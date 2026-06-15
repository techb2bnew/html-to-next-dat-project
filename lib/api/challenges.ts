function getApiBase(): string {
  if (typeof window !== 'undefined') {
    return (window as any).__APP_CONFIG__?.apiUrl || 'https://b2b-bck.onrender.com'
  }
  return 'https://b2b-bck.onrender.com'
}

export async function apiFetchChallenges(email: string) {
  const res = await fetch(`${getApiBase()}/api/challenges?email=${encodeURIComponent(email)}`)
  if (!res.ok) throw new Error(`Server returned ${res.status}`)
  return res.json()
}

export async function apiStartChallenge(challengeId: string, studentName: string, email: string) {
  const res = await fetch(`${getApiBase()}/api/challenges/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ challenge_id: challengeId, student_name: studentName, email }),
  })
  if (!res.ok) throw new Error('Failed to start challenge')
  return res.json()
}

export async function apiAnswerChallenge(
  sessionId: string,
  text: string,
  audioBlob: Blob | null
) {
  const form = new FormData()
  form.append('session_id', sessionId)
  form.append('answer', text)
  if (audioBlob && audioBlob.size > 0) {
    form.append('media', audioBlob, 'audio.webm')
  }
  const res = await fetch(`${getApiBase()}/api/challenges/answer`, { method: 'POST', body: form })
  if (!res.ok) throw new Error('Failed to answer challenge')
  return res.json()
}

export async function apiCompleteChallenge(sessionId: string, metrics: Record<string, unknown>) {
  const res = await fetch(`${getApiBase()}/api/challenges/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, metrics }),
  })
  if (!res.ok) throw new Error('Failed to complete challenge')
  return res.json()
}

export async function apiFetchProfile(email: string, name: string) {
  const res = await fetch(
    `${getApiBase()}/api/student/profile?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`
  )
  if (!res.ok) throw new Error('Failed to fetch profile')
  return res.json()
}

export async function apiFetchLeaderboard() {
  const res = await fetch(`${getApiBase()}/api/student/leaderboard`)
  if (!res.ok) throw new Error('Failed to fetch leaderboard')
  return res.json()
}

export async function apiFetchAnalytics(email: string) {
  const res = await fetch(
    `${getApiBase()}/api/student/analytics?email=${encodeURIComponent(email)}`
  )
  if (!res.ok) throw new Error('Failed to fetch analytics')
  return res.json()
}

export async function apiFetchDailyChallenge() {
  const res = await fetch(`${getApiBase()}/api/challenges/daily`)
  if (!res.ok) throw new Error('Failed to fetch daily challenge')
  return res.json()
}

export async function apiGenerateDailyChallenge() {
  const res = await fetch(`${getApiBase()}/api/challenges/daily/generate`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to generate daily challenge')
  return res.json()
}
