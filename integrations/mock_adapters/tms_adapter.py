from datetime import datetime, timedelta
from typing import List, Dict, Any

class TMSAdapter:
    """Mock Adapter for Track Management System (TMS)"""
    
    def fetch_raw_defects(self) -> List[Dict[str, Any]]:
        now = datetime.now()
        return [
            {
                "asset_id": "TRK-125-001",
                "asset_type": "TRACK",
                "location_km": 125.4,
                "defect_type": "RAIL_CRACK",
                "severity": "HIGH",
                "reported_date": (now - timedelta(days=2)).isoformat(),
                "due_date": (now + timedelta(days=1)).isoformat(),
                "estimated_duration_minutes": 120,
                "department": "ENGINEERING"
            },
            {
                "asset_id": "TRK-128-004",
                "asset_type": "TRACK",
                "location_km": 128.1,
                "defect_type": "SLEEPER_DAMAGE",
                "severity": "MEDIUM",
                "reported_date": (now - timedelta(days=1)).isoformat(),
                "due_date": (now + timedelta(days=4)).isoformat(),
                "estimated_duration_minutes": 90,
                "department": "ENGINEERING"
            }
        ]
