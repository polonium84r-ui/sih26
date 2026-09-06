import React from 'react';
import { TrainSchedule, MaintenanceTask } from '../../types';
import { Radio, HelpCircle, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface CorridorSimProps {
  trains: TrainSchedule[];
  tasks: MaintenanceTask[];
}

export const CorridorSim: React.FC<CorridorSimProps> = ({ trains, tasks }) => {
  return (
    <div style={{ padding: '0 24px 24px 24px' }}>
      {/* Friendly Guide Banner */}
      <div className="formal-panel" style={{ padding: '14px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <HelpCircle size={20} color="var(--text-primary)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>What is Digital Twin?</strong> This live simulation models the physical railway corridor section (KM 120 - 130), showing live express train movements, active maintenance blocks, and asset condition.
        </div>
      </div>

      <div className="formal-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <Radio size={18} color="var(--text-primary)" /> DIGITAL TWIN • REAL-TIME CORRIDOR MONITOR
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Section: Corridor A (Southern Zone) • Live Speed & Signals
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <span className="badge badge-clear"><Activity size={12} /> STATUS: OPERATIONAL</span>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-dark)', padding: '10px 16px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#000000', borderRadius: '2px' }} /> 🚆 Express Train Position
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', border: '1px dashed #000000', background: 'rgba(0,0,0,0.1)', borderRadius: '2px' }} /> 📦 Scheduled Maintenance Block Window
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#3f3f46', borderRadius: '2px' }} /> 🛤️ Steel Railway Trackbed
          </span>
        </div>

        {/* Track Trackbed Diagram */}
        <div style={{ background: '#000000', border: '1px solid var(--border-strong)', borderRadius: '6px', padding: '40px 20px', position: 'relative', overflow: 'hidden' }}>
          {/* Main Rails */}
          <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '2px', background: '#ffffff', transform: 'translateY(-6px)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '2px', background: '#ffffff', transform: 'translateY(6px)' }} />

          {/* Sleepers */}
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'absolute', top: '50%', left: '20px', right: '20px', transform: 'translateY(-10px)' }}>
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} style={{ width: '2px', height: '20px', background: '#3f3f46' }} />
            ))}
          </div>

          {/* Block B104 Zone Overlay */}
          <div style={{
            position: 'absolute',
            top: '16px',
            bottom: '16px',
            left: '30%',
            width: '25%',
            background: 'rgba(255, 255, 255, 0.12)',
            border: '2px dashed #ffffff',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.8rem',
            letterSpacing: '0.05em'
          }}>
            ACTIVE BLOCK B104 (KM 125 - 127)
          </div>

          {/* Train Movement Sprite */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '68%',
            transform: 'translateY(-50%)',
            background: '#ffffff',
            color: '#000000',
            border: '1px solid #ffffff',
            padding: '6px 14px',
            borderRadius: '4px',
            fontWeight: 800,
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🚆 EXP-102 (KERALA EXPRESS) • 110 KM/H
          </div>
        </div>

        {/* Corridor Assets Status Row */}
        <div style={{ display: 'grid', gridTemplateColumns: tasks.length > 0 ? 'repeat(3, 1fr)' : '1fr', gap: '16px', marginTop: '20px' }}>
          {tasks.length === 0 ? (
            <div style={{ background: 'var(--bg-card-secondary)', padding: '20px', borderRadius: '6px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <CheckCircle2 size={24} color="#16a34a" />
              </div>
              <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 800 }}>ALL CORRIDOR ASSETS OPERATIONAL</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>No active defects reported across Trackbed, Signaling Point Machines, or Overhead Traction Catenary Wires.</p>
            </div>
          ) : (
            tasks.slice(0, 3).map((task) => (
              <div key={task.task_id} style={{ background: 'var(--bg-card-secondary)', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>{task.asset_type} HEALTH</span>
                  <ShieldAlert size={16} color="var(--text-primary)" />
                </div>
                <h4 style={{ color: 'var(--text-primary)', marginTop: '6px', fontSize: '0.9rem', fontWeight: 700 }}>{task.asset_id} ({task.defect_type})</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{task.department} Dept • Severity: {task.severity}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
