import { getApiBase } from '@/lib/config';

const base = () => getApiBase();

export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${base()}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password }),
  });
  return res.json();
}

export async function fetchSubmissions(token: string) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 60000);
  try {
    const res = await fetch(`${base()}/admin/submissions`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (res.status === 401) throw new Error('UNAUTHORIZED');
    return res.json();
  } catch (e) {
    clearTimeout(t);
    throw e;
  }
}

export async function fetchSubmissionDetail(token: string, sessionId: string) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 60000);
  try {
    const res = await fetch(`${base()}/admin/submission/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: ctrl.signal,
    });
    clearTimeout(t);
    return res.json();
  } catch (e) {
    clearTimeout(t);
    throw e;
  }
}

export async function generateAISummary(token: string, sessionId: string) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 60000);
  try {
    const res = await fetch(`${base()}/admin/ai_summary/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: ctrl.signal,
    });
    clearTimeout(t);
    return res.json();
  } catch (e) {
    clearTimeout(t);
    throw e;
  }
}

export async function saveGradeApi(
  token: string,
  sessionId: string,
  index: number,
  score: number,
  feedback: string,
) {
  const res = await fetch(`${base()}/admin/grade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ session_id: sessionId, answer_index: index, score, feedback }),
  });
  return res.json();
}

export async function sendFinalResultsApi(
  token: string,
  sessionId: string,
  score: number,
  improvements: string,
) {
  const res = await fetch(`${base()}/admin/send_results`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ session_id: sessionId, score, improvements }),
  });
  return res.json();
}

export async function deleteSubmissionApi(token: string, sessionId: string) {
  const res = await fetch(`${base()}/admin/delete/${sessionId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function clearAllSessionsApi(token: string) {
  const res = await fetch(`${base()}/admin/clear_all`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function fetchChallengesApi() {
  const res = await fetch(`${base()}/api/challenges`);
  return res.json();
}

export async function deleteChallengeApi(token: string, challengeId: string) {
  const res = await fetch(`${base()}/api/challenges/delete/${challengeId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function fetchAnalyticsApi() {
  const res = await fetch(`${base()}/api/admin/analytics`);
  return res.json();
}

export async function fetchSimLiveApi() {
  const res = await fetch(`${base()}/api/sim/admin/activity`);
  return res.json();
}

export async function fetchStudentProfileApi(email: string) {
  const res = await fetch(`${base()}/api/sim/admin/student/${email}`);
  return res.json();
}

export async function triggerStudentAiReviewApi(email: string) {
  const res = await fetch(`${base()}/api/sim/admin/student/${email}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function fetchDatResultsApi() {
  const res = await fetch(`${base()}/api/sim/admin/dat/results`);
  return res.json();
}

export function getReportUrl(token: string, sessionId: string) {
  return `${base()}/admin/session/report/${sessionId}?token=${token}`;
}
