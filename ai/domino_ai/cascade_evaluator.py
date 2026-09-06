from typing import List, Optional
from backend.app.models.domain import (
    MaintenanceTask,
    CascadeImpact,
    SeverityEnum,
    TrainSchedule
)
from integrations.mock_adapters.live_delays_adapter import LiveDelayAdapter

class DominoAIEngine:
    """Evaluates cascade-risk propagation if maintenance is delayed, incorporating live NTES train feeds."""

    def __init__(self, delay_adapter: Optional[LiveDelayAdapter] = None):
        self.delay_adapter = delay_adapter or LiveDelayAdapter()

    def evaluate_cascade_impact(self, task: MaintenanceTask, trains: List[TrainSchedule]) -> CascadeImpact:
        affected_assets = [task.asset_id]
        affected_trains = []
        chain = []
        max_live_delay = 0

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

        # Find intersecting scheduled trains & check live NTES delay feed
        for train in trains:
            # Overlap in corridor location
            if max(task.location_start_km, train.start_km) <= min(task.location_end_km, train.end_km):
                delay_min = self.delay_adapter.get_train_delay_minutes(train.train_number)
                is_canc = self.delay_adapter.is_train_cancelled(train.train_number)

                status_str = ""
                if is_canc:
                    status_str = " [NTES: CANCELLED]"
                elif delay_min > 0:
                    status_str = f" [NTES: +{delay_min}m DELAY]"
                    max_live_delay = max(max_live_delay, delay_min)

                affected_trains.append(f"{train.train_id} ({train.train_name}){status_str}")

        if not affected_trains:
            affected_trains.append("FREIGHT-204 (Downstream Bottleneck)")

        chain.append(f"Direct operational conflict with {len(affected_trains)} scheduled movements")

        if max_live_delay > 0:
            chain.append(f"Live NTES Tracking: Intersecting traffic currently delayed up to {max_live_delay} mins; bottleneck probability elevated")

        risk_score = 70.0 if task.severity == SeverityEnum.HIGH or task.severity == SeverityEnum.CRITICAL else 40.0
        if len(affected_trains) > 1:
            risk_score += 18.5
        if max_live_delay > 15:
            risk_score += min(10.0, max_live_delay * 0.1)

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

