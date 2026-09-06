import React, { useState } from 'react';
import { MaintenanceTask, Department, Severity, TaskStatus } from '../../types';
import { AlertCircle, PlusCircle, CheckCircle2, Trash2, Send, ShieldAlert, Cpu } from 'lucide-react';

interface DefectRequestPortalProps {
  tasks: MaintenanceTask[];
  onTaskCreated: () => void;
}

export const DefectRequestPortal: React.FC<DefectRequestPortalProps> = ({ tasks, onTaskCreated }) => {
  const [department, setDepartment] = useState<Department>('ENGINEERING');
  const [assetType, setAssetType] = useState<'TRACK' | 'SIGNAL' | 'OHE'>('TRACK');
  const [assetId, setAssetId] = useState('TRK-125-001');
  const [defectType, setDefectType] = useState('RAIL_CRACK');
  const [locationStartKm, setLocationStartKm] = useState<number>(125.4);
  const [locationEndKm, setLocationEndKm] = useState<number>(126.4);
  const [severity, setSeverity] = useState<Severity>('HIGH');
  const [durationMins, setDurationMins] = useState<number>(120);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  const handleDepartmentChange = (dept: Department) => {
    setDepartment(dept);
    if (dept === 'ENGINEERING') {
      setAssetType('TRACK');
      setAssetId('TRK-125-001');
      setDefectType('RAIL_CRACK');
    } else if (dept === 'SNT') {
      setAssetType('SIGNAL');
      setAssetId('SIG-126-01');
      setDefectType('POINT_MACHINE_FAILURE');
    } else if (dept === 'TRACTION') {
      setAssetType('OHE');
      setAssetId('OHE-125-04');
      setDefectType('CANTILEVER_INSPECTION');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const sourceSystem = department === 'ENGINEERING' ? 'TMS' : (department === 'SNT' ? 'SMMS' : 'TDMS');
    const now = new Date();
    const dueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const newTaskPayload = {
      task_id: `TASK-${sourceSystem}-${assetId}`,
      source_system: sourceSystem,
      asset_id: assetId,
      asset_type: assetType,
      department: department,
      defect_type: defectType,
      location_start_km: Number(locationStartKm),
      location_end_km: Number(locationEndKm),
      corridor_id: 'CORRIDOR-A',
      severity: severity,
      reported_date: now.toISOString(),
      due_date: dueDate.toISOString(),
      estimated_duration_minutes: Number(durationMins),
      status: 'PENDING' as TaskStatus
    };

    try {
      const res = await fetch('http://localhost:8000/api/v1/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTaskPayload)
      });
      if (res.ok) {
        const data = await res.json();
        setFeedback(data);
        onTaskCreated();
      }
    } catch (err) {
      console.error('Failed to submit defect request:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/tasks/clear', { method: 'DELETE' });
      if (res.ok) {
        setFeedback(null);
        onTaskCreated();
      }
    } catch (err) {
      console.error('Failed to clear defects:', err);
    }
  };

  return (
    <div style={{ padding: '0 24px 24px 24px' }}>
      <div className="formal-panel" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <PlusCircle size={20} color="var(--text-primary)" /> DEFECT & BLOCK REQUEST PORTAL (RAISE A PROBLEM)
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Field Officers (TMS, SMMS, TDMS) raise live track defects & maintenance block requests.
            </p>
          </div>
          {tasks.length > 0 && (
            <button onClick={handleClearAll} className="btn-formal-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Trash2 size={14} /> Clear All Raised Defects
            </button>
          )}
        </div>

        {/* Request Form */}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {/* Department Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>1. DEPARTMENT / SYSTEM</label>
            <select
              value={department}
              onChange={e => handleDepartmentChange(e.target.value as Department)}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-strong)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: 600 }}
            >
              <option value="ENGINEERING">TMS — Track Engineering</option>
              <option value="SNT">SMMS — Signal & Telecom</option>
              <option value="TRACTION">TDMS — Overhead Electrical (OHE)</option>
            </select>
          </div>

          {/* Asset Type */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>2. ASSET TYPE</label>
            <select
              value={assetType}
              onChange={e => setAssetType(e.target.value as any)}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-strong)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: 600 }}
            >
              <option value="TRACK">TRACK (Steel Rails & Sleepers)</option>
              <option value="SIGNAL">SIGNAL (Light & Point Machine)</option>
              <option value="OHE">OHE (Overhead Traction Wire)</option>
            </select>
          </div>

          {/* Asset ID */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>3. ASSET IDENTIFIER</label>
            <input
              type="text"
              value={assetId}
              onChange={e => setAssetId(e.target.value)}
              placeholder="e.g. TRK-125-001"
              required
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-strong)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: 600 }}
            />
          </div>

          {/* Defect Type */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>4. DEFECT / FAULT CATEGORY</label>
            <input
              type="text"
              value={defectType}
              onChange={e => setDefectType(e.target.value)}
              placeholder="e.g. RAIL_CRACK"
              required
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-strong)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: 600 }}
            />
          </div>

          {/* Location KM Start & End */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>START KM</label>
              <input
                type="number"
                step="0.1"
                value={locationStartKm}
                onChange={e => setLocationStartKm(parseFloat(e.target.value) || 0)}
                required
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-strong)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: 600 }}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>END KM</label>
              <input
                type="number"
                step="0.1"
                value={locationEndKm}
                onChange={e => setLocationEndKm(parseFloat(e.target.value) || 0)}
                required
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-strong)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: 600 }}
              />
            </div>
          </div>

          {/* Severity & Duration */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>SEVERITY</label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as Severity)}
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-strong)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: 600 }}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>DURATION (MINS)</label>
              <input
                type="number"
                value={durationMins}
                onChange={e => setDurationMins(parseInt(e.target.value) || 60)}
                required
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-strong)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: 600 }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="submit" disabled={loading} className="btn-formal" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
              <Send size={16} /> {loading ? 'Registering with AI Engine...' : 'Submit Defect Request to AI Engine'}
            </button>
          </div>
        </form>
      </div>

      {/* Success Feedback Card */}
      {feedback && (
        <div className="formal-panel" style={{ padding: '20px', marginBottom: '20px', background: '#000000', color: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <CheckCircle2 size={20} color="#ffffff" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>INSTANT AI ENGINE EVALUATION FOR SUBMITTED DEFECT</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', fontSize: '0.85rem' }}>
            <div style={{ background: '#18181b', padding: '12px', borderRadius: '4px', border: '1px solid #3f3f46' }}>
              <span style={{ color: '#a1a1aa', fontSize: '0.7rem', fontWeight: 700 }}>AI PRIORITY SCORE</span>
              <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                {feedback.priority_evaluation?.priority_score} <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>/ 100 ({feedback.priority_evaluation?.priority_level})</span>
              </p>
            </div>
            <div style={{ background: '#18181b', padding: '12px', borderRadius: '4px', border: '1px solid #3f3f46' }}>
              <span style={{ color: '#a1a1aa', fontSize: '0.7rem', fontWeight: 700 }}>DOMINO CASCADE RISK</span>
              <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                {feedback.cascade_impact?.cascade_risk_score} <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>/ 100 ({feedback.cascade_impact?.cascade_level})</span>
              </p>
            </div>
            <div style={{ background: '#18181b', padding: '12px', borderRadius: '4px', border: '1px solid #3f3f46' }}>
              <span style={{ color: '#a1a1aa', fontSize: '0.7rem', fontWeight: 700 }}>BLOCK SCHEDULER STATUS</span>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#16a34a', marginTop: '4px' }}>
                ✓ Ingested in CP-SAT Solver
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active Raised Defects List */}
      <div className="formal-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={18} /> ACTIVE RAISED MAINTENANCE DEFECTS ({tasks.length})
        </h3>
        {tasks.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-card-secondary)', borderRadius: '6px' }}>
            <p style={{ fontWeight: 700 }}>No defects currently raised.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Use the form above to raise a TMS track defect, SMMS signal fault, or TDMS wire maintenance request.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f1f3f5', textAlign: 'left' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Task ID</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>System / Dept</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Asset ID & Type</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Defect Category</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Location KM</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Severity</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Est. Duration</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.task_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 800, fontFamily: 'monospace' }}>{t.task_id}</td>
                  <td style={{ padding: '12px 10px', fontWeight: 700 }}>{t.source_system} ({t.department})</td>
                  <td style={{ padding: '12px 10px' }}>{t.asset_id} ({t.asset_type})</td>
                  <td style={{ padding: '12px 10px', fontWeight: 600 }}>{t.defect_type}</td>
                  <td style={{ padding: '12px 10px' }}>KM {t.location_start_km} – {t.location_end_km}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <span className={`badge badge-${t.severity.toLowerCase()}`}>{t.severity}</span>
                  </td>
                  <td style={{ padding: '12px 10px' }}>{t.estimated_duration_minutes} mins</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
