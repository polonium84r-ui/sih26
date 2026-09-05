from datetime import datetime, timedelta
from typing import List, Dict, Any

class TDMSAdapter:
    """Mock Adapter for Traction Distribution Management System (TDMS)"""
    
    def fetch_raw_ohe_maintenance(self) -> List[Dict[str, Any]]:
        now = datetime.now()
        return [
            {
                "asset_id": "OHE-234-04",
                "asset_type": "OHE",
                "location_km": 234.2,
                "fault_type": "CANTILEVER_WEAR_INSPECTION",
                "severity": "HIGH",
                "reported_date": (now - timedelta(days=1)).isoformat(),
                "due_date": (now + timedelta(days=2)).isoformat(),
                "duration_minutes": 120,
                "department": "TRACTION"
            },
            {
                "asset_id": "OHE-250-02",
                "asset_type": "OHE",
                "location_km": 250.0,
                "fault_type": "CATENARY_DROPPER_REPLACEMENT",
                "severity": "MEDIUM",
                "reported_date": (now - timedelta(days=2)).isoformat(),
                "due_date": (now + timedelta(days=3)).isoformat(),
                "duration_minutes": 90,
                "department": "TRACTION"
            }
        ]
