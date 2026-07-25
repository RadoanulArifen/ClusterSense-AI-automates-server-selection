from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Node
from app.ml.ml_service import cost_service
from app.services.trust_meter_service import trust_meter_service
from app.services.outcome_record_service import outcome_record_service

router = APIRouter()


@router.get("/recommendations")
def get_recommendations(db: Session = Depends(get_db)):
    nodes = db.query(Node).filter(Node.is_active == True).all()
    node_list = [
        {
            "node_id":                  n.node_id,
            "cpu_usage_percent":        n.cpu_usage,
            "ram_usage_percent":        n.ram_usage,
            "active_jobs":              n.active_jobs,
            "idle_time_minutes":        n.idle_time_minutes,
            "power_consumption_watts":  n.power_watts,
            "utilization_score":        n.utilization_score,
            "monthly_cost_usd":         n.monthly_cost_usd,
            "health_status":            n.health_status,
            # aliases
            "cpu_usage":  n.cpu_usage,
            "ram_usage":  n.ram_usage,
            "power_watts": n.power_watts,
            "running_services": n.running_services,
        }
        for n in nodes
    ]

    recs = cost_service.analyze(node_list)
    trust_summary = None
    try:
        for recommendation in recs:
            outcome_record_service.record_recommendation(
                module="cost_optimization",
                recommendation=recommendation["action"],
                recommended_node=recommendation["node_id"],
                predicted_action=recommendation["action"],
            )
        trust_summary = trust_meter_service.summary("cost_optimization")
    except Exception:
        # Cost recommendations remain available even if local trust telemetry fails.
        pass

    total_cost    = sum(r["current_cost_monthly"]     for r in recs)
    total_saving  = sum(r["estimated_saving_monthly"] for r in recs)
    idle_count    = sum(1 for r in recs if r["action"] in ["Shutdown", "Sleep Mode"])
    avg_util      = sum(r["utilization_score"] for r in recs) / len(recs) if recs else 0

    return {
        "summary": {
            "total_monthly_cost":    round(total_cost,   2),
            "total_saving_monthly":  round(total_saving, 2),
            "total_saving_annual":   round(total_saving * 12, 2),
            "idle_servers":          idle_count,
            "avg_utilization_score": round(avg_util, 1),
            "savings_percentage":    round((total_saving / total_cost * 100) if total_cost > 0 else 0, 1),
        },
        "recommendations": recs,
        "trust_meter": trust_summary,
    }
