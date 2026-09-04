from datetime import datetime, timedelta
from typing import List, Dict, Any

class COAAdapter:
    """Mock Adapter for Control Office Application (COA) - Timetable & Movements"""
    
    def fetch_train_timetables(self) -> List[Dict[str, Any]]:
        now = datetime.now()
        base_time = datetime(now.year, now.month, now.day, 0, 0, 0) + timedelta(days=1)
        return [
            {
                "train_id": "EXP-102",
                "train_number": "12625",
                "train_name": "KERALA EXPRESS",
                "train_type": "EXPRESS",
                "corridor_id": "CORRIDOR-A",
                "start_km": 120.0,
                "end_km": 130.0,
                "arrival": (base_time + timedelta(hours=0, minutes=30)).isoformat(),
                "departure": (base_time + timedelta(hours=0, minutes=45)).isoformat(),
                "priority_level": 1
            },
            {
                "train_id": "FREIGHT-204",
                "train_number": "BOXN-902",
                "train_name": "COAL FREIGHT",
                "train_type": "FREIGHT",
                "corridor_id": "CORRIDOR-A",
                "start_km": 120.0,
                "end_km": 130.0,
                "arrival": (base_time + timedelta(hours=3, minutes=15)).isoformat(),
                "departure": (base_time + timedelta(hours=3, minutes=50)).isoformat(),
                "priority_level": 3
            }
        ]
