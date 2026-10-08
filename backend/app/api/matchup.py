from fastapi import APIRouter, Depends, HTTPException, Query
from backend.app.repository import DataRepository, get_repository
from backend.app.schemas import MatchupOut

router = APIRouter(prefix="", tags=["Tactical Matchup Simulator"])

@router.get("/matchup", response_model=MatchupOut)
def simulate_matchup(
    team_a: int = Query(..., description="Team A ID (Home / Attacking focus)"),
    team_b: int = Query(..., description="Team B ID (Away / Opponent)"),
    repo: DataRepository = Depends(get_repository),
) -> MatchupOut:
    """
    Simulates tactical friction between Team A and Team B:
    - Phase-by-phase tactical delta (Build-up, Chance Creation, Finishing, Defending, Transition)
    - Exploitable tactical vectors (Attacking strengths vs Defensive weaknesses)
    - Vulnerable target zones in opponent's defensive structure
    - Historical head-to-head match results
    """
    res = repo.simulate_matchup(team_a_id=team_a, team_b_id=team_b)
    if not res:
        raise HTTPException(status_code=404, detail="One or both teams not found")
    return res
