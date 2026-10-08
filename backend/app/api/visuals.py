from fastapi import APIRouter, Depends, Query
from backend.app.repository import DataRepository, get_repository
from backend.app.schemas import HeatmapOut

router = APIRouter(prefix="/visuals", tags=["Spatial Visuals & Heatmaps"])

@router.get("/heatmap", response_model=HeatmapOut)
def get_spatial_heatmap(
    team_id: int | None = Query(None, description="Filter actions by team ID"),
    player_id: int | None = Query(None, description="Filter actions by player ID"),
    match_id: int | None = Query(None, description="Filter actions by match ID"),
    type_id: int | None = Query(None, description="Filter actions by SPADL type (e.g. 0=pass, 11=shot, 9=tackle, 18=clearance)"),
    nx: int = Query(32, ge=8, le=64, description="Pitch length grid bins"),
    ny: int = Query(24, ge=6, le=48, description="Pitch width grid bins"),
    repo: DataRepository = Depends(get_repository),
) -> HeatmapOut:
    """
    Computes 2D spatial action density histogram on a canonical 105m x 68m pitch:
    Filterable by player, team, match, and action type (pass, shot, duel, recovery).
    """
    return repo.get_heatmap(
        team_id=team_id,
        player_id=player_id,
        match_id=match_id,
        type_id=type_id,
        nx=nx,
        ny=ny,
    )
