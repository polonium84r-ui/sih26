from datetime import datetime
from typing import List, Dict, Any
from backend.app.models.domain import (
    MaintenanceTask,
    TrainSchedule,
    BlockRequest,
    DepartmentEnum,
    SeverityEnum,
    TaskStatusEnum,
    TrainTypeEnum
)
from integrations.mock_adapters.tms_adapter import TMSAdapter
from integrations.mock_adapters.smms_adapter import SMMSAdapter
from integrations.mock_adapters.tdms_adapter import TDMSAdapter
from integrations.mock_adapters.coa_adapter import COAAdapter
from integrations.mock_adapters.bdms_adapter import BDMSAdapter

class DataNormalizerService:
    def __init__(self):
        self.tms = TMSAdapter()
        self.smms = SMMSAdapter()
        self.tdms = TDMSAdapter()
        self.coa = COAAdapter()
        self.bdms = BDMSAdapter()

    def get_all_normalized_tasks(self) -> List[MaintenanceTask]:
        tasks: List[MaintenanceTask] = []
        
        # Ingest TMS
        for item in self.tms.fetch_raw_defects():
            tasks.append(MaintenanceTask(
                task_id=f"TASK-TMS-{item['asset_id']}",
                source_system="TMS",
                asset_id=item['asset_id'],
                asset_type=item['asset_type'],
                department=DepartmentEnum.ENGINEERING,
                defect_type=item['defect_type'],
                location_start_km=item['location_km'],
                location_end_km=item['location_km'] + 1.0,
                severity=SeverityEnum(item['severity']),
                reported_date=datetime.fromisoformat(item['reported_date']),
                due_date=datetime.fromisoformat(item['due_date']),
                estimated_duration_minutes=item['estimated_duration_minutes'],
                status=TaskStatusEnum.PENDING
            ))
            
        # Ingest SMMS
        for item in self.smms.fetch_raw_faults():
            tasks.append(MaintenanceTask(
                task_id=f"TASK-SMMS-{item['asset_id']}",
                source_system="SMMS",
                asset_id=item['asset_id'],
                asset_type=item['asset_type'],
                department=DepartmentEnum.SNT,
                defect_type=item['fault_type'],
                location_start_km=item['location_km'],
                location_end_km=item['location_km'] + 0.5,
                severity=SeverityEnum(item['severity']),
                reported_date=datetime.fromisoformat(item['reported_date']),
                due_date=datetime.fromisoformat(item['due_date']),
                estimated_duration_minutes=item['duration_minutes'],
                status=TaskStatusEnum.PENDING
            ))

        # Ingest TDMS
        for item in self.tdms.fetch_raw_ohe_maintenance():
            tasks.append(MaintenanceTask(
                task_id=f"TASK-TDMS-{item['asset_id']}",
                source_system="TDMS",
                asset_id=item['asset_id'],
                asset_type=item['asset_type'],
                department=DepartmentEnum.TRACTION,
                defect_type=item['fault_type'],
                location_start_km=item['location_km'],
                location_end_km=item['location_km'] + 1.2,
                severity=SeverityEnum(item['severity']),
                reported_date=datetime.fromisoformat(item['reported_date']),
                due_date=datetime.fromisoformat(item['due_date']),
                estimated_duration_minutes=item['duration_minutes'],
                status=TaskStatusEnum.PENDING
            ))
            
        return tasks

    def get_all_normalized_trains(self) -> List[TrainSchedule]:
        trains: List[TrainSchedule] = []
        for item in self.coa.fetch_train_timetables():
            trains.append(TrainSchedule(
                train_id=item['train_id'],
                train_number=item['train_number'],
                train_name=item['train_name'],
                train_type=TrainTypeEnum(item['train_type']),
                corridor_id=item['corridor_id'],
                start_km=item['start_km'],
                end_km=item['end_km'],
                scheduled_arrival=datetime.fromisoformat(item['arrival']),
                scheduled_departure=datetime.fromisoformat(item['departure']),
                priority_level=item['priority_level']
            ))
        return trains

    def get_all_normalized_block_requests(self) -> List[BlockRequest]:
        requests: List[BlockRequest] = []
        for item in self.bdms.fetch_block_requests():
            requests.append(BlockRequest(
                request_id=item['request_id'],
                department=DepartmentEnum(item['department']),
                corridor_id=item['corridor_id'],
                location_start_km=item['location_start_km'],
                location_end_km=item['location_end_km'],
                requested_duration_minutes=item['duration_minutes'],
                requested_date=datetime.fromisoformat(item['requested_date']),
                priority=SeverityEnum(item['priority']),
                status=TaskStatusEnum.PENDING
            ))
        return requests
