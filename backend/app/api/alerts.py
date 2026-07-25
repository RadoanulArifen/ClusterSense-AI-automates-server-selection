from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Alert

router = APIRouter()


@router.get("/")
def list_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(50).all()
    return [
        {
            "id": a.id, "alert_id": a.alert_id, "node_id": a.node_id,
            "alert_type": a.alert_type, "severity": a.severity,
            "message": a.message, "is_acknowledged": a.is_acknowledged,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in alerts
    ]


@router.patch("/{alert_id}/acknowledge")
def acknowledge(alert_id: str, db: Session = Depends(get_db)):
    a = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if a:
        a.is_acknowledged = True
        db.commit()
    return {"message": "Alert acknowledged"}
