from fastapi import APIRouter
from app.services.plan_comparison_service import plan_comparison_service

router = APIRouter()


@router.get("/latest")
def get_latest_plan_comparison():
    """Return the most recent simulated Plan Compare result for the dashboard."""
    return plan_comparison_service.latest()
