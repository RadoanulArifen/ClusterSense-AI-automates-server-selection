from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Node

router = APIRouter()


def nd(n):
    return {
        "id": n.id, "node_id": n.node_id, "hostname": n.hostname, "ip_address": n.ip_address,
        "cpu_cores": n.cpu_cores, "cpu_usage": n.cpu_usage, "ram_total_gb": n.ram_total_gb,
        "ram_usage": n.ram_usage, "disk_total_gb": n.disk_total_gb, "disk_usage": n.disk_usage,
        "network_usage": n.network_usage, "active_jobs": n.active_jobs,
        "idle_time_minutes": n.idle_time_minutes, "power_watts": n.power_watts,
        "temperature": n.temperature, "utilization_score": n.utilization_score,
        "monthly_cost_usd": n.monthly_cost_usd, "running_services": n.running_services,
        "uptime_hours": n.uptime_hours, "health_status": n.health_status,
        "location": n.location, "node_type": n.node_type,
    }


@router.get("/")
def list_nodes(db: Session = Depends(get_db)):
    return [nd(n) for n in db.query(Node).filter(Node.is_active == True).all()]


@router.get("/{node_id}")
def get_node(node_id: str, db: Session = Depends(get_db)):
    n = db.query(Node).filter(Node.node_id == node_id).first()
    if not n: raise HTTPException(404, "Node not found")
    return nd(n)
