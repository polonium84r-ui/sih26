import React, { useState } from 'react';
import { PriorityScore, MaintenanceTask } from '../../types';
import { AlertCircle, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface PriorityListProps {
  priorities: PriorityScore[];
  tasks: MaintenanceTask[];
}

export const PriorityList: React.FC<PriorityListProps> = ({ priorities, tasks }) => {
  const [expandedTask, setExpandedTask] = useState<string | null>(priorities[0]?.task_id || null);

  const toggleExpand = (taskId: string) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  return (
    <div className="formal-panel" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
            <AlertCircle size={18} color="#ffffff" /> AI PRIORITY ENGINE (RANKED DEFECTS)
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Which maintenance tasks should be done first? (Click any item to see full reasoning)
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {priorities.map((item) => {
          const task = tasks.find(t => t.task_id === item.task_id);
          const isExpanded = expandedTask === item.task_id;

          return (
            <div 
              key={item.task_id} 
              style={{
                background: 'var(--bg-card-secondary)',
                border: '1px solid var(--border-strong)',
                borderRadius: '6px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onClick={() => toggleExpand(item.task_id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    background: item.ranking === 1 ? '#ffffff' : '#18181b',
                    color: item.ranking === 1 ? '#000000' : '#ffffff',
                    border: '1px solid #ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.85rem'
                  }}>
                    #{item.ranking}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>{item.task_id}</span>
                      <span className={`badge badge-${item.priority_level.toLowerCase()}`}>
                        {item.priority_level} PRIORITY
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      <strong>{task?.asset_id}</strong> ({task?.department} Dept) • {task?.defect_type} @ Location KM {task?.location_start_km}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                      {item.priority_score} <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>/ 100</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      Click to inspect factors
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={18} color="#ffffff" /> : <ChevronDown size={18} color="var(--text-tertiary)" />}
                </div>
              </div>

              {/* Expanded Plain English Reasoning Panel */}
              {isExpanded && (
                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', background: '#09090b', padding: '12px', borderRadius: '4px' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <HelpCircle size={14} /> WHY WAS THIS GIVEN A SCORE OF {item.priority_score}?
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {item.explanation_factors.map((f, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-card)', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                        <span>• {f.factor}</span>
                        <strong style={{ color: '#ffffff' }}>{f.impact} Points</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
