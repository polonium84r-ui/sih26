import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { KPIOverview } from './components/dashboard/KPIOverview';
import { PriorityList } from './components/dashboard/PriorityList';
import { DominoView } from './components/dashboard/DominoView';
import { BlockTetrisGantt } from './components/block_tetris/BlockTetrisGantt';
import { CorridorSim } from './components/digital_twin/CorridorSim';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { FieldAssistant } from './components/field_assistant/FieldAssistant';

import { MaintenanceTask, PriorityScore, CascadeImpact, BlockRecommendation } from './types';

// Mock Initial Data matching Backend API Output
const sampleTasks: MaintenanceTask[] = [
  {
    task_id: "TASK-TMS-TRK-125-001",
    source_system: "TMS",
    asset_id: "TRK-125-001",
    asset_type: "TRACK",
    department: "ENGINEERING",
    defect_type: "RAIL_CRACK",
    location_start_km: 125.4,
    location_end_km: 126.4,
    corridor_id: "CORRIDOR-A",
    severity: "HIGH",
    reported_date: "2026-09-02T08:00:00Z",
    due_date: "2026-09-05T00:00:00Z",
    estimated_duration_minutes: 120,
    status: "PENDING"
  },
  {
    task_id: "TASK-SMMS-SIG-126-01",
    source_system: "SMMS",
    asset_id: "SIG-126-01",
    asset_type: "SIGNAL",
    department: "SNT",
    defect_type: "POINT_MACHINE_FAILURE",
    location_start_km: 126.2,
    location_end_km: 126.7,
    corridor_id: "CORRIDOR-A",
    severity: "CRITICAL",
    reported_date: "2026-09-04T03:00:00Z",
    due_date: "2026-09-04T15:00:00Z",
    estimated_duration_minutes: 60,
    status: "PENDING"
  },
  {
    task_id: "TASK-TDMS-OHE-125-04",
    source_system: "TDMS",
    asset_id: "OHE-125-04",
    asset_type: "OHE",
    department: "TRACTION",
    defect_type: "CANTILEVER_INSPECTION",
    location_start_km: 125.8,
    location_end_km: 127.0,
    corridor_id: "CORRIDOR-A",
    severity: "HIGH",
    reported_date: "2026-09-03T08:00:00Z",
    due_date: "2026-09-06T00:00:00Z",
    estimated_duration_minutes: 120,
    status: "PENDING"
  }
];

const samplePriorities: PriorityScore[] = [
  {
    task_id: "TASK-SMMS-SIG-126-01",
    priority_score: 94.5,
    priority_level: "CRITICAL",
    ranking: 1,
    reasons: ["Point Machine Failure", "Due within 12 hours", "Signal SNT Criticality"],
    explanation_factors: [
      { factor: "Defect Severity (POINT_MACHINE_FAILURE)", impact: "+45.0" },
      { factor: "Due within 12 Hours", impact: "+25.0" },
      { factor: "Department Criticality (SNT)", impact: "+24.5" }
    ]
  },
  {
    task_id: "TASK-TMS-TRK-125-001",
    priority_score: 88.0,
    priority_level: "CRITICAL",
    ranking: 2,
    reasons: ["Rail Crack Defect", "Overdue Maintenance", "Engineering Criticality"],
    explanation_factors: [
      { factor: "Defect Severity (RAIL_CRACK)", impact: "+35.0" },
      { factor: "Due within 24 Hours", impact: "+25.0" },
      { factor: "Department Criticality (ENGINEERING)", impact: "+28.0" }
    ]
  }
];

const sampleCascade: CascadeImpact[] = [
  {
    task_id: "TASK-TMS-TRK-125-001",
    cascade_risk_score: 88.0,
    cascade_level: "CRITICAL",
    affected_assets: ["TRK-125-001", "SIG-126-01"],
    affected_trains: ["EXP-102 (KERALA EXPRESS)", "FREIGHT-204"],
    chain_explanation: [
      "Unaddressed rail crack forces Speed Restriction (TSR 30 km/h)",
      "Speed restriction creates 18 min cumulative delay for EXP-102",
      "Signal headway conflict at Junction KM126 causes downstream freight holding"
    ]
  }
];

const sampleBlocks: BlockRecommendation[] = [
  {
    block_id: "BLK-20260905-01",
    corridor_id: "CORRIDOR-A",
    start_km: 125.0,
    end_km: 127.0,
    start_time: "2026-09-05T01:00:00Z",
    end_time: "2026-09-05T03:00:00Z",
    duration_minutes: 120,
    allocated_tasks: ["TASK-TMS-TRK-125-001", "TASK-TDMS-OHE-125-04"],
    participating_departments: ["ENGINEERING", "TRACTION"],
    conflict_status: "CLEAR",
    optimization_score: 95.0
  }
];

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <KPIOverview />

      <main style={{ flex: 1 }}>
        {activeTab === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '0 24px 24px 24px' }}>
            <PriorityList priorities={samplePriorities} tasks={sampleTasks} />
            <DominoView impacts={sampleCascade} />
          </div>
        )}

        {activeTab === 'tetris' && (
          <BlockTetrisGantt blocks={sampleBlocks} tasks={sampleTasks} />
        )}

        {activeTab === 'digital-twin' && (
          <CorridorSim trains={[]} tasks={sampleTasks} />
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
