"""Trust calculations derived from Outcome Record history."""
from typing import Dict, List
from app.services.outcome_record_service import outcome_record_service


SCORE_BY_STATUS = {"GOOD": 1, "MIXED": 0.5, "POOR": 0}
RECOMMENDATION_TYPES = {
    "scheduling": "Scheduling Trust",
    "cost_optimization": "Cost Optimization Trust",
}


class TrustMeterService:
    """Calculates recommendation trust exclusively from Outcome Records."""

    def summary(self, module: str = None) -> Dict:
        records = outcome_record_service.list_records()
        if module:
            return self._summarize(module, records)
        return {key: self._summarize(key, records) for key in RECOMMENDATION_TYPES}

    @staticmethod
    def _summarize(module: str, records: List[Dict]) -> Dict:
        outcomes = [record for record in records if record.get("module") == module]
        total = len(outcomes)
        good = sum(record.get("status") == "GOOD" for record in outcomes)
        mixed = sum(record.get("status") == "MIXED" for record in outcomes)
        poor = sum(record.get("status") == "POOR" for record in outcomes)
        score_total = sum(SCORE_BY_STATUS.get(record.get("status"), 0) for record in outcomes)
        latest = max((record.get("timestamp") for record in outcomes), default=None)
        return {
            "module": module,
            "recommendation_type": RECOMMENDATION_TYPES[module],
            "trust_score": round((score_total / total * 100) if total else 0, 1),
            "historical_accuracy": round((good / total * 100) if total else 0, 1),
            "total_recommendations": total,
            "successful_recommendations": good,
            "failed_recommendations": poor,
            "mixed_recommendations": mixed,
            "last_updated": latest,
        }


trust_meter_service = TrustMeterService()
