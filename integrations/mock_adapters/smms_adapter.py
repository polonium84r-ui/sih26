from datetime import datetime, timedelta
from typing import List, Dict, Any

class SMMSAdapter:
    """Mock Adapter for Signal Maintenance Management System (SMMS)"""
    
    def fetch_raw_faults(self) -> List[Dict[str, Any]]:
        now = datetime.now()
        return [
            {
                "asset_id": "SIG-126-01",
                "asset_type": "SIGNAL",
                "location_km": 126.2,
                "fault_type": "POINT_MACHINE_FAILURE",
                "severity": "CRITICAL",
                "reported_date": (now - timedelta(hours=5)).isoformat(),
                "due_date": (now + timedelta(hours=12)).isoformat(),
                "duration_minutes": 60,
                "department": "SNT"
            }
        ]
