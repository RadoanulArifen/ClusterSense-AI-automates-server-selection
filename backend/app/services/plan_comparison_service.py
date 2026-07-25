"""Simulated Plan Compare generation and history storage."""
import json
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List


DATA_PATH = Path(__file__).resolve().parents[2] / "mock" / "plan_compare.json"
RISK_ORDER = {"LOW": 0, "MEDIUM": 1, "HIGH": 2}


class PlanComparisonService:
    """Builds and stores two simulated deployment plans for a What-if request."""

    def __init__(self):
        self._lock = threading.Lock()

    def compare(self, request: Dict, nodes: List[Dict]) -> Dict:
        candidates = [node for node in nodes if node.get("health_status") not in {"offline", "critical"}]
        candidates.sort(key=lambda node: node["cpu_usage"] + node["ram_usage"])
        if not candidates:
            return {}

        plan_a_node = candidates[0]
        plan_b_node = candidates[1] if len(candidates) > 1 else candidates[0]
        plan_a = self._build_plan("Plan A", plan_a_node, request, cost_multiplier=1.12, performance_bias=1.0)
        plan_b = self._build_plan("Plan B", plan_b_node, request, cost_multiplier=0.94, performance_bias=0.84)
        winner = min((plan_a, plan_b), key=lambda plan: (RISK_ORDER[plan["predicted_risk"]], plan["estimated_cost"], -plan["trust_score"]))
        reason = self._reason(winner, plan_b if winner is plan_a else plan_a)
        comparison = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "request": request,
            "plan_a": plan_a,
            "plan_b": plan_b,
            "winning_plan": winner["name"],
            "recommendation_reason": reason,
        }
        with self._lock:
            records = self._read_records()
            records.append(comparison)
            DATA_PATH.write_text(json.dumps(records, indent=2), encoding="utf-8")
        return comparison

    def latest(self) -> Dict:
        records = self._read_records()
        return max(records, key=lambda record: record.get("timestamp", "")) if records else {}

    @staticmethod
    def _build_plan(name: str, node: Dict, request: Dict, cost_multiplier: float, performance_bias: float) -> Dict:
        deployments = request["future_deployments"]
        cpu_load = min(99, node["cpu_usage"] + deployments * request["avg_cpu_per_deployment"] * 0.32 * performance_bias)
        ram_load = min(99, node["ram_usage"] + deployments * request["avg_ram_per_deployment"] / node["ram_total_gb"] * 7 * performance_bias)
        risk = "HIGH" if max(cpu_load, ram_load) > 85 else "MEDIUM" if max(cpu_load, ram_load) > 70 else "LOW"
        trust = max(60, 97 - RISK_ORDER[risk] * 8 - (cpu_load + ram_load) * 0.04)
        estimated_cost = max(20, (node["monthly_cost_usd"] + deployments * 4.5) * cost_multiplier)
        outcome = "Higher Failure Risk" if risk == "HIGH" else "Higher Performance" if name == "Plan A" else "Lower Operational Cost" if estimated_cost < 200 else "Balanced Resource Usage"
        return {
            "name": name,
            "recommended_node": node["node_id"],
            "estimated_cost": round(estimated_cost, 2),
            "expected_cpu_load": round(cpu_load, 1),
            "expected_ram_usage": round(ram_load, 1),
            "predicted_risk": risk,
            "trust_score": round(trust, 1),
            "expected_outcome": outcome,
        }

    @staticmethod
    def _reason(winner: Dict, other: Dict) -> str:
        reasons = []
        if RISK_ORDER[winner["predicted_risk"]] < RISK_ORDER[other["predicted_risk"]]: reasons.append("lower risk")
        if winner["estimated_cost"] < other["estimated_cost"]: reasons.append("lower estimated cost")
        if winner["trust_score"] > other["trust_score"]: reasons.append("higher trust score")
        return ", ".join(reasons).capitalize() + "." if reasons else "Best balance of resource usage and operational cost."

    @staticmethod
    def _read_records() -> List[Dict]:
        if not DATA_PATH.exists():
            return []
        return json.loads(DATA_PATH.read_text(encoding="utf-8"))


plan_comparison_service = PlanComparisonService()
