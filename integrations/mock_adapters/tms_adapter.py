from datetime import datetime, timedelta
from typing import List, Dict, Any

class TMSAdapter:
    """Mock Adapter for Track Management System (TMS)"""
    
    def fetch_raw_defects(self) -> List[Dict[str, Any]]:
        now = datetime.now()
        return [
            {
                "asset_id": "TRK-232-001",
                "asset_type": "TRACK",
                "location_km": 232.4,
                "defect_type": "RAIL_CRACK_FRACTURE",
                "severity": "CRITICAL",
                "reported_date": (now - timedelta(days=2)).isoformat(),
                "due_date": (now + timedelta(hours=14)).isoformat(),
                "estimated_duration_minutes": 150,
                "department": "ENGINEERING"
            },
            {
                "asset_id": "TRK-248-004",
                "asset_type": "TRACK",
                "location_km": 248.1,
                "defect_type": "PSC_SLEEPER_DAMAGE",
                "severity": "HIGH",
                "reported_date": (now - timedelta(days=1)).isoformat(),
                "due_date": (now + timedelta(days=2)).isoformat(),
                "estimated_duration_minutes": 90,
                "department": "ENGINEERING"
            },
            {
                "asset_id": "TRK-116-002",
                "asset_type": "TRACK",
                "location_km": 116.5,
                "defect_type": "WELD_MISALIGNMENT",
                "severity": "MEDIUM",
                "reported_date": (now - timedelta(days=3)).isoformat(),
                "due_date": (now + timedelta(days=5)).isoformat(),
                "estimated_duration_minutes": 60,
                "department": "ENGINEERING"
            }
        ]
