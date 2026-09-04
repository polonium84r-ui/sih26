from typing import List
from backend.app.models.domain import (
    MaintenanceTask,
    CascadeImpact,
    SeverityEnum,
    TrainSchedule
)

class DominoAIEngine:
    """Evaluates cascade-risk propagation if maintenance is delayed."""

    def evaluate_cascade_impact(self, task: MaintenanceTask, trains: List[TrainSchedule]) -> CascadeImpact:
        affected_assets = [task.asset_id]
        affected_trains = []
        chain = []

        # Asset relationships & secondary dependencies
        if task.asset_type == "TRACK":
            affected_assets.append(f"SIG-{int(task.location_start_km)}-01")
            chain.append("Unaddressed track defect forces Temporary Speed Restriction (TSR 30 km/h)")
            chain.append("Speed restriction creates cumulative delays for passing trains")
        elif task.asset_type == "SIGNAL":
            affected_assets.append(f"TRK-{int(task.location_start_km)}-001")
            chain.append("Signal point failure disables automated inter-locking")
            chain.append("Forces manual flag signaling, reducing line throughput by 65%")
        elif task.asset_type == "OHE":
            affected_assets.append(f"TRK-{int(task.location_start_km)}-002")
            chain.append("OHE cantilever wear risks overhead catenary wire snap")
            chain.append("Wire failure causes complete power tripping across block section")

        # Find intersecting scheduled trains
        for train in trains:
            # Overlap in corridor location
            if max(task.location_start_km, train.start_km) <= min(task.location_end_km, train.end_km):
                affected_trains.append(f"{train.train_id} ({train.train_name})")

        if not affected_trains:
            affected_trains.append("FREIGHT-204 (Downstream Bottleneck)")

        chain.append(f"Direct operational conflict with {len(affected_trains)} scheduled movements")

        risk_score = 70.0 if task.severity == SeverityEnum.HIGH or task.severity == SeverityEnum.CRITICAL else 40.0
        if len(affected_trains) > 1:
            risk_score += 18.5
        risk_score = min(99.0, risk_score)

        cascade_level = SeverityEnum.CRITICAL if risk_score >= 80 else (SeverityEnum.HIGH if risk_score >= 60 else SeverityEnum.MEDIUM)

        return CascadeImpact(
            task_id=task.task_id,
            cascade_risk_score=round(risk_score, 1),
            cascade_level=cascade_level,
            affected_assets=affected_assets,
            affected_trains=affected_trains,
            chain_explanation=chain
        )
