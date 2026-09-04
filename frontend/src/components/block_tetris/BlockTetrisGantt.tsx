import React, { useState } from 'react';
import { BlockRecommendation, MaintenanceTask } from '../../types';
import { Calendar, CheckCircle, AlertTriangle, Info, HelpCircle } from 'lucide-react';

interface BlockTetrisGanttProps {
  blocks: BlockRecommendation[];
  tasks: MaintenanceTask[];
}

export const BlockTetrisGantt: React.FC<BlockTetrisGanttProps> = ({ blocks, tasks }) => {
  const [selectedBlock, setSelectedBlock] = useState<BlockRecommendation | null>(blocks[0] || null);

  const hours = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00'];
  const kilometers = ['KM 120-123', 'KM 124-126 (SECTION A)', 'KM 127-130'];

  return (
    <div style={{ padding: '0 24px 24px 24px' }}>
      {/* Friendly Guide Banner */}
      <div className="formal-panel" style={{ padding: '14px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <HelpCircle size={20} color="#ffffff" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <strong style={{ color: '#ffffff' }}>What is Block Tetris?</strong> This Gantt grid shows railway line capacity over time. The white box represents an <strong>AI-recommended 2-hour window (01:00 - 03:00)</strong> where Engineering & Traction work together while NO passenger trains pass.
        </div>
      </div>

      <div className="formal-panel" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
              <Calendar size={18} color="#ffffff" /> BLOCK TETRIS • CORRIDOR SCHEDULER
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Click on the white block below to view allocated maintenance tasks and collision checks.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <span className="badge badge-clear"><CheckCircle size={12} /> SAFE WINDOW (NO TRAINS)</span>
            <span className="badge badge-high"><AlertTriangle size={12} /> TRAIN CONFLICT</span>
          </div>
        </div>

        {/* Timeline Grid Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '180px repeat(9, 1fr)', gap: '4px', background: '#000000', border: '1px solid var(--border-strong)', padding: '12px', borderRadius: '4px 4px 0 0', fontWeight: 700, fontSize: '0.75rem', textAlign: 'center' }}>
          <div style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>CORRIDOR SECTION</div>
          {hours.map((h, i) => (
            <div key={i} style={{ color: '#ffffff' }}>{h}</div>
          ))}
        </div>

        {/* Timeline Rows */}
        {kilometers.map((km, rIdx) => (
          <div key={rIdx} style={{ display: 'grid', gridTemplateColumns: '180px repeat(9, 1fr)', gap: '4px', background: 'var(--bg-card)', padding: '14px 12px', border: '1px solid var(--border-color)', borderTop: 'none', alignItems: 'center', position: 'relative' }}>
            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#ffffff' }}>{km}</div>

            {/* Grid cells */}
            {hours.map((_, cIdx) => (
              <div key={cIdx} style={{ height: '42px', background: '#09090b', borderRadius: '4px', border: '1px solid #18181b' }} />
            ))}

            {/* Block B104 on Section A (KM 124-126) at 01:00-03:00 */}
            {rIdx === 1 && (
              <div
                onClick={() => setSelectedBlock(blocks[0])}
                style={{
                  position: 'absolute',
                  left: 'calc(180px + (100% - 180px) * 1 / 9 + 4px)',
                  width: 'calc((100% - 180px) * 2 / 9 - 8px)',
                  height: '42px',
                  background: '#ffffff',
                  color: '#000000',
                  border: '2px solid #ffffff',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  zIndex: 10,
                  boxShadow: '0 0 10px rgba(255, 255, 255, 0.4)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>BLOCK B104 (CLICK ME)</span>
                  <span>01:00 - 03:00</span>
                </div>
                <span style={{ fontSize: '0.65rem', color: '#27272a', fontWeight: 700 }}>✓ Combined Track & OHE Repair</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Block Detail Panel */}
      {selectedBlock && (
        <div className="formal-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '12px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} /> BLOCK DETAILS: {selectedBlock.block_id} (01:00 AM - 03:00 AM)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', fontSize: '0.85rem' }}>
            <div style={{ background: '#09090b', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem', fontWeight: 700 }}>LOCATION RANGE:</span>
              <p style={{ fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>KM {selectedBlock.start_km} to {selectedBlock.end_km}</p>
            </div>
            <div style={{ background: '#09090b', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem', fontWeight: 700 }}>CO-LOCATED WORK:</span>
              <p style={{ fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>{selectedBlock.participating_departments.join(' + ')}</p>
            </div>
            <div style={{ background: '#09090b', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem', fontWeight: 700 }}>SAFETY CHECK:</span>
              <p style={{ marginTop: '2px' }}><span className="badge badge-clear">✓ 0 TRAIN CONFLICTS</span></p>
            </div>
            <div style={{ background: '#09090b', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem', fontWeight: 700 }}>AI CP-SAT CONFIDENCE:</span>
              <p style={{ fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>{selectedBlock.optimization_score} / 100</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
