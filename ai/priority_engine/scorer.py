from datetime import datetime, timezone
from typing import List
from backend.app.models.domain import (
    MaintenanceTask,
    PriorityScore,
    PriorityExplanationFactor,
    SeverityEnum
)

class AIPriorityEngine:
    """Calculates maintenance task priority scores (0 - 100) with explainable breakdown."""

    SEVERITY_WEIGHTS = {
        SeverityEnum.CRITICAL: 45.0,
        SeverityEnum.HIGH: 35.0,
        SeverityEnum.MEDIUM: 20.0,
        SeverityEnum.LOW: 10.0
    }

    DEPARTMENT_CRITICALITY = {
        "ENGINEERING": 1.2,
        "SNT": 1.15,
        "TRACTION": 1.1,
        "OPERATIONS": 1.0
    }

    def score_task(self, task: MaintenanceTask, rank: int = 1) -> PriorityScore:
        factors = []
        base_score = self.SEVERITY_WEIGHTS.get(task.severity, 15.0)
        factors.append(PriorityExplanationFactor(
            factor=f"Defect Severity ({task.defect_type})",
            impact=f"+{base_score:.1f}"
        ))

        # Overdue / Due Date Proximity Factor
        now = datetime.now()
        due_diff_hours = (task.due_date - now).total_seconds() / 3600.0
        time_score = 0.0
        if due_diff_hours <= 0:
            time_score = 35.0
            factors.append(PriorityExplanationFactor(factor="Maintenance OVERDUE", impact="+35.0"))
        elif due_diff_hours <= 24:
            time_score = 25.0
            factors.append(PriorityExplanationFactor(factor="Due within 24 Hours", impact="+25.0"))
        elif due_diff_hours <= 72:
            time_score = 15.0
            factors.append(PriorityExplanationFactor(factor="Due within 3 Days", impact="+15.0"))
        else:
            time_score = 5.0
            factors.append(PriorityExplanationFactor(factor="Routine Maintenance Window", impact="+5.0"))

        # Department multiplier
        dept_mult = self.DEPARTMENT_CRITICALITY.get(task.department.value, 1.0)
        dept_score = (dept_mult - 1.0) * 20.0
        if dept_score > 0:
            factors.append(PriorityExplanationFactor(
                factor=f"Department Criticality ({task.department.value})",
                impact=f"+{dept_score:.1f}"
            ))

        total_score = min(100.0, base_score + time_score + dept_score)

        if total_score >= 80:
            level = SeverityEnum.CRITICAL
        elif total_score >= 60:
            level = SeverityEnum.HIGH
        elif total_score >= 40:
            level = SeverityEnum.MEDIUM
        else:
            level = SeverityEnum.LOW

        reasons = [f.factor for f in factors]

        return PriorityScore(
            task_id=task.task_id,
            priority_score=round(total_score, 1),
            priority_level=level,
            ranking=rank,
            reasons=reasons,
            explanation_factors=factors
        )

    def rank_tasks(self, tasks: List[MaintenanceTask]) -> List[PriorityScore]:
        scores = [self.score_task(task) for task in tasks]
        # Sort descending by priority_score
        scores.sort(key=lambda s: s.priority_score, reverse=True)
        # Assign ranks
        for idx, s in enumerate(scores):
            s.ranking = idx + 1
        return scores
