import csv
import json
import shutil
from pathlib import Path
from integrations.gtfs_adapter import GTFSAdapter

def sync_railpull_assets():
    """Copies exported map assets (stations.csv, tracks.geojson) into frontend/public, generating from GTFS if missing."""
    base_dir = Path(__file__).resolve().parent.parent
    railpull_out = base_dir / "railpull" / "data" / "out"
    frontend_public = base_dir / "frontend" / "public"

    if not railpull_out.exists():
        railpull_out.mkdir(parents=True, exist_ok=True)
    if not frontend_public.exists():
        frontend_public.mkdir(parents=True, exist_ok=True)

    gtfs = GTFSAdapter()

    # Generate GTFS stations.csv if railpull version is smaller or missing
    stations_out = railpull_out / "stations.csv"
    if not stations_out.exists() or stations_out.stat().st_size < 10000:
        gtfs_stations = gtfs.fetch_gtfs_stations()
        if gtfs_stations:
            with open(stations_out, mode="w", encoding="utf-8", newline="") as f:
                writer = csv.writer(f)
                writer.writerow(["code", "name", "lat", "lon"])
                for st in gtfs_stations:
                    writer.writerow([st["code"], st["name"], st["lat"], st["lon"]])
            print(f"[GTFS] Exported {len(gtfs_stations)} GTFS stations to {stations_out}")

    # Generate GTFS tracks.geojson if missing
    tracks_out = railpull_out / "tracks.geojson"
    if not tracks_out.exists() or tracks_out.stat().st_size < 50:
        tracks_geojson = gtfs.fetch_gtfs_tracks_geojson()
        if tracks_geojson and tracks_geojson.get("features"):
            tracks_out.write_text(json.dumps(tracks_geojson, ensure_ascii=False), encoding="utf-8")
            print(f"[GTFS] Exported {len(tracks_geojson['features'])} GTFS track shapes to {tracks_out}")

    copied = []
    for filename in ["stations.csv", "tracks.geojson", "delays.json"]:
        src = railpull_out / filename
        dst = frontend_public / filename
        if src.exists():
            shutil.copy2(src, dst)
            copied.append(filename)

    print(f"[SYNC] Synchronized {len(copied)} map assets to {frontend_public}: {', '.join(copied) if copied else 'None found'}")

if __name__ == "__main__":
    sync_railpull_assets()
