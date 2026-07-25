from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from collections import defaultdict
from app.database import get_db
from app.models.models import Node, DeploymentRequest, Deployment, Alert, NodeMetric

router = APIRouter()


def node_dict(n):
    return {
        "id": n.id, "node_id": n.node_id, "hostname": n.hostname,
        "ip_address": n.ip_address, "cpu_cores": n.cpu_cores,
        "cpu_usage": n.cpu_usage, "ram_total_gb": n.ram_total_gb, "ram_usage": n.ram_usage,
        "disk_total_gb": n.disk_total_gb, "disk_usage": n.disk_usage,
        "network_usage": n.network_usage, "active_jobs": n.active_jobs,
        "idle_time_minutes": n.idle_time_minutes, "power_watts": n.power_watts,
        "temperature": n.temperature, "utilization_score": n.utilization_score,
        "monthly_cost_usd": n.monthly_cost_usd,
        "running_services": n.running_services, "uptime_hours": n.uptime_hours,
        "health_status": n.health_status, "location": n.location, "node_type": n.node_type,
    }


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    nodes = db.query(Node).filter(Node.is_active == True).all()
    n = len(nodes)
    if n == 0:
        return {}
    healthy  = sum(1 for x in nodes if x.health_status == "healthy")
    warning  = sum(1 for x in nodes if x.health_status == "warning")
    critical = sum(1 for x in nodes if x.health_status == "critical")
    avg_cpu  = sum(x.cpu_usage for x in nodes) / n
    avg_ram  = sum(x.ram_usage for x in nodes) / n
    avg_disk = sum(x.disk_usage for x in nodes) / n
    total_pwr = sum(x.power_watts for x in nodes)
    total_svcs = sum(x.running_services for x in nodes)
    avg_util = sum(x.utilization_score for x in nodes) / n
    total_cost = sum(x.monthly_cost_usd for x in nodes)
    health_score = max(0, min(100, (healthy/n*100) - warning*2 - critical*5))

    pending = db.query(DeploymentRequest).filter(DeploymentRequest.status.in_(["pending","analyzing"])).count()
    total_deps = db.query(Deployment).filter(Deployment.status == "completed").count()
    active_alerts = db.query(Alert).filter(Alert.is_acknowledged == False).count()

    return {
        "total_servers": n, "healthy_servers": healthy,
        "warning_servers": warning, "critical_servers": critical,
        "avg_cpu_usage": round(avg_cpu, 2), "avg_ram_usage": round(avg_ram, 2),
        "avg_disk_usage": round(avg_disk, 2), "total_power_kw": round(total_pwr/1000, 2),
        "total_running_services": total_svcs, "avg_utilization_score": round(avg_util, 1),
        "total_monthly_cost_usd": round(total_cost, 2),
        "cluster_health_score": round(health_score, 1),
        "pending_requests": pending, "total_deployments": total_deps,
        "active_alerts": active_alerts,
    }


@router.get("/nodes")
def get_nodes(db: Session = Depends(get_db)):
    return [node_dict(n) for n in db.query(Node).filter(Node.is_active == True).order_by(Node.node_id).all()]


@router.get("/metrics/trends")
def get_trends(db: Session = Depends(get_db)):
    metrics = db.query(NodeMetric).order_by(NodeMetric.recorded_at.desc()).limit(600).all()
    if not metrics:
        return {"cpu": [], "ram": [], "network": [], "temperature": [], "power": []}
    groups = defaultdict(list)
    for m in metrics:
        groups[m.recorded_at.strftime("%H:%M")].append(m)
    result = []
    for t in sorted(groups.keys())[-20:]:
        g = groups[t]
        result.append({
            "time": t,
            "cpu":   round(sum(m.cpu_usage for m in g)/len(g), 1),
            "ram":   round(sum(m.ram_usage for m in g)/len(g), 1),
            "network": round(sum(m.network_usage for m in g)/len(g), 1),
            "temperature": round(sum(m.temperature for m in g)/len(g), 1),
            "power": round(sum(m.power_watts for m in g)/len(g), 1),
        })
    return {
        "cpu":         [{"time": d["time"], "value": d["cpu"]}         for d in result],
        "ram":         [{"time": d["time"], "value": d["ram"]}         for d in result],
        "network":     [{"time": d["time"], "value": d["network"]}     for d in result],
        "temperature": [{"time": d["time"], "value": d["temperature"]} for d in result],
        "power":       [{"time": d["time"], "value": d["power"]}       for d in result],
    }
