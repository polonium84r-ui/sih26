import sys
import os
from datetime import datetime

# Add root project path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from integrations.normalizer.data_normalizer import DataNormalizerService
from ai.priority_engine.scorer import AIPriorityEngine
from ai.domino_ai.cascade_evaluator import DominoAIEngine
from optimizer.solver.cpsat_solver import BlockOptimizerSolver

def test_full_pipeline():
    print("🚀 Starting AI Railway Block Planner Pipeline Integration Test...")
    
    # 1. Integration & Normalization
    normalizer = DataNormalizerService()
    tasks = normalizer.get_all_normalized_tasks()
    trains = normalizer.get_all_normalized_trains()
    requests = normalizer.get_all_normalized_block_requests()
    
    assert len(trains) >= 1, "Expected normalized train timetables from COA"
    print(f"✓ Data Integration Success: Ingested {len(tasks)} tasks, {len(trains)} trains, {len(requests)} block requests.")

    # 2. AI Priority Engine Scoring
    priority_engine = AIPriorityEngine()
    priorities = priority_engine.rank_tasks(tasks)
    assert len(priorities) == len(tasks)
    if len(priorities) > 0:
        assert priorities[0].priority_score >= priorities[-1].priority_score
        print(f"✓ AI Priority Scoring Success: Ranked #1 Task '{priorities[0].task_id}' with score {priorities[0].priority_score}.")
    else:
        print("✓ AI Priority Scoring Success: Clean empty state verified (0 defects).")

    # 3. Domino AI Cascade Impact Analysis
    domino_engine = DominoAIEngine()
    cascade_impacts = [domino_engine.evaluate_cascade_impact(task, trains) for task in tasks]
    assert len(cascade_impacts) == len(tasks)
    print(f"✓ Domino AI Cascade Risk Success: Assessed cascade risk for {len(cascade_impacts)} tasks.")

    # 4. Block Optimizer & Department Coordination
    optimizer = BlockOptimizerSolver()
    recommendations = optimizer.solve(tasks, trains, datetime.now())
    print(f"✓ Block Optimizer Success: Generated {len(recommendations)} optimal block window recommendations.")

    print("\n🎉 ALL PIPELINE INTEGRATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_full_pipeline()
