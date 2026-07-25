"""SQLAlchemy ORM models for ClusterSense AI"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True, index=True)
    email         = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name     = Column(String, default="Infrastructure Admin")
    role          = Column(String, default="admin")
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())


class Node(Base):
    __tablename__ = "nodes"
    id               = Column(Integer, primary_key=True, index=True)
    node_id          = Column(String, unique=True, index=True, nullable=False)
    hostname         = Column(String, nullable=False)
    ip_address       = Column(String, nullable=False)
    cpu_cores        = Column(Integer, default=16)
    cpu_usage        = Column(Float, default=0.0)     # cpu_usage_percent
    ram_total_gb     = Column(Float, default=64.0)
    ram_usage        = Column(Float, default=0.0)     # ram_usage_percent
    disk_total_gb    = Column(Float, default=1000.0)
    disk_usage       = Column(Float, default=0.0)     # disk_usage_percent
    network_usage    = Column(Float, default=0.0)     # network_usage_percent
    active_jobs      = Column(Integer, default=0)
    idle_time_minutes= Column(Float, default=120.0)
    power_watts      = Column(Float, default=250.0)   # power_consumption_watts
    temperature      = Column(Float, default=45.0)    # temperature_celsius
    utilization_score= Column(Float, default=0.0)
    monthly_cost_usd = Column(Float, default=0.0)
    running_services = Column(Integer, default=0)
    uptime_hours     = Column(Float, default=0.0)
    health_status    = Column(String, default="healthy")
    location         = Column(String, default="DC-1")
    node_type        = Column(String, default="compute")
    is_active        = Column(Boolean, default=True)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())
    updated_at       = Column(DateTime(timezone=True), onupdate=func.now())
    metrics          = relationship("NodeMetric",  back_populates="node", cascade="all, delete-orphan")
    predictions      = relationship("Prediction",  back_populates="node", cascade="all, delete-orphan")


class DeploymentRequest(Base):
    __tablename__ = "deployment_requests"
    id                    = Column(Integer, primary_key=True, index=True)
    request_id            = Column(String, unique=True, index=True, nullable=False)
    customer_name         = Column(String, nullable=False)
    customer_email        = Column(String, nullable=False)
    service_type          = Column(String, nullable=False)
    service_name          = Column(String, nullable=False)
    # Job-level fields that match the Smart Scheduling dataset
    job_type              = Column(String, default="ETL")
    required_cpu          = Column(Float, nullable=False)
    required_ram_gb       = Column(Float, nullable=False)
    required_disk_gb      = Column(Float, nullable=False)
    estimated_runtime_min = Column(Integer, default=60)
    priority              = Column(String, default="Medium")
    monthly_price         = Column(Float, default=0.0)
    status                = Column(String, default="pending")
    notes                 = Column(Text, nullable=True)
    created_at            = Column(DateTime(timezone=True), server_default=func.now())
    updated_at            = Column(DateTime(timezone=True), onupdate=func.now())
    deployment            = relationship("Deployment", back_populates="request", uselist=False)


class Deployment(Base):
    __tablename__ = "deployments"
    id               = Column(Integer, primary_key=True, index=True)
    deployment_id    = Column(String, unique=True, index=True, nullable=False)
    request_id       = Column(Integer, ForeignKey("deployment_requests.id"), nullable=False)
    node_id          = Column(Integer, ForeignKey("nodes.id"), nullable=False)
    assigned_cpu     = Column(Float, nullable=False)
    assigned_ram_gb  = Column(Float, nullable=False)
    assigned_disk_gb = Column(Float, nullable=False)
    confidence_score = Column(Float, default=0.0)
    ai_reasoning     = Column(Text, nullable=True)
    recommended_node = Column(String, nullable=True)
    status           = Column(String, default="completed")
    deployed_by      = Column(String, default="admin@hostnova.com")
    deployed_at      = Column(DateTime(timezone=True), server_default=func.now())
    request          = relationship("DeploymentRequest", back_populates="deployment")
    node             = relationship("Node")


class NodeMetric(Base):
    __tablename__ = "node_metrics"
    id            = Column(Integer, primary_key=True, index=True)
    node_id       = Column(Integer, ForeignKey("nodes.id"), nullable=False)
    cpu_usage     = Column(Float, default=0.0)
    ram_usage     = Column(Float, default=0.0)
    disk_usage    = Column(Float, default=0.0)
    network_usage = Column(Float, default=0.0)
    active_jobs   = Column(Integer, default=0)
    power_watts   = Column(Float, default=250.0)
    temperature   = Column(Float, default=45.0)
    recorded_at   = Column(DateTime(timezone=True), server_default=func.now())
    node          = relationship("Node", back_populates="metrics")


class Prediction(Base):
    __tablename__ = "predictions"
    id              = Column(Integer, primary_key=True, index=True)
    node_id         = Column(Integer, ForeignKey("nodes.id"), nullable=False)
    prediction_type = Column(String, nullable=False)
    risk_level      = Column(String, nullable=True)
    confidence      = Column(Float, default=0.0)
    reasoning       = Column(Text, nullable=True)
    recommendation  = Column(Text, nullable=True)
    predicted_at    = Column(DateTime(timezone=True), server_default=func.now())
    node            = relationship("Node", back_populates="predictions")


class Alert(Base):
    __tablename__ = "alerts"
    id               = Column(Integer, primary_key=True, index=True)
    alert_id         = Column(String, unique=True, index=True, nullable=False)
    node_id          = Column(String, nullable=False)
    alert_type       = Column(String, nullable=False)
    severity         = Column(String, nullable=False)
    message          = Column(Text, nullable=False)
    is_acknowledged  = Column(Boolean, default=False)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())
    acknowledged_at  = Column(DateTime(timezone=True), nullable=True)


class CostRecommendation(Base):
    __tablename__ = "cost_recommendations"
    id                       = Column(Integer, primary_key=True, index=True)
    node_id                  = Column(String, nullable=False)
    action                   = Column(String, nullable=False)
    current_cost_monthly     = Column(Float, default=0.0)
    estimated_saving_monthly = Column(Float, default=0.0)
    estimated_saving_annual  = Column(Float, default=0.0)
    utilization_score        = Column(Float, default=0.0)
    reasoning                = Column(Text, nullable=True)
    is_applied               = Column(Boolean, default=False)
    created_at               = Column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id           = Column(Integer, primary_key=True, index=True)
    action       = Column(String, nullable=False)
    entity_type  = Column(String, nullable=False)
    entity_id    = Column(String, nullable=True)
    performed_by = Column(String, default="admin@hostnova.com")
    details      = Column(Text, nullable=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
