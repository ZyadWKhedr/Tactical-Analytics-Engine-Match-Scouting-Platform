"""
Test suite for Tactical Analytics REST API.
Verifies all Person 4 required endpoints, response contracts, 4xx error handling,
and database/model connectivity.
"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.repository import compute_smoothed_density

client = TestClient(app)


# -----------------------------------------------------------------------------
# System & Meta Tests
# -----------------------------------------------------------------------------
def test_health():
    """[No DB] Health check probe."""
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"


def test_meta():
    """[Database Required] Global dataset and source database connectivity check."""
    res = client.get("/api/v1/meta")
    assert res.status_code == 200
    data = res.json()
    assert data["n_matches"] >= 1
    assert data["n_teams"] >= 1
    assert data["n_competitions"] >= 1
    assert data["source"]["database_ok"] is True


# -----------------------------------------------------------------------------
# Teams, Archetypes & Tactical Dossiers
# -----------------------------------------------------------------------------
def test_list_teams():
    """[Models Only] Team directory with playstyles and ratings."""
    res = client.get("/api/v1/teams")
    assert res.status_code == 200
    teams = res.json()
    assert len(teams) >= 20
    sample = teams[0]
    assert "team" in sample
    assert "rating" in sample
    assert "playstyle" in sample
    assert 1.0 <= sample["rating"]["team"] <= 10.0


def test_team_detail_and_blueprint():
    """[Models Only] Single team summary and Opponent Scouting Blueprint."""
    res = client.get("/api/v1/teams/1613")
    assert res.status_code == 200
    assert res.json()["team"]["team_id"] == 1613

    # Blueprint
    res_bp = client.get("/api/v1/teams/1613/blueprint")
    assert res_bp.status_code == 200
    bp = res_bp.json()
    assert "most_vulnerable_zones" in bp
    assert "press_triggers" in bp
    assert "game_plan" in bp
    assert len(bp["game_plan"]) > 0


def test_team_swot_and_zones():
    """[Models Only] SWOT phase scores and 6x5 defensive grid vulnerabilities."""
    res_swot = client.get("/api/v1/teams/1613/swot")
    assert res_swot.status_code == 200
    swot = res_swot.json()
    assert "strengths" in swot
    assert "weaknesses" in swot
    assert "phase_scores" in swot

    res_zones = client.get("/api/v1/teams/1613/zones")
    assert res_zones.status_code == 200
    zones = res_zones.json()
    assert len(zones["grid"]) == 30
    assert len(zones["corridors"]) == 3
    assert "entry_routes" in zones


# -----------------------------------------------------------------------------
# Ratings Leaderboards & Player Profiles
# -----------------------------------------------------------------------------
def test_squad_ratings():
    """[Models Only] Squad contextual rating leaderboard."""
    res = client.get("/api/v1/ratings/squads")
    assert res.status_code == 200
    squads = res.json()
    assert len(squads) >= 20
    assert squads[0]["rank"] == 1
    assert squads[0]["team_rating"] >= squads[-1]["team_rating"]


def test_player_ratings():
    """[Database & Models] Filterable player ratings and detailed player profile."""
    res = client.get("/api/v1/ratings/players?limit=20&min_minutes=500")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 100
    assert len(data["items"]) == 20
    p = data["items"][0]
    assert p["rating"] >= 6.0
    assert "components" in p

    # Player profile
    pid = p["player"]["player_id"]
    res_prof = client.get(f"/api/v1/ratings/players/{pid}")
    assert res_prof.status_code == 200
    assert res_prof.json()["player"]["player_id"] == pid


# -----------------------------------------------------------------------------
# Expected Goals & Model Calibration
# -----------------------------------------------------------------------------
def test_xg_team_and_model():
    """[Database & Models] Logistic regression xG model and team-level xG timeline."""
    res_model = client.get("/api/v1/xg/model")
    assert res_model.status_code == 200
    m = res_model.json()
    assert m["model"] == "logistic_regression"
    assert "validation" in m

    res_txg = client.get("/api/v1/teams/1613/xg")
    assert res_txg.status_code == 200
    txg = res_txg.json()
    assert txg["shots_for"] > 0
    assert txg["xg_for"] > 0.0
    assert len(txg["timeline"]) > 0


# -----------------------------------------------------------------------------
# Matches, Shot Maps & Passing Networks
# -----------------------------------------------------------------------------
def test_matches_and_detail():
    """[Database Required] Match fixtures, lineups and shot maps."""
    res = client.get("/api/v1/matches?limit=10")
    assert res.status_code == 200
    matches = res.json()
    assert len(matches) == 10
    mid = matches[0]["match_id"]

    res_det = client.get(f"/api/v1/matches/{mid}")
    assert res_det.status_code == 200
    det = res_det.json()
    assert len(det["home_stats"]["lineup"]) > 0
    assert len(det["away_stats"]["lineup"]) > 0

    res_shots = client.get(f"/api/v1/matches/{mid}/shots")
    assert res_shots.status_code == 200


def test_compute_smoothed_density_unit():
    """[No DB / Pure Unit] Standalone helper tests: all-zero grid, single outlier resilience, and sigma=0."""
    # (1) All-zero grid
    zero_grid = [[0] * 16 for _ in range(12)]
    d_zero, p98_zero = compute_smoothed_density(zero_grid, sigma=1.0)
    assert p98_zero == 0.0
    assert len(d_zero) == 12 and all(len(row) == 16 for row in d_zero)
    assert all(all(val == 0.0 for val in row) for row in d_zero)

    # (2) Single outlier cell (outlier spike must not crush all other cells' density to ~0)
    outlier_grid = [[5.0] * 20 for _ in range(20)]
    outlier_grid[0][0] = 500.0  # extreme outlier
    d_outlier, p98_outlier = compute_smoothed_density(outlier_grid, sigma=1.0)
    assert p98_outlier > 0.0
    assert d_outlier[0][0] == 1.0  # outlier clipped at 1.0
    # Crucial: Outlier must NOT push every other cell's density to ~0 (log1p scaling preserves ~40% density)
    assert d_outlier[10][10] > 0.35
    assert all(all(0.0 <= val <= 1.0 for val in row) for row in d_outlier)

    # (3) sigma=0 disables smoothing (derived directly from unsmoothed counts normalized to p98)
    raw_grid = [[0.0, 10.0], [20.0, 50.0]]
    d_raw, p98_raw = compute_smoothed_density(raw_grid, sigma=0.0)
    assert p98_raw > 0.0
    assert d_raw[0][0] == 0.0
    assert d_raw[1][1] == 1.0


def test_passing_network_and_heatmap():
    """[Database Required] Directed passing network graph and spatial action density."""
    # 2500089: match between 1646 and 1659
    res_pn = client.get("/api/v1/matches/2500089/passing-network?team_id=1659&min_passes=1")
    assert res_pn.status_code == 200
    pn = res_pn.json()
    assert len(pn["nodes"]) > 0
    assert len(pn["edges"]) > 0

    res_hm = client.get("/api/v1/visuals/heatmap?team_id=1659&nx=16&ny=12")
    assert res_hm.status_code == 200
    hm = res_hm.json()
    assert hm["nx"] == 16
    assert hm["ny"] == 12
    assert len(hm["counts"]) == 12
    assert len(hm["counts"][0]) == 16
    assert len(hm["density"]) == 12
    assert len(hm["density"][0]) == 16


def test_heatmap_density_contract_and_smoothing():
    """[Database Required] Heatmap returns density [ny][nx] in [0, 1], and raw counts sum to n_actions."""
    res = client.get("/api/v1/visuals/heatmap?team_id=1659&nx=16&ny=12&sigma=1.0")
    assert res.status_code == 200
    hm = res.json()
    assert hm["nx"] == 16
    assert hm["ny"] == 12
    # Density grid shape [ny][nx] and bounds in [0, 1]
    assert len(hm["density"]) == 12
    assert all(len(row) == 16 for row in hm["density"])
    assert all(all(0.0 <= val <= 1.0 for val in row) for row in hm["density"])
    # Raw counts still sum to total binned n_actions
    assert sum(sum(row) for row in hm["counts"]) == hm["n_actions"]
    assert hm["n_actions"] > 0
    assert hm["sigma"] == 1.0
    assert hm["p98_count"] > 0.0


def test_heatmap_sigma_zero_unsmoothed():
    """[Database Required] sigma=0 returns density derived from the unsmoothed counts."""
    res = client.get("/api/v1/visuals/heatmap?team_id=1659&nx=16&ny=12&sigma=0")
    assert res.status_code == 200
    hm = res.json()
    assert hm["sigma"] == 0.0
    assert len(hm["density"]) == 12
    assert all(len(row) == 16 for row in hm["density"])
    assert all(all(0.0 <= val <= 1.0 for val in row) for row in hm["density"])
    assert sum(sum(row) for row in hm["counts"]) == hm["n_actions"]


def test_matchup_simulator():
    """[Database & Models] Two-club tactical clash deliberation."""
    # Newcastle vs Bournemouth
    res = client.get("/api/v1/matchup?team_a=1613&team_b=1659")
    assert res.status_code == 200
    m = res.json()
    assert m["team_a"]["team"]["team_id"] == 1613
    assert m["team_b"]["team"]["team_id"] == 1659
    assert "axis_deltas" in m
    assert "head_to_head" in m


# -----------------------------------------------------------------------------
# Error Handling & Edge Case Tests (Person 5 / QA Readiness)
# -----------------------------------------------------------------------------
def test_unknown_team_id_404():
    """[Contract / Error] Non-existent team ID returns 404 for team summary and blueprint."""
    res = client.get("/api/v1/teams/99999999")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()

    res_bp = client.get("/api/v1/teams/99999999/blueprint")
    assert res_bp.status_code == 404
    assert "not found" in res_bp.json()["detail"].lower()


def test_unknown_match_id_404():
    """[Database Required / Error] Non-existent match ID returns 404."""
    res = client.get("/api/v1/matches/99999999")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_heatmap_empty_filter_zero_grid():
    """[Database Required / Edge Case] Heatmap query matching zero actions returns a valid zero grid (not 500)."""
    res = client.get("/api/v1/visuals/heatmap?player_id=99999999&nx=16&ny=12")
    assert res.status_code == 200
    data = res.json()
    assert data["nx"] == 16
    assert data["ny"] == 12
    assert data["n_actions"] == 0
    assert data["max_count"] == 0
    assert data["p98_count"] == 0.0
    assert len(data["counts"]) == 12
    assert all(len(row) == 16 for row in data["counts"])
    assert all(all(val == 0 for val in row) for row in data["counts"])
    assert len(data["density"]) == 12
    assert all(len(row) == 16 for row in data["density"])
    assert all(all(val == 0.0 for val in row) for row in data["density"])


def test_invalid_query_params_422():
    """[Validation / Error] Boundary violations on query parameters return 422 Unprocessable Entity."""
    # nx out of allowed range [8, 64]
    res_nx_high = client.get("/api/v1/visuals/heatmap?nx=999")
    assert res_nx_high.status_code == 422

    res_nx_low = client.get("/api/v1/visuals/heatmap?nx=2")
    assert res_nx_low.status_code == 422

    # ny out of allowed range [6, 48]
    res_ny_high = client.get("/api/v1/visuals/heatmap?ny=100")
    assert res_ny_high.status_code == 422

    # sigma out of allowed range [0, 4]
    res_sigma_low = client.get("/api/v1/visuals/heatmap?sigma=-1.0")
    assert res_sigma_low.status_code == 422

    res_sigma_high = client.get("/api/v1/visuals/heatmap?sigma=5.0")
    assert res_sigma_high.status_code == 422

    # matches limit out of allowed range [1, 200]
    res_limit = client.get("/api/v1/matches?limit=0")
    assert res_limit.status_code == 422
