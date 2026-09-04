import React from 'react';
import { CascadeImpact } from '../../types';
import { Network, ArrowRight, AlertOctagon } from 'lucide-react';

interface DominoViewProps {
  impacts: CascadeImpact[];
}

export const DominoView: React.FC<DominoViewProps> = ({ impacts }) => {
  return (
    <div className="formal-panel" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <Network size={18} color="var(--text-primary)" /> DOMINO AI (CASCADE RISK ENGINE)
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            What happens if maintenance is delayed? (Chain reaction analysis)
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {impacts.map((item) => (
          <div 
            key={item.task_id}
            style={{
              background: 'var(--bg-card-secondary)',
              border: '1px solid var(--border-strong)',
              borderRadius: '6px',
              padding: '14px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertOctagon size={16} color="var(--text-primary)" />
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  IF DELAYED: {item.task_id}
                </span>
              </div>
              <span className="badge badge-critical">
                CASCADE RISK: {item.cascade_risk_score} / 100
              </span>
            </div>

            {/* Plain English Step-by-Step Chain */}
            <div style={{ background: 'var(--bg-dark)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>PREDICTED CHAIN REACTION:</span>
              {item.chain_explanation.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                  <span style={{ 
                    background: '#000000', 
                    color: '#ffffff', 
                    borderRadius: '50%', 
                    width: '18px', 
                    height: '18px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: 800, 
                    fontSize: '0.65rem',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.75rem' }}>
              <div>
                <span style={{ color: 'var(--text-tertiary)', fontWeight: 700 }}>AFFECTED ASSETS:</span>
                <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>{item.affected_assets.join(', ')}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)', fontWeight: 700 }}>IMPACTED TRAINS:</span>
                <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>{item.affected_trains.join(', ')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
