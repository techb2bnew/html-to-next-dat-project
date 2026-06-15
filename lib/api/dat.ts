import type { DatLoad, Carrier, PostedTruck, BookedLoad, NationalLoadItem } from '@/lib/types/dat'

function getApiBase(): string {
  if (typeof window !== 'undefined') {
    return (window as any).__APP_CONFIG__?.apiUrl || 'https://b2b-bck.onrender.com'
  }
  return 'https://b2b-bck.onrender.com'
}

export async function apiLogin(email: string, name: string) {
  const res = await fetch(`${getApiBase()}/api/sim/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || 'Login failed')
  }
  return res.json()
}

export async function apiLogout(sessionId: string) {
  await fetch(`${getApiBase()}/api/sim/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  }).catch(() => {})
}

export async function apiLoadDashboard(email: string, name: string): Promise<{
  carriers: Carrier[]
  booked_loads: BookedLoad[]
  load_count: number
  total_revenue: number
  trucks: Carrier[]
}> {
  const res = await fetch(`${getApiBase()}/api/sim/dashboard?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`)
  if (!res.ok) throw new Error('Dashboard load failed')
  return res.json()
}

export async function apiSearchLoads(params: {
  origin: string
  dh_o: string
  destination: string
  dh_d: string
  equipment: string
  load_type: string
  length: string
  weight: string
  date_range: string
  email: string
  name: string
}): Promise<{ loads: DatLoad[] }> {
  const res = await fetch(`${getApiBase()}/api/sim/dat/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error('Search failed')
  return res.json()
}

export async function apiNationalLoads(equipment: string, email: string, name: string): Promise<{
  national_loads: NationalLoadItem[]
}> {
  const res = await fetch(`${getApiBase()}/api/sim/dat/national_loads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ equipment, email, name }),
  })
  if (!res.ok) throw new Error('National loads failed')
  return res.json()
}

export async function apiRecommendedLoads(email: string, name: string): Promise<{ loads: DatLoad[] }> {
  const res = await fetch(`${getApiBase()}/api/sim/dat/recommended_loads?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`)
  if (!res.ok) throw new Error('Recommended loads failed')
  return res.json()
}

export async function apiGenerateRecommendedLoads(email: string, name: string): Promise<{ loads: DatLoad[] }> {
  const res = await fetch(`${getApiBase()}/api/sim/dat/recommended_loads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name }),
  })
  if (!res.ok) throw new Error('Generate recommended loads failed')
  return res.json()
}

export async function apiPostTruck(data: {
  origin: string
  destination: string
  equipment: string
  date_available: string
  email: string
  name: string
}): Promise<{ message: string; posted_trucks: PostedTruck[] }> {
  const res = await fetch(`${getApiBase()}/api/sim/dat/trucks/post`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Post truck failed')
  return res.json()
}

export async function apiPostedTrucks(email: string): Promise<{ trucks: PostedTruck[] }> {
  const res = await fetch(`${getApiBase()}/api/sim/dat/trucks/posted?email=${encodeURIComponent(email)}`)
  if (!res.ok) throw new Error('Posted trucks failed')
  return res.json()
}

export interface NegotiateParams {
  session_id: string
  load_id: string
  origin: string
  destination: string
  distance: number
  rate: number
  dh1: number
  dh2: number
  broker_name: string
  broker_phone: string
  load_type: string
  equip_full: string
  length: string
  weight: string
  pickup_date: string
  company_location: string
  conversation: { role: string; content: string }[]
  user_message: string
  student_email: string
  student_name: string
}

export async function apiNegotiateCall(params: NegotiateParams): Promise<{
  broker_message: string
  call_ended: boolean
  booked: boolean
  final_rate?: number
  score?: string
  score_badge?: string
  evaluation?: string
}> {
  const res = await fetch(`${getApiBase()}/api/sim/calls/negotiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error('Negotiate failed')
  return res.json()
}

export async function apiDriverChat(params: {
  driver_name: string
  message: string
  history: { role: string; content: string }[]
  student_email: string
  student_name: string
}): Promise<{ reply: string }> {
  const res = await fetch(`${getApiBase()}/api/sim/driver/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error('Driver chat failed')
  return res.json()
}

export async function apiGenerateDoc(params: {
  doc_type: string
  load_details: Record<string, unknown>
  rate: number
  student_email: string
  student_name: string
}): Promise<{ html: string }> {
  const res = await fetch(`${getApiBase()}/api/sim/documents/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error('Document generation failed')
  return res.json()
}

export async function apiCitySuggestions(query: string): Promise<string[]> {
  if (query.length < 2) return []
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`
  )
  const data = await res.json()
  if (!data.results?.length) return []
  return data.results.map((r: { name: string; admin1?: string; country_code?: string }) => {
    const parts = [r.name]
    if (r.admin1) parts.push(r.admin1)
    if (r.country_code) parts.push(r.country_code)
    return parts.join(', ')
  })
}
