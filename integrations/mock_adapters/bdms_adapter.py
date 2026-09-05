from datetime import datetime, timedelta
from typing import List, Dict, Any

class BDMSAdapter:
    """Mock Adapter for Block Management System (BDMS)"""
    
    def fetch_block_requests(self) -> List[Dict[str, Any]]:
        now = datetime.now()
        target_date = datetime(now.year, now.month, now.day) + timedelta(days=1)
        return [
            {
                "request_id": "BR-20260905-01",
                "department": "ENGINEERING",
                "corridor_id": "KGP-KUR-CORRIDOR",
                "location_start_km": 230.0,
                "location_end_km": 255.0,
                "duration_minutes": 150,
                "requested_date": target_date.isoformat(),
                "priority": "CRITICAL",
                "status": "PENDING"
            },
            {
                "request_id": "BR-20260905-02",
                "department": "TRACTION",
                "corridor_id": "KGP-KUR-CORRIDOR",
                "location_start_km": 234.0,
                "location_end_km": 250.0,
                "duration_minutes": 120,
                "requested_date": target_date.isoformat(),
                "priority": "HIGH",
                "status": "PENDING"
            }
        ]
