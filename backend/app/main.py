"""ClusterSense AI — FastAPI Backend"""
import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

from app.database import engine, Base
from app.api import auth, nodes, deployment_requests, deployments, predictions, alerts, simulation, cost, copilot, dashboard, trust_meter, outcomes, plan_compare
from app.services.seed_service import seed_demo_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    await seed_demo_data()
    yield


app = FastAPI(
    title="ClusterSense AI API",
    description="AI-Powered Infrastructure Management — HostNova Cloud",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if origin.strip()],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

app.include_router(auth.router,                prefix="/api/auth",                tags=["Auth"])
app.include_router(dashboard.router,           prefix="/api/dashboard",           tags=["Dashboard"], dependencies=[Depends(auth.require_admin)])
app.include_router(nodes.router,               prefix="/api/nodes",               tags=["Nodes"], dependencies=[Depends(auth.require_admin)])
app.include_router(deployment_requests.router, prefix="/api/deployment-requests", tags=["Deployment Requests"], dependencies=[Depends(auth.require_admin)])
app.include_router(deployments.router,         prefix="/api/deployments",         tags=["Deployments"], dependencies=[Depends(auth.require_admin)])
app.include_router(predictions.router,         prefix="/api/predictions",         tags=["Predictions"], dependencies=[Depends(auth.require_admin)])
app.include_router(alerts.router,              prefix="/api/alerts",              tags=["Alerts"], dependencies=[Depends(auth.require_admin)])
app.include_router(simulation.router,          prefix="/api/simulation",          tags=["Simulation"], dependencies=[Depends(auth.require_admin)])
app.include_router(cost.router,                prefix="/api/cost",                tags=["Cost"], dependencies=[Depends(auth.require_admin)])
app.include_router(trust_meter.router,         prefix="/api/trust-meter",         tags=["Trust Meter"], dependencies=[Depends(auth.require_admin)])
app.include_router(outcomes.router,            prefix="/api/outcomes",            tags=["Outcomes"], dependencies=[Depends(auth.require_admin)])
app.include_router(plan_compare.router,        prefix="/api/plan-compare",        tags=["Plan Compare"], dependencies=[Depends(auth.require_admin)])
app.include_router(copilot.router,             prefix="/api/copilot",             tags=["Copilot"], dependencies=[Depends(auth.require_admin)])

@app.get("/")
def root(): return {"message": "ClusterSense AI API v1.0", "status": "operational"}

@app.get("/health")
def health(): return {"status": "healthy"}
