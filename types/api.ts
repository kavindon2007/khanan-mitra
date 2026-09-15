export interface VTCBasic {
  id: string;
  name: string;
  district: string;
  state: string;
  sector: string;
}

export interface Worker {
  id: string;
  short_worker_id: string;
  full_name: string;
  phone_number: string;
  department: string;
  contractor: string | null;
  blood_group: string | null;
  preferred_language: string;
  is_active: boolean;
  vtc: VTCBasic;
  badge_issued_at: string | null;
  created_at: string;
}

export interface WorkerListResponse {
  items: Worker[];
  page: number;
  page_size: number;
  total: number;
}

export interface WorkerDetailResponse {
  worker: Worker;
  latest_completion: any | null;
  certificate_status: string;
}

export interface TrainingScenarioBasic {
  id: string;
  scenario_key: string;
  title_en: string;
  title_hi: string;
  title_sat: string;
  passing_threshold: number;
  total_steps: number;
}

export interface CompletionLog {
  id: string;
  worker: Worker;
  scenario: TrainingScenarioBasic;
  score: number;
  passed: boolean;
  total_attempts: number;
  duration_seconds: number | null;
  completed_at: string;
  verified_at: string;
  sync_path: string;
  certificate_issued: boolean;
  certificate_expires_at: string | null;
  is_flagged: boolean;
  flagged_reason: string | null;
}

export interface CompletionLogListResponse {
  items: CompletionLog[];
  page: number;
  page_size: number;
  total: number;
}

export interface StepLog {
  id: string;
  step_key: string;
  step_index: number;
  action_taken: string;
  correct: boolean;
  points_awarded: number;
  time_taken_seconds: number;
  attempt_number: number;
  recorded_at: string;
}

export interface CompletionDetailResponse {
  completion: CompletionLog;
  steps: StepLog[];
  certificate_status: string;
}

export interface DashboardOverview {
  total_workers: number;
  active_workers: number;
  total_vtcs: number;
  total_completions: number;
  passed_completions: number;
  failed_completions: number;
  pass_rate: number;
  flagged_completions: number;
  expiring_certificates: number;
}

export interface VTCStat {
  id: string;
  name: string;
  district: string;
  state: string;
  sector: string;
  worker_count: number;
  completion_count: number;
  pass_rate: number;
}

export interface VTCStatsResponse {
  items: VTCStat[];
}

export interface StepAnalytics {
  scenario_key: string;
  step_key: string;
  attempts: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  average_time_seconds: number;
}

export interface StepAnalyticsResponse {
  items: StepAnalytics[];
}

export interface Device {
  id: string;
  device_label: string;
  android_id: string | null;
  vtc: VTCBasic;
  last_synced_at: string | null;
  last_heartbeat_at: string | null;
  pending_records: number;
  app_version: string | null;
  encryption_key_version: number;
  created_at: string;
  status: string;
}

export interface DeviceListResponse {
  items: Device[];
}

export interface AuditLog {
  id: string;
  actor_type: string;
  actor_id: string | null;
  action: string;
  target_table: string | null;
  target_id: string | null;
  metadata_: any | null;
  created_at: string;
}

export interface AuditLogListResponse {
  items: AuditLog[];
  page: number;
  page_size: number;
  total: number;
}

export interface CertificateVerification {
  valid: boolean;
  status: string;
  worker?: {
    id: string;
    full_name: string;
    short_worker_id: string;
    vtc: string;
  };
  training?: {
    scenario: string;
    score: number;
  };
  completed_at?: string;
  expires_at?: string | null;
}
