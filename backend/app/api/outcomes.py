from typing import Optional
from fastapi import APIRouter
from app.services.outcome_record_service import outcome_record_service

router = APIRouter()


@router.get("/")
def list_outcomes(
    module: Optional[str] = None, status: Optional[str] = None,
    search: Optional[str] = None, limit: Optional[int] = None,
):
    """Return simulated recommendation outcomes, newest first."""
    return outcome_record_service.list_records(module, status, search, limit)
