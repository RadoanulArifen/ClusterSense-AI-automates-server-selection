"""Seed demo data — node metrics match real dataset columns"""
import os, random, uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import User, Node, DeploymentRequest, Deployment, NodeMetric, Alert, AuditLog
from app.security import get_password_hash

CUSTOMERS = [
    "Acme Corp","TechVision Inc","DataFlow Systems","CloudPeak Ltd","NexGen Solutions",
    "ByteForge Co","PixelWave Agency","Quantum Dynamics","SwiftNet Corp","AlphaStack Ltd",
    "OmegaSoft Inc","PrimeCloud Co","HyperTech Systems","FutureDev Ltd","CodeCraft Inc",
    "DataMesh Corp","InnovateTech","SkyBridge Solutions","CoreNexus Ltd","EdgePeak Co",
]

SERVICES = [
    {"name":"Shared Hosting Basic",   "type":"shared",     "job":"ETL",            "cpu":2,  "ram":2,   "disk":50,   "price":9.99,   "priority":"Low"},
    {"name":"Business VPS Pro",       "type":"vps",        "job":"Data Processing","cpu":4,  "ram":8,   "disk":200,  "price":49.99,  "priority":"Medium"},
    {"name":"Cloud Compute Standard", "type":"cloud",      "job":"Analytics",      "cpu":8,  "ram":16,  "disk":500,  "price":99.99,  "priority":"Medium"},
    {"name":"GPU Compute Instance",   "type":"gpu",        "job":"ML Training",    "cpu":16, "ram":64,  "disk":1000, "price":299.99, "priority":"High"},
    {"name":"Managed Kubernetes",     "type":"kubernetes", "job":"Simulation",     "cpu":32, "ram":128, "disk":2000, "price":499.99, "priority":"High"},
    {"name":"Managed Database",       "type":"database",   "job":"ETL",            "cpu":8,  "ram":32,  "disk":1000, "price":199.99, "priority":"Medium"},
    {"name":"AI Workspace Enterprise","type":"ai_workspace","job":"ML Training",   "cpu":64, "ram":256, "disk":5000, "price":999.99, "priority":"Critical"},
]

LOCATIONS = ["DC-1 (New York)","DC-2 (London)","DC-3 (Singapore)","DC-4 (Frankfurt)"]
NODE_TYPES = ["compute","storage","gpu","general","memory-optimized"]


async def seed_demo_data():
    db = SessionLocal()
    try:
        # Provision the administrator separately so SQL-imported demo data is supported.
        if not db.query(User).count():
            password = os.environ["ADMIN_PASSWORD"]
            if password.startswith("CHANGE_ME") or len(password) < 12:
                raise ValueError("ADMIN_PASSWORD must be a unique password of at least 12 characters")
            db.add(User(email=os.environ["ADMIN_EMAIL"],
                        hashed_password=get_password_hash(password),
                        full_name="Infrastructure Admin", role="admin"))
            db.commit()
        if db.query(Node).count():
            return
        print("Seeding demo data …")

        # 20 nodes with column names matching real datasets
        nodes = []
        for i in range(1, 21):
            node_id = f"Node-{str(i).zfill(3)}"
            cpu   = round(random.uniform(15, 92), 2)
            ram   = round(random.uniform(20, 88), 2)
            disk  = round(random.uniform(25, 85), 2)
            net   = round(random.uniform(10, 80), 2)
            jobs  = random.randint(1, 15)
            idle  = round(random.uniform(30, 600), 1)
            temp  = round(40 + cpu*0.4 + random.uniform(-5, 10), 2)
            pwr   = round(100 + cpu*5 + random.uniform(-20, 30), 2)
            util  = round((cpu + ram) / 2, 1)
            cost  = round((pwr/1000) * 0.12 * 24 * 30, 2)

            if cpu > 85 or ram > 85 or temp > 78:
                health = "critical"
            elif cpu > 68 or ram > 72 or temp > 68:
                health = "warning"
            else:
                health = "healthy"

            node = Node(
                node_id=node_id,
                hostname=f"srv-{node_id.lower()}.hostnova.cloud",
                ip_address=f"10.0.{i//10}.{i%10+1}",
                cpu_cores=random.choice([8,16,32,64]),
                cpu_usage=cpu,
                ram_total_gb=random.choice([32,64,128,256,512]),
                ram_usage=ram,
                disk_total_gb=random.choice([500,1000,2000,4000]),
                disk_usage=disk,
                network_usage=net,
                active_jobs=jobs,
                idle_time_minutes=idle,
                power_watts=pwr,
                temperature=temp,
                utilization_score=util,
                monthly_cost_usd=cost,
                running_services=jobs,
                uptime_hours=round(random.uniform(100,8700),1),
                health_status=health,
                location=random.choice(LOCATIONS),
                node_type=random.choice(NODE_TYPES),
            )
            db.add(node)
            nodes.append(node)

        db.flush()

        # 30 historical metric snapshots per node
        for node in nodes:
            for j in range(30):
                ts = datetime.utcnow() - timedelta(minutes=(30-j)*3)
                metric = NodeMetric(
                    node_id=node.id,
                    cpu_usage=max(5, min(99, node.cpu_usage + random.uniform(-5,5))),
                    ram_usage=max(5, min(99, node.ram_usage + random.uniform(-3,3))),
                    disk_usage=max(5, min(99, node.disk_usage + random.uniform(-1,1))),
                    network_usage=max(0, node.network_usage + random.uniform(-10,10)),
                    active_jobs=max(0, node.active_jobs + random.randint(-2,2)),
                    power_watts=max(80, node.power_watts + random.uniform(-20,20)),
                    temperature=max(30, node.temperature + random.uniform(-3,3)),
                    recorded_at=ts,
                )
                db.add(metric)

        # 50 deployment requests
        for i in range(50):
            svc   = random.choice(SERVICES)
            cust  = random.choice(CUSTOMERS)
            email = f"{cust.lower().replace(' ','').replace('.','')[:10]}@example.com"
            created = datetime.utcnow() - timedelta(hours=random.randint(0,168))
            status  = random.choice(["pending","pending","pending","analyzing","completed","completed"])

            req = DeploymentRequest(
                request_id=f"REQ-{str(i+1).zfill(4)}-{uuid.uuid4().hex[:6].upper()}",
                customer_name=cust, customer_email=email,
                service_type=svc["type"], service_name=svc["name"],
                job_type=svc["job"],
                required_cpu=svc["cpu"], required_ram_gb=svc["ram"],
                required_disk_gb=svc["disk"],
                estimated_runtime_min=random.randint(30,600),
                priority=svc["priority"], monthly_price=svc["price"],
                status=status,
                notes=f"Deployment request from {cust} via Order Management System",
                created_at=created,
            )
            db.add(req)
            db.flush()

            if status == "completed" and nodes:
                anode = random.choice(nodes)
                dep = Deployment(
                    deployment_id=f"DEP-{uuid.uuid4().hex[:8].upper()}",
                    request_id=req.id, node_id=anode.id,
                    assigned_cpu=svc["cpu"], assigned_ram_gb=svc["ram"], assigned_disk_gb=svc["disk"],
                    confidence_score=round(random.uniform(0.75,0.99),3),
                    ai_reasoning=f"Selected {anode.node_id} — lowest CPU, sufficient RAM, low failure risk.",
                    recommended_node=anode.node_id, status="completed",
                    deployed_at=created + timedelta(minutes=random.randint(2,30)),
                )
                db.add(dep)

        # Alerts for high-risk nodes
        alert_templates = [
            ("High CPU Usage",     "warning",  "CPU usage exceeded 80% threshold"),
            ("RAM Critical",       "critical", "RAM usage above 90% — action required"),
            ("Temperature Warning","warning",  "Server temperature rising above safe threshold"),
            ("Disk Space Low",     "warning",  "Disk usage above 85%"),
            ("High Failure Risk",  "critical", "AI Predictor flagged high failure risk"),
            ("Network Anomaly",    "warning",  "Unusual network traffic spike detected"),
        ]
        for node in random.sample(nodes, min(8, len(nodes))):
            atype, sev, msg = random.choice(alert_templates)
            alert = Alert(
                alert_id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
                node_id=node.node_id, alert_type=atype, severity=sev,
                message=f"{node.node_id}: {msg}",
                is_acknowledged=random.choice([True,False,False]),
                created_at=datetime.utcnow() - timedelta(hours=random.randint(0,24)),
            )
            db.add(alert)

        db.commit()
        print(f"✅ Seeded: 1 admin, {len(nodes)} nodes (Node-001…Node-020), 50 requests")

    except Exception as e:
        db.rollback()
        raise RuntimeError("Database seed failed") from e
    finally:
        db.close()
