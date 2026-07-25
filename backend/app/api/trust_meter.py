from fastapi import APIRouter
from app.services.trust_meter_service import trust_meter_service

router = APIRouter()


@router.get("/summary")
def get_trust_summary():
    """Return historical recommendation trust for every AI recommendation module."""
    return trust_meter_service.summary()
