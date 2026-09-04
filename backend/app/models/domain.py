from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class DepartmentEnum(str, Enum):
    ENGINEERING = "ENGINEERING"
    SNT = "SNT"  # Signal & Telecom
    TRACTION = "TRACTION"  # OHE / Electrical
    OPERATIONS = "OPERATIONS"

class SeverityEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class TaskStatusEnum(str, Enum):
    PENDING = "PENDING"
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    DELAYED = "DELAYED"
    CANCELLED = "CANCELLED"

class TrainTypeEnum(str, Enum):
    EXPRESS = "EXPRESS"
    PASSENGER = "PASSENGER"
    FREIGHT = "FREIGHT"

class MaintenanceTask(BaseModel):
    task_id: str
    source_system: str  # TMS, SMMS, TDMS
    asset_id: str
    asset_type: str  # TRACK, SIGNAL, OHE
    department: DepartmentEnum
    defect_type: str
    location_start_km: float
    location_end_km: float
    corridor_id: str = "CORRIDOR-A"
    severity: SeverityEnum
    reported_date: datetime
    due_date: datetime
    estimated_duration_minutes: int
    status: TaskStatusEnum = TaskStatusEnum.PENDING

class TrainSchedule(BaseModel):
    train_id: str
    train_number: str
    train_name: str
    train_type: TrainTypeEnum
    corridor_id: str = "CORRIDOR-A"
    start_km: float
    end_km: float
    scheduled_arrival: datetime
    scheduled_departure: datetime
    priority_level: int = 1  # 1 = Highest (Rajdhani/Express), 3 = Freight

class BlockRequest(BaseModel):
    request_id: str
    department: DepartmentEnum
    corridor_id: str = "CORRIDOR-A"
    location_start_km: float
    location_end_km: float
    requested_duration_minutes: int
    requested_date: datetime
    priority: SeverityEnum
    status: TaskStatusEnum = TaskStatusEnum.PENDING

class PriorityExplanationFactor(BaseModel):
    factor: str
    impact: str

class PriorityScore(BaseModel):
    task_id: str
    priority_score: float
    priority_level: SeverityEnum
    ranking: int
    reasons: List[str]
    explanation_factors: List[PriorityExplanationFactor]

class CascadeImpact(BaseModel):
    task_id: str
    cascade_risk_score: float
    cascade_level: SeverityEnum
    affected_assets: List[str]
    affected_trains: List[str]
    chain_explanation: List[str]

class BlockRecommendation(BaseModel):
    block_id: str
    corridor_id: str
    start_km: float
    end_km: float
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    allocated_tasks: List[str]
    participating_departments: List[DepartmentEnum]
    conflict_status: str
    optimization_score: float

class DailyPlan(BaseModel):
    plan_id: str
    plan_date: str
    total_blocks: int
    total_tasks_scheduled: int
    coordination_efficiency_pct: float
    recommended_blocks: List[BlockRecommendation]
