from fastapi import APIRouter, Depends
from backend.app.repository import DataRepository, get_repository
from backend.app.schemas import ShotOut, XgModelOut

router = APIRouter(prefix="/xg", tags=["Expected Goals & Assists"])

@router.get("/model", response_model=XgModelOut)
def get_xg_model(repo: DataRepository = Depends(get_repository)) -> XgModelOut:
    """Returns the calibrated logistic regression xG model: coefficients, intercept, and held-out validation metrics."""
    return repo.get_xg_model()
