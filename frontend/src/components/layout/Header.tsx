import React, { useState } from 'react';
import { Train, Play, CheckCircle2, Info } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedAlert, setOptimizedAlert] = useState(false);

  const tabs = [
    { id: 'dashboard', label: '1. Risk & Priority Center' },
    { id: 'tetris', label: '2. Block Tetris Scheduler' },
    { id: 'digital-twin', label: '3. Live Digital Twin' },
    { id: 'analytics', label: '4. Executive ROI' },
    { id: 'field', label: '5. Field Assistant' },
  ];

  const handleRunOptimizer = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      setOptimizedAlert(true);
      setTimeout(() => setOptimizedAlert(false), 4000);
    }, 1000);
  };

  return (
    <header style={{ margin: '16px 24px 0 24px' }}>
      <div className="formal-panel" style={{ padding: '16px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ 
              background: '#ffffff', 
              padding: '10px', 
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Train size={24} color="#000000" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                INDIAN RAILWAYS • AI BLOCK PLANNER
              </h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Smart Maintenance & Train Delay Prevention System
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={handleRunOptimizer}
              className="btn-formal"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
            >
              <Play size={16} /> {isOptimizing ? 'Running CP-SAT AI...' : 'Run AI Optimizer'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? '#ffffff' : 'transparent',
                color: activeTab === tab.id ? '#000000' : 'var(--text-secondary)',
                border: activeTab === tab.id ? '1px solid #ffffff' : '1px solid var(--border-color)',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Optimized Toast Feedback Banner */}
      {optimizedAlert && (
        <div style={{
          marginTop: '12px',
          background: '#ffffff',
          color: '#000000',
          padding: '12px 20px',
          borderRadius: '6px',
          fontWeight: 700,
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 12px rgba(255,255,255,0.2)'
        }}>
          <CheckCircle2 size={18} />
          <span>AI Optimization Successful: Combined Track & OHE maintenance into 1 non-conflicting block window (BLK-20260905-01). 0 train delays predicted!</span>
        </div>
      )}

      {/* Plain English System Concept Guide */}
      <div style={{
        marginTop: '12px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        padding: '10px 16px',
        borderRadius: '6px',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Info size={16} color="#ffffff" style={{ flexShrink: 0 }} />
        <span>
          <strong>How this system works:</strong> It automatically pulls track defects from Engineering, Signals, and Traction, ranks their urgency using AI, and finds open time slots where multiple departments can work together without delaying passenger trains.
        </span>
      </div>
    </header>
  );
};
