from datetime import datetime, timedelta
from typing import List, Dict, Any

class SMMSAdapter:
    """Mock Adapter for Signal Maintenance Management System (SMMS)"""
    
    def fetch_raw_faults(self) -> List[Dict[str, Any]]:
        now = datetime.now()
        return [
            {
                "asset_id": "SIG-228-01",
                "asset_type": "SIGNAL",
                "location_km": 228.0,
                "fault_type": "POINT_MACHINE_INTERLOCK_FAULT",
                "severity": "CRITICAL",
                "reported_date": (now - timedelta(hours=4)).isoformat(),
                "due_date": (now + timedelta(hours=8)).isoformat(),
                "duration_minutes": 75,
                "department": "SNT"
            },
            {
                "asset_id": "SIG-185-03",
                "asset_type": "SIGNAL",
                "location_km": 185.2,
                "fault_type": "TRACK_CIRCUIT_DEVIATION",
                "severity": "HIGH",
                "reported_date": (now - timedelta(hours=12)).isoformat(),
                "due_date": (now + timedelta(days=1)).isoformat(),
                "duration_minutes": 60,
                "department": "SNT"
            }
        ]
