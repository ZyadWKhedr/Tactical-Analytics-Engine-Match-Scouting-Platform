"""
Raw Wyscout JSON  ->  validation / dedup / normalisation  ->  PostgreSQL
=======================================================================

Usage (from the repository root)::

    python -m etl.load_wyscout                 # all 1,941 matches
    python -m etl.load_wyscout --limit 1       # 1 match per competition (smoke test)
    python -m etl.load_wyscout --competitions England Spain

Pipeline
--------
1. **Ingest** the public Wyscout JSON files in ``data/wyscout`` (download them
   with ``python -m etl.download_wyscout``).
2. **Validate** raw events: required fields, known team ids, coordinate ranges.
3. **Deduplicate** raw events by Wyscout event id and SPADL actions by
   ``(original_event_id, type_id)``.
4. **Normalise events** to SPADL via ``socceraction`` and flip every action so
   the acting team attacks left -> right on a 105 x 68 m pitch.
5. **Normalise timestamps**: ``match_seconds`` is a monotonic match clock
   (each period starts where the previous one actually ended, so first-half
   stoppage time never overlaps the second half).
6. **Load** with PostgreSQL ``COPY`` and build indexes.
7. **Validate integrity** with ``sql/postgres/03_integrity_checks.sql`` and
   write ``etl/reports/etl_report.json``.
"""
from __future__ import annotations

import argparse
import io
import json
import logging
import time
import warnings
from collections import Counter
from pathlib import Path

import numpy as np
import pandas as pd
from sqlalchemy import text

from backend.app.config import REPO_ROOT, get_settings
from backend.app.db import get_engine

warnings.filterwarnings("ignore")
log = logging.getLogger("etl")

WYSCOUT_DIR = REPO_ROOT / "data" / "wyscout"
SQL_DIR = REPO_ROOT / "sql" / "postgres"
REPORT_DIR = REPO_ROOT / "etl" / "reports"

PITCH_X, PITCH_Y = 105.0, 68.0
UNKNOWN_PLAYER_ID = 0

COMPETITION_FILES = {
    "England": (364, 181150, "2017/2018"),
    "Spain": (795, 181144, "2017/2018"),
    "Italy": (524, 181248, "2017/2018"),
    "Germany": (426, 181137, "2017/2018"),
    "France": (412, 181189, "2017/2018"),
    "European_Championship": (102, 9291, "2016"),
    "World_Cup": (28, 10078, "2018"),
}


# -----------------------------------------------------------------------------
# helpers
# -----------------------------------------------------------------------------
def _load_json(path: Path):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def _clean_str(s):
    if s is None:
        return None
    s = str(s).strip()
    return s or None


def copy_df(conn, table: str, df: pd.DataFrame) -> int:
    """Bulk load a DataFrame with PostgreSQL COPY (orders of magnitude faster than INSERT)."""
    if df.empty:
        return 0
    buf = io.StringIO()
    df.to_csv(buf, index=False, header=False, na_rep="\\N")
    buf.seek(0)
    cols = ",".join(f'"{c}"' for c in df.columns)
    raw = conn.connection.dbapi_connection
    with raw.cursor() as cur:
        cur.copy_expert(
            f"COPY core.{table} ({cols}) FROM STDIN WITH (FORMAT csv, NULL '\\N')", buf
        )
    return len(df)


def run_sql_file(conn, path: Path) -> None:
    conn.exec_driver_sql(path.read_text(encoding="utf-8"))


# -----------------------------------------------------------------------------
# dimension builders
# -----------------------------------------------------------------------------
def build_competitions() -> pd.DataFrame:
    raw = {c["wyId"]: c for c in _load_json(WYSCOUT_DIR / "competitions.json")}
    rows = []
    for _, (cid, sid, sname) in COMPETITION_FILES.items():
        c = raw[cid]
        rows.append(
            dict(
                competition_id=cid,
                season_id=sid,
                competition_name=c["name"],
                season_name=sname,
                country_name=c["area"]["name"] or "International",
                format=_clean_str(c.get("format")),
            )
        )
    return pd.DataFrame(rows)


def build_teams() -> pd.DataFrame:
    rows = []
    for t in _load_json(WYSCOUT_DIR / "teams.json"):
        rows.append(
            dict(
                team_id=t["wyId"],
                team_name=t["name"],
                official_name=_clean_str(t.get("officialName")),
                short_name=None,
                city=_clean_str(t.get("city")),
                country=_clean_str(t.get("area", {}).get("name")),
                team_type="national" if t.get("type") == "national" else "club",
            )
        )
    return pd.DataFrame(rows).drop_duplicates("team_id")


def build_players(team_ids: set[int]) -> pd.DataFrame:
    rows = []
    for p in _load_json(WYSCOUT_DIR / "players.json"):
        team = p.get("currentTeamId")
        try:
            team = int(team) if team not in (None, "", "null") else None
        except (TypeError, ValueError):
            team = None
        h, w = p.get("height") or None, p.get("weight") or None
        rows.append(
            dict(
                player_id=p["wyId"],
                short_name=_clean_str(p.get("shortName")) or f"Player {p['wyId']}",
                first_name=_clean_str(p.get("firstName")),
                last_name=_clean_str(p.get("lastName")),
                role_code=_clean_str((p.get("role") or {}).get("code2")),
                role_name=_clean_str((p.get("role") or {}).get("name")),
                birth_date=_clean_str(p.get("birthDate")),
                height_cm=h if h and 140 <= h <= 220 else None,
                weight_kg=w if w and 40 <= w <= 130 else None,
                foot=_clean_str(p.get("foot")),
                nationality=_clean_str((p.get("passportArea") or {}).get("name")),
                current_team_id=team if team in team_ids else None,
            )
        )
    df = pd.DataFrame(rows).drop_duplicates("player_id")
    # Placeholder for events that Wyscout could not attribute to a player.
    # Keeps FK integrity without silently dropping events (docs/06 §2.3).
    if UNKNOWN_PLAYER_ID not in set(df.player_id):
        df = pd.concat(
            [pd.DataFrame([dict(player_id=UNKNOWN_PLAYER_ID, short_name="Unknown player")]), df],
            ignore_index=True,
        )
    for c in ("height_cm", "weight_kg", "current_team_id"):
        df[c] = df[c].astype("Int64")
    return df


def build_fixtures_matches(comp_file: str, cid: int, sid: int):
    raw = _load_json(WYSCOUT_DIR / f"matches_{comp_file}.json")
    fixtures, matches = [], []
    for m in raw:
        td = {int(k): v for k, v in m["teamsData"].items()}
        home = next(t for t, v in td.items() if v["side"] == "home")
        away = next(t for t, v in td.items() if v["side"] == "away")
        h, a = td[home], td[away]
        fixtures.append(
            dict(
                fixture_id=m["wyId"],
                competition_id=cid,
                season_id=sid,
                gameweek=m.get("gameweek") or None,
                round_id=m.get("roundId"),
                kickoff_utc=pd.Timestamp(m["dateutc"], tz="UTC").isoformat(),
                venue=_clean_str(m.get("venue")),
                home_team_id=home,
                away_team_id=away,
                status=m.get("status", "Played"),
            )
        )
        matches.append(
            dict(
                match_id=m["wyId"],
                label=m["label"],
                home_team_id=home,
                away_team_id=away,
                home_score=h["score"],
                away_score=a["score"],
                home_score_ht=h.get("scoreHT"),
                away_score_ht=a.get("scoreHT"),
                home_score_pen=h.get("scoreP") or None,
                away_score_pen=a.get("scoreP") or None,
                winner_team_id=m["winner"] or None,
                duration=m.get("duration", "Regular"),
                home_formation=None,  # not provided by the public feed
                away_formation=None,
                n_events=0,
            )
        )
    f = pd.DataFrame(fixtures)
    mt = pd.DataFrame(matches)
    f["gameweek"] = f["gameweek"].astype("Int64")
    for c in ("home_score_ht", "away_score_ht", "home_score_pen", "away_score_pen", "winner_team_id"):
        mt[c] = mt[c].astype("Int64")
    return f, mt


# -----------------------------------------------------------------------------
# event normalisation
# -----------------------------------------------------------------------------
def normalise_match(raw_events: pd.DataFrame, home_id: int, away_id: int, stats: Counter):
    import socceraction.spadl as spadl

    ev = raw_events
    n0 = len(ev)
    # ---- raw validation & dedup -------------------------------------------
    ev = ev.drop_duplicates("event_id")
    stats["raw_duplicates_removed"] += n0 - len(ev)
    bad_team = ~ev.team_id.isin([home_id, away_id])
    stats["raw_unknown_team_removed"] += int(bad_team.sum())
    ev = ev[~bad_team]
    no_pos = ev.positions.map(lambda p: not isinstance(p, list) or len(p) == 0)
    stats["raw_missing_position_removed"] += int(no_pos.sum())
    ev = ev[~no_pos]
    stats["raw_events"] += n0

    # ---- SPADL conversion + canonical orientation -------------------------
    actions = spadl.wyscout.convert_to_actions(ev, home_id)
    actions = spadl.play_left_to_right(actions, home_id)

    # ---- SPADL validation & dedup -----------------------------------------
    n1 = len(actions)
    actions = actions.drop_duplicates(["original_event_id", "type_id", "start_x", "start_y"])
    stats["spadl_duplicates_removed"] += n1 - len(actions)
    for c, hi in (("start_x", PITCH_X), ("end_x", PITCH_X), ("start_y", PITCH_Y), ("end_y", PITCH_Y)):
        out = (actions[c] < 0) | (actions[c] > hi)
        stats["coords_clipped"] += int(out.sum())
        actions[c] = actions[c].clip(0, hi)
    nan_t = actions.time_seconds.isna()
    stats["missing_time_removed"] += int(nan_t.sum())
    actions = actions[~nan_t]
    actions["time_seconds"] = actions.time_seconds.clip(lower=0)

    # ---- timestamp normalisation ------------------------------------------
    actions = actions.sort_values(["period_id", "time_seconds", "action_id"], kind="stable")
    period_end = actions.groupby("period_id").time_seconds.max().sort_index()
    offsets = period_end.cumsum().shift(1, fill_value=0.0)
    actions["match_seconds"] = actions.time_seconds + actions.period_id.map(offsets)
    actions["action_id"] = np.arange(len(actions), dtype=np.int32)

    actions["player_id"] = actions.player_id.fillna(UNKNOWN_PLAYER_ID).astype(int)
    actions["original_event_id"] = pd.to_numeric(actions.original_event_id, errors="coerce").astype("Int64")
    stats["spadl_actions"] += len(actions)
    return actions


EVENT_COLS = [
    "match_id", "action_id", "original_event_id", "period_id", "time_seconds", "match_seconds",
    "team_id", "player_id", "type_id", "result_id", "bodypart_id",
    "start_x", "start_y", "end_x", "end_y",
]


# -----------------------------------------------------------------------------
# main
# -----------------------------------------------------------------------------
def main(argv: list[str] | None = None) -> dict:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--competitions", nargs="*", default=list(COMPETITION_FILES), choices=list(COMPETITION_FILES))
    ap.add_argument("--limit", type=int, default=None, help="max matches per competition")
    args = ap.parse_args(argv)

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    if not (WYSCOUT_DIR / "teams.json").exists():
        raise SystemExit("Wyscout data missing. Run: python -m etl.download_wyscout")

    import socceraction.spadl as spadl
    from socceraction.data.wyscout import PublicWyscoutLoader

    t0 = time.time()
    engine = get_engine()
    stats: Counter = Counter()
    loader = PublicWyscoutLoader(root=str(WYSCOUT_DIR), download=False)

    log.info("Creating schema")
    with engine.begin() as conn:
        run_sql_file(conn, SQL_DIR / "01_schema.sql")

    competitions = build_competitions()
    competitions = competitions[competitions.competition_name.notna()]
    teams = build_teams()
    players = build_players(set(teams.team_id))

    with engine.begin() as conn:
        copy_df(conn, "action_types", spadl.config.actiontypes_df())
        copy_df(conn, "results", spadl.config.results_df())
        copy_df(conn, "bodyparts", spadl.config.bodyparts_df())
        copy_df(conn, "competitions", competitions)
        copy_df(conn, "teams", teams)
        copy_df(conn, "players", players)
    known_players = set(players.player_id)
    log.info("Loaded %d competitions, %d teams, %d players", len(competitions), len(teams), len(players))

    for comp in args.competitions:
        cid, sid, _ = COMPETITION_FILES[comp]
        fixtures, matches = build_fixtures_matches(comp, cid, sid)
        if args.limit:
            fixtures, matches = fixtures.head(args.limit), matches.head(args.limit)
        ev_frames, lineup_frames = [], []
        for i, m in enumerate(matches.itertuples(index=False), 1):
            raw = loader.events(m.match_id)
            actions = normalise_match(raw, m.home_team_id, m.away_team_id, stats)
            actions["match_id"] = m.match_id
            unknown = ~actions.player_id.isin(known_players)
            stats["unknown_player_remapped"] += int(unknown.sum())
            actions.loc[unknown, "player_id"] = UNKNOWN_PLAYER_ID
            ev_frames.append(actions[EVENT_COLS])
            matches.loc[matches.match_id == m.match_id, "n_events"] = len(actions)

            lu = loader.players(m.match_id)
            lu = lu[lu.player_id.isin(known_players)]
            lineup_frames.append(
                pd.DataFrame(
                    dict(
                        match_id=m.match_id,
                        team_id=lu.team_id.astype(int),
                        player_id=lu.player_id.astype(int),
                        jersey_number=lu.jersey_number.replace(0, np.nan).astype("Int64"),
                        is_starter=lu.is_starter.astype(bool),
                        minutes_played=lu.minutes_played.clip(0, 130).astype(int),
                    )
                ).drop_duplicates(["match_id", "player_id"])
            )
            if i % 50 == 0:
                log.info("  %s: %d/%d matches normalised", comp, i, len(matches))

        events = pd.concat(ev_frames, ignore_index=True)
        lineups = pd.concat(lineup_frames, ignore_index=True)
        with engine.begin() as conn:
            copy_df(conn, "fixtures", fixtures)
            copy_df(conn, "matches", matches)
            copy_df(conn, "lineups", lineups)
            copy_df(conn, "events", events)
        stats["matches"] += len(matches)
        log.info("%s: loaded %d matches, %d events, %d lineup rows", comp, len(matches), len(events), len(lineups))

    load_squad_ratings(engine)

    log.info("Building indexes")
    with engine.begin() as conn:
        run_sql_file(conn, SQL_DIR / "02_indexes.sql")

    checks = run_integrity_checks(engine)
    report = dict(
        runtime_seconds=round(time.time() - t0, 1),
        competitions=args.competitions,
        limit_per_competition=args.limit,
        pipeline_stats=dict(stats),
        integrity_checks=checks,
    )
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    (REPORT_DIR / "etl_report.json").write_text(json.dumps(report, indent=2))
    log.info("Done in %.1fs. Report: %s", report["runtime_seconds"], REPORT_DIR / "etl_report.json")
    log.info(json.dumps(report, indent=2))
    return report


def load_squad_ratings(engine) -> None:
    """Persist Persons 2/3 squad ratings (models/team_ratings.parquet) into Postgres."""
    settings = get_settings()
    path = settings.models_dir / "team_ratings.parquet"
    if not path.exists():
        log.warning("No %s, skipping squad_ratings", path)
        return
    meta = json.loads((settings.models_dir / "run_metadata.json").read_text())
    tr = pd.read_parquet(path)
    cols = [
        "team_id", "matches", "team_rating", "attack_rating", "defence_rating", "attack_strength",
        "defence_strength", "overall_strength", "form_z", "goal_diff_p90", "xt_diff_p90",
        "possession_dominance", "low_block", "press_intensity", "playstyle", "playstyle_confidence",
    ]
    df = tr[cols].copy()
    df["engine_version"] = meta.get("engine_version", "unknown")
    with engine.begin() as conn:
        known = {r[0] for r in conn.execute(text("SELECT team_id FROM core.teams"))}
        df = df[df.team_id.isin(known)]
        conn.execute(text("TRUNCATE core.squad_ratings"))
        copy_df(conn, "squad_ratings", df)
    log.info("Loaded %d squad ratings", len(df))


def run_integrity_checks(engine) -> dict:
    sql = (SQL_DIR / "03_integrity_checks.sql").read_text(encoding="utf-8")
    results = {}
    blocks = [b for b in sql.split("-- name: ")[1:]]
    with engine.connect() as conn:
        for b in blocks:
            name, body = b.split("\n", 1)
            query = "\n".join(l for l in body.splitlines() if not l.strip().startswith("--")).strip()
            results[name.strip()] = int(conn.execute(text(query)).scalar() or 0)
        counts = {
            t: int(conn.execute(text(f"SELECT COUNT(*) FROM core.{t}")).scalar())
            for t in ("competitions", "teams", "players", "fixtures", "matches", "lineups",
                      "events", "squad_ratings")
        }
    return dict(row_counts=counts, checks=results)


if __name__ == "__main__":
    main()
