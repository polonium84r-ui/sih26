import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Play, Pause, RotateCcw, ShieldCheck, 
  Clock, X, Navigation, Maximize2, Crosshair, 
  Sparkles, Database, Activity, ShieldAlert, CheckCircle2, Radio
} from 'lucide-react';
import { MaintenanceTask, TrainSchedule } from '../../types';

interface CorridorImpactMapProps {
  tasks?: MaintenanceTask[];
  trains?: TrainSchedule[];
}

// True Geographic Corridor Points (Kharagpur to Khordha)
const TRACK_COORDINATES: [number, number][] = [
  [22.3361, 87.3236], // Kharagpur (KGP) - KM 0
  [22.2850, 87.3120],
  [22.2045, 87.3012], // Hijli
  [22.1150, 87.2840],
  [22.0125, 87.2640], // Belda
  [21.9480, 87.2510],
  [21.8950, 87.2410], // Dantan
  [21.8155, 87.2114], // Jaleswar
  [21.7520, 87.1420],
  [21.6917, 87.0658], // Basta
  [21.6111, 86.9942], // Rupsa
  [21.5540, 86.9620],
  [21.4934, 86.9318], // Balasore (BLS) - KM 116
  [21.4250, 86.8650],
  [21.3650, 86.7950], // Nilgiri Road
  [21.3200, 86.7400],
  [21.2858, 86.6908], // Soro
  [21.2380, 86.6350],
  [21.1920, 86.5820], // Markona
  [21.1250, 86.5350],
  [21.0574, 86.4975], // Bhadrak (BHC) - KM 185
  [20.9850, 86.3200], // Baudpur
  [20.9507, 86.1362], // Jajpur Keonjhar Road
  [20.8850, 86.0850], // Conflict Zone (KM 228)
  [20.7650, 86.0120],
  [20.7200, 85.9900], // Maintenance Block Start (KM 230)
  [20.6450, 85.9550], // Dhanmandal (KM 242)
  [20.5700, 85.9200], // Maintenance Block End (KM 255)
  [20.5250, 85.9010], // Kapilas Road
  [20.4625, 85.8830], // Cuttack (CTC) - KM 278
  [20.3540, 85.8620], // Barang
  [20.2668, 85.8436], // Bhubaneswar (BBS) - KM 306
  [20.2110, 85.7950],
  [20.1654, 85.7336], // Khordha Road (KUR) - KM 325
];

// Maintenance Block Sub-Segment (KM 230 to KM 255)
const BLOCK_COORDINATES: [number, number][] = [
  [20.7200, 85.9900],
  [20.6450, 85.9550],
  [20.5700, 85.9200],
];

interface StationData {
  id: string;
  name: string;
  code: string;
  km: number;
  lat: number;
  lng: number;
  labelPos: 'right' | 'left';
  platforms: number;
  zone: string;
}

const STATIONS: StationData[] = [
  { id: 'kgp', name: 'KHARAGPUR', code: 'KGP', km: 0, lat: 22.3361, lng: 87.3236, labelPos: 'left', platforms: 8, zone: 'SER' },
  { id: 'bls', name: 'BALASORE', code: 'BLS', km: 116, lat: 21.4934, lng: 86.9318, labelPos: 'right', platforms: 4, zone: 'SER' },
  { id: 'bhc', name: 'BHADRAK', code: 'BHC', km: 185, lat: 21.0574, lng: 86.4975, labelPos: 'right', platforms: 4, zone: 'ECoR' },
  { id: 'ctc', name: 'CUTTACK', code: 'CTC', km: 278, lat: 20.4625, lng: 85.8830, labelPos: 'left', platforms: 5, zone: 'ECoR' },
  { id: 'bbs', name: 'BHUBANESWAR', code: 'BBS', km: 306, lat: 20.2668, lng: 85.8436, labelPos: 'right', platforms: 6, zone: 'ECoR' },
  { id: 'kur', name: 'KHORDHA', code: 'KUR', km: 325, lat: 20.1654, lng: 85.7336, labelPos: 'left', platforms: 7, zone: 'ECoR' },
];

const calculateTrackMetrics = (coords: [number, number][]) => {
  const distances: number[] = [0];
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const lat1 = coords[i][0], lng1 = coords[i][1];
    const lat2 = coords[i + 1][0], lng2 = coords[i + 1][1];
    const dLat = lat2 - lat1;
    const dLng = (lng2 - lng1) * Math.cos(((lat1 + lat2) / 2) * (Math.PI / 180));
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    total += dist;
    distances.push(total);
  }
  return { distances, totalDistance: total };
};

export const CorridorImpactMap: React.FC<CorridorImpactMapProps> = ({ tasks = [], trains = [] }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const trainMarkersRef = useRef<{ [key: string]: L.Marker }>({});
  const [mapReady, setMapReady] = useState<boolean>(false);

  const trackMetrics = useMemo(() => calculateTrackMetrics(TRACK_COORDINATES), []);

  // Simulation time in minutes (0 = 00:00, 480 = 08:00)
  const [simTimeMinutes, setSimTimeMinutes] = useState<number>(135); // 02:15 AM default
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [aiResolved, setAiResolved] = useState<boolean>(false);

  // Inspector panel
  const [activeInspector, setActiveInspector] = useState<{ type: string; data: any } | null>({
    type: 'conflict',
    data: {
      km: 228,
      name: 'Coromandel Exp Headway vs Block Possession Conflict',
      location: 'Section KM 228.0 (Baitarani River)',
      severity: 'CRITICAL',
      delay: '+28 mins',
      details: 'Train 12841 approaches possession boundary while single-line working is active.',
      action: 'Regulate Freight 4092 at Bhadrak Loop 3 and run Coromandel at line speed.'
    }
  });

  const formatTime = (mins: number) => {
    const hours = Math.floor(mins / 60) % 24;
    const m = Math.floor(mins % 60);
    return `${String(hours).padStart(2, '0')}:${String(m).padStart(2, '0')} hrs`;
  };

  // Interpolate position and tangent heading along track
  const getInterpolatedTrackState = (progress: number, isReversed: boolean = false): { lat: number; lng: number; angle: number } => {
    const effectiveProgress = isReversed ? 1 - progress : progress;
    const targetDist = Math.max(0, Math.min(1, effectiveProgress)) * trackMetrics.totalDistance;

    let segIndex = 0;
    for (let i = 0; i < trackMetrics.distances.length - 1; i++) {
      if (targetDist >= trackMetrics.distances[i] && targetDist <= trackMetrics.distances[i + 1]) {
        segIndex = i;
        break;
      }
    }

    const segStart = trackMetrics.distances[segIndex];
    const segEnd = trackMetrics.distances[segIndex + 1];
    const segLen = segEnd - segStart;
    const t = segLen > 0 ? (targetDist - segStart) / segLen : 0;

    const p1 = TRACK_COORDINATES[segIndex];
    const p2 = TRACK_COORDINATES[segIndex + 1];

    const lat = p1[0] + (p2[0] - p1[0]) * t;
    const lng = p1[1] + (p2[1] - p1[1]) * t;

    const dLat = isReversed ? (p1[0] - p2[0]) : (p2[0] - p1[0]);
    const dLng = isReversed ? (p1[1] - p2[1]) : (p2[1] - p1[1]);
    const angle = -Math.atan2(dLat, dLng) * (180 / Math.PI);

    return { lat, lng, angle };
  };

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [21.25, 86.5],
        zoom: 8,
        zoomControl: false,
        attributionControl: false,
        minZoom: 7,
        maxZoom: 14
      });

      // Free clean OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        opacity: 0.85
      }).addTo(map);

      L.control.zoom({ position: 'topleft' }).addTo(map);

      // --- DUAL-LINE BLUE RAILWAY TRACK ---
      
      // Outer Dark Blue Rail Casing
      L.polyline(TRACK_COORDINATES, {
        color: '#1e3a8a',
        weight: 6,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Inner Track Slot creating crisp dual rails
      L.polyline(TRACK_COORDINATES, {
        color: '#ffffff',
        weight: 2.5,
        opacity: 1.0,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // MAINTENANCE BLOCK: Solid Orange Highlight (KM 230 - 255)
      const blockPoly = L.polyline(BLOCK_COORDINATES, {
        color: '#f97316',
        weight: 8,
        opacity: 1.0,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      blockPoly.on('click', () => {
        setActiveInspector({
          type: 'block',
          data: {
            id: 'BLK-20260905-01',
            section: 'Dhanmandal ↔ Kapilas Road (KM 230 - 255)',
            departments: ['ENGINEERING (TMS)', 'TRACTION (TDMS)'],
            duration: '01:00 - 03:30 (150 mins)',
            work: 'Co-located Track Weld Tamper & OHE Cantilever Tensioning',
            status: 'ACTIVE POSSESSION'
          }
        });
      });

      // Maintenance Block Callout
      const blockLabelIcon = L.divIcon({
        className: 'block-callout-icon',
        html: `
          <div style="
            font-size: 11px;
            font-weight: 900;
            color: #ea580c;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            white-space: nowrap;
            text-shadow: 0 0 3px #ffffff, 0 0 6px #ffffff, 0 0 8px #ffffff;
            cursor: pointer;
          ">
            MAINTENANCE BLOCK
          </div>
        `,
        iconSize: [160, 20],
        iconAnchor: [-12, 10]
      });
      L.marker([20.6450, 85.9550], { icon: blockLabelIcon }).addTo(map).on('click', () => {
        blockPoly.fire('click');
      });

      // CONFLICT CALLOUT & CROSSHAIR TARGET (KM 228)
      const conflictIcon = L.divIcon({
        className: 'pro-conflict-icon',
        html: `
          <div style="position: relative; cursor: pointer;">
            <!-- Red Target Ring -->
            <div style="
              width: 14px;
              height: 14px;
              border-radius: 50%;
              background: #ffffff;
              border: 3px solid #dc2626;
              box-shadow: 0 0 8px rgba(220,38,38,0.6);
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            "></div>

            <!-- Red "CONFLICT" Label Text -->
            <div style="
              position: absolute;
              top: 50%;
              right: 14px;
              transform: translateY(-50%);
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 11px;
              font-weight: 900;
              color: #dc2626;
              letter-spacing: 0.08em;
              white-space: nowrap;
              text-shadow: 0 0 3px #ffffff, 0 0 6px #ffffff;
            ">
              CONFLICT
            </div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      L.marker([20.8850, 86.0850], { icon: conflictIcon, zIndexOffset: 600 }).addTo(map).on('click', () => {
        setActiveInspector({
          type: 'conflict',
          data: {
            km: 228,
            name: 'Coromandel Exp Headway vs Block Possession Conflict',
            location: 'Section KM 228.0 (Baitarani River)',
            severity: 'CRITICAL',
            delay: '+28 mins',
            details: 'Train 12841 approaches possession boundary while single-line working is active.',
            action: 'Regulate Freight 4092 at Bhadrak Loop 3 and run Coromandel at line speed.'
          }
        });
      });

      // STATION NODES & LABELS
      STATIONS.forEach(st => {
        const isLeft = st.labelPos === 'left';
        
        const stationIcon = L.divIcon({
          className: 'pro-station-icon',
          html: `
            <div style="position: relative; cursor: pointer;">
              <!-- Circle Node directly on track -->
              <div style="
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #ffffff;
                border: 2.5px solid #1e3a8a;
                box-shadow: 0 1px 4px rgba(0,0,0,0.3);
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
              "></div>

              <!-- Station Name -->
              <div style="
                position: absolute;
                top: 50%;
                ${isLeft ? 'right: 14px;' : 'left: 14px;'}
                transform: translateY(-50%);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 11.5px;
                font-weight: 900;
                color: #0f172a;
                letter-spacing: 0.08em;
                white-space: nowrap;
                text-shadow: 0 0 3px #ffffff, 0 0 5px #ffffff, 0 0 8px #ffffff;
              ">
                ${st.name}
              </div>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        L.marker([st.lat, st.lng], { icon: stationIcon, zIndexOffset: 200 }).addTo(map).on('click', () => {
          setActiveInspector({ type: 'station', data: st });
        });
      });

      // DOWNSTREAM IMPACT CALLOUT
      const downstreamIcon = L.divIcon({
        className: 'downstream-icon',
        html: `
          <div style="
            font-size: 11px;
            font-weight: 900;
            color: #dc2626;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            white-space: nowrap;
            text-shadow: 0 0 4px #ffffff, 0 0 6px #ffffff;
            cursor: pointer;
          ">
            DOWNSTREAM IMPACT
          </div>
        `,
        iconSize: [160, 20],
        iconAnchor: [-10, 12]
      });
      L.marker([20.1654, 85.7336], { icon: downstreamIcon }).addTo(map).on('click', () => {
        setActiveInspector({
          type: 'downstream',
          data: {
            station: 'KHORDHA ROAD JUNCTION',
            cascadeDelay: '+28 mins',
            affectedServices: ['12841 COROMANDEL', 'TALCHER FREIGHT', '58417 PASSENGER']
          }
        });
      });

      mapInstanceRef.current = map;
      map.fitBounds(L.polyline(TRACK_COORDINATES).getBounds(), { padding: [50, 50] });
      setMapReady(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Simulation Animation Ticker
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setSimTimeMinutes(prev => {
          if (prev >= 480) return 0;
          return prev + 0.4 * playbackSpeed;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // 3. MODERN ORANGE & WHITE AERODYNAMIC TRAIN SPRITE (Matching Provided Image)
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;
    const map = mapInstanceRef.current;

    const activeTrainsList = trains.length > 0 ? trains.slice(0, 2) : [
      {
        train_id: 'EXP-12841',
        train_number: '12841',
        train_name: 'COROMANDEL EXPRESS',
        train_type: 'EXPRESS',
        start_km: 0.0,
        end_km: 325.0,
        priority_level: 1,
        scheduled_arrival: '01:15',
        scheduled_departure: '01:20'
      },
      {
        train_id: 'EXP-12801',
        train_number: '12801',
        train_name: 'PURUSHOTTAM EXPRESS',
        train_type: 'EXPRESS',
        start_km: 325.0,
        end_km: 0.0,
        priority_level: 1,
        scheduled_arrival: '02:00',
        scheduled_departure: '02:10'
      }
    ];

    activeTrainsList.forEach((t, idx) => {
      let progress = 0;
      let isDelayed = false;
      let currentSpeed = 105;
      const isReversed = t.start_km > t.end_km;

      if (!isReversed) {
        // Down train: KGP -> KUR. At 02:15 AM (135 min), progress = 0.52 (between Balasore and Bhadrak)
        const offset = idx * 60;
        progress = Math.min(1, Math.max(0, (simTimeMinutes - offset) / 240));
        if (t.train_number === '12841' && !aiResolved && simTimeMinutes >= 110 && simTimeMinutes <= 180) {
          isDelayed = true;
          currentSpeed = 30;
        }
      } else {
        // Up train: KUR -> KGP
        const offset = idx * 50;
        progress = Math.min(1, Math.max(0, (simTimeMinutes - offset) / 250));
      }

      const { lat, lng, angle } = getInterpolatedTrackState(progress, isReversed);

      // --- MODERN AERODYNAMIC ORANGE & WHITE VECTOR TRAIN SPRITE ---
      // Aerodynamic Orange/Tangerine Nose Livery + Dark Panoramic Windshield + White Body + Coach Windows
      const trainIcon = L.divIcon({
        className: 'modern-orange-train-icon',
        html: `
          <div style="
            position: relative;
            transform: translate(-50%, -50%) rotate(${angle}deg);
            transform-origin: 27px 8px;
            cursor: pointer;
            pointer-events: auto;
            filter: drop-shadow(0 3px 6px rgba(0,0,0,0.5));
          ">
            <svg viewBox="0 0 56 16" width="56" height="16" style="display: block; overflow: visible;">
              <defs>
                <linearGradient id="trainWhiteGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
                <linearGradient id="trainOrangeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ea580c" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>

              <!-- Coach Car (Rear) -->
              <!-- Dark Undercarriage Skirt -->
              <rect x="0" y="10.5" width="22" height="3" rx="1" fill="#1e293b"/>
              <!-- White/Silver Coach Body -->
              <rect x="0" y="2" width="22" height="9" rx="1.5" fill="url(#trainWhiteGrad)" stroke="#64748b" stroke-width="0.6"/>
              <!-- Orange Upper Roofline Trim -->
              <path d="M 0 2 L 22 2 L 22 4 L 0 4 Z" fill="url(#trainOrangeGrad)"/>
              <!-- Tinted Passenger Windows -->
              <rect x="3" y="4.5" width="3.5" height="3.5" rx="0.6" fill="#0f172a"/>
              <rect x="8" y="4.5" width="3.5" height="3.5" rx="0.6" fill="#0f172a"/>
              <rect x="13" y="4.5" width="3.5" height="3.5" rx="0.6" fill="#0f172a"/>
              <rect x="17.5" y="4.5" width="2.5" height="5.5" rx="0.5" fill="#334155"/>

              <!-- Inter-car Gangway Connector -->
              <rect x="22" y="3.5" width="3" height="6.5" rx="0.5" fill="#0f172a"/>

              <!-- Locomotive / Lead EMU Car -->
              <!-- Undercarriage Skirt -->
              <rect x="25" y="10.5" width="26" height="3" rx="1" fill="#1e293b"/>
              
              <!-- White Metallic Front Body -->
              <path d="M 25 2 L 46 2 Q 54 4 55 8.5 Q 54 13 46 13 L 25 13 Z" fill="url(#trainWhiteGrad)" stroke="#475569" stroke-width="0.6"/>

              <!-- Bold Aerodynamic Orange Front Livery Wrap -->
              <path d="M 39 2 L 46 2 Q 54 4 55 8.5 Q 54 13 46 13 L 39 13 Q 48 8.5 39 2 Z" fill="url(#trainOrangeGrad)"/>

              <!-- Orange Roof Trim extending back -->
              <path d="M 25 2 L 42 2 L 42 4 L 25 4 Z" fill="url(#trainOrangeGrad)"/>

              <!-- Dark Panoramic Driver Windshield & Pillar Mask -->
              <path d="M 43 3.5 L 50 4.5 Q 53.5 6.5 53.5 8.5 Q 53.5 10.5 50 11.5 L 43 11.5 Z" fill="#0f172a"/>
              <!-- Windshield Glass Reflection -->
              <path d="M 44 4.5 L 49 5.5 Q 51.5 7 51.5 8.5 Q 51.5 9.5 49 10.5 L 44 10.5 Z" fill="#38bdf8" opacity="0.85"/>

              <!-- Side Driver Window -->
              <path d="M 35 4.5 L 40 4.5 L 40 8.5 L 35 8.5 Z" fill="#0f172a"/>

              <!-- Twin LED Headlamps -->
              <circle cx="52" cy="6" r="1" fill="#ffffff"/>
              <circle cx="52" cy="11" r="1" fill="#ffffff"/>
              <!-- Forward Headlamp Beam -->
              <polygon points="53,8.5 68,3 68,14" fill="rgba(254, 240, 138, 0.45)"/>
            </svg>

            <!-- Train Live Tag Badge -->
            <div style="
              position: absolute;
              top: -16px;
              left: 50%;
              transform: translateX(-50%) rotate(${-angle}deg);
              background: rgba(15, 23, 42, 0.92);
              backdrop-filter: blur(4px);
              border: 1px solid ${isDelayed ? '#ef4444' : '#f97316'};
              color: #ffffff;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 9px;
              font-weight: 800;
              padding: 2px 6px;
              border-radius: 4px;
              white-space: nowrap;
              display: flex;
              align-items: center;
              gap: 4px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.35);
              pointer-events: none;
            ">
              <span style="width: 5px; height: 5px; border-radius: 50%; background: ${isDelayed ? '#ef4444' : '#22c55e'}; display: inline-block;"></span>
              ${t.train_number} • ${currentSpeed} km/h
            </div>
          </div>
        `,
        iconSize: [56, 16],
        iconAnchor: [28, 8]
      });

      if (trainMarkersRef.current[t.train_id]) {
        trainMarkersRef.current[t.train_id].setLatLng([lat, lng]);
        trainMarkersRef.current[t.train_id].setIcon(trainIcon);
      } else {
        const marker = L.marker([lat, lng], { icon: trainIcon, zIndexOffset: 500 }).addTo(map);
        marker.on('click', () => {
          setActiveInspector({
            type: 'train',
            data: {
              ...t,
              currentSpeed,
              isDelayed,
              delayMins: isDelayed ? 28 : 0,
              locationKm: `KM ${Math.round(progress * 325)}.0`
            }
          });
        });
        trainMarkersRef.current[t.train_id] = marker;
      }
    });
  }, [simTimeMinutes, aiResolved, trains, trackMetrics, mapReady]);

  const fitCorridorView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.fitBounds(L.polyline(TRACK_COORDINATES).getBounds(), { padding: [50, 50] });
  };

  const focusOnConflict = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([20.8850, 86.0850], 11, { duration: 1.0 });
  };

  const focusOnBlock = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([20.6450, 85.9550], 11, { duration: 1.0 });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 24px 24px 24px' }}>
      
      {/* Top Header */}
      <div className="formal-panel" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '28px', 
              height: '28px', 
              borderRadius: '6px', 
              background: '#000000', 
              color: '#ffffff' 
            }}>
              <Navigation size={16} />
            </span>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>
                CORRIDOR IMPACT
              </h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                Kharagpur ↔ Khordha Mainline Corridor • 325.0 Route KM
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fitCorridorView}
            className="btn-formal-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700 }}
          >
            <Maximize2 size={13} /> Fit Corridor
          </button>

          <button
            onClick={focusOnConflict}
            className="btn-formal-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', borderColor: '#dc2626' }}
          >
            <Crosshair size={13} /> Conflict Zone
          </button>

          <button
            onClick={focusOnBlock}
            className="btn-formal-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, color: '#ea580c', borderColor: '#ea580c' }}
          >
            <Crosshair size={13} /> Maintenance Block
          </button>

          <button
            onClick={() => setAiResolved(!aiResolved)}
            className="btn-formal"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: aiResolved ? '#ffffff' : '#000000',
              color: aiResolved ? '#000000' : '#ffffff',
              border: '1.5px solid #000000',
              padding: '8px 16px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <Sparkles size={15} />
            {aiResolved ? 'Reset Schedule' : '⚡ Auto-Resolve with AI'}
          </button>
        </div>
      </div>

      {/* Main Map + Inspector Panel Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '20px', alignItems: 'start' }}>
        
        {/* Left: Professional Corridor Map Canvas */}
        <div className="formal-panel" style={{ padding: '0', position: 'relative', overflow: 'hidden', height: '680px', background: '#f8fafc' }}>
          
          {/* Header Tag inside Map */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #0f172a',
            padding: '8px 16px',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
          }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 900, margin: 0, color: '#0f172a', letterSpacing: '0.04em' }}>
              CORRIDOR IMPACT
            </h2>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>
              Kharagpur ↔ Khordha
            </span>
          </div>

          {/* Leaflet Map DOM Container */}
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

          {/* Bottom Vibrant Red Scrubber */}
          <div style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(10px)',
            borderTop: '2px solid #000000',
            padding: '12px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            zIndex: 1000
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '6px',
                    background: '#000000',
                    color: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>

                <button
                  onClick={() => setSimTimeMinutes(0)}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '6px',
                    background: '#f4f4f5',
                    color: '#000000',
                    border: '1px solid #000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Reset to 00:00"
                >
                  <RotateCcw size={13} />
                </button>

                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#000000', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} /> {formatTime(simTimeMinutes)}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#71717a', fontWeight: 600 }}>
                    SIMULATION TIMELINE (00:00 - 08:00)
                  </div>
                </div>
              </div>

              {/* Speed Multipliers */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 5, 10].map(spd => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      border: '1px solid #000000',
                      background: playbackSpeed === spd ? '#000000' : 'transparent',
                      color: playbackSpeed === spd ? '#ffffff' : '#000000',
                      cursor: 'pointer'
                    }}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Red Timeline Slider Bar */}
            <input
              type="range"
              min="0"
              max="480"
              step="1"
              value={simTimeMinutes}
              onChange={e => setSimTimeMinutes(parseFloat(e.target.value))}
              style={{
                width: '100%',
                height: '7px',
                accentColor: '#dc2626',
                cursor: 'pointer'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#71717a', fontWeight: 700 }}>
              <span>00:00</span>
              <span style={{ color: '#ea580c' }}>01:00 Block Possession Active</span>
              <span style={{ color: '#dc2626' }}>02:15 Conflict Point</span>
              <span>03:30 Possession Cleared</span>
              <span>08:00</span>
            </div>
          </div>
        </div>

        {/* Right: Live Diagnostics Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {activeInspector && (
            <div className="formal-panel" style={{ padding: '20px', border: '1.5px solid #000000' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Radio size={16} color="var(--text-primary)" />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', margin: 0, color: 'var(--text-primary)' }}>
                    {activeInspector.type} INSPECTOR
                  </h3>
                </div>
                <button
                  onClick={() => setActiveInspector(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Conflict Inspector */}
              {activeInspector.type === 'conflict' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: '#000000', color: '#ffffff', padding: '12px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f87171' }}>CONFLICT LOCATION</span>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, marginTop: '2px' }}>KM 228 (Baitarani River Section)</h4>
                    <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Bhadrak ↔ Cuttack Mainline</span>
                  </div>

                  <div style={{ background: 'var(--bg-card-secondary)', padding: '12px', borderRadius: '6px', fontSize: '0.8rem' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Root Cause Diagnostic:</strong>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                      Train 12841 (Coromandel Exp) approaches Section B104 while single-line track possession is active. Without AI regulation, train faces a 28 min signal halt.
                    </p>
                  </div>

                  <div style={{ background: 'var(--bg-card-secondary)', padding: '12px', borderRadius: '6px', fontSize: '0.8rem' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>AI Dispatch Solution:</strong>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                      Hold Talcher Coal Freight on Bhadrak Loop line 3, giving 12841 immediate line clearance through the bi-directional track section.
                    </p>
                  </div>

                  <button
                    onClick={() => setAiResolved(true)}
                    className="btn-formal"
                    style={{ marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <ShieldCheck size={16} /> Apply Recommended Resolution
                  </button>
                </div>
              )}

              {/* Maintenance Block Inspector */}
              {activeInspector.type === 'block' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
                  <div style={{ background: '#ea580c', color: '#ffffff', padding: '12px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ffedd5' }}>BLOCK CODE</span>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '2px' }}>{activeInspector.data.id}</h4>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{activeInspector.data.section}</span>
                  </div>

                  <div style={{ background: 'var(--bg-card-secondary)', padding: '12px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>CO-LOCATED DEPARTMENTS</span>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                      <span className="badge badge-clear">TMS TRACK</span>
                      <span className="badge badge-clear">TDMS OHE</span>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-card-secondary)', padding: '12px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>SCHEDULED WINDOW</span>
                    <p style={{ fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{activeInspector.data.duration}</p>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{activeInspector.data.work}</p>
                  </div>
                </div>
              )}

              {/* Station Inspector */}
              {activeInspector.type === 'station' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
                  <div style={{ background: '#000000', color: '#ffffff', padding: '12px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>STATION NODE</span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '2px' }}>{activeInspector.data.name} ({activeInspector.data.code})</h4>
                    <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{activeInspector.data.zone} Division • KM {activeInspector.data.km}.0</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ background: 'var(--bg-card-secondary)', padding: '10px', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>PLATFORMS</span>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{activeInspector.data.platforms}</h4>
                    </div>
                    <div style={{ background: 'var(--bg-card-secondary)', padding: '10px', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>STATUS</span>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>OPERATIONAL</h4>
                    </div>
                  </div>
                </div>
              )}

              {/* Train Inspector */}
              {activeInspector.type === 'train' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
                  <div style={{ background: '#000000', color: '#ffffff', padding: '14px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f97316' }}>TRAIN TELEMETRY • LIVE RAKE</span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 900, marginTop: '2px', color: '#ffffff' }}>{activeInspector.data.train_number} {activeInspector.data.train_name}</h4>
                    <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Location: {activeInspector.data.locationKm}</span>
                  </div>

                  {/* Aerodynamic Train Livery Badge */}
                  <div style={{
                    background: 'var(--bg-card-secondary)',
                    borderRadius: '6px',
                    padding: '12px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>CONSIST TYPE</span>
                      <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0 0' }}>16-Car Aerodynamic EMU</h5>
                    </div>
                    <span className="badge badge-clear" style={{ borderColor: '#ea580c', color: '#ea580c', fontWeight: 800 }}>
                      ORANGE & WHITE LIVERY
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ background: 'var(--bg-card-secondary)', padding: '10px', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>SPEED</span>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{activeInspector.data.currentSpeed} km/h</h4>
                    </div>
                    <div style={{ background: 'var(--bg-card-secondary)', padding: '10px', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>SCHEDULE STATUS</span>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: activeInspector.data.isDelayed ? '#dc2626' : '#16a34a', marginTop: '2px' }}>
                        {activeInspector.data.isDelayed ? `+${activeInspector.data.delayMins} min` : 'ON TIME'}
                      </h4>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-card-secondary)', padding: '10px', borderRadius: '6px', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Traction:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>25 kV AC 50Hz OHE</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      <span>Cab Signaling:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>KAVACH TPWS / ETCS L2</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Downstream Inspector */}
              {activeInspector.type === 'downstream' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
                  <div style={{ background: '#dc2626', color: '#ffffff', padding: '12px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fee2e2' }}>CASCADE DELAY NODE</span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '2px' }}>KHORDHA ROAD JUNCTION</h4>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    Cumulative ripple delay of +28 mins calculated across downstream express and freight services if upstream single-line regulation is not optimized.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Database Live Telemetry */}
          <div className="formal-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <Activity size={16} /> CORRIDOR OVERVIEW
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--bg-card-secondary)', borderRadius: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>DB Ingested Tasks:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{tasks.length} Maintenance Defects</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--bg-card-secondary)', borderRadius: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>DB Ingested Trains:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{trains.length} Active Services</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--bg-card-secondary)', borderRadius: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Corridor Condition:</span>
                <strong style={{ color: '#dc2626' }}>
                  1 Headway Conflict (KM 228)
                </strong>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
export default CorridorImpactMap;
