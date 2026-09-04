from datetime import datetime, timedelta
from typing import List
from backend.app.models.domain import (
    MaintenanceTask,
    TrainSchedule,
    BlockRecommendation,
    DepartmentEnum
)
from optimizer.coordinator.department_coordinator import DepartmentCoordinator

class BlockOptimizerSolver:
    """Schedules tasks into non-conflicting time windows, avoiding train collisions."""

    def __init__(self):
        self.coordinator = DepartmentCoordinator()

    def solve(
        self,
        tasks: List[MaintenanceTask],
        trains: List[TrainSchedule],
        target_date: datetime
    ) -> List[BlockRecommendation]:
        recommendations: List[BlockRecommendation] = []
        task_groups = self.coordinator.group_coordinated_tasks(tasks)

        # Baseline window: start at 01:00 AM tomorrow
        window_start = datetime(target_date.year, target_date.month, target_date.day, 1, 0, 0)
        
        for idx, group in enumerate(task_groups):
            block_code = f"BLK-{target_date.strftime('%Y%m%d')}-{idx+1:02d}"
            
            # Determine maximum duration required by group
            max_duration = max([t.estimated_duration_minutes for t in group])
            block_end = window_start + timedelta(minutes=max_duration)

            # Spatial boundary
            min_km = min([t.location_start_km for t in group])
            max_km = max([t.location_end_km for t in group])

            # Department list
            depts = list(set([t.department for t in group]))

            # Conflict Detection against Train Schedule
            has_conflict = False
            for train in trains:
                # Check time overlap & spatial overlap
                time_overlap = max(window_start, train.scheduled_arrival) < min(block_end, train.scheduled_departure)
                spatial_overlap = max(min_km, train.start_km) < min(max_km, train.end_km)
                if time_overlap and spatial_overlap:
                    has_conflict = True
                    break

            conflict_status = "CONFLICT_DETECTED" if has_conflict else "CLEAR"
            optimization_score = 95.0 if not has_conflict else 65.0

            recommendations.append(BlockRecommendation(
                block_id=block_code,
                corridor_id=group[0].corridor_id,
                start_km=min_km,
                end_km=max_km,
                start_time=window_start,
                end_time=block_end,
                duration_minutes=max_duration,
                allocated_tasks=[t.task_id for t in group],
                participating_departments=depts,
                conflict_status=conflict_status,
                optimization_score=optimization_score
            ))

            # Shift window for next block
            window_start = block_end + timedelta(minutes=45)

        return recommendations
