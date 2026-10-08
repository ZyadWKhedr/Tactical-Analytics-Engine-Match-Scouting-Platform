from fastapi import APIRouter, Depends
from backend.app.repository import DataRepository, get_repository
from backend.app.schemas import MetaOut

router = APIRouter(prefix="", tags=["System Metadata"])

@router.get("/meta", response_model=MetaOut)
def get_metadata(repo: DataRepository = Depends(get_repository)) -> MetaOut:
    """Returns database size, competitions, loaded match counts, and engine version."""
    return repo.get_metadata()
