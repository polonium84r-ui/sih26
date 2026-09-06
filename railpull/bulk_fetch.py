import sys
import json
import time
from pathlib import Path

cwd = Path.cwd().resolve()
sys.path = [p for p in sys.path if Path(p or '.').resolve() != cwd] + [str(cwd)]

from ntes import NTESClient

def main():
    client = NTESClient()
    sched_dir = Path("data/raw/schedules")
    sched_dir.mkdir(parents=True, exist_ok=True)

    print("Step 1: Discovering train numbers across Indian Railway zones...")
    discovered = dict()
    # Search digits across Indian train numbering system (12xxx, 15xxx, 20xxx, 22xxx, etc.)
    prefixes = [f"{i:03d}" for i in range(120, 230, 2)]
    for p in prefixes:
        try:
            r = client.search(p)
            trains = (r or {}).get("Trains", []) or []
            for t in trains:
                no = str(t.get("TrainNumber", "")).strip()
                name = str(t.get("TrainName", "")).strip()
                ttype = str(t.get("Type", "")).strip()
                if no and len(no) == 5:
                    discovered[no] = {"name": name, "type": ttype}
        except Exception:
            pass
        time.sleep(0.05)

    print(f"[OK] Discovered {len(discovered)} real Indian train numbers.")

    # Save discovered roster to numbers.json
    NUMBERS_FILE = Path("data/raw/numbers.json")
    NUMBERS_FILE.write_text(json.dumps(discovered, indent=1, ensure_ascii=False))

    print("Step 2: Fetching valid train timetables from NTES...")
    fetched = 0
    todo = list(discovered.keys())[:150]

    for i, no in enumerate(todo):
        out_file = sched_dir / f"{no}.json"
        if out_file.exists() and out_file.stat().st_size > 50:
            fetched += 1
            continue
        try:
            res = client.schedule(no)
            if res and res.get("stations") and len(res["stations"]) >= 2:
                out_file.write_text(json.dumps(res, ensure_ascii=False))
                fetched += 1
                print(f"[{i+1}/{len(todo)}] Fetched train #{no} ({discovered[no]['name']}) - {len(res['stations'])} stops")
        except Exception as e:
            pass
        time.sleep(0.3)

    total_files = len([f for f in sched_dir.glob("*.json") if f.stat().st_size > 50])
    print(f"[OK] Bulk fetch complete! Total valid train schedules on disk: {total_files}")

if __name__ == "__main__":
    main()
