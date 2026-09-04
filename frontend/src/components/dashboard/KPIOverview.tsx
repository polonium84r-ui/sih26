import React from 'react';
import { ShieldAlert, CheckCircle2, Clock, Layers } from 'lucide-react';

export const KPIOverview: React.FC = () => {
  const kpis = [
    { 
      title: 'Monitored Assets', 
      value: '12,540', 
      sub: 'Tracks, Signals & OHE Wires',
      explanation: 'Total railway infrastructure assets tracked in real-time.',
      icon: Layers 
    },
    { 
      title: 'Pending Defects', 
      value: '4', 
      sub: '2 Track, 1 Signal, 1 OHE',
      explanation: 'Urgent issues needing maintenance blocks.',
      icon: ShieldAlert 
    },
    { 
      title: 'Recommended Blocks', 
      value: '2', 
      sub: 'Combined Multi-Department Work',
      explanation: 'Shadow maintenance slots grouped to save line capacity.',
      icon: CheckCircle2 
    },
    { 
      title: 'Track Utilization Rate', 
      value: '87.5%', 
      sub: '+25.5% vs Manual Planning',
      explanation: 'Percentage of available maintenance time effectively used.',
      icon: Clock 
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', margin: '16px 24px 20px 24px' }}>
      {kpis.map((kpi, idx) => {
        const IconComponent = kpi.icon;
        return (
          <div key={idx} className="formal-panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                  {kpi.title}
                </p>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '4px 0', color: '#ffffff' }}>
                  {kpi.value}
                </h3>
              </div>
              <div style={{ 
                background: '#27272a', 
                border: '1px solid #3f3f46',
                padding: '10px', 
                borderRadius: '6px',
                display: 'flex'
              }}>
                <IconComponent size={20} color="#ffffff" />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '10px' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff' }}>
                {kpi.sub}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {kpi.explanation}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
