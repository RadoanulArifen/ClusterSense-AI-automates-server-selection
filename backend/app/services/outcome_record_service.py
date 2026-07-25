"""Simulated Outcome Record storage for AI recommendation history."""
import json
import random
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional


DATA_PATH = Path(__file__).resolve().parents[2] / "mock" / "outcome_records.json"
VALID_MODULES = {"scheduling", "cost_optimization"}
VALID_STATUSES = {"GOOD", "MIXED", "POOR"}


class OutcomeRecordService:
    """Reads and appends simulated recommendation outcomes without a database."""

    def __init__(self):
        self._lock = threading.Lock()

    def record_recommendation(
        self, module: str, recommendation: str, recommended_node: str, predicted_action: str
    ) -> Dict:
        if module not in VALID_MODULES:
            raise ValueError(f"Unsupported outcome module: {module}")

        status = random.choices(["GOOD", "MIXED", "POOR"], weights=[0.82, 0.13, 0.05], k=1)[0]
        actual_outcome = {
            "GOOD": "Recommendation achieved the expected operational result",
            "MIXED": "Recommendation worked but required additional monitoring",
            "POOR": "Recommendation required follow-up intervention",
        }[status]
        record = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "module": module,
            "recommendation": recommendation,
            "recommended_node": recommended_node,
            "predicted_action": predicted_action,
            "actual_outcome": actual_outcome,
            "status": status,
        }
        with self._lock:
            records = self._read_records()
            records.append(record)
            DATA_PATH.write_text(json.dumps(records, indent=2), encoding="utf-8")
        return record

    def list_records(
        self, module: Optional[str] = None, status: Optional[str] = None,
        search: Optional[str] = None, limit: Optional[int] = None,
    ) -> List[Dict]:
        records = self._read_records()
        if module in VALID_MODULES:
            records = [record for record in records if record.get("module") == module]
        if status in VALID_STATUSES:
            records = [record for record in records if record.get("status") == status]
        if search:
            term = search.lower().strip()
            records = [record for record in records if term in record.get("recommended_node", "").lower() or term in record.get("recommendation", "").lower()]
        records.sort(key=lambda record: record.get("timestamp", ""), reverse=True)
        return records[:limit] if limit else records

    @staticmethod
    def _read_records() -> List[Dict]:
        if not DATA_PATH.exists():
            return []
        return json.loads(DATA_PATH.read_text(encoding="utf-8"))


outcome_record_service = OutcomeRecordService()
