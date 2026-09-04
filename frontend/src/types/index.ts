export type Department = 'ENGINEERING' | 'SNT' | 'TRACTION' | 'OPERATIONS';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskStatus = 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';

export interface MaintenanceTask {
  task_id: string;
  source_system: 'TMS' | 'SMMS' | 'TDMS';
  asset_id: string;
  asset_type: 'TRACK' | 'SIGNAL' | 'OHE';
  department: Department;
  defect_type: string;
  location_start_km: number;
  location_end_km: number;
  corridor_id: string;
  severity: Severity;
  reported_date: string;
  due_date: string;
  estimated_duration_minutes: number;
  status: TaskStatus;
}

export interface PriorityExplanationFactor {
  factor: string;
  impact: string;
}

export interface PriorityScore {
  task_id: string;
  priority_score: number;
  priority_level: Severity;
  ranking: number;
  reasons: string[];
  explanation_factors: PriorityExplanationFactor[];
}

export interface CascadeImpact {
  task_id: string;
  cascade_risk_score: number;
  cascade_level: Severity;
  affected_assets: string[];
  affected_trains: string[];
  chain_explanation: string[];
}

export interface BlockRecommendation {
  block_id: string;
  corridor_id: string;
  start_km: number;
  end_km: number;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  allocated_tasks: string[];
  participating_departments: Department[];
  conflict_status: 'CLEAR' | 'CONFLICT_DETECTED';
  optimization_score: number;
}
