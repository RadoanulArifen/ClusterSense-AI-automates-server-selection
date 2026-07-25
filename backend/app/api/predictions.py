import random
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Node
from app.ml.ml_service import failure_service

router = APIRouter()


@router.get("/failure")
def predict_all(db: Session = Depends(get_db)):
    """Run failure prediction on all active nodes using real model."""
    nodes = db.query(Node).filter(Node.is_active == True).all()
    results = []
    for n in nodes:
        pred = failure_service.predict({
            "node_id":                 n.node_id,
            "cpu_usage_percent":       n.cpu_usage,
            "ram_usage_percent":       n.ram_usage,
            "disk_usage_percent":      n.disk_usage,
            "network_usage_percent":   n.network_usage,
            "active_jobs":             n.active_jobs,
            "idle_time_minutes":       n.idle_time_minutes,
            "power_consumption_watts": n.power_watts,
            "temperature_celsius":     n.temperature,
        })
        results.append({
            "node_id":       n.node_id,
            "hostname":      n.hostname,
            "health_status": n.health_status,
            "cpu_usage":     n.cpu_usage,
            "ram_usage":     n.ram_usage,
            "disk_usage":    n.disk_usage,
            "temperature":   n.temperature,
            "active_jobs":   n.active_jobs,
            "idle_time_minutes": n.idle_time_minutes,
            "power_watts":   n.power_watts,
            "utilization_score": n.utilization_score,
            **pred,
        })

    order = {"High": 0, "Medium": 1, "Low": 2}
    results.sort(key=lambda x: order.get(x["risk_level"], 3))
    return results


@router.get("/failure/{node_id}")
def predict_node(node_id: str, db: Session = Depends(get_db)):
    n = db.query(Node).filter(Node.node_id == node_id).first()
    if not n:
        return {"error": "Node not found"}
    return failure_service.predict({
        "node_id":                 n.node_id,
        "cpu_usage_percent":       n.cpu_usage,
        "ram_usage_percent":       n.ram_usage,
        "disk_usage_percent":      n.disk_usage,
        "network_usage_percent":   n.network_usage,
        "active_jobs":             n.active_jobs,
        "idle_time_minutes":       n.idle_time_minutes,
        "power_consumption_watts": n.power_watts,
        "temperature_celsius":     n.temperature,
    })
