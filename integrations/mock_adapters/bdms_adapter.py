from datetime import datetime, timedelta
from typing import List, Dict, Any

class BDMSAdapter:
    """Mock Adapter for Block Management System (BDMS)"""
    
    def fetch_block_requests(self) -> List[Dict[str, Any]]:
        now = datetime.now()
        target_date = datetime(now.year, now.month, now.day) + timedelta(days=1)
        return [
            {
                "request_id": "BR-1001",
                "department": "ENGINEERING",
                "corridor_id": "CORRIDOR-A",
                "location_start_km": 125.0,
                "location_end_km": 127.0,
                "duration_minutes": 120,
                "requested_date": target_date.isoformat(),
                "priority": "HIGH",
                "status": "PENDING"
            },
            {
                "request_id": "BR-1002",
                "department": "TRACTION",
                "corridor_id": "CORRIDOR-A",
                "location_start_km": 125.5,
                "location_end_km": 126.8,
                "duration_minutes": 90,
                "requested_date": target_date.isoformat(),
                "priority": "HIGH",
                "status": "PENDING"
            }
        ]
