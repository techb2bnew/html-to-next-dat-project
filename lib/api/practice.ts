function getApiBase(): string {
  if (typeof window !== 'undefined') {
    return (window as any).__APP_CONFIG__?.apiUrl || 'https://b2b-bck.onrender.com'
  }
  return 'https://b2b-bck.onrender.com'
}

export interface StartPracticePayload {
  track?: string
  student_name?: string
  email?: string
  mobile_number?: string
  batch_id?: string
  college?: string
  course?: string
  semester?: string
  session_id?: string
}

export async function apiStartPractice(data: StartPracticePayload) {
  const res = await fetch(`${getApiBase()}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, string>
    throw new Error(err.message || err.error || `Server returned ${res.status}`)
  }
  return res.json()
}

export async function apiAnswerPractice(
  sessionId: string,
  answer: string,
  audioBlob?: Blob
) {
  const form = new FormData()
  form.append('session_id', sessionId)
  form.append('answer', answer)
  if (audioBlob && audioBlob.size > 0) {
    form.append('media', audioBlob, 'answer.webm')
  }
  const res = await fetch(`${getApiBase()}/answer`, { method: 'POST', body: form })
  if (res.status === 400) throw new Error('session_id missing')
  return res.json()
}

export async function apiNegotiateBrokerCall(payload: Record<string, unknown>) {
  const res = await fetch(`${getApiBase()}/api/sim/calls/negotiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return res.json()
}

export async function apiFetchActiveSessions() {
  const res = await fetch(`${getApiBase()}/active_batches`)
  if (!res.ok) throw new Error('Failed to load sessions')
  return res.json()
}
