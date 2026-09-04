import React from 'react';
import { TrendingUp, BarChart3, Award, Clock } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const comparison = [
    { metric: 'Block Utilization Rate', before: '62.0%', after: '87.5%', diff: '+25.5%', icon: TrendingUp },
    { metric: 'Unused Block Time', before: '38.0%', after: '12.5%', diff: '-25.5%', icon: Clock },
    { metric: 'Number of Separate Blocks', before: '12', after: '7', diff: '-41.6%', icon: BarChart3 },
    { metric: 'Train Schedule Impact Delay', before: '18 mins', after: '4 mins', diff: '-77.7%', icon: Award },
  ];

  return (
    <div style={{ padding: '0 24px 24px 24px' }}>
      <div className="formal-panel" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <TrendingUp size={18} color="var(--text-primary)" /> EXECUTIVE ROI & EFFICIENCY ANALYTICS
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Baseline performance evaluation of manual vs. AI CP-SAT block scheduling.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {comparison.map((item, idx) => {
            return (
              <div key={idx} style={{ background: 'var(--bg-card-secondary)', border: '1px solid var(--border-strong)', padding: '20px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.metric}</span>
                  <span className="badge badge-clear">{item.diff} GAIN</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                  <div style={{ background: 'var(--bg-dark)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>BASELINE (MANUAL)</span>
                    <h3 style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '1.4rem', fontWeight: 800 }}>{item.before}</h3>
                  </div>
                  <div style={{ background: '#000000', padding: '12px', borderRadius: '4px', border: '1px solid #000000' }}>
                    <span style={{ fontSize: '0.7rem', color: '#a1a1aa', fontWeight: 700 }}>AI OPTIMIZED</span>
                    <h3 style={{ color: '#ffffff', marginTop: '4px', fontSize: '1.4rem', fontWeight: 800 }}>{item.after}</h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
