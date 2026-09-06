import json
from pathlib import Path
from typing import Dict, Any

class LiveDelayAdapter:
    """Adapter for live train delays and cancellation data fetched from NTES via railpull."""

    def __init__(self):
        self.delays_path = Path(__file__).resolve().parents[2] / "railpull" / "data" / "out" / "delays.json"

    def fetch_live_delays(self) -> Dict[str, Any]:
        """Returns the full live delays snapshot from delays.json."""
        if self.delays_path.exists():
            try:
                with open(self.delays_path, mode="r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return {
            "updatedAt": 0,
            "source": "ntes-station-boards",
            "trains": {}
        }

    def get_train_delay_minutes(self, train_number: str) -> int:
        """Returns live delay in minutes for a given train number, or 0 if on time / unknown."""
        data = self.fetch_live_delays()
        train_info = data.get("trains", {}).get(str(train_number), {})
        return train_info.get("d", 0)

    def is_train_cancelled(self, train_number: str) -> bool:
        """Returns True if the train is currently marked cancelled on NTES station boards."""
        data = self.fetch_live_delays()
        train_info = data.get("trains", {}).get(str(train_number), {})
        return bool(train_info.get("c", 0))
