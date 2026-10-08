from fastapi import APIRouter, Depends, HTTPException, Query
from backend.app.repository import DataRepository, get_repository
from backend.app.schemas import MatchDetail, MatchSummary, PassingNetworkOut, ShotOut

router = APIRouter(prefix="/matches", tags=["Matches, Lineups & Shot Maps"])

@router.get("", response_model=list[MatchSummary])
def list_matches(
    competition_id: int | None = Query(None, description="Filter by competition ID"),
    team_id: int | None = Query(None, description="Filter by team ID"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    repo: DataRepository = Depends(get_repository),
) -> list[MatchSummary]:
    """Returns matches with scores and match-level expected goals totals."""
    return repo.list_matches(competition_id=competition_id, team_id=team_id, limit=limit, offset=offset)

@router.get("/{match_id}", response_model=MatchDetail)
def get_match_detail(match_id: int, repo: DataRepository = Depends(get_repository)) -> MatchDetail:
    """Returns match metadata, scores, passing stats, and full starting / bench lineups."""
    res = repo.get_match_detail(match_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"Match {match_id} not found")
    return res

@router.get("/{match_id}/shots", response_model=list[ShotOut])
def get_match_shots(match_id: int, repo: DataRepository = Depends(get_repository)) -> list[ShotOut]:
    """Returns all shots with individual xG, body part, outcome, and assister xA for this match."""
    return repo.get_match_shots(match_id)

@router.get("/{match_id}/passing-network", response_model=PassingNetworkOut)
def get_passing_network(
    match_id: int,
    team_id: int = Query(..., description="Team ID to generate passing network for"),
    min_passes: int = Query(2, ge=1, description="Minimum pairwise pass threshold"),
    repo: DataRepository = Depends(get_repository),
) -> PassingNetworkOut:
    """
    Computes directed tactical passing network:
    - Node spatial centroids (x, y)
    - Consecutive sequence pass volume between players (< 5s temporal window)
    - Node degree centrality
    """
    res = repo.get_passing_network(match_id=match_id, team_id=team_id, min_passes=min_passes)
    if not res:
        raise HTTPException(status_code=404, detail=f"No passing actions found for team {team_id} in match {match_id}")
    return res
