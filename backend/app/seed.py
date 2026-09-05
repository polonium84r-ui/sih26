import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from backend.app.database import engine, SessionLocal, Base
from backend.app.models.orm import TaskORM, TrainORM, BlockRequestORM, BlockRecommendationORM
from backend.app.models.domain import MaintenanceTask, TrainSchedule, BlockRequest
from integrations.normalizer.data_normalizer import DataNormalizerService
from optimizer.solver.cpsat_solver import BlockOptimizerSolver

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")

def init_db(db: Session):
    """Initializes schema tables and populates seed data from adapters and solver."""
    # 1. Create tables
    Base.metadata.create_all(bind=engine)
    logger.info("✓ Database schema tables initialized.")

    # 2. Seed Maintenance Tasks
    normalizer = DataNormalizerService()
    normalized_tasks = normalizer.get_all_normalized_tasks()

    for t in normalized_tasks:
        existing = db.query(TaskORM).filter(TaskORM.task_id == t.task_id).first()
        if not existing:
            db_task = TaskORM(
                task_id=t.task_id,
                source_system=t.source_system,
                asset_id=t.asset_id,
                asset_type=t.asset_type,
                department=t.department,
                defect_type=t.defect_type,
                location_start_km=t.location_start_km,
                location_end_km=t.location_end_km,
                corridor_id=t.corridor_id,
                severity=t.severity,
                reported_date=t.reported_date,
                due_date=t.due_date,
                estimated_duration_minutes=t.estimated_duration_minutes,
                status=t.status
            )
            db.add(db_task)
    db.commit()
    task_count = db.query(TaskORM).count()
    logger.info(f"✓ Seeded maintenance_tasks table (Total: {task_count} tasks).")

    # 3. Seed Train Schedules
    normalized_trains = normalizer.get_all_normalized_trains()
    for tr in normalized_trains:
        existing = db.query(TrainORM).filter(TrainORM.train_id == tr.train_id).first()
        if not existing:
            db_train = TrainORM(
                train_id=tr.train_id,
                train_number=tr.train_number,
                train_name=tr.train_name,
                train_type=tr.train_type,
                corridor_id=tr.corridor_id,
                start_km=tr.start_km,
                end_km=tr.end_km,
                scheduled_arrival=tr.scheduled_arrival,
                scheduled_departure=tr.scheduled_departure,
                priority_level=tr.priority_level
            )
            db.add(db_train)
    db.commit()
    train_count = db.query(TrainORM).count()
    logger.info(f"✓ Seeded train_schedules table (Total: {train_count} trains).")

    # 4. Seed Block Requests
    normalized_requests = normalizer.get_all_normalized_block_requests()
    for req in normalized_requests:
        existing = db.query(BlockRequestORM).filter(BlockRequestORM.request_id == req.request_id).first()
        if not existing:
            db_req = BlockRequestORM(
                request_id=req.request_id,
                department=req.department,
                corridor_id=req.corridor_id,
                location_start_km=req.location_start_km,
                location_end_km=req.location_end_km,
                requested_duration_minutes=req.requested_duration_minutes,
                requested_date=req.requested_date,
                priority=req.priority,
                status=req.status
            )
            db.add(db_req)
    db.commit()
    req_count = db.query(BlockRequestORM).count()
    logger.info(f"✓ Seeded block_requests table (Total: {req_count} requests).")

    # 5. Generate and Seed Block Recommendations using CP-SAT Solver
    solver = BlockOptimizerSolver()
    target_date = datetime.now() + timedelta(days=1)
    recommendations = solver.solve(normalized_tasks, normalized_trains, target_date)

    for rec in recommendations:
        existing = db.query(BlockRecommendationORM).filter(BlockRecommendationORM.block_id == rec.block_id).first()
        if not existing:
            db_block = BlockRecommendationORM(
                block_id=rec.block_id,
                corridor_id=rec.corridor_id,
                start_km=rec.start_km,
                end_km=rec.end_km,
                start_time=rec.start_time,
                end_time=rec.end_time,
                duration_minutes=rec.duration_minutes,
                allocated_tasks=rec.allocated_tasks,
                participating_departments=[d.value for d in rec.participating_departments],
                conflict_status=rec.conflict_status,
                optimization_score=rec.optimization_score
            )
            db.add(db_block)
    db.commit()
    block_count = db.query(BlockRecommendationORM).count()
    logger.info(f"✓ Seeded block_recommendations table (Total: {block_count} recommended blocks).")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
