"""
Repository layer: combines PostgreSQL relational data with model outputs
(Parquet tables, JSON dossiers, and run metadata).
"""
from __future__ import annotations

import json
import logging
from functools import lru_cache
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from sqlalchemy import text

from backend.app.config import get_settings
from backend.app.db import get_engine
from backend.app.schemas import (
    BlueprintOut,
    CompetitionOut,
    CorridorSummary,
    DataSourceInfo,
    HeatmapOut,
    LineupPlayer,
    MatchDetail,
    MatchSummary,
    MatchupEdge,
    MatchupOut,
    MatchupSide,
    MetaOut,
    NetworkEdge,
    NetworkNode,
    PassingNetworkOut,
    PlayerProfile,
    PlayerRatingOut,
    PlayerRef,
    PlaystyleAxes,
    PlaystyleOut,
    PressTrigger,
    RatingComponents,
    RatingTriplet,
    ShotOut,
    SquadRatingOut,
    SwotItem,
    SwotOut,
    TeamMatchStats,
    TeamRef,
    TeamSummary,
    TeamXgOut,
    TopPlayer,
    XgMatchRow,
    XgModelOut,
    XgPlayerRow,
    ZoneCell,
    ZoneSummary,
    ZonesOut,
)

log = logging.getLogger(__name__)


def clean_text(s: Any) -> str:
    """Decodes escaped unicode sequences from raw feeds (e.g. Lionel Andr\\u00e9s -> Lionel Andrés)."""
    if s is None:
        return ""
    import re
    val = str(s).strip()
    try:
        val = re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1), 16)), val)
    except Exception:
        pass
    return val


class DataRepository:
    """Singleton repository caching parquet/json models and querying PostgreSQL."""

    def __init__(self) -> None:
        self.settings = get_settings()
        self.engine = get_engine()
        self._load_cached_models()

    def _load_cached_models(self) -> None:
        mdir = self.settings.models_dir
        log.info("Loading model files from %s", mdir)

        self.run_metadata: dict[str, Any] = {}
        if (mdir / "run_metadata.json").exists():
            self.run_metadata = json.loads((mdir / "run_metadata.json").read_text(encoding="utf-8"))

        self.team_dossiers: dict[int, dict[str, Any]] = {}
        if (mdir / "team_dossiers.json").exists():
            dossiers_list = json.loads((mdir / "team_dossiers.json").read_text(encoding="utf-8"))
            self.team_dossiers = {d["team_id"]: d for d in dossiers_list}

        self.team_ratings_df = self._read_parquet_safe(mdir / "team_ratings.parquet")
        self.team_playstyles_df = self._read_parquet_safe(mdir / "team_playstyles.parquet")
        self.player_ratings_df = self._read_parquet_safe(mdir / "player_ratings.parquet")
        self.team_swot_df = self._read_parquet_safe(mdir / "team_swot.parquet")
        self.swot_metrics_df = self._read_parquet_safe(mdir / "swot_metrics.parquet")
        self.zone_vuln_df = self._read_parquet_safe(mdir / "zone_vulnerabilities.parquet")
        self.press_triggers_df = self._read_parquet_safe(mdir / "press_triggers.parquet")
        self.entry_routes_df = self._read_parquet_safe(mdir / "entry_routes.parquet")
        self.shots_xg_df = self._read_parquet_safe(mdir / "shots_xg.parquet")

        self.xg_model_info: dict[str, Any] = {}
        if (mdir / "xg_model.json").exists():
            self.xg_model_info = json.loads((mdir / "xg_model.json").read_text(encoding="utf-8"))

    @staticmethod
    def _read_parquet_safe(path: Path) -> pd.DataFrame:
        if path.exists():
            try:
                return pd.read_parquet(path)
            except Exception as e:
                log.error("Failed to read %s: %s", path, e)
        return pd.DataFrame()

    # -------------------------------------------------------------------------
    # Lookups & Mappings
    # -------------------------------------------------------------------------
    @lru_cache(maxsize=1)
    def get_team_lookup(self) -> dict[int, dict[str, Any]]:
        with self.engine.connect() as conn:
            rows = conn.execute(
                text("SELECT team_id, team_name, country, team_type, city, official_name FROM core.teams")
            ).fetchall()
        return {
            r.team_id: {
                "team_id": r.team_id,
                "name": clean_text(r.team_name),
                "country": clean_text(r.country),
                "team_type": r.team_type,
                "city": clean_text(r.city),
                "official_name": clean_text(r.official_name),
            }
            for r in rows
        }

    @lru_cache(maxsize=1)
    def get_player_lookup(self) -> dict[int, dict[str, Any]]:
        with self.engine.connect() as conn:
            rows = conn.execute(
                text("SELECT player_id, short_name, role_name, current_team_id FROM core.players")
            ).fetchall()
        return {
            r.player_id: {
                "player_id": r.player_id,
                "name": clean_text(r.short_name),
                "role_name": clean_text(r.role_name),
                "current_team_id": r.current_team_id,
            }
            for r in rows
        }

    def team_ref(self, team_id: int) -> TeamRef:
        lookup = self.get_team_lookup()
        t = lookup.get(team_id)
        if t:
            return TeamRef(
                team_id=t["team_id"],
                name=t["name"],
                country=t["country"],
                team_type=t["team_type"],
            )
        return TeamRef(team_id=team_id, name=f"Team {team_id}")

    def player_ref(self, player_id: int) -> PlayerRef:
        lookup = self.get_player_lookup()
        p = lookup.get(player_id)
        if p:
            return PlayerRef(player_id=p["player_id"], name=p["name"])
        return PlayerRef(player_id=player_id, name=f"Player {player_id}")

    # -------------------------------------------------------------------------
    # System Metadata
    # -------------------------------------------------------------------------
    def get_metadata(self) -> MetaOut:
        with self.engine.connect() as conn:
            comps = conn.execute(
                text(
                    """
                    SELECT c.competition_id, c.season_id, c.competition_name, c.season_name, c.country_name,
                           COUNT(m.match_id) as n_matches
                    FROM core.competitions c
                    LEFT JOIN core.fixtures f ON f.competition_id = c.competition_id
                    LEFT JOIN core.matches m ON m.match_id = f.fixture_id
                    GROUP BY c.competition_id, c.season_id, c.competition_name, c.season_name, c.country_name
                    ORDER BY c.competition_name
                    """
                )
            ).fetchall()
            n_events = conn.execute(text("SELECT COUNT(*) FROM core.events")).scalar() or 0
            n_matches = conn.execute(text("SELECT COUNT(*) FROM core.matches")).scalar() or 0
            n_teams = conn.execute(text("SELECT COUNT(*) FROM core.teams")).scalar() or 0
            n_players = conn.execute(text("SELECT COUNT(*) FROM core.players")).scalar() or 0
            n_shots = conn.execute(text("SELECT COUNT(*) FROM core.shots")).scalar() or 0

        comp_list = [
            CompetitionOut(
                competition_id=c.competition_id,
                season_id=c.season_id,
                name=c.competition_name,
                season=c.season_name,
                country=c.country_name,
                n_matches=c.n_matches,
            )
            for c in comps
        ]

        src_info = DataSourceInfo(
            database=str(self.engine.url.render_as_string(hide_password=True)),
            database_ok=True,
            analytics_dir=str(self.settings.models_dir),
            analytics_engine_version=self.run_metadata.get("engine_version", "1.0.0"),
        )

        return MetaOut(
            n_competitions=len(comp_list),
            n_matches=n_matches,
            n_events=n_events,
            n_teams=n_teams,
            n_players=n_players,
            n_shots=n_shots,
            competitions=comp_list,
            source=src_info,
        )

    # -------------------------------------------------------------------------
    # Teams & Playstyles
    # -------------------------------------------------------------------------
    def list_teams(self, competition_id: int | None = None) -> list[TeamSummary]:
        with self.engine.connect() as conn:
            query = """
                SELECT DISTINCT t.team_id, t.team_name, t.country, t.team_type,
                                f.competition_id, c.competition_name
                FROM core.teams t
                LEFT JOIN core.fixtures f ON f.home_team_id = t.team_id OR f.away_team_id = t.team_id
                LEFT JOIN core.competitions c ON c.competition_id = f.competition_id
            """
            params: dict[str, Any] = {}
            if competition_id:
                query += " WHERE f.competition_id = :cid"
                params["cid"] = competition_id
            rows = conn.execute(text(query), params).fetchall()

        team_comp_map = {r.team_id: (r.competition_id, r.competition_name) for r in rows}

        tr_dict = (
            self.team_ratings_df.set_index("team_id").to_dict(orient="index")
            if not self.team_ratings_df.empty
            else {}
        )
        ps_dict = (
            self.team_playstyles_df.set_index("team_id").to_dict(orient="index")
            if not self.team_playstyles_df.empty
            else {}
        )

        results: list[TeamSummary] = []
        for team_id, t_info in self.get_team_lookup().items():
            if competition_id and team_id not in team_comp_map:
                continue

            comp_id, comp_name = team_comp_map.get(team_id, (None, None))
            tr = tr_dict.get(team_id, {})
            ps = ps_dict.get(team_id, {})

            rating = RatingTriplet(
                team=float(tr.get("team_rating", 6.5)),
                attack=float(tr.get("attack_rating", 6.5)),
                defence=float(tr.get("defence_rating", 6.5)),
            )

            axes = PlaystyleAxes(
                possession_dominance=float(ps.get("possession_dominance", 50.0)),
                low_block=float(ps.get("low_block", 50.0)),
                press_intensity=float(ps.get("press_intensity", 50.0)),
                directness=float(ps.get("directness", 50.0)) if "directness" in ps else None,
                width_usage=float(ps.get("width_usage", 50.0)) if "width_usage" in ps else None,
                transition_threat=float(ps.get("transition_threat", 50.0)) if "transition_threat" in ps else None,
            )

            playstyle_out = PlaystyleOut(
                label=str(ps.get("archetype_name", ps.get("playstyle", "Balanced"))),
                confidence=float(ps.get("playstyle_confidence", 1.0)),
                archetype=str(ps.get("archetype", "")),
                descriptors=str(ps.get("playstyle_descriptors", "")),
                axes=axes,
            )

            results.append(
                TeamSummary(
                    team=self.team_ref(team_id),
                    competition_id=comp_id,
                    competition_name=comp_name,
                    matches=int(tr.get("matches", 38)),
                    rating=rating,
                    playstyle=playstyle_out,
                )
            )

        results.sort(key=lambda x: x.rating.team, reverse=True)
        return results

    def get_team_summary(self, team_id: int) -> TeamSummary | None:
        teams = self.list_teams()
        for t in teams:
            if t.team.team_id == team_id:
                return t
        return None

    # -------------------------------------------------------------------------
    # Squad Ratings Leaderboard
    # -------------------------------------------------------------------------
    def get_squad_ratings(self, competition_id: int | None = None) -> list[SquadRatingOut]:
        teams = self.list_teams(competition_id=competition_id)
        tr_dict = (
            self.team_ratings_df.set_index("team_id").to_dict(orient="index")
            if not self.team_ratings_df.empty
            else {}
        )

        out: list[SquadRatingOut] = []
        for rank, t in enumerate(teams, start=1):
            tr = tr_dict.get(t.team.team_id, {})
            out.append(
                SquadRatingOut(
                    rank=rank,
                    team=t.team,
                    competition_name=t.competition_name,
                    matches=t.matches,
                    team_rating=t.rating.team,
                    attack_rating=t.rating.attack,
                    defence_rating=t.rating.defence,
                    overall_strength=float(tr.get("overall_strength", 0.0)) if "overall_strength" in tr else None,
                    form_z=float(tr.get("form_z", 0.0)) if "form_z" in tr else None,
                    goal_diff_p90=float(tr.get("goal_diff_p90", 0.0)) if "goal_diff_p90" in tr else None,
                    xt_diff_p90=float(tr.get("xt_diff_p90", 0.0)) if "xt_diff_p90" in tr else None,
                    playstyle=t.playstyle.label,
                )
            )
        return out

    # -------------------------------------------------------------------------
    # Player Ratings & Profiles
    # -------------------------------------------------------------------------
    def get_player_ratings(
        self,
        position_group: str | None = None,
        min_minutes: float = 300.0,
        team_id: int | None = None,
        search: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[PlayerRatingOut]]:
        if self.player_ratings_df.empty:
            return 0, []

        df = self.player_ratings_df.copy()
        if min_minutes > 0:
            df = df[df["minutes"] >= min_minutes]
        if position_group and position_group != "All":
            df = df[df["position_group"] == position_group]
        if team_id:
            df = df[df["team_id"] == team_id]

        if search:
            lookup = self.get_player_lookup()
            p_ids = [
                pid for pid, p in lookup.items() if search.lower() in p["name"].lower()
            ]
            df = df[df["player_id"].isin(p_ids)]

        total = len(df)
        df = df.sort_values("rating", ascending=False).iloc[offset : offset + limit]

        items: list[PlayerRatingOut] = []
        for _, r in df.iterrows():
            pid = int(r["player_id"])
            tid = int(r["team_id"]) if pd.notna(r.get("team_id")) else None

            comps = RatingComponents(
                progression=float(r["comp_progression"]) if pd.notna(r.get("comp_progression")) else None,
                creation=float(r["comp_creation"]) if pd.notna(r.get("comp_creation")) else None,
                finishing=float(r["comp_finishing"]) if pd.notna(r.get("comp_finishing")) else None,
                retention=float(r["comp_retention"]) if pd.notna(r.get("comp_retention")) else None,
                defending=float(r["comp_defending"]) if pd.notna(r.get("comp_defending")) else None,
                discipline=float(r["comp_discipline"]) if pd.notna(r.get("comp_discipline")) else None,
            )

            items.append(
                PlayerRatingOut(
                    player=self.player_ref(pid),
                    team=self.team_ref(tid) if tid else None,
                    position_group=str(r["position_group"]) if pd.notna(r.get("position_group")) else None,
                    position_confidence=float(r["position_confidence"]) if pd.notna(r.get("position_confidence")) else None,
                    matches=int(r.get("matches", 0)),
                    minutes=float(r.get("minutes", 0.0)),
                    rating=float(r.get("rating", 6.5)),
                    percentile_overall=float(r.get("rating_percentile_overall", 50.0)),
                    percentile_in_position=float(r.get("rating_percentile_in_position", 50.0)),
                    components=comps,
                    goals=int(r.get("goals_total", 0)),
                    xg=float(r.get("shot_quality_total", 0.0)),
                    xa=float(r.get("xt_positive_total", 0.0)),
                )
            )

        return total, items

    def get_player_profile(self, player_id: int) -> PlayerProfile | None:
        with self.engine.connect() as conn:
            p = conn.execute(
                text(
                    """
                    SELECT player_id, short_name, first_name, last_name, role_name,
                           birth_date, height_cm, foot, nationality, current_team_id
                    FROM core.players
                    WHERE player_id = :pid
                    """
                ),
                {"pid": player_id},
            ).fetchone()

            if not p:
                return None

            lu_stats = conn.execute(
                text(
                    """
                    SELECT COUNT(*) as appearances,
                           SUM(CASE WHEN is_starter THEN 1 ELSE 0 END) as starts,
                           SUM(minutes_played) as total_mins
                    FROM core.lineups
                    WHERE player_id = :pid
                    """
                ),
                {"pid": player_id},
            ).fetchone()

            shots_stats = conn.execute(
                text(
                    """
                    SELECT COUNT(*) as shots,
                           SUM(CASE WHEN is_goal THEN 1 ELSE 0 END) as goals,
                           COALESCE(SUM(xg), 0.0) as total_xg,
                           COALESCE(SUM(xa), 0.0) as total_xa
                    FROM core.shots
                    WHERE player_id = :pid
                    """
                ),
                {"pid": player_id},
            ).fetchone()

        full_name = clean_text(f"{p.first_name or ''} {p.last_name or ''}".strip() or p.short_name)

        rating_item: PlayerRatingOut | None = None
        if not self.player_ratings_df.empty:
            p_rows = self.player_ratings_df[self.player_ratings_df["player_id"] == player_id]
            if not p_rows.empty:
                r = p_rows.iloc[0]
                comps = RatingComponents(
                    progression=float(r["comp_progression"]) if pd.notna(r.get("comp_progression")) else None,
                    creation=float(r["comp_creation"]) if pd.notna(r.get("comp_creation")) else None,
                    finishing=float(r["comp_finishing"]) if pd.notna(r.get("comp_finishing")) else None,
                    retention=float(r["comp_retention"]) if pd.notna(r.get("comp_retention")) else None,
                    defending=float(r["comp_defending"]) if pd.notna(r.get("comp_defending")) else None,
                    discipline=float(r["comp_discipline"]) if pd.notna(r.get("comp_discipline")) else None,
                )
                rating_item = PlayerRatingOut(
                    player=self.player_ref(player_id),
                    team=self.team_ref(int(r["team_id"])) if pd.notna(r.get("team_id")) else None,
                    position_group=str(r["position_group"]) if pd.notna(r.get("position_group")) else None,
                    position_confidence=float(r["position_confidence"]) if pd.notna(r.get("position_confidence")) else None,
                    matches=int(r.get("matches", 0)),
                    minutes=float(r.get("minutes", 0.0)),
                    rating=float(r.get("rating", 6.5)),
                    percentile_overall=float(r.get("rating_percentile_overall", 50.0)),
                    percentile_in_position=float(r.get("rating_percentile_in_position", 50.0)),
                    components=comps,
                )

        return PlayerProfile(
            player=self.player_ref(player_id),
            full_name=full_name,
            role=p.role_name,
            birth_date=str(p.birth_date) if p.birth_date else None,
            height_cm=p.height_cm,
            foot=p.foot,
            nationality=p.nationality,
            current_team=self.team_ref(p.current_team_id) if p.current_team_id else None,
            appearances=int(lu_stats.appearances or 0) if lu_stats else 0,
            starts=int(lu_stats.starts or 0) if lu_stats else 0,
            minutes_played=int(lu_stats.total_mins or 0) if lu_stats else 0,
            rating=rating_item,
            shots=int(shots_stats.shots or 0) if shots_stats else 0,
            goals=int(shots_stats.goals or 0) if shots_stats else 0,
            xg=round(float(shots_stats.total_xg or 0.0), 2) if shots_stats else 0.0,
            xa=round(float(shots_stats.total_xa or 0.0), 2) if shots_stats else 0.0,
            key_passes=0,
        )

    # -------------------------------------------------------------------------
    # Opponent Blueprint & Dossier
    # -------------------------------------------------------------------------
    def get_opponent_blueprint(self, team_id: int) -> BlueprintOut | None:
        team_summary = self.get_team_summary(team_id)
        if not team_summary:
            return None

        dossier = self.team_dossiers.get(team_id, {})
        ds_playstyle = dossier.get("playstyle", {})
        ds_zones = dossier.get("zone_vulnerabilities", {})
        ds_swot = dossier.get("strengths_weaknesses", {})
        ds_ratings = dossier.get("ratings", {})

        press_triggers = [
            PressTrigger(
                trigger=pt["trigger"],
                engagement_rate=float(pt["engagement_rate"]),
                league_rate=float(pt["league_rate"]),
                lift=float(pt["lift"]),
                z=float(pt["z"]),
                opportunities=int(pt["opportunities"]),
            )
            for pt in ds_playstyle.get("press_triggers", [])
        ]

        press_blind_spots = [
            PressTrigger(
                trigger=pt["trigger"],
                engagement_rate=float(pt["engagement_rate"]),
                league_rate=float(pt["league_rate"]),
                lift=float(pt["lift"]),
                z=float(pt["z"]),
                opportunities=int(pt["opportunities"]),
            )
            for pt in ds_playstyle.get("press_blind_spots", [])
        ]

        vuln_zones = [
            ZoneSummary(
                zone=z["zone"],
                vulnerability_index=float(z["vulnerability_index"]),
                z=float(z.get("z", 0.0)),
                opponent_entries=int(z.get("opponent_entries", 0)),
                xt_conceded_per_entry=float(z.get("xt_conceded_per_entry", 0.0)),
                shot_chains_conceded=int(z.get("shot_chains_conceded", 0)),
                goals_conceded_via_zone=int(z.get("goals_conceded_via_zone", 0)),
                clean_recovery_rate=float(z.get("clean_recovery_rate", 0.0)),
            )
            for z in ds_zones.get("most_vulnerable", [])
        ]

        solid_zones = [
            ZoneSummary(
                zone=z["zone"],
                vulnerability_index=float(z["vulnerability_index"]),
                z=float(z.get("z", 0.0)),
                opponent_entries=int(z.get("opponent_entries", 0)),
                xt_conceded_per_entry=float(z.get("xt_conceded_per_entry", 0.0)),
                shot_chains_conceded=int(z.get("shot_chains_conceded", 0)),
                goals_conceded_via_zone=int(z.get("goals_conceded_via_zone", 0)),
                clean_recovery_rate=float(z.get("clean_recovery_rate", 0.0)),
            )
            for z in ds_zones.get("most_solid", [])
        ]

        strengths = [
            SwotItem(
                metric=s["metric"],
                label=s.get("metric", ""),
                phase=s.get("phase", "General"),
                value=float(s.get("value", 0.0)),
                unit=s.get("unit"),
                percentile=float(s.get("percentile", 90.0)),
                verdict=s.get("verdict", "key strength"),
            )
            for s in ds_swot.get("strengths", [])
        ]

        weaknesses = [
            SwotItem(
                metric=w["metric"],
                label=w.get("metric", ""),
                phase=w.get("phase", "General"),
                value=float(w.get("value", 0.0)),
                unit=w.get("unit"),
                percentile=float(w.get("percentile", 10.0)),
                verdict=w.get("verdict", "key weakness"),
            )
            for w in ds_swot.get("weaknesses", [])
        ]

        top_players = [
            TopPlayer(
                player=self.player_ref(int(p["player_id"])),
                position=p.get("position"),
                minutes=float(p.get("minutes_est", 0.0)),
                rating=float(p.get("rating", 6.5)),
                percentile_in_position=float(p.get("percentile_in_position", 50.0)),
            )
            for p in ds_ratings.get("top_players", [])
        ]

        # Rule-based deterministic tactical game plan generator
        game_plan: list[str] = []
        if vuln_zones:
            target = vuln_zones[0]
            game_plan.append(
                f"Direct attacks into '{target.zone}' (vulnerability index {target.vulnerability_index:.1f}); "
                f"concedes {target.shot_chains_conceded} shot chains from this channel."
            )
        if press_blind_spots:
            blind = press_blind_spots[0]
            game_plan.append(
                f"Circulate build-up through '{blind.trigger}' where engagement lift is {blind.lift:.2f}x "
                f"(under-presses compared to league baseline)."
            )
        if press_triggers:
            trig = press_triggers[0]
            game_plan.append(
                f"Caution: Avoid prolonged '{trig.trigger}' where press engagement rate spikes to "
                f"{trig.engagement_rate*100:.1f}% (+{trig.lift:.2f}x lift)."
            )
        if team_summary.playstyle.axes.low_block > 65:
            game_plan.append(
                "Opponent employs a deep low-block. Use patient box-edge circulation, switches of play, "
                "and sustained field tilt rather than rushed direct passes."
            )
        elif team_summary.playstyle.axes.press_intensity > 65:
            game_plan.append(
                "High-intensity press expected. Utilize vertical third-man runs and direct counter-transitions behind their high defensive line."
            )

        return BlueprintOut(
            team=team_summary.team,
            competition_name=team_summary.competition_name,
            matches=team_summary.matches,
            rating=team_summary.rating,
            playstyle=team_summary.playstyle,
            sequence_predictability=float(ds_playstyle.get("sequence_predictability", 0.5)),
            press_triggers=press_triggers,
            press_blind_spots=press_blind_spots,
            most_vulnerable_zones=vuln_zones,
            most_solid_zones=solid_zones,
            most_attacked_zone=ds_zones.get("most_attacked_zone"),
            strengths=strengths,
            weaknesses=weaknesses,
            phase_scores={k: float(v) for k, v in ds_swot.get("phase_scores", {}).items()},
            top_players=top_players,
            game_plan=game_plan,
        )

    # -------------------------------------------------------------------------
    # SWOT Analysis
    # -------------------------------------------------------------------------
    def get_team_swot(self, team_id: int) -> SwotOut | None:
        team_summary = self.get_team_summary(team_id)
        if not team_summary:
            return None

        metrics_items: list[SwotItem] = []
        if not self.swot_metrics_df.empty:
            m_sub = self.swot_metrics_df[self.swot_metrics_df["team_id"] == team_id]
            for _, r in m_sub.iterrows():
                metrics_items.append(
                    SwotItem(
                        metric=str(r["metric"]),
                        label=str(r["label"]),
                        phase=str(r["phase"]),
                        value=float(r["value"]) if pd.notna(r.get("value")) else None,
                        unit=str(r["unit"]) if pd.notna(r.get("unit")) else None,
                        percentile=float(r["percentile"]) * 100 if float(r["percentile"]) <= 1.0 else float(r["percentile"]),
                        higher_is_better=bool(r["higher_is_better"]) if pd.notna(r.get("higher_is_better")) else None,
                        description=str(r.get("description", "")),
                        verdict=str(r.get("verdict", "average")),
                    )
                )

        strengths = sorted([m for m in metrics_items if "strength" in m.verdict], key=lambda x: x.percentile, reverse=True)[:6]
        weaknesses = sorted([m for m in metrics_items if "weakness" in m.verdict], key=lambda x: x.percentile)[:6]

        phase_scores: dict[str, float] = {}
        profile_balance = 0.5
        if not self.team_swot_df.empty:
            sw_sub = self.team_swot_df[self.team_swot_df["team_id"] == team_id]
            if not sw_sub.empty:
                sw_row = sw_sub.iloc[0]
                profile_balance = float(sw_row.get("profile_balance", 0.5))
                for col in self.team_swot_df.columns:
                    if col.startswith("phase_"):
                        phase_name = col.replace("phase_", "").replace("_", " ").title()
                        phase_scores[phase_name] = float(sw_row[col])

        return SwotOut(
            team=team_summary.team,
            strengths=strengths,
            weaknesses=weaknesses,
            phase_scores=phase_scores,
            metrics=metrics_items,
            profile_balance=profile_balance,
        )

    # -------------------------------------------------------------------------
    # Pitch-Zone Vulnerabilities
    # -------------------------------------------------------------------------
    def get_team_zones(self, team_id: int) -> ZonesOut | None:
        team_summary = self.get_team_summary(team_id)
        if not team_summary:
            return None

        grid: list[ZoneCell] = []
        if not self.zone_vuln_df.empty:
            zv_sub = self.zone_vuln_df[self.zone_vuln_df["team_id"] == team_id]
            for _, r in zv_sub.iterrows():
                channel = int(r["channel"])
                corridor = "flank" if channel in (0, 4) else ("half_space" if channel in (1, 3) else "central")
                grid.append(
                    ZoneCell(
                        zone_id=int(r["zone_id"]),
                        zone_name=str(r["zone_name"]),
                        band=int(r["band"]),
                        channel=channel,
                        band_name=str(r["band_name"]),
                        channel_name=str(r["channel_name"]),
                        corridor=corridor,
                        vulnerability_index=float(r["vulnerability_index"]),
                        conceded_entries_p90=float(r.get("conceded_entries_p90", 0.0)),
                        conceded_xt_per_entry=float(r.get("conceded_xt_per_entry", 0.0)),
                        conceded_shot_chains=int(r.get("conceded_shot_chains", 0)),
                        conceded_goals=int(r.get("conceded_goals", 0)),
                        clean_recovery_rate=float(r.get("clean_recovery_rate", 0.0)) if pd.notna(r.get("clean_recovery_rate")) else None,
                        exposure_rank_in_team=int(r["exposure_rank_in_team"]) if pd.notna(r.get("exposure_rank_in_team")) else None,
                    )
                )

        corridors: list[CorridorSummary] = []
        for corr_type in ("flank", "half_space", "central"):
            cells = [c for c in grid if c.corridor == corr_type]
            if cells:
                corridors.append(
                    CorridorSummary(
                        corridor=corr_type,
                        mean_vulnerability=round(float(np.mean([c.vulnerability_index for c in cells])), 1),
                        conceded_shot_chains=sum(c.conceded_shot_chains for c in cells),
                        conceded_goals=sum(c.conceded_goals for c in cells),
                    )
                )

        entry_routes: dict[str, float] = {}
        if not self.entry_routes_df.empty:
            er_sub = self.entry_routes_df[self.entry_routes_df["team_id"] == team_id]
            if not er_sub.empty:
                r_dict = er_sub.iloc[0].to_dict()
                entry_routes = {
                    k: round(float(v), 4)
                    for k, v in r_dict.items()
                    if k != "team_id" and pd.notna(v)
                }

        return ZonesOut(
            team=team_summary.team,
            grid=grid,
            corridors=corridors,
            entry_routes=entry_routes,
        )

    # -------------------------------------------------------------------------
    # Expected Goals (xG) & Timeline
    # -------------------------------------------------------------------------
    def get_team_xg(self, team_id: int) -> TeamXgOut | None:
        team_summary = self.get_team_summary(team_id)
        if not team_summary:
            return None

        with self.engine.connect() as conn:
            matches_rows = conn.execute(
                text(
                    """
                    SELECT m.match_id, f.kickoff_utc, m.home_team_id, m.away_team_id,
                           m.home_score, m.away_score,
                           COALESCE(sh_home.xg, 0.0) as home_xg,
                           COALESCE(sh_away.xg, 0.0) as away_xg
                    FROM core.matches m
                    JOIN core.fixtures f ON f.fixture_id = m.match_id
                    LEFT JOIN (
                        SELECT match_id, SUM(xg) as xg FROM core.shots WHERE team_id = :tid GROUP BY match_id
                    ) sh_home ON sh_home.match_id = m.match_id AND m.home_team_id = :tid
                    LEFT JOIN (
                        SELECT match_id, SUM(xg) as xg FROM core.shots WHERE team_id = :tid GROUP BY match_id
                    ) sh_away ON sh_away.match_id = m.match_id AND m.away_team_id = :tid
                    WHERE m.home_team_id = :tid OR m.away_team_id = :tid
                    ORDER BY f.kickoff_utc ASC
                    """
                ),
                {"tid": team_id},
            ).fetchall()

            player_xg_rows = conn.execute(
                text(
                    """
                    SELECT player_id,
                           COUNT(*) as shots,
                           SUM(CASE WHEN is_goal THEN 1 ELSE 0 END) as goals,
                           SUM(xg) as total_xg,
                           COALESCE(SUM(xa), 0.0) as total_xa
                    FROM core.shots
                    WHERE team_id = :tid
                    GROUP BY player_id
                    ORDER BY total_xg DESC
                    LIMIT 10
                    """
                ),
                {"tid": team_id},
            ).fetchall()

            # Global shots stats for this team
            shot_counts = conn.execute(
                text(
                    """
                    SELECT COUNT(*) as shots_for,
                           SUM(CASE WHEN is_goal THEN 1 ELSE 0 END) as goals_for,
                           COALESCE(SUM(xg), 0.0) as xg_for,
                           COALESCE(SUM(CASE WHEN shot_type <> 'penalty' THEN xg ELSE 0 END), 0.0) as npxg_for
                    FROM core.shots
                    WHERE team_id = :tid
                    """
                ),
                {"tid": team_id},
            ).fetchone()

            # Shots against
            opp_shots = conn.execute(
                text(
                    """
                    SELECT COUNT(*) as shots_against,
                           SUM(CASE WHEN is_goal THEN 1 ELSE 0 END) as goals_against,
                           COALESCE(SUM(xg), 0.0) as xg_against
                    FROM core.shots s
                    JOIN core.matches m ON m.match_id = s.match_id
                    WHERE (m.home_team_id = :tid OR m.away_team_id = :tid) AND s.team_id <> :tid
                    """
                ),
                {"tid": team_id},
            ).fetchone()

        timeline: list[XgMatchRow] = []
        for r in matches_rows:
            is_home = r.home_team_id == team_id
            opp_id = r.away_team_id if is_home else r.home_team_id
            gf = r.home_score if is_home else r.away_score
            ga = r.away_score if is_home else r.home_score
            timeline.append(
                XgMatchRow(
                    match_id=r.match_id,
                    kickoff_utc=r.kickoff_utc,
                    opponent=self.team_ref(opp_id),
                    is_home=is_home,
                    goals_for=gf,
                    goals_against=ga,
                    xg_for=round(float(r.home_xg if is_home else r.away_xg), 2),
                    xg_against=0.0,
                )
            )

        top_players = [
            XgPlayerRow(
                player=self.player_ref(pr.player_id),
                shots=int(pr.shots),
                goals=int(pr.goals),
                xg=round(float(pr.total_xg), 2),
                xa=round(float(pr.total_xa), 2),
                key_passes=0,
            )
            for pr in player_xg_rows
        ]

        shots_for = int(shot_counts.shots_for or 0)
        xg_for = float(shot_counts.xg_for or 0.0)

        return TeamXgOut(
            team=team_summary.team,
            matches=len(timeline),
            shots_for=shots_for,
            shots_against=int(opp_shots.shots_against or 0),
            goals_for=int(shot_counts.goals_for or 0),
            goals_against=int(opp_shots.goals_against or 0),
            xg_for=round(xg_for, 2),
            xg_against=round(float(opp_shots.xg_against or 0.0), 2),
            npxg_for=round(float(shot_counts.npxg_for or 0.0), 2),
            xg_per_shot=round(xg_for / shots_for, 3) if shots_for > 0 else 0.0,
            timeline=timeline,
            top_players=top_players,
        )

    def get_match_shots(self, match_id: int) -> list[ShotOut]:
        with self.engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT action_id, team_id, player_id, period_id, match_seconds,
                           x, y, xg, is_goal, shot_type, bodypart, assister_id, xa
                    FROM core.shots
                    WHERE match_id = :mid
                    ORDER BY action_id ASC
                    """
                ),
                {"mid": match_id},
            ).fetchall()

        return [
            ShotOut(
                action_id=r.action_id,
                team_id=r.team_id,
                player=self.player_ref(r.player_id),
                period_id=r.period_id,
                minute=round(r.match_seconds / 60.0, 1),
                x=round(float(r.x), 2),
                y=round(float(r.y), 2),
                xg=round(float(r.xg), 3),
                is_goal=bool(r.is_goal),
                shot_type=r.shot_type,
                bodypart=r.bodypart,
                assister=self.player_ref(r.assister_id) if r.assister_id else None,
                xa=round(float(r.xa), 3) if r.xa is not None else None,
            )
            for r in rows
        ]

    def get_xg_model(self) -> XgModelOut:
        info = self.xg_model_info
        return XgModelOut(
            model=info.get("model", "logistic_regression"),
            features=info.get("features", []),
            coefficients=info.get("coefficients", {}),
            intercept=float(info.get("intercept", 0.0)),
            penalty_xg=float(info.get("penalty_xg", 0.76)),
            validation=info.get("validation", {}),
        )

    # -------------------------------------------------------------------------
    # Matches & Lineups
    # -------------------------------------------------------------------------
    def list_matches(
        self,
        competition_id: int | None = None,
        team_id: int | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[MatchSummary]:
        with self.engine.connect() as conn:
            query = """
                SELECT m.match_id, f.competition_id, c.competition_name, f.gameweek, f.kickoff_utc, f.venue,
                       m.home_team_id, m.away_team_id, m.home_score, m.away_score,
                       sh_h.xg as home_xg, sh_a.xg as away_xg
                FROM core.matches m
                JOIN core.fixtures f ON f.fixture_id = m.match_id
                JOIN core.competitions c ON c.competition_id = f.competition_id
                LEFT JOIN (SELECT match_id, SUM(xg) as xg FROM core.shots GROUP BY match_id) sh_all ON sh_all.match_id = m.match_id
                LEFT JOIN (SELECT match_id, team_id, SUM(xg) as xg FROM core.shots GROUP BY match_id, team_id) sh_h
                    ON sh_h.match_id = m.match_id AND sh_h.team_id = m.home_team_id
                LEFT JOIN (SELECT match_id, team_id, SUM(xg) as xg FROM core.shots GROUP BY match_id, team_id) sh_a
                    ON sh_a.match_id = m.match_id AND sh_a.team_id = m.away_team_id
                WHERE 1=1
            """
            params: dict[str, Any] = {"lim": limit, "off": offset}
            if competition_id:
                query += " AND f.competition_id = :cid"
                params["cid"] = competition_id
            if team_id:
                query += " AND (m.home_team_id = :tid OR m.away_team_id = :tid)"
                params["tid"] = team_id

            query += " ORDER BY f.kickoff_utc DESC LIMIT :lim OFFSET :off"
            rows = conn.execute(text(query), params).fetchall()

        return [
            MatchSummary(
                match_id=r.match_id,
                competition_id=r.competition_id,
                competition_name=r.competition_name,
                gameweek=r.gameweek,
                kickoff_utc=r.kickoff_utc,
                venue=r.venue,
                home=self.team_ref(r.home_team_id),
                away=self.team_ref(r.away_team_id),
                home_score=r.home_score,
                away_score=r.away_score,
                home_xg=round(float(r.home_xg), 2) if r.home_xg is not None else None,
                away_xg=round(float(r.away_xg), 2) if r.away_xg is not None else None,
            )
            for r in rows
        ]

    def get_match_detail(self, match_id: int) -> MatchDetail | None:
        with self.engine.connect() as conn:
            m = conn.execute(
                text(
                    """
                    SELECT m.match_id, f.competition_id, c.competition_name, f.gameweek, f.kickoff_utc, f.venue,
                           m.home_team_id, m.away_team_id, m.home_score, m.away_score, m.duration, m.n_events
                    FROM core.matches m
                    JOIN core.fixtures f ON f.fixture_id = m.match_id
                    JOIN core.competitions c ON c.competition_id = f.competition_id
                    WHERE m.match_id = :mid
                    """
                ),
                {"mid": match_id},
            ).fetchone()

            if not m:
                return None

            lineups_rows = conn.execute(
                text(
                    """
                    SELECT l.team_id, l.player_id, l.jersey_number, l.is_starter, l.minutes_played,
                           p.short_name, p.role_name
                    FROM core.lineups l
                    JOIN core.players p ON p.player_id = l.player_id
                    WHERE l.match_id = :mid
                    ORDER BY l.is_starter DESC, l.minutes_played DESC
                    """
                ),
                {"mid": match_id},
            ).fetchall()

            # Stats per team in match
            stats_rows = conn.execute(
                text(
                    """
                    SELECT team_id,
                           COUNT(*) as total_actions,
                           SUM(CASE WHEN type_id = 0 THEN 1 ELSE 0 END) as passes,
                           SUM(CASE WHEN type_id = 0 AND result_id = 1 THEN 1 ELSE 0 END) as pass_successes
                    FROM core.events
                    WHERE match_id = :mid
                    GROUP BY team_id
                    """
                ),
                {"mid": match_id},
            ).fetchall()

            xg_rows = conn.execute(
                text(
                    """
                    SELECT team_id, COUNT(*) as shots, COALESCE(SUM(xg), 0.0) as total_xg
                    FROM core.shots
                    WHERE match_id = :mid
                    GROUP BY team_id
                    """
                ),
                {"mid": match_id},
            ).fetchall()

        xg_map = {r.team_id: (int(r.shots), float(r.total_xg)) for r in xg_rows}
        stats_map = {r.team_id: r for r in stats_rows}

        tot_actions = sum(r.total_actions for r in stats_rows) or 1

        def build_side_stats(tid: int) -> TeamMatchStats:
            st = stats_map.get(tid)
            passes = int(st.passes) if st else 0
            succ = int(st.pass_successes) if st else 0
            shots, xg = xg_map.get(tid, (0, 0.0))
            actions = int(st.total_actions) if st else 0

            players = [
                LineupPlayer(
                    player=self.player_ref(lr.player_id),
                    jersey_number=lr.jersey_number,
                    is_starter=lr.is_starter,
                    minutes_played=lr.minutes_played,
                    role=lr.role_name,
                )
                for lr in lineups_rows
                if lr.team_id == tid
            ]

            return TeamMatchStats(
                team=self.team_ref(tid),
                shots=shots,
                shots_on_target_proxy=0,
                xg=round(xg, 2),
                passes=passes,
                pass_accuracy=round((succ / passes) * 100, 1) if passes > 0 else 0.0,
                possession_share=round((actions / tot_actions) * 100, 1),
                lineup=players,
            )

        home_stats = build_side_stats(m.home_team_id)
        away_stats = build_side_stats(m.away_team_id)

        summary = MatchSummary(
            match_id=m.match_id,
            competition_id=m.competition_id,
            competition_name=m.competition_name,
            gameweek=m.gameweek,
            kickoff_utc=m.kickoff_utc,
            venue=m.venue,
            home=home_stats.team,
            away=away_stats.team,
            home_score=m.home_score,
            away_score=m.away_score,
            home_xg=home_stats.xg,
            away_xg=away_stats.xg,
        )

        return MatchDetail(
            summary=summary,
            duration=m.duration,
            home_stats=home_stats,
            away_stats=away_stats,
            n_events=m.n_events,
        )

    # -------------------------------------------------------------------------
    # Passing Networks & Tactical Heatmaps
    # -------------------------------------------------------------------------
    def get_passing_network(self, match_id: int, team_id: int, min_passes: int = 2) -> PassingNetworkOut | None:
        with self.engine.connect() as conn:
            events_rows = conn.execute(
                text(
                    """
                    SELECT action_id, player_id, time_seconds, start_x, start_y, end_x, end_y, result_id
                    FROM core.events
                    WHERE match_id = :mid AND team_id = :tid AND type_id = 0
                    ORDER BY action_id ASC
                    """
                ),
                {"mid": match_id, "tid": team_id},
            ).fetchall()

        if not events_rows:
            return None

        df_p = pd.DataFrame(
            [
                {
                    "action_id": r.action_id,
                    "player_id": r.player_id,
                    "time_seconds": r.time_seconds,
                    "start_x": r.start_x,
                    "start_y": r.start_y,
                    "result_id": r.result_id,
                }
                for r in events_rows
            ]
        )

        # Successful passes for node centroids
        succ_passes = df_p[df_p["result_id"] == 1].copy()
        if succ_passes.empty:
            return None

        nodes_agg = (
            succ_passes.groupby("player_id")
            .agg(pos_x=("start_x", "mean"), pos_y=("start_y", "mean"), n_passes=("action_id", "count"))
            .reset_index()
        )

        # Consecutive passing edge sequence (< 5s temporal window)
        succ_passes["next_player"] = succ_passes["player_id"].shift(-1)
        succ_passes["time_diff"] = succ_passes["time_seconds"].shift(-1) - succ_passes["time_seconds"]

        valid_edges = succ_passes[
            (succ_passes["time_diff"] < 5.0) & (succ_passes["player_id"] != succ_passes["next_player"])
        ]

        edge_counts = (
            valid_edges.groupby(["player_id", "next_player"])
            .size()
            .reset_index(name="pass_count")
        )

        node_dict = set(nodes_agg["player_id"])
        edges: list[NetworkEdge] = []
        recv_counts: dict[int, int] = {}

        for _, er in edge_counts.iterrows():
            p1, p2, cnt = int(er["player_id"]), int(er["next_player"]), int(er["pass_count"])
            recv_counts[p2] = recv_counts.get(p2, 0) + cnt
            if cnt >= min_passes and p1 in node_dict and p2 in node_dict:
                edges.append(NetworkEdge(source=p1, target=p2, count=cnt))

        nodes: list[NetworkNode] = []
        tot_deg = sum(er["pass_count"] for _, er in edge_counts.iterrows()) or 1
        for _, nr in nodes_agg.iterrows():
            pid = int(nr["player_id"])
            deg = int(nr["n_passes"])
            nodes.append(
                NetworkNode(
                    player=self.player_ref(pid),
                    x=round(float(nr["pos_x"]), 1),
                    y=round(float(nr["pos_y"]), 1),
                    passes_completed=deg,
                    passes_received=recv_counts.get(pid, 0),
                    degree_centrality=round(deg / tot_deg, 3),
                    betweenness=0.0,
                )
            )

        return PassingNetworkOut(
            match_id=match_id,
            team=self.team_ref(team_id),
            min_passes=min_passes,
            total_passes=len(succ_passes),
            nodes=nodes,
            edges=edges,
        )

    def get_heatmap(
        self,
        team_id: int | None = None,
        player_id: int | None = None,
        match_id: int | None = None,
        type_id: int | None = None,
        nx: int = 32,
        ny: int = 24,
    ) -> HeatmapOut:
        with self.engine.connect() as conn:
            query = "SELECT start_x, start_y FROM core.events WHERE 1=1"
            params: dict[str, Any] = {}
            if team_id:
                query += " AND team_id = :tid"
                params["tid"] = team_id
            if player_id:
                query += " AND player_id = :pid"
                params["pid"] = player_id
            if match_id:
                query += " AND match_id = :mid"
                params["mid"] = match_id
            if type_id is not None:
                query += " AND type_id = :type_id"
                params["type_id"] = type_id

            query += " LIMIT 50000"
            rows = conn.execute(text(query), params).fetchall()

        grid = np.zeros((ny, nx), dtype=int)
        for r in rows:
            ix = int(np.clip(np.floor(r.start_x / (105.0 / nx)), 0, nx - 1))
            iy = int(np.clip(np.floor(r.start_y / (68.0 / ny)), 0, ny - 1))
            grid[iy, ix] += 1

        return HeatmapOut(
            nx=nx,
            ny=ny,
            pitch_length=105.0,
            pitch_width=68.0,
            counts=grid.tolist(),
            max_count=int(grid.max()),
            n_actions=len(rows),
            filter={
                "team_id": team_id,
                "player_id": player_id,
                "match_id": match_id,
                "type_id": type_id,
            },
        )

    # -------------------------------------------------------------------------
    # Tactical Matchup Simulator
    # -------------------------------------------------------------------------
    def simulate_matchup(self, team_a_id: int, team_b_id: int) -> MatchupOut | None:
        ta_summary = self.get_team_summary(team_a_id)
        tb_summary = self.get_team_summary(team_b_id)
        if not ta_summary or not tb_summary:
            return None

        ta_swot = self.get_team_swot(team_a_id)
        tb_swot = self.get_team_swot(team_b_id)
        ta_zones = self.get_team_zones(team_a_id)
        tb_zones = self.get_team_zones(team_b_id)

        # Cross-comparison of tactical phases
        def build_side(
            team_s: TeamSummary, swot_own: SwotOut | None, swot_opp: SwotOut | None, zones_opp: ZonesOut | None
        ) -> MatchupSide:
            edges: list[MatchupEdge] = []
            if swot_own and swot_opp:
                for phase, score_own in swot_own.phase_scores.items():
                    score_opp = swot_opp.phase_scores.get(phase, 50.0)
                    gap = score_own - score_opp
                    if gap > 10.0:
                        edges.append(
                            MatchupEdge(
                                phase=phase,
                                attacker_score=score_own,
                                defender_score=score_opp,
                                gap=round(gap, 1),
                            )
                        )
            edges.sort(key=lambda x: x.gap, reverse=True)

            targets: list[ZoneSummary] = []
            if zones_opp and zones_opp.grid:
                sorted_opp = sorted(zones_opp.grid, key=lambda z: z.vulnerability_index, reverse=True)[:3]
                targets = [
                    ZoneSummary(
                        zone=z.zone_name,
                        vulnerability_index=z.vulnerability_index,
                        shot_chains_conceded=z.conceded_shot_chains,
                        goals_conceded_via_zone=z.conceded_goals,
                    )
                    for z in sorted_opp
                ]

            return MatchupSide(
                team=team_s.team,
                rating=team_s.rating,
                playstyle=team_s.playstyle,
                exploitable_phases=edges,
                target_zones=targets,
            )

        side_a = build_side(ta_summary, ta_swot, tb_swot, tb_zones)
        side_b = build_side(tb_summary, tb_swot, ta_swot, ta_zones)

        # Axis deltas (A - B)
        axis_deltas = {
            "possession_dominance": round(ta_summary.playstyle.axes.possession_dominance - tb_summary.playstyle.axes.possession_dominance, 1),
            "low_block": round(ta_summary.playstyle.axes.low_block - tb_summary.playstyle.axes.low_block, 1),
            "press_intensity": round(ta_summary.playstyle.axes.press_intensity - tb_summary.playstyle.axes.press_intensity, 1),
        }

        # Head-to-head historical matches
        with self.engine.connect() as conn:
            h2h_rows = conn.execute(
                text(
                    """
                    SELECT m.match_id, f.competition_id, c.competition_name, f.gameweek, f.kickoff_utc, f.venue,
                           m.home_team_id, m.away_team_id, m.home_score, m.away_score
                    FROM core.matches m
                    JOIN core.fixtures f ON f.fixture_id = m.match_id
                    JOIN core.competitions c ON c.competition_id = f.competition_id
                    WHERE (m.home_team_id = :ta AND m.away_team_id = :tb)
                       OR (m.home_team_id = :tb AND m.away_team_id = :ta)
                    ORDER BY f.kickoff_utc DESC
                    """
                ),
                {"ta": team_a_id, "tb": team_b_id},
            ).fetchall()

        h2h = [
            MatchSummary(
                match_id=r.match_id,
                competition_id=r.competition_id,
                competition_name=r.competition_name,
                gameweek=r.gameweek,
                kickoff_utc=r.kickoff_utc,
                venue=r.venue,
                home=self.team_ref(r.home_team_id),
                away=self.team_ref(r.away_team_id),
                home_score=r.home_score,
                away_score=r.away_score,
            )
            for r in h2h_rows
        ]

        return MatchupOut(
            team_a=side_a,
            team_b=side_b,
            rating_edge=round(ta_summary.rating.team - tb_summary.rating.team, 2),
            axis_deltas=axis_deltas,
            head_to_head=h2h,
        )


@lru_cache(maxsize=1)
def get_repository() -> DataRepository:
    return DataRepository()
