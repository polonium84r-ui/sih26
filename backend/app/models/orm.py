from sqlalchemy import Column, String, Float, Integer, DateTime, Enum as SQLEnum, JSON
from backend.app.database import Base
from backend.app.models.domain import (
    DepartmentEnum,
    SeverityEnum,
    TaskStatusEnum,
    TrainTypeEnum
)

class TaskORM(Base):
    __tablename__ = "maintenance_tasks"

    task_id = Column(String, primary_key=True, index=True)
    source_system = Column(String, nullable=False)
    asset_id = Column(String, index=True, nullable=False)
    asset_type = Column(String, nullable=False)
    department = Column(SQLEnum(DepartmentEnum), nullable=False)
    defect_type = Column(String, nullable=False)
    location_start_km = Column(Float, nullable=False)
    location_end_km = Column(Float, nullable=False)
    corridor_id = Column(String, default="CORRIDOR-A", nullable=False)
    severity = Column(SQLEnum(SeverityEnum), nullable=False)
    reported_date = Column(DateTime, nullable=False)
    due_date = Column(DateTime, nullable=False)
    estimated_duration_minutes = Column(Integer, nullable=False)
    status = Column(SQLEnum(TaskStatusEnum), default=TaskStatusEnum.PENDING, nullable=False)


class TrainORM(Base):
    __tablename__ = "train_schedules"

    train_id = Column(String, primary_key=True, index=True)
    train_number = Column(String, nullable=False)
    train_name = Column(String, nullable=False)
    train_type = Column(SQLEnum(TrainTypeEnum), nullable=False)
    corridor_id = Column(String, default="CORRIDOR-A", nullable=False)
    start_km = Column(Float, nullable=False)
    end_km = Column(Float, nullable=False)
    scheduled_arrival = Column(DateTime, nullable=False)
    scheduled_departure = Column(DateTime, nullable=False)
    priority_level = Column(Integer, default=1, nullable=False)


class BlockRequestORM(Base):
    __tablename__ = "block_requests"

    request_id = Column(String, primary_key=True, index=True)
    department = Column(SQLEnum(DepartmentEnum), nullable=False)
    corridor_id = Column(String, default="CORRIDOR-A", nullable=False)
    location_start_km = Column(Float, nullable=False)
    location_end_km = Column(Float, nullable=False)
    requested_duration_minutes = Column(Integer, nullable=False)
    requested_date = Column(DateTime, nullable=False)
    priority = Column(SQLEnum(SeverityEnum), nullable=False)
    status = Column(SQLEnum(TaskStatusEnum), default=TaskStatusEnum.PENDING, nullable=False)


class BlockRecommendationORM(Base):
    __tablename__ = "block_recommendations"

    block_id = Column(String, primary_key=True, index=True)
    corridor_id = Column(String, nullable=False)
    start_km = Column(Float, nullable=False)
    end_km = Column(Float, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    allocated_tasks = Column(JSON, nullable=False)  # List of task_id strings
    participating_departments = Column(JSON, nullable=False)  # List of department strings
    conflict_status = Column(String, nullable=False)
    optimization_score = Column(Float, nullable=False)
