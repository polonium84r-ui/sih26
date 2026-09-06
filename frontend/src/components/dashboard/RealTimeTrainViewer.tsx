import React, { useEffect, useState } from 'react';
import { Train, Clock, AlertTriangle, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';

interface TrainSchedule {
  train_id: string;
  train_number: string;
  train_name: string;
  train_type: string;
  type_label?: string;
  runs_days?: string;
  corridor_id: string;
  start_km: number;
  end_km: number;
  scheduled_arrival: string;
  scheduled_departure: string;
  priority_level: number;
}

interface LiveDelayData {
  updatedAt: number;
  source: string;
  trains: Record<string, { d?: number; c?: number }>;
}

export const RealTimeTrainViewer: React.FC = () => {
  const [trains, setTrains] = useState<TrainSchedule[]>([]);
  const [liveDelays, setLiveDelays] = useState<LiveDelayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [subTab, setSubTab] = useState<'timetables' | 'delays'>('timetables');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Real Timetables
      const trainsRes = await fetch('http://localhost:8000/api/v1/integrations/trains');
      if (trainsRes.ok) {
        const trainsData = await trainsRes.json();
        setTrains(trainsData);
      }

      // Fetch Live Delays
      const delaysRes = await fetch('http://localhost:8000/api/v1/integrations/delays/live');
      if (delaysRes.ok) {
        const delaysData = await delaysRes.json();
        setLiveDelays(delaysData);
      }
    } catch (err) {
      console.error('Failed to fetch real-time train data:', err);
    } finally {
      setLoading(false);
      setLastRefreshed(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const delayEntries = Object.entries(liveDelays?.trains || {});
  const lateCount = delayEntries.filter(([_, v]) => v.d && v.d > 0).length;
  const cancelledCount = delayEntries.filter(([_, v]) => v.c === 1).length;

  return (
    <div style={{ padding: '0 24px 24px 24px' }}>
      {/* Header Banner */}
      <div className="formal-panel" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Train size={22} color="#000000" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                COA & NTES REAL-TIME TRAIN TIMETABLES & LIVE DELAY MONITOR
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Direct Feed from Control Office Application (COA) and National Train Enquiry System (NTES)
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Last updated: <strong>{lastRefreshed || 'Loading...'}</strong>
            </span>
            <button
              onClick={fetchData}
              className="btn-formal"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              {loading ? 'Refreshing...' : 'Refresh NTES Feed'}
            </button>
          </div>
        </div>

        {/* Summary KPI Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '16px' }}>
          <div style={{ background: '#f8f9fa', padding: '14px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TIMETABLE TRAINS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '2px' }}>{trains.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '2px' }}>Vande Bharat & Rajdhani Active</div>
          </div>

          <div style={{ background: '#f8f9fa', padding: '14px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>NTES LIVE MONITORED</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '2px' }}>{delayEntries.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Active Station Boards</div>
          </div>

          <div style={{ background: '#f8f9fa', padding: '14px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>LIVE DELAYED TRAINS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '2px', color: lateCount > 0 ? '#d97706' : '#000' }}>
              {lateCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Factor in Domino AI</div>
          </div>

          <div style={{ background: '#f8f9fa', padding: '14px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CANCELLED SERVICES</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '2px', color: cancelledCount > 0 ? '#dc2626' : '#000' }}>
              {cancelledCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>NTES Station Alerts</div>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <button
          onClick={() => setSubTab('timetables')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            background: subTab === 'timetables' ? '#000' : '#fff',
            color: subTab === 'timetables' ? '#fff' : '#000',
            border: '1px solid #000'
          }}
        >
          1. Real Train Timetables ({trains.length})
        </button>

        <button
          onClick={() => setSubTab('delays')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            background: subTab === 'delays' ? '#000' : '#fff',
            color: subTab === 'delays' ? '#fff' : '#000',
            border: '1px solid #000'
          }}
        >
          2. Live NTES Delay Monitor ({delayEntries.length})
        </button>
      </div>

      {/* View 1: Real Train Timetables */}
      {subTab === 'timetables' && (
        <div className="formal-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '14px' }}>
            Real Indian Railways Scheduled Trains (COA Data)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f1f3f5', textAlign: 'left' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Train No.</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Train Name</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Category</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Operating Days</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Scheduled Arrival</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Scheduled Departure</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Corridor Span</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Priority</th>
              </tr>
            </thead>
            <tbody>
              {trains.map((t) => (
                <tr key={t.train_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 800, fontFamily: 'monospace' }}>
                    {t.train_number}
                  </td>
                  <td style={{ padding: '12px 10px', fontWeight: 700 }}>
                    {t.train_name}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{
                      background: t.train_name.includes('VANDE') ? '#eff6ff' : 
                                  t.train_name.includes('RAJ') ? '#fef2f2' : 
                                  (t.type_label === 'Suburban' || t.train_type === 'PASSENGER' || t.train_name.includes('LOCAL') || t.train_name.includes('EMU')) ? '#ecfdf5' : '#f3f4f6',
                      color: t.train_name.includes('VANDE') ? '#1d4ed8' : 
                             t.train_name.includes('RAJ') ? '#b91c1c' : 
                             (t.type_label === 'Suburban' || t.train_type === 'PASSENGER' || t.train_name.includes('LOCAL') || t.train_name.includes('EMU')) ? '#047857' : '#374151',
                      border: (t.type_label === 'Suburban' || t.train_type === 'PASSENGER' || t.train_name.includes('LOCAL') || t.train_name.includes('EMU')) ? '1px solid #a7f3d0' : 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      fontSize: '0.75rem'
                    }}>
                      {t.type_label || (t.train_name.includes('LOCAL') || t.train_name.includes('EMU') ? 'Suburban Local' : t.train_type)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', fontWeight: 600 }}>
                    {t.runs_days || 'Daily'}
                  </td>
                  <td style={{ padding: '12px 10px', fontFamily: 'monospace' }}>
                    {new Date(t.scheduled_arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '12px 10px', fontFamily: 'monospace' }}>
                    {new Date(t.scheduled_departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    {t.start_km} km – {t.end_km} km
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ background: '#000', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                      Level {t.priority_level} (Highest)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View 2: Live NTES Delay Monitor */}
      {subTab === 'delays' && (
        <div className="formal-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '14px' }}>
            Live NTES Station Board Delay Feed ({delayEntries.length} Trains Tracked)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {delayEntries.map(([trainNo, info]) => {
              const isCancelled = info.c === 1;
              const delayMins = info.d || 0;

              return (
                <div
                  key={trainNo}
                  style={{
                    border: '1px solid var(--border-color)',
                    padding: '14px',
                    borderRadius: '6px',
                    background: isCancelled ? '#fff5f5' : (delayMins > 30 ? '#fffbe6' : '#ffffff'),
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'monospace' }}>
                      Train #{trainNo}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      NTES Live Station Board
                    </div>
                  </div>

                  <div>
                    {isCancelled ? (
                      <span style={{ background: '#dc2626', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldAlert size={14} /> CANCELLED
                      </span>
                    ) : delayMins > 0 ? (
                      <span style={{ background: delayMins > 60 ? '#b91c1c' : '#d97706', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} /> +{delayMins} MINS LATE
                      </span>
                    ) : (
                      <span style={{ background: '#16a34a', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={14} /> ON TIME
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
