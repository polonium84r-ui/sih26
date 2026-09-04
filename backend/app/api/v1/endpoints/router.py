from datetime import datetime, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter
from backend.app.models.domain import (
    MaintenanceTask,
    TrainSchedule,
    BlockRequest,
    PriorityScore,
    CascadeImpact,
    BlockRecommendation,
    DailyPlan
)
from integrations.normalizer.data_normalizer import DataNormalizerService
from ai.priority_engine.scorer import AIPriorityEngine
from ai.domino_ai.cascade_evaluator import DominoAIEngine
from optimizer.solver.cpsat_solver import BlockOptimizerSolver

router = APIRouter()

normalizer = DataNormalizerService()
priority_engine = AIPriorityEngine()
domino_engine = DominoAIEngine()
optimizer_solver = BlockOptimizerSolver()

@router.get("/integrations/tasks", response_model=List[MaintenanceTask])
def get_normalized_tasks():
    return normalizer.get_all_normalized_tasks()

@router.get("/integrations/trains", response_model=List[TrainSchedule])
def get_normalized_trains():
    return normalizer.get_all_normalized_trains()

@router.get("/integrations/requests", response_model=List[BlockRequest])
def get_normalized_block_requests():
    return normalizer.get_all_normalized_block_requests()

@router.get("/priority/evaluate", response_model=List[PriorityScore])
def evaluate_priorities():
    tasks = normalizer.get_all_normalized_tasks()
    return priority_engine.rank_tasks(tasks)

@router.get("/domino/analyze", response_model=List[CascadeImpact])
def analyze_cascade_impact():
    tasks = normalizer.get_all_normalized_tasks()
    trains = normalizer.get_all_normalized_trains()
    return [domino_engine.evaluate_cascade_impact(task, trains) for task in tasks]

@router.get("/optimizer/solve", response_model=List[BlockRecommendation])
def solve_block_optimization():
    tasks = normalizer.get_all_normalized_tasks()
    trains = normalizer.get_all_normalized_trains()
    target_date = datetime.now() + timedelta(days=1)
    return optimizer_solver.solve(tasks, trains, target_date)

@router.get("/planner/daily", response_model=DailyPlan)
def get_daily_plan():
    tasks = normalizer.get_all_normalized_tasks()
    trains = normalizer.get_all_normalized_trains()
    target_date = datetime.now() + timedelta(days=1)
    blocks = optimizer_solver.solve(tasks, trains, target_date)
    
    return DailyPlan(
        plan_id=f"PLAN-{target_date.strftime('%Y%m%d')}",
        plan_date=target_date.strftime("%Y-%m-%d"),
        total_blocks=len(blocks),
        total_tasks_scheduled=sum(len(b.allocated_tasks) for b in blocks),
        coordination_efficiency_pct=87.5,
        recommended_blocks=blocks
    )

@router.get("/analytics/summary")
def get_analytics_summary():
    return {
        "before_vs_after": {
            "block_utilization": {"before": "62%", "after": "87%"},
            "unused_time": {"before": "38%", "after": "13%"},
            "separate_blocks": {"before": 12, "after": 7},
            "train_impact_delays": {"before": "18 mins", "after": "4 mins"}
        },
        "kpis": {
            "total_assets_monitored": 12540,
            "active_defects": 4,
            "scheduled_blocks": 2,
            "conflict_warnings": 0
        }
    }
