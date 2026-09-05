import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { KPIOverview } from './components/dashboard/KPIOverview';
import { PriorityList } from './components/dashboard/PriorityList';
import { DominoView } from './components/dashboard/DominoView';
import { BlockTetrisGantt } from './components/block_tetris/BlockTetrisGantt';
import { CorridorSim } from './components/digital_twin/CorridorSim';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { FieldAssistant } from './components/field_assistant/FieldAssistant';

import { MaintenanceTask, PriorityScore, CascadeImpact, BlockRecommendation, TrainSchedule } from './types';

const API_BASE = 'http://localhost:8000/api/v1';

export function App() {
  const [activeTab, setActiveTab] = useState('digital-twin');
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [trains, setTrains] = useState<TrainSchedule[]>([]);
  const [priorities, setPriorities] = useState<PriorityScore[]>([]);
  const [cascadeImpacts, setCascadeImpacts] = useState<CascadeImpact[]>([]);
  const [blocks, setBlocks] = useState<BlockRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dbStatus, setDbStatus] = useState<'CONNECTED' | 'OFFLINE'>('CONNECTED');

  const fetchDatabaseData = async () => {
    try {
      setLoading(true);
      const [tasksRes, trainsRes, prioRes, dominoRes, blocksRes] = await Promise.all([
        fetch(`${API_BASE}/integrations/tasks`),
        fetch(`${API_BASE}/integrations/trains`),
        fetch(`${API_BASE}/priority/evaluate`),
        fetch(`${API_BASE}/domino/analyze`),
        fetch(`${API_BASE}/optimizer/solve`),
      ]);

      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (trainsRes.ok) setTrains(await trainsRes.json());
      if (prioRes.ok) setPriorities(await prioRes.json());
      if (dominoRes.ok) setCascadeImpacts(await dominoRes.json());
      if (blocksRes.ok) setBlocks(await blocksRes.json());
      setDbStatus('CONNECTED');
    } catch (err) {
      console.warn('Backend API connection failed, checking fallback:', err);
      setDbStatus('OFFLINE');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <KPIOverview />

      <main style={{ flex: 1 }}>
        {activeTab === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '0 24px 24px 24px' }}>
            <PriorityList priorities={priorities} tasks={tasks} />
            <DominoView impacts={cascadeImpacts} />
          </div>
        )}

        {activeTab === 'tetris' && (
          <BlockTetrisGantt blocks={blocks} tasks={tasks} />
        )}

        {activeTab === 'digital-twin' && (
          <CorridorSim trains={trains} tasks={tasks} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}

        {activeTab === 'field' && (
          <FieldAssistant />
        )}
      </main>
    </div>
  );
}

export default App;
