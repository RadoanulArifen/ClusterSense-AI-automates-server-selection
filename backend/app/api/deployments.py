import uuid, random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.models import Node, DeploymentRequest, Deployment, NodeMetric, AuditLog, Alert
from app.ml.ml_service import scheduling_service
from app.services.trust_meter_service import trust_meter_service
from app.services.outcome_record_service import outcome_record_service

router = APIRouter()


class ScheduleBody(BaseModel):
    request_id: str


class DeployBody(BaseModel):
    request_id: str
    node_id: str
    confidence_score: float
    ai_reasoning: str


@router.post("/schedule")
def schedule(body: ScheduleBody, db: Session = Depends(get_db)):
    """Run Smart Scheduling AI and return recommended node."""

    try:
        req = db.query(DeploymentRequest).filter(
            DeploymentRequest.request_id == body.request_id
        ).first()

        if not req:
            raise HTTPException(status_code=404, detail="Request not found")

        req.status = "analyzing"
        db.commit()

        nodes = db.query(Node).filter(Node.is_active == True).all()

        node_list = [
            {
                "node_id": n.node_id,
                "cpu_usage_percent": n.cpu_usage,
                "ram_usage_percent": n.ram_usage,
                "disk_usage_percent": n.disk_usage,
                "network_usage_percent": n.network_usage,
                "active_jobs": n.active_jobs,
                "idle_time_minutes": n.idle_time_minutes,
                "power_consumption_watts": n.power_watts,
                "temperature_celsius": n.temperature,
                "utilization_score": n.utilization_score,
                "health_status": n.health_status,
                "location": n.location,
                "cpu_cores": n.cpu_cores,
                "ram_total_gb": n.ram_total_gb,

                # aliases
                "cpu_usage": n.cpu_usage,
                "ram_usage": n.ram_usage,
                "temperature": n.temperature,
                "power_watts": n.power_watts,
                "running_services": n.running_services,
            }
            for n in nodes
        ]

        request_data = {
            "job_type": req.job_type,
            "cpu_required": req.required_cpu,
            "memory_required_gb": req.required_ram_gb,
            "estimated_runtime_min": req.estimated_runtime_min,
            "priority": req.priority,
        }

        print("=" * 80)
        print("REQUEST DATA:")
        print(request_data)

        print("=" * 80)
        print(f"TOTAL NODES: {len(node_list)}")

        result = scheduling_service.recommend(node_list, request_data)
        if not result.get("error"):
            try:
                outcome_record_service.record_recommendation(
                    module="scheduling",
                    recommendation=f"Deploy to {result['recommended_node']}",
                    recommended_node=result["recommended_node"],
                    predicted_action="Deploy",
                )
                result["trust_meter"] = trust_meter_service.summary("scheduling")
            except Exception:
                # Trust telemetry must never prevent a scheduling recommendation.
                pass

        print("=" * 80)
        print("SCHEDULING RESULT:")
        print(result)

        return {
            "request_id": body.request_id,
            "service_name": req.service_name,
            "customer_name": req.customer_name,
            "job_type": req.job_type,
            "required_cpu": req.required_cpu,
            "required_ram_gb": req.required_ram_gb,
            "required_disk_gb": req.required_disk_gb,
            "priority": req.priority,
            "scheduling_result": result,
        }

    except Exception as e:
        import traceback

        print("=" * 80)
        print("SCHEDULING ERROR")
        traceback.print_exc()
        print("=" * 80)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.post("/deploy")
def deploy(body: DeployBody, db: Session = Depends(get_db)):
    """Execute deployment — update node resources and mark request completed."""
    req = db.query(DeploymentRequest).filter(DeploymentRequest.request_id == body.request_id).first()
    if not req:
        raise HTTPException(404, "Request not found")

    node = db.query(Node).filter(Node.node_id == body.node_id).first()
    if not node:
        raise HTTPException(404, "Node not found")

    # Update node resource usage
    node.cpu_usage   = min(99, node.cpu_usage   + req.required_cpu * 0.8)
    node.ram_usage   = min(99, node.ram_usage   + (req.required_ram_gb / node.ram_total_gb) * 100 * 0.9)
    node.disk_usage  = min(99, node.disk_usage  + (req.required_disk_gb / node.disk_total_gb) * 100)
    node.active_jobs     += 1
    node.running_services += 1
    node.idle_time_minutes = max(0, node.idle_time_minutes - 30)
    node.network_usage = min(99, node.network_usage + random.uniform(2, 8))
    node.power_watts   = min(1200, node.power_watts + req.required_cpu * 8)
    node.utilization_score = round((node.cpu_usage + node.ram_usage) / 2, 1)
    node.monthly_cost_usd  = round((node.power_watts / 1000) * 0.12 * 24 * 30, 2)

    # Re-evaluate health
    if node.cpu_usage > 85 or node.ram_usage > 85:
        node.health_status = "critical"
    elif node.cpu_usage > 70 or node.ram_usage > 70:
        node.health_status = "warning"

    # Record metric snapshot
    db.add(NodeMetric(
        node_id=node.id,
        cpu_usage=node.cpu_usage, ram_usage=node.ram_usage,
        disk_usage=node.disk_usage, network_usage=node.network_usage,
        active_jobs=node.active_jobs, power_watts=node.power_watts,
        temperature=node.temperature + random.uniform(0, 2),
    ))

    # Mark request completed
    req.status = "completed"

    # Create deployment record
    dep = Deployment(
        deployment_id=f"DEP-{uuid.uuid4().hex[:8].upper()}",
        request_id=req.id, node_id=node.id,
        assigned_cpu=req.required_cpu, assigned_ram_gb=req.required_ram_gb,
        assigned_disk_gb=req.required_disk_gb,
        confidence_score=body.confidence_score / 100,
        ai_reasoning=body.ai_reasoning,
        recommended_node=body.node_id, status="completed",
    )
    db.add(dep)

    # Alert if node is now critical
    if node.health_status == "critical":
        db.add(Alert(
            alert_id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
            node_id=node.node_id, alert_type="High Resource Usage",
            severity="critical",
            message=f"{node.node_id}: Resource usage critical after deploying {req.service_name}",
        ))

    db.add(AuditLog(
        action="DEPLOY", entity_type="deployment",
        entity_id=dep.deployment_id,
        details=f"Deployed {req.service_name} → {node.node_id} (AI confidence: {body.confidence_score:.1f}%)",
    ))

    db.commit()

    return {
        "success": True,
        "deployment_id": dep.deployment_id,
        "node_id": node.node_id,
        "service_name": req.service_name,
        "new_cpu_usage": round(node.cpu_usage, 2),
        "new_ram_usage": round(node.ram_usage, 2),
        "new_active_jobs": node.active_jobs,
        "new_running_services": node.running_services,
        "utilization_score": node.utilization_score,
        "health_status": node.health_status,
        "message": f"Successfully deployed {req.service_name} to {node.node_id}",
    }


@router.get("/")
def list_deployments(db: Session = Depends(get_db)):
    deps = db.query(Deployment).order_by(Deployment.deployed_at.desc()).limit(50).all()
    return [
        {
            "id": d.id, "deployment_id": d.deployment_id,
            "service_name":  d.request.service_name  if d.request else "—",
            "customer_name": d.request.customer_name if d.request else "—",
            "node_id":       d.node.node_id           if d.node    else "—",
            "assigned_cpu": d.assigned_cpu, "assigned_ram_gb": d.assigned_ram_gb,
            "confidence_score": round(d.confidence_score * 100, 1),
            "status": d.status,
            "deployed_at": d.deployed_at.isoformat() if d.deployed_at else None,
        }
        for d in deps
    ]
