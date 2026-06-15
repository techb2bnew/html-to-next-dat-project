export type DatView =
  | 'dashboard'
  | 'search'
  | 'trucks'
  | 'post_truck'
  | 'loads'
  | 'network'
  | 'tools'

export interface SearchTab {
  id: number
  title: string
  origin: string
  dh_o: string
  destination: string
  dh_d: string
  equipment: string
  load_type: string
  length: string
  weight: string
  date_range: string
  hasSearched: boolean
  results: DatLoad[]
}

export interface DatLoad {
  load_id?: string
  reference_number?: string
  origin?: { city: string; state: string; dh_o?: number }
  destination?: { city: string; state: string; dh_d?: number }
  rate: number
  trip_miles?: number
  distance?: number
  age?: string
  pickup_date?: string
  equipment?: { type?: string; weight?: string; length?: string; load_type?: string }
  broker?: {
    company?: string
    name?: string
    phone?: string
    mc?: string
    credit_score?: number
    dtp?: number
    location?: string
  }
}

export interface Carrier {
  name: string
  driver: string
  phone: string
  truck_type: string
  status: string
  city: string
  state: string
}

export interface PostedTruck {
  origin: string
  destination: string
  equipment: string
  date_available: string
  posted_at: string
}

export interface BookedLoad {
  load_id?: string
  reference_number?: string
  origin?: { city: string; state: string }
  destination?: { city: string; state: string }
  rate: number
  status?: string
  broker?: string | { company?: string; name?: string }
}

export interface NationalLoadItem {
  state: string
  loads_in: number
  loads_out: number
}

export interface CallMessage {
  role: 'user' | 'broker'
  content: string
}

export interface DriverChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface CallState {
  isOpen: boolean
  conversation: CallMessage[]
  status: string
  isListening: boolean
  isProcessing: boolean
}

export interface CurrentLoadData {
  load_id?: string
  reference_number?: string
  origin: string
  destination: string
  distance: number
  rate: number
  dh1: number
  dh2: number
  broker: string
  phone: string
  email?: string
  loadType: string
  equipFull: string
  length: string
  weight: string
  pickupDate: string
  companyLocation: string
}
