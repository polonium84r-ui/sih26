from datetime import datetime, timedelta
from typing import List, Dict, Any

class COAAdapter:
    """Mock Adapter for Control Office Application (COA) - Timetable & Movements"""
    
    def fetch_train_timetables(self) -> List[Dict[str, Any]]:
        now = datetime.now()
        base_time = datetime(now.year, now.month, now.day, 0, 0, 0) + timedelta(days=1)
        return [
            {
                "train_id": "EXP-12841",
                "train_number": "12841",
                "train_name": "COROMANDEL EXPRESS",
                "train_type": "EXPRESS",
                "corridor_id": "KGP-KUR-CORRIDOR",
                "start_km": 0.0,
                "end_km": 325.0,
                "arrival": (base_time + timedelta(hours=1, minutes=15)).isoformat(),
                "departure": (base_time + timedelta(hours=1, minutes=20)).isoformat(),
                "priority_level": 1
            },
            {
                "train_id": "EXP-12801",
                "train_number": "12801",
                "train_name": "PURUSHOTTAM EXPRESS",
                "train_type": "EXPRESS",
                "corridor_id": "KGP-KUR-CORRIDOR",
                "start_km": 325.0,
                "end_km": 0.0,
                "arrival": (base_time + timedelta(hours=2, minutes=0)).isoformat(),
                "departure": (base_time + timedelta(hours=2, minutes=10)).isoformat(),
                "priority_level": 1
            },
            {
                "train_id": "EXP-12863",
                "train_number": "12863",
                "train_name": "HOWRAH - SMVT BENGALURU EXP",
                "train_type": "EXPRESS",
                "corridor_id": "KGP-KUR-CORRIDOR",
                "start_km": 0.0,
                "end_km": 325.0,
                "arrival": (base_time + timedelta(hours=3, minutes=30)).isoformat(),
                "departure": (base_time + timedelta(hours=3, minutes=35)).isoformat(),
                "priority_level": 1
            },
            {
                "train_id": "FRT-BOXN-4092",
                "train_number": "BOXN-4092",
                "train_name": "TALCHER COAL FREIGHT",
                "train_type": "FREIGHT",
                "corridor_id": "KGP-KUR-CORRIDOR",
                "start_km": 185.0,
                "end_km": 0.0,
                "arrival": (base_time + timedelta(hours=1, minutes=45)).isoformat(),
                "departure": (base_time + timedelta(hours=2, minutes=30)).isoformat(),
                "priority_level": 3
            },
            {
                "train_id": "PAS-58417",
                "train_number": "58417",
                "train_name": "PURI - BALASORE PASSENGER",
                "train_type": "PASSENGER",
                "corridor_id": "KGP-KUR-CORRIDOR",
                "start_km": 325.0,
                "end_km": 116.0,
                "arrival": (base_time + timedelta(hours=4, minutes=15)).isoformat(),
                "departure": (base_time + timedelta(hours=4, minutes=20)).isoformat(),
                "priority_level": 2
            }
        ]
