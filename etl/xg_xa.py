"""
Expected Goals (xG) and Expected Assists (xA)
=============================================

Usage (after ``python -m etl.load_wyscout``)::

    python -m etl.xg_xa

Model
-----
* **xG**: logistic regression on open-play and direct free-kick shots with
  features: log distance to goal centre (105, 34), visible goal-mouth angle
  between the posts (105, 30.34) / (105, 37.66), header flag, free-kick flag
  and assist context (cross / pass / take-on immediately before the shot).
  Penalties get their empirical conversion rate.
* **xA**: the xG of a shot credited to the team-mate whose completed pass
  (any pass-like SPADL action) immediately preceded it within 15 s.

Validation (docs/06 §2.2, no leakage): train/test split **by match**
(GroupShuffleSplit, ``random_state=42``). Held-out Brier score, log-loss,
ROC-AUC and a 10-bin reliability table are written to ``models/xg_model.json``.
The final model is refit on all matches before scoring.

Outputs: ``core.shots`` table, ``models/shots_xg.parquet``, ``models/xg_model.json``.
"""
from __future__ import annotations

import json
import logging

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import brier_score_loss, log_loss, roc_auc_score
from sklearn.model_selection import GroupShuffleSplit
from sqlalchemy import text

from backend.app.config import get_settings
from backend.app.db import get_engine
from etl.load_wyscout import copy_df

log = logging.getLogger("xg")

GOAL_X, GOAL_Y = 105.0, 34.0
POST_L, POST_R = 30.34, 37.66
SHOT, PENALTY, FREEKICK = 11, 12, 13
PASS_LIKE = (0, 1, 2, 3, 4, 5, 6)
CROSS_LIKE = (1, 3, 5)
TAKE_ON, DRIBBLE = 7, 21
HEAD = (1, 3)
SEED = 42
FEATURES = ["log_dist", "angle", "is_head", "is_freekick", "prev_cross", "prev_pass", "prev_takeon"]

SHOTS_SQL = """
WITH e AS (
  SELECT match_id, action_id, team_id, player_id, type_id, result_id, bodypart_id,
         period_id, match_seconds, start_x, start_y,
         LAG(action_id)     OVER w AS prev_action_id,
         LAG(team_id)       OVER w AS prev_team_id,
         LAG(player_id)     OVER w AS prev_player_id,
         LAG(type_id)       OVER w AS prev_type_id,
         LAG(result_id)     OVER w AS prev_result_id,
         LAG(match_seconds) OVER w AS prev_seconds
  FROM core.events
  WINDOW w AS (PARTITION BY match_id ORDER BY action_id)
)
SELECT * FROM e WHERE type_id IN (11, 12, 13)
"""


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    dx = (GOAL_X - df.start_x).clip(lower=0.1)
    dy = df.start_y - GOAL_Y
    df["distance_m"] = np.hypot(dx, dy)
    a1 = np.arctan2(POST_L - df.start_y, dx)
    a2 = np.arctan2(POST_R - df.start_y, dx)
    df["angle_rad"] = np.abs(a2 - a1)
    df["log_dist"] = np.log1p(df.distance_m)
    df["angle"] = df.angle_rad
    df["is_head"] = df.bodypart_id.isin(HEAD).astype(int)
    df["is_freekick"] = (df.type_id == FREEKICK).astype(int)

    same_team = df.prev_team_id == df.team_id
    recent = (df.match_seconds - df.prev_seconds) <= 15
    ok = same_team & recent & (df.prev_result_id == 1)
    df["prev_cross"] = (ok & df.prev_type_id.isin(CROSS_LIKE)).astype(int)
    df["prev_pass"] = (ok & df.prev_type_id.isin(PASS_LIKE) & ~df.prev_type_id.isin(CROSS_LIKE)).astype(int)
    df["prev_takeon"] = (same_team & recent & df.prev_type_id.isin((TAKE_ON, DRIBBLE))).astype(int)
    df["is_assisted"] = ok & df.prev_type_id.isin(PASS_LIKE) & (df.prev_player_id != df.player_id)
    df["is_goal"] = (df.result_id == 1).astype(int)
    return df


def reliability_table(y, p, bins=10):
    edges = np.quantile(p, np.linspace(0, 1, bins + 1))
    edges[0], edges[-1] = 0, 1
    idx = np.clip(np.searchsorted(edges, p, side="right") - 1, 0, bins - 1)
    out = []
    for b in range(bins):
        m = idx == b
        if m.any():
            out.append(dict(bin=b, n=int(m.sum()), mean_pred=round(float(p[m].mean()), 4),
                            observed=round(float(y[m].mean()), 4)))
    return out


def main() -> dict:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    settings = get_settings()
    engine = get_engine()

    with engine.connect() as conn:
        df = pd.read_sql(text(SHOTS_SQL), conn)
    if df.empty:
        raise SystemExit("No shots in core.events. Run python -m etl.load_wyscout first.")
    df = build_features(df)
    log.info("Loaded %d shots (%d goals)", len(df), df.is_goal.sum())

    np_mask = df.type_id != PENALTY
    X, y, groups = df.loc[np_mask, FEATURES].values, df.loc[np_mask, "is_goal"].values, df.loc[np_mask, "match_id"].values

    # ---- held-out validation (split by match) ------------------------------
    metrics: dict = {}
    if len(np.unique(groups)) >= 5:
        tr, te = next(GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=SEED).split(X, y, groups))
        clf = LogisticRegression(max_iter=1000, random_state=SEED).fit(X[tr], y[tr])
        p = clf.predict_proba(X[te])[:, 1]
        metrics = dict(
            n_train=int(len(tr)), n_test=int(len(te)),
            brier=round(float(brier_score_loss(y[te], p)), 5),
            brier_baseline=round(float(brier_score_loss(y[te], np.full_like(p, y[tr].mean()))), 5),
            log_loss=round(float(log_loss(y[te], p)), 5),
            roc_auc=round(float(roc_auc_score(y[te], p)), 4) if len(np.unique(y[te])) > 1 else None,
            mean_pred=round(float(p.mean()), 4), observed_rate=round(float(y[te].mean()), 4),
            reliability=reliability_table(y[te], p),
        )
        log.info("Held-out xG: Brier %.4f (baseline %.4f), AUC %s", metrics["brier"], metrics["brier_baseline"], metrics["roc_auc"])

    # ---- final fit on all matches ------------------------------------------
    clf = LogisticRegression(max_iter=1000, random_state=SEED).fit(X, y)
    df["xg"] = 0.0
    df.loc[np_mask, "xg"] = clf.predict_proba(X)[:, 1]
    pen = df.type_id == PENALTY
    pen_rate = float(df.loc[pen, "is_goal"].mean()) if pen.any() else 0.76
    df.loc[pen, "xg"] = pen_rate

    # ---- xA ------------------------------------------------------------------
    df["assist_action_id"] = df.prev_action_id.where(df.is_assisted & ~pen).astype("Int64")
    df["assister_id"] = df.prev_player_id.where(df.is_assisted & ~pen).astype("Int64")
    df["xa"] = df.xg.where(df.is_assisted & ~pen)

    # ---- team-level face validity (season xG vs goals) ------------------------
    team = df.groupby("team_id").agg(xg=("xg", "sum"), goals=("is_goal", "sum"))
    metrics["team_season_xg_goals_r"] = round(float(team.xg.corr(team.goals)), 4) if len(team) > 2 else None
    metrics["total_xg"] = round(float(df.xg.sum()), 1)
    metrics["total_goals"] = int(df.is_goal.sum())

    df["shot_type"] = np.select([pen, df.type_id == FREEKICK], ["penalty", "freekick"], "open_play")
    df["bodypart"] = np.where(df.is_head == 1, "head", "foot/other")
    out = df.rename(columns={"start_x": "x", "start_y": "y"})[[
        "match_id", "action_id", "team_id", "player_id", "period_id", "match_seconds", "x", "y",
        "distance_m", "angle_rad", "shot_type", "bodypart", "is_goal", "xg",
        "assist_action_id", "assister_id", "xa",
    ]].copy()
    out["is_goal"] = out.is_goal.astype(bool)

    with engine.begin() as conn:
        conn.execute(text("TRUNCATE core.shots"))
        copy_df(conn, "shots", out)
    out.to_parquet(settings.models_dir / "shots_xg.parquet", index=False)

    model = dict(
        model="logistic_regression", features=FEATURES, random_state=SEED,
        coefficients=dict(zip(FEATURES, [round(float(c), 5) for c in clf.coef_[0]])),
        intercept=round(float(clf.intercept_[0]), 5),
        penalty_xg=round(pen_rate, 4),
        validation=metrics,
    )
    (settings.models_dir / "xg_model.json").write_text(json.dumps(model, indent=2))
    log.info("Wrote %d shots. Team xG~goals r=%s", len(out), metrics.get("team_season_xg_goals_r"))
    return model


if __name__ == "__main__":
    main()
