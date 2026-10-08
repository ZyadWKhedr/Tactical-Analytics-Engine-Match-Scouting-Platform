from fastapi import APIRouter, Depends, HTTPException, Query
from backend.app.repository import DataRepository, get_repository
from backend.app.schemas import BlueprintOut, PressTrigger, SwotOut, TeamSummary, TeamXgOut, ZonesOut

router = APIRouter(prefix="/teams", tags=["Teams & Tactical Dossiers"])

@router.get("", response_model=list[TeamSummary])
def list_teams(
    competition_id: int | None = Query(None, description="Filter by competition ID"),
    repo: DataRepository = Depends(get_repository),
) -> list[TeamSummary]:
    """Returns all 142 scouted teams with playstyle archetypes, 3-axis continuous indices, and 1-10 ratings."""
    return repo.list_teams(competition_id=competition_id)

@router.get("/{team_id}", response_model=TeamSummary)
def get_team(team_id: int, repo: DataRepository = Depends(get_repository)) -> TeamSummary:
    """Returns high-level summary and playstyle for a single team."""
    res = repo.get_team_summary(team_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"Team {team_id} not found")
    return res

@router.get("/{team_id}/blueprint", response_model=BlueprintOut)
def get_opponent_blueprint(team_id: int, repo: DataRepository = Depends(get_repository)) -> BlueprintOut:
    """
    Returns full machine-readable Opponent Scouting Blueprint:
    - Most vulnerable & most solid zones
    - Situational press triggers & press blind spots
    - Key strengths & weaknesses
    - Top rated squad players
    - Automated deterministic tactical game plan recommendations
    """
    res = repo.get_opponent_blueprint(team_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"Dossier for team {team_id} not found")
    return res

@router.get("/{team_id}/swot", response_model=SwotOut)
def get_team_swot(team_id: int, repo: DataRepository = Depends(get_repository)) -> SwotOut:
    """Returns SWOT catalogue across 9 tactical phases of play and 35+ granular percentiles."""
    res = repo.get_team_swot(team_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"SWOT data for team {team_id} not found")
    return res

@router.get("/{team_id}/zones", response_model=ZonesOut)
def get_team_zones(team_id: int, repo: DataRepository = Depends(get_repository)) -> ZonesOut:
    """
    Returns reliability-calibrated 6x5 pitch grid defensive vulnerability indices:
    - 30 spatial grid cells
    - Macro corridors (flanks, half-spaces, central)
    - Box entry routes (crosses, passes, carries)
    """
    res = repo.get_team_zones(team_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"Zone vulnerabilities for team {team_id} not found")
    return res

@router.get("/{team_id}/press-triggers", response_model=list[PressTrigger])
def get_team_press_triggers(team_id: int, repo: DataRepository = Depends(get_repository)) -> list[PressTrigger]:
    """Returns empirical Bayes shrunk press reaction propensities for 5s/22m window triggers."""
    bp = repo.get_opponent_blueprint(team_id)
    if not bp:
        raise HTTPException(status_code=404, detail=f"Team {team_id} not found")
    return bp.press_triggers

@router.get("/{team_id}/xg", response_model=TeamXgOut)
def get_team_xg(team_id: int, repo: DataRepository = Depends(get_repository)) -> TeamXgOut:
    """Returns season match-by-match xG vs actual goals timeline and top xG/xA contributors."""
    res = repo.get_team_xg(team_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"xG history for team {team_id} not found")
    return res
