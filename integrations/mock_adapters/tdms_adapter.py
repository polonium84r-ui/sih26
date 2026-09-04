from datetime import datetime, timedelta
from typing import List, Dict, Any

class TDMSAdapter:
    """Mock Adapter for Traction Distribution Management System (TDMS)"""
    
    def fetch_raw_ohe_maintenance(self) -> List[Dict[str, Any]]:
        now = datetime.now()
        return [
            {
                "asset_id": "OHE-125-04",
                "asset_type": "OHE",
                "location_km": 125.8,
                "fault_type": "CANTILEVER_INSPECTION",
                "severity": "HIGH",
                "reported_date": (now - timedelta(days=1)).isoformat(),
                "due_date": (now + timedelta(days=2)).isoformat(),
                "duration_minutes": 120,
                "department": "TRACTION"
            }
        ]
