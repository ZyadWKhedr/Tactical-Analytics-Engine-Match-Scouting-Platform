from fastapi import APIRouter, Depends, HTTPException, Query
from backend.app.repository import DataRepository, get_repository
from backend.app.schemas import PaginatedPlayers, PlayerProfile, PlayerRatingOut, SquadRatingOut

router = APIRouter(prefix="/ratings", tags=["Contextual Ratings"])

@router.get("/squads", response_model=list[SquadRatingOut])
def get_squad_ratings(
    competition_id: int | None = Query(None, description="Filter by competition ID"),
    repo: DataRepository = Depends(get_repository),
) -> list[SquadRatingOut]:
    """
    Squad Ratings Leaderboard (1.0 - 10.0 scale, anchored at μ = 6.5):
    - Overall team rating, attack rating, defence rating
    - Ridge-adjusted team strength
    - Form trajectory & goal difference p90
    """
    return repo.get_squad_ratings(competition_id=competition_id)

@router.get("/players", response_model=PaginatedPlayers)
def get_player_ratings(
    position_group: str | None = Query(None, description="e.g. Center Back, Striker, Central Midfield"),
    min_minutes: float = Query(300.0, ge=0, description="Minimum estimated minutes played"),
    team_id: int | None = Query(None, description="Filter by team ID"),
    search: str | None = Query(None, description="Search player by name"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    repo: DataRepository = Depends(get_repository),
) -> PaginatedPlayers:
    """
    Contextual Player Ratings (1.0 - 10.0 scale, μ = 6.5) adjusted for role,
    opponent strength, game state, and Bayesian minutes shrinkage.
    """
    total, items = repo.get_player_ratings(
        position_group=position_group,
        min_minutes=min_minutes,
        team_id=team_id,
        search=search,
        limit=limit,
        offset=offset,
    )
    return PaginatedPlayers(total=total, items=items)

@router.get("/players/{player_id}", response_model=PlayerProfile)
def get_player_profile(player_id: int, repo: DataRepository = Depends(get_repository)) -> PlayerProfile:
    """Returns biographical profile, role, appearances, shots, goals, and 6-axis ratings radar components."""
    res = repo.get_player_profile(player_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"Player {player_id} not found")
    return res
