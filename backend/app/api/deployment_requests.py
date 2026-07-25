import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.models import DeploymentRequest, AuditLog

router = APIRouter()


class CreateRequestBody(BaseModel):
    customer_name: str
    customer_email: str
    service_type: str
    service_name: str
    job_type: str = "ETL"
    required_cpu: float
    required_ram_gb: float
    required_disk_gb: float
    estimated_runtime_min: int = 60
    priority: str = "Medium"
    monthly_price: float = 0.0
    notes: Optional[str] = None


def rd(r):
    return {
        "id": r.id, "request_id": r.request_id,
        "customer_name": r.customer_name, "customer_email": r.customer_email,
        "service_type": r.service_type, "service_name": r.service_name,
        "job_type": r.job_type,
        "required_cpu": r.required_cpu, "required_ram_gb": r.required_ram_gb,
        "required_disk_gb": r.required_disk_gb,
        "estimated_runtime_min": r.estimated_runtime_min,
        "priority": r.priority, "monthly_price": r.monthly_price,
        "status": r.status, "notes": r.notes,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    }


@router.get("/")
def list_requests(status: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(DeploymentRequest)
    if status:
        q = q.filter(DeploymentRequest.status == status)
    return [rd(r) for r in q.order_by(DeploymentRequest.created_at.desc()).limit(100).all()]


@router.post("/")
def create_request(body: CreateRequestBody, db: Session = Depends(get_db)):
    req_id = f"REQ-{uuid.uuid4().hex[:8].upper()}"
    req = DeploymentRequest(
        request_id=req_id,
        customer_name=body.customer_name, customer_email=body.customer_email,
        service_type=body.service_type, service_name=body.service_name,
        job_type=body.job_type,
        required_cpu=body.required_cpu, required_ram_gb=body.required_ram_gb,
        required_disk_gb=body.required_disk_gb,
        estimated_runtime_min=body.estimated_runtime_min,
        priority=body.priority, monthly_price=body.monthly_price,
        notes=body.notes, status="pending",
    )
    db.add(req)
    db.add(AuditLog(action="CREATE_REQUEST", entity_type="deployment_request",
                    entity_id=req_id, details=f"{body.customer_name} → {body.service_name}"))
    db.commit()
    db.refresh(req)
    return rd(req)


@router.get("/{request_id}")
def get_request(request_id: str, db: Session = Depends(get_db)):
    r = db.query(DeploymentRequest).filter(DeploymentRequest.request_id == request_id).first()
    if not r:
        raise HTTPException(404, "Request not found")
    return rd(r)


@router.patch("/{request_id}/status")
def update_status(request_id: str, status: str, db: Session = Depends(get_db)):
    r = db.query(DeploymentRequest).filter(DeploymentRequest.request_id == request_id).first()
    if not r:
        raise HTTPException(404, "Request not found")
    r.status = status
    db.commit()
    return {"message": "Status updated", "status": status}
