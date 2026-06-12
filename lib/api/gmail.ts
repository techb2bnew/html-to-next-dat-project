import { getApiBase } from '../config';
import type { EmailMessage, LoadData } from '../types/gmail';

export interface EvaluateEmailResponse {
  status: string;
  message?: string;
  evaluation: {
    broker_reply: string;
    booked: boolean;
    agreed_rate?: number;
  };
}

export async function evaluateEmail(params: {
  emailBody: string;
  loadDetails: LoadData | null;
  history: EmailMessage[];
  studentEmail: string;
  studentName: string;
}): Promise<EvaluateEmailResponse> {
  const res = await fetch(`${getApiBase()}/api/sim/ai/email/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email_body: params.emailBody,
      load_details: params.loadDetails,
      history: params.history,
      student_email: params.studentEmail,
      student_name: params.studentName,
    }),
  });
  const text = await res.text();
  return JSON.parse(text);
}

export async function generateDocument(params: {
  type: string;
  loadDetails: LoadData | null;
  rate: string | number;
}): Promise<{ status: string; html: string }> {
  const res = await fetch(`${getApiBase()}/api/sim/documents/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: params.type,
      load_details: params.loadDetails,
      rate: params.rate,
    }),
  });
  return res.json();
}
