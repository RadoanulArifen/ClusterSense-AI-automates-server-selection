import random
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Node
from app.services.plan_comparison_service import plan_comparison_service

router = APIRouter()


class SimBody(BaseModel):
    future_deployments: int
    avg_cpu_per_deployment: float = 4.0
    avg_ram_per_deployment: float = 8.0
    avg_disk_per_deployment: float = 100.0


@router.post("/whatif")
def whatif(body: SimBody, db: Session = Depends(get_db)):
    nodes = db.query(Node).filter(Node.is_active == True).all()
    if not nodes:
        return {"error": "No nodes"}

    n = len(nodes)
    avg_cpu  = sum(x.cpu_usage for x in nodes) / n
    avg_ram  = sum(x.ram_usage for x in nodes) / n
    total_svcs = sum(x.running_services for x in nodes)

    cpu_per_node = (body.future_deployments * body.avg_cpu_per_deployment * 0.8) / n
    ram_per_node = (body.future_deployments * body.avg_ram_per_deployment / 64) * 100 / n

    fut_cpu = min(99, avg_cpu + cpu_per_node)
    fut_ram = min(99, avg_ram + ram_per_node)

    overloaded, at_risk = [], []
    for node in nodes:
        fc = min(99, node.cpu_usage + cpu_per_node + random.uniform(-5, 10))
        fr = min(99, node.ram_usage + ram_per_node + random.uniform(-3, 7))
        if fc > 85 or fr > 85:
            overloaded.append({"node_id": node.node_id, "projected_cpu": round(fc,1), "projected_ram": round(fr,1)})
        elif fc > 70 or fr > 70:
            at_risk.append({"node_id": node.node_id, "projected_cpu": round(fc,1), "projected_ram": round(fr,1)})

    health = "Critical" if fut_cpu > 85 or fut_ram > 85 else ("Warning" if fut_cpu > 70 or fut_ram > 70 else "Healthy")
    healthy_nodes = [x for x in nodes if x.health_status == "healthy" and x.cpu_usage < 60]
    suggested = [x.node_id for x in sorted(healthy_nodes, key=lambda x: x.cpu_usage)[:5]]
    capacity_left = max(0, len([x for x in nodes if x.node_id not in [o["node_id"] for o in overloaded]]) * 5 - body.future_deployments)

    rec_map = {
        "Critical": f"⛔ CRITICAL: {len(overloaded)}/{n} nodes will be overloaded. Add 3-5 new servers before deploying.",
        "Warning":  f"⚠️ WARNING: {len(overloaded)} nodes at risk. Consider deferring {len(overloaded)*5} deployments.",
        "Healthy":  "✅ SAFE: Cluster can handle the projected deployments without issues.",
    }
    plan_comparison = plan_comparison_service.compare(
        {
            "future_deployments": body.future_deployments,
            "avg_cpu_per_deployment": body.avg_cpu_per_deployment,
            "avg_ram_per_deployment": body.avg_ram_per_deployment,
        },
        [{
            "node_id": node.node_id,
            "cpu_usage": node.cpu_usage,
            "ram_usage": node.ram_usage,
            "ram_total_gb": node.ram_total_gb,
            "monthly_cost_usd": node.monthly_cost_usd,
            "health_status": node.health_status,
        } for node in nodes],
    )

    return {
        "simulation_params": {
            "future_deployments": body.future_deployments,
            "avg_cpu_per_deployment": body.avg_cpu_per_deployment,
            "avg_ram_per_deployment": body.avg_ram_per_deployment,
        },
        "current_state": {"avg_cpu": round(avg_cpu,1), "avg_ram": round(avg_ram,1), "total_services": total_svcs, "active_nodes": n},
        "projected_state": {"avg_cpu": round(fut_cpu,1), "avg_ram": round(fut_ram,1), "total_services": total_svcs + body.future_deployments, "cluster_health": health},
        "overloaded_nodes": overloaded,
        "at_risk_nodes": at_risk,
        "suggested_servers": suggested,
        "capacity_remaining": capacity_left,
        "recommendation": rec_map[health],
        "plan_comparison": plan_comparison,
    }
