export type SimMode = 'broker' | 'carrier' | 'mixed';
export type CallPhase = 'setup' | 'call' | 'score';
export type MsgType = 'system' | 'ai' | 'user';

export interface ScenarioData {
  lane: { origin: string; destination: string };
  equipment: string;
  commodity: string;
  weight: string;
  market_condition: string;
  base_rate: number | string;
}

export interface SimulationState {
  mode: string;
  ai_role: string;
  user_role: string;
  ai_persona: string;
  scenario: ScenarioData;
}

export interface CallMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface TimelineEvent {
  id: number;
  time: string;
  text: string;
}

export interface TranscriptMessage {
  id: number;
  type: MsgType;
  speaker: string;
  text: string;
}

export interface ScoreData {
  overall_rating: number;
  negotiation_score: number;
  communication_score: number;
  objection_handling_score: number;
  closing_score: number;
  professionalism_score: number;
  confidence_score: number;
  industry_knowledge_score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}
