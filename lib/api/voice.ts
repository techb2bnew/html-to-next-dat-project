import { getApiBase } from '@/lib/config';
import type { SimulationState, CallMessage, ScoreData } from '@/lib/types/voice';

export async function initCall(mode: string): Promise<SimulationState & { status: string }> {
  const res = await fetch(`${getApiBase()}/api/sim/calls/init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ simulation_mode: mode }),
  });
  return res.json();
}

export interface DirectCallPayload {
  load_id?: string;
  broker_name?: string;
  load: Record<string, unknown>;
}

export interface DirectCallResponse {
  opening_line?: string;
}

export async function initiateDirectCall(payload: DirectCallPayload): Promise<DirectCallResponse> {
  const res = await fetch(`${getApiBase()}/api/sim/calls/initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export interface ChatPayload {
  mode: string;
  ai_role: string;
  user_role: string;
  ai_persona: string;
  scenario: SimulationState['scenario'];
  history: CallMessage[];
}

export interface ChatResponse {
  status: string;
  reply: string;
  emotional_state?: string;
  detected_objection?: string;
  action?: string;
  message?: string;
}

export async function chatWithAI(payload: ChatPayload): Promise<ChatResponse> {
  const res = await fetch(`${getApiBase()}/api/sim/calls/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export interface ScorePayload {
  history: CallMessage[];
  scenario: SimulationState['scenario'];
  ai_role: string;
  user_role: string;
  email: string;
  student_name: string;
}

export interface ScoreResponse {
  status: string;
  scores: ScoreData;
}

export async function scoreCall(payload: ScorePayload): Promise<ScoreResponse> {
  const res = await fetch(`${getApiBase()}/api/sim/calls/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}
