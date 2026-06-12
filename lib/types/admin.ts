export type AdminTab = 'submissions' | 'challenges' | 'analytics' | 'dat' | 'sim-live';
export type StudentModalTab = 'overview' | 'timeline' | 'loads' | 'roleplays' | 'ai-review';

export interface AdminAnswer {
  question: string;
  answer_text: string;
  ai_score: number | null;
  ai_feedback: string;
  weak_points?: string;
  improvements?: string;
  manual_score?: number;
  admin_feedback?: string;
  media_path?: string;
}

export interface AdminSession {
  session_id: string;
  student_name: string;
  created_at: string;
  status: 'completed' | 'in_progress';
  answers?: AdminAnswer[];
  track?: string;
  total_manual_score?: number;
  overall_improvements?: string;
  batch_id?: string;
  overall_summary?: string;
  overall_ai_score?: number;
  performance_level?: string;
  key_strengths?: string[];
  weak_areas?: string[];
  improvement_suggestions?: string[];
}

export interface Challenge {
  challenge_id: string;
  title: string;
  category: string;
  difficulty: string;
  duration: string;
  xp_reward: number;
  character: { name: string; role: string };
}

export interface Analytics {
  total_attempts: number;
  avg_score?: number;
  hardest_scenarios?: { title: string; avg_score: number; attempts: number }[];
  skill_heatmap?: Record<string, number>;
}

export interface DatResult {
  timestamp_str?: string;
  type: string;
  student_name?: string;
  student_email: string;
  broker_name: string;
  origin: string;
  destination: string;
  posted_rate: number;
  agreed_rate: number;
  score_pct: number;
  grade: string;
  status: string;
  ai_evaluation?: Record<string, any>;
}

export interface DatLeaderboardEntry {
  _id: string;
  student_name?: string;
  avg_score: number;
  total_calls: number;
  booked_count: number;
  max_rate: number;
  total_revenue: number;
}

export interface LiveActivity {
  time_str: string;
  name?: string;
  email: string;
  action: string;
  detail: string;
}

export interface LiveStudent {
  name: string;
  email: string;
  booked_loads: number;
  level_info?: { title: string };
}

export interface StudentSimData {
  status: string;
  student?: {
    name: string;
    email: string;
    balance?: number;
    revenue?: number;
    booked_loads?: number;
    calls_made?: number;
    emails_sent?: number;
    xp?: number;
    level_info?: { title: string };
    booked_load_history?: any[];
    ai_review?: any;
  };
  activities?: any[];
  calls?: any[];
  emails?: any[];
}

export interface GradeRow {
  score: string;
  feedback: string;
}
