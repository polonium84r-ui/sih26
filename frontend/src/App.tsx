import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { KPIOverview } from './components/dashboard/KPIOverview';
import { PriorityList } from './components/dashboard/PriorityList';
import { DominoView } from './components/dashboard/DominoView';
import { BlockTetrisGantt } from './components/block_tetris/BlockTetrisGantt';
import { CorridorSim } from './components/digital_twin/CorridorSim';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { FieldAssistant } from './components/field_assistant/FieldAssistant';
import { RealTimeTrainViewer } from './components/dashboard/RealTimeTrainViewer';
import { DefectRequestPortal } from './components/request_portal/DefectRequestPortal';
import { TimetableReports } from './components/reports/TimetableReports';

import { MaintenanceTask, PriorityScore, CascadeImpact, BlockRecommendation, TrainSchedule } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [priorities, setPriorities] = useState<PriorityScore[]>([]);
  const [cascadeImpacts, setCascadeImpacts] = useState<CascadeImpact[]>([]);
  const [blocks, setBlocks] = useState<BlockRecommendation[]>([]);
  const [trains, setTrains] = useState<TrainSchedule[]>([]);

  const fetchBackendData = async () => {
    try {
      // 1. Fetch Normalized Tasks
      const tasksRes = await fetch('http://localhost:8000/api/v1/integrations/tasks');
      if (tasksRes.ok) setTasks(await tasksRes.json());

      // 2. Fetch AI Priorities
      const priorityRes = await fetch('http://localhost:8000/api/v1/priority/evaluate');
      if (priorityRes.ok) setPriorities(await priorityRes.json());

      // 3. Fetch Domino Cascade Impacts (Evaluated against REAL trains and live delays)
      const dominoRes = await fetch('http://localhost:8000/api/v1/domino/analyze');
      if (dominoRes.ok) setCascadeImpacts(await dominoRes.json());

      // 4. Fetch CP-SAT Block Recommendations
      const blockRes = await fetch('http://localhost:8000/api/v1/optimizer/solve');
      if (blockRes.ok) setBlocks(await blockRes.json());

      // 5. Fetch Trains
      const trainsRes = await fetch('http://localhost:8000/api/v1/integrations/trains');
      if (trainsRes.ok) setTrains(await trainsRes.json());
    } catch (err) {
      console.error('Error loading live data from backend API:', err);
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <KPIOverview tasks={tasks} blocks={blocks} />

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
          <CorridorSim trains={[]} tasks={tasks} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}

        {activeTab === 'field' && (
          <FieldAssistant />
        )}

        {activeTab === 'coa-live' && (
          <RealTimeTrainViewer />
        )}

        {activeTab === 'request-portal' && (
          <DefectRequestPortal tasks={tasks} onTaskCreated={fetchBackendData} />
        )}

        {activeTab === 'reports' && (
          <TimetableReports trains={trains} blocks={blocks} />
        )}
      </main>
    </div>
  );
}

export default App;
