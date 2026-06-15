'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  DatView,
  SearchTab,
  DatLoad,
  Carrier,
  PostedTruck,
  BookedLoad,
  NationalLoadItem,
  CallMessage,
  CallState,
  DriverChatMessage,
  CurrentLoadData,
} from '@/lib/types/dat'
import {
  apiLogin,
  apiLogout,
  apiLoadDashboard,
  apiSearchLoads,
  apiNationalLoads,
  apiRecommendedLoads,
  apiGenerateRecommendedLoads,
  apiPostTruck,
  apiPostedTrucks,
  apiNegotiateCall,
  apiDriverChat,
  apiGenerateDoc,
} from '@/lib/api/dat'

let tabIdSeed = 1
function defaultTab(): SearchTab {
  return {
    id: tabIdSeed++,
    title: 'Search 1',
    origin: '',
    dh_o: '50',
    destination: '',
    dh_d: '50',
    equipment: 'Dry Van',
    load_type: 'Both',
    length: 'Any',
    weight: 'Any',
    date_range: 'Today',
    hasSearched: false,
    results: [],
  }
}

export interface DriverChatState {
  isOpen: boolean
  driverName: string
  phone: string
  history: DriverChatMessage[]
  inputValue: string
  isLoading: boolean
}

export function useDatSim() {
  // ── Auth ──────────────────────────────────────────────────────────
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginName, setLoginName] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const sessionIdRef = useRef('')

  // ── Navigation ────────────────────────────────────────────────────
  const [view, setView] = useState<DatView>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // ── Search tabs ───────────────────────────────────────────────────
  const [searchTabs, setSearchTabs] = useState<SearchTab[]>(() => {
    if (typeof window === 'undefined') return [defaultTab()]
    try {
      const saved = localStorage.getItem('sim_searchTabs_tabs')
      const savedActive = localStorage.getItem('sim_searchTabs_active')
      if (saved) {
        const tabs = JSON.parse(saved) as SearchTab[]
        if (savedActive) {
          const activeId = parseInt(savedActive, 10)
          const found = tabs.find(t => t.id === activeId)
          if (found) tabIdSeed = Math.max(tabIdSeed, ...tabs.map(t => t.id)) + 1
        }
        return tabs.length > 0 ? tabs : [defaultTab()]
      }
    } catch {}
    return [defaultTab()]
  })

  const [activeTabId, setActiveTabId] = useState<number>(() => {
    if (typeof window === 'undefined') return 1
    try {
      const saved = localStorage.getItem('sim_searchTabs_active')
      return saved ? parseInt(saved, 10) : searchTabs[0]?.id ?? 1
    } catch {}
    return 1
  })

  const [expandedLoadId, setExpandedLoadId] = useState<string | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [isAutoScanning, setIsAutoScanning] = useState(false)
  const autoScanRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Dashboard / national / recommended ───────────────────────────
  const [nationalLoads, setNationalLoads] = useState<NationalLoadItem[]>([])
  const [natEquipment, setNatEquipment] = useState('Vans (Standard)')
  const [natLoading, setNatLoading] = useState(false)
  const [recommendedLoads, setRecommendedLoads] = useState<DatLoad[]>([])
  const [recLoading, setRecLoading] = useState(false)

  // ── Trucks ────────────────────────────────────────────────────────
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [trucksLoading, setTrucksLoading] = useState(false)
  const [postedTrucks, setPostedTrucks] = useState<PostedTruck[]>([])

  // ── Post truck form ───────────────────────────────────────────────
  const [postOrigin, setPostOrigin] = useState('')
  const [postDest, setPostDest] = useState('')
  const [postEquip, setPostEquip] = useState('Dry Van')
  const [postDate, setPostDate] = useState('Today')
  const [postLoading, setPostLoading] = useState(false)
  const [postMessage, setPostMessage] = useState('')

  // ── My loads ──────────────────────────────────────────────────────
  const [bookedLoads, setBookedLoads] = useState<BookedLoad[]>([])
  const [loadCount, setLoadCount] = useState(0)
  const [revenue, setRevenue] = useState(0)
  const [loadsLoading, setLoadsLoading] = useState(false)

  // ── AI Call ───────────────────────────────────────────────────────
  const [callState, setCallState] = useState<CallState>({
    isOpen: false,
    conversation: [],
    status: 'Connecting...',
    isListening: false,
    isProcessing: false,
  })
  const [currentLoadData, setCurrentLoadData] = useState<CurrentLoadData | null>(null)
  const recognitionRef = useRef<any>(null)
  const finalTranscriptRef = useRef('')

  // ── Booked modal ──────────────────────────────────────────────────
  const [bookedModalOpen, setBookedModalOpen] = useState(false)
  const [scoreBadge, setScoreBadge] = useState('')

  // ── Doc modal ────────────────────────────────────────────────────
  const [docModalOpen, setDocModalOpen] = useState(false)
  const [docContent, setDocContent] = useState('')
  const [docLoading, setDocLoading] = useState(false)

  // ── Driver chat ───────────────────────────────────────────────────
  const [driverChat, setDriverChat] = useState<DriverChatState>({
    isOpen: false,
    driverName: '',
    phone: '',
    history: [],
    inputValue: '',
    isLoading: false,
  })

  // ═══════════════════════════════════════════════════════════════
  // Persist tabs to localStorage
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    try {
      localStorage.setItem('sim_searchTabs_tabs', JSON.stringify(searchTabs))
    } catch {}
  }, [searchTabs])

  useEffect(() => {
    try {
      localStorage.setItem('sim_searchTabs_active', String(activeTabId))
    } catch {}
  }, [activeTabId])

  // ═══════════════════════════════════════════════════════════════
  // Auto-login on mount
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const sid = localStorage.getItem('session_id') || ''
    const email = localStorage.getItem('studentEmail') || ''
    const name = localStorage.getItem('studentName') || ''
    if (sid && email) {
      sessionIdRef.current = sid
      setLoginEmail(email)
      setLoginName(name)
      setIsLoggedIn(true)
    }
  }, [])

  // Load dashboard data after login
  useEffect(() => {
    if (isLoggedIn && loginEmail) {
      loadDashboardData()
      loadNationalLoads(natEquipment)
      loadRecommendedLoads()
    }
  }, [isLoggedIn]) // eslint-disable-line

  // ═══════════════════════════════════════════════════════════════
  // Auth
  // ═══════════════════════════════════════════════════════════════
  const login = useCallback(async (email: string, name: string) => {
    setLoginLoading(true)
    setLoginError('')
    try {
      const data = await apiLogin(email, name)
      localStorage.setItem('session_id', data.session_id || '')
      localStorage.setItem('studentEmail', email)
      localStorage.setItem('studentName', name)
      sessionIdRef.current = data.session_id || ''
      setLoginEmail(email)
      setLoginName(name)
      setIsLoggedIn(true)
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Check credentials.')
    } finally {
      setLoginLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await apiLogout(sessionIdRef.current)
    localStorage.removeItem('session_id')
    localStorage.removeItem('studentEmail')
    localStorage.removeItem('studentName')
    sessionIdRef.current = ''
    setIsLoggedIn(false)
    setLoginEmail('')
    setLoginName('')
    setView('dashboard')
  }, [])

  // ═══════════════════════════════════════════════════════════════
  // Navigation
  // ═══════════════════════════════════════════════════════════════
  const navigate = useCallback((targetView: DatView) => {
    setView(targetView)
    setSidebarOpen(false)
    if (targetView === 'trucks') {
      loadTrucksData()
    } else if (targetView === 'loads') {
      loadMyLoadsData()
    } else if (targetView === 'post_truck') {
      loadPostedTrucksData()
    }
  }, []) // eslint-disable-line

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  // ═══════════════════════════════════════════════════════════════
  // Dashboard data
  // ═══════════════════════════════════════════════════════════════
  const loadDashboardData = useCallback(async () => {
    try {
      const data = await apiLoadDashboard(loginEmail, loginName)
      setCarriers(data.carriers || data.trucks || [])
      setBookedLoads(data.booked_loads || [])
      setLoadCount(data.load_count || 0)
      setRevenue(data.total_revenue || 0)
    } catch {}
  }, [loginEmail, loginName])

  const loadNationalLoads = useCallback(async (equipment: string) => {
    setNatLoading(true)
    try {
      const data = await apiNationalLoads(equipment, loginEmail, loginName)
      setNationalLoads(data.national_loads || [])
    } catch {} finally {
      setNatLoading(false)
    }
  }, [loginEmail, loginName])

  const changeNatEquipment = useCallback((equipment: string) => {
    setNatEquipment(equipment)
    loadNationalLoads(equipment)
  }, [loadNationalLoads])

  const loadRecommendedLoads = useCallback(async () => {
    setRecLoading(true)
    try {
      const data = await apiRecommendedLoads(loginEmail, loginName)
      setRecommendedLoads(data.loads || [])
    } catch {} finally {
      setRecLoading(false)
    }
  }, [loginEmail, loginName])

  const regenerateRecommendedLoads = useCallback(async () => {
    setRecLoading(true)
    try {
      const data = await apiGenerateRecommendedLoads(loginEmail, loginName)
      setRecommendedLoads(data.loads || [])
    } catch {} finally {
      setRecLoading(false)
    }
  }, [loginEmail, loginName])

  // ═══════════════════════════════════════════════════════════════
  // Trucks
  // ═══════════════════════════════════════════════════════════════
  const loadTrucksData = useCallback(async () => {
    setTrucksLoading(true)
    try {
      const data = await apiLoadDashboard(loginEmail, loginName)
      setCarriers(data.carriers || data.trucks || [])
    } catch {} finally {
      setTrucksLoading(false)
    }
  }, [loginEmail, loginName])

  const loadPostedTrucksData = useCallback(async () => {
    try {
      const data = await apiPostedTrucks(loginEmail)
      setPostedTrucks(data.trucks || [])
    } catch {}
  }, [loginEmail])

  const postTruckAction = useCallback(async () => {
    if (!postOrigin.trim() || !postDest.trim()) {
      setPostMessage('Please enter origin and destination.')
      return
    }
    setPostLoading(true)
    setPostMessage('')
    try {
      const data = await apiPostTruck({
        origin: postOrigin,
        destination: postDest,
        equipment: postEquip,
        date_available: postDate,
        email: loginEmail,
        name: loginName,
      })
      setPostMessage('Truck posted successfully!')
      setPostedTrucks(data.posted_trucks || [])
      setPostOrigin('')
      setPostDest('')
    } catch (err: any) {
      setPostMessage(err.message || 'Post failed.')
    } finally {
      setPostLoading(false)
    }
  }, [postOrigin, postDest, postEquip, postDate, loginEmail, loginName])

  // ═══════════════════════════════════════════════════════════════
  // My loads
  // ═══════════════════════════════════════════════════════════════
  const loadMyLoadsData = useCallback(async () => {
    setLoadsLoading(true)
    try {
      const data = await apiLoadDashboard(loginEmail, loginName)
      setBookedLoads(data.booked_loads || [])
      setLoadCount(data.load_count || 0)
      setRevenue(data.total_revenue || 0)
    } catch {} finally {
      setLoadsLoading(false)
    }
  }, [loginEmail, loginName])

  // ═══════════════════════════════════════════════════════════════
  // Search tabs
  // ═══════════════════════════════════════════════════════════════
  const activeTab = searchTabs.find(t => t.id === activeTabId) ?? searchTabs[0]

  const switchTab = useCallback((id: number) => {
    setActiveTabId(id)
    setExpandedLoadId(null)
  }, [])

  const addNewTab = useCallback(() => {
    const n = searchTabs.length + 1
    const newTab: SearchTab = {
      id: tabIdSeed++,
      title: `Search ${n}`,
      origin: '',
      dh_o: '50',
      destination: '',
      dh_d: '50',
      equipment: 'Dry Van',
      load_type: 'Both',
      length: 'Any',
      weight: 'Any',
      date_range: 'Today',
      hasSearched: false,
      results: [],
    }
    setSearchTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)
  }, [searchTabs.length])

  const closeTab = useCallback((id: number) => {
    setSearchTabs(prev => {
      if (prev.length === 1) return prev
      const next = prev.filter(t => t.id !== id)
      setActiveTabId(cur => {
        if (cur === id) return next[next.length - 1].id
        return cur
      })
      return next
    })
  }, [])

  const updateTabField = useCallback((field: keyof SearchTab, value: string) => {
    setSearchTabs(prev =>
      prev.map(t => t.id === activeTabId ? { ...t, [field]: value } : t)
    )
  }, [activeTabId])

  // ═══════════════════════════════════════════════════════════════
  // Search execution
  // ═══════════════════════════════════════════════════════════════
  const executeSearch = useCallback(async (tabId?: number) => {
    const tid = tabId ?? activeTabId
    const tab = searchTabs.find(t => t.id === tid)
    if (!tab) return
    setSearchLoading(true)
    setExpandedLoadId(null)
    try {
      const data = await apiSearchLoads({
        origin: tab.origin,
        dh_o: tab.dh_o,
        destination: tab.destination,
        dh_d: tab.dh_d,
        equipment: tab.equipment,
        load_type: tab.load_type,
        length: tab.length,
        weight: tab.weight,
        date_range: tab.date_range,
        email: loginEmail,
        name: loginName,
      })
      const loads = data.loads || []
      setSearchTabs(prev =>
        prev.map(t => t.id === tid ? { ...t, results: loads, hasSearched: true } : t)
      )
    } catch {} finally {
      setSearchLoading(false)
    }
  }, [activeTabId, searchTabs, loginEmail, loginName])

  const toggleAutoScan = useCallback(() => {
    if (isAutoScanning) {
      if (autoScanRef.current) clearInterval(autoScanRef.current)
      setIsAutoScanning(false)
    } else {
      setIsAutoScanning(true)
      executeSearch()
      autoScanRef.current = setInterval(() => executeSearch(), 5000)
    }
  }, [isAutoScanning, executeSearch])

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoScanRef.current) clearInterval(autoScanRef.current)
    }
  }, [])

  const toggleExpandedRow = useCallback((loadId: string) => {
    setExpandedLoadId(prev => prev === loadId ? null : loadId)
  }, [])

  // ═══════════════════════════════════════════════════════════════
  // AI Call broker
  // ═══════════════════════════════════════════════════════════════
  const openCallBroker = useCallback((load: DatLoad) => {
    const origin = `${load.origin?.city || ''}, ${load.origin?.state || ''}`
    const destination = `${load.destination?.city || ''}, ${load.destination?.state || ''}`
    const rate = load.rate || 0
    const distance = load.trip_miles || load.distance || 0
    const broker = load.broker?.company || load.broker?.name || 'Broker'
    const phone = load.broker?.phone || '555-0100'
    const loadId = load.load_id || load.reference_number || 'LOAD-001'

    const loadData: CurrentLoadData = {
      load_id: loadId,
      origin,
      destination,
      distance,
      rate,
      dh1: load.origin?.dh_o || 0,
      dh2: load.destination?.dh_d || 0,
      broker,
      phone,
      loadType: load.equipment?.load_type || 'Both',
      equipFull: `${load.equipment?.type || 'Dry Van'} - ${load.equipment?.length || '53ft'} / ${load.equipment?.weight || '45,000 lbs'}`,
      length: load.equipment?.length || '53ft',
      weight: load.equipment?.weight || '45,000 lbs',
      pickupDate: load.pickup_date || 'Today',
      companyLocation: load.broker?.location || 'USA',
    }

    // If in iframe / child window, open in parent via postMessage
    if (window.opener) {
      const channel = new BroadcastChannel('dat-call-channel')
      channel.postMessage({ type: 'OPEN_CALL', loadData })
      channel.close()
      window.location.href = '/'
      return
    }

    setCurrentLoadData(loadData)
    setCallState({
      isOpen: true,
      conversation: [],
      status: 'Connecting...',
      isListening: false,
      isProcessing: false,
    })

    // Initial broker greeting via API
    setTimeout(async () => {
      try {
        const data = await apiNegotiateCall({
          session_id: sessionIdRef.current,
          load_id: loadId,
          origin,
          destination,
          distance,
          rate,
          dh1: loadData.dh1,
          dh2: loadData.dh2,
          broker_name: broker,
          broker_phone: phone,
          load_type: loadData.loadType,
          equip_full: loadData.equipFull,
          length: loadData.length,
          weight: loadData.weight,
          pickup_date: loadData.pickupDate,
          company_location: loadData.companyLocation,
          conversation: [],
          user_message: '__INIT__',
          student_email: loginEmail,
          student_name: loginName,
        })
        addCallMessage(data.broker_message, 'broker')
        speakText(data.broker_message)
        setCallState(prev => ({ ...prev, status: 'On Call' }))
      } catch {
        setCallState(prev => ({ ...prev, status: 'Connected' }))
      }
    }, 800)
  }, [loginEmail, loginName])

  const addCallMessage = useCallback((content: string, role: 'user' | 'broker') => {
    setCallState(prev => ({
      ...prev,
      conversation: [...prev.conversation, { role, content }],
    }))
  }, [])

  const sendCallMessage = useCallback(async (message: string) => {
    if (!currentLoadData || !message.trim()) return
    const normalized = normalizeSpokenNumbers(message)
    setCallState(prev => ({
      ...prev,
      isProcessing: true,
      conversation: [...prev.conversation, { role: 'user', content: normalized }],
    }))
    try {
      const data = await apiNegotiateCall({
        session_id: sessionIdRef.current,
        load_id: currentLoadData.load_id || 'LOAD-001',
        origin: currentLoadData.origin,
        destination: currentLoadData.destination,
        distance: currentLoadData.distance,
        rate: currentLoadData.rate,
        dh1: currentLoadData.dh1,
        dh2: currentLoadData.dh2,
        broker_name: currentLoadData.broker,
        broker_phone: currentLoadData.phone,
        load_type: currentLoadData.loadType,
        equip_full: currentLoadData.equipFull,
        length: currentLoadData.length,
        weight: currentLoadData.weight,
        pickup_date: currentLoadData.pickupDate,
        company_location: currentLoadData.companyLocation,
        conversation: callState.conversation.map(m => ({ role: m.role, content: m.content })),
        user_message: normalized,
        student_email: loginEmail,
        student_name: loginName,
      })
      setCallState(prev => ({
        ...prev,
        isProcessing: false,
        conversation: [...prev.conversation, { role: 'broker', content: data.broker_message }],
      }))
      speakText(data.broker_message)
      if (data.call_ended) {
        setCallState(prev => ({ ...prev, status: 'Call Ended', isListening: false }))
        if (recognitionRef.current) {
          try { recognitionRef.current.stop() } catch {}
        }
        if (data.booked) {
          setScoreBadge(data.score_badge || '⭐ Good')
          setTimeout(() => {
            setCallState(prev => ({ ...prev, isOpen: false }))
            setBookedModalOpen(true)
          }, 1500)
        }
      }
    } catch {
      setCallState(prev => ({ ...prev, isProcessing: false }))
    }
  }, [currentLoadData, callState.conversation, loginEmail, loginName])

  const closeCallModal = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
    }
    speechSynthesis.cancel()
    setCallState({ isOpen: false, conversation: [], status: 'Connecting...', isListening: false, isProcessing: false })
    setCurrentLoadData(null)
  }, [])

  const toggleVoiceRecognition = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      alert('Speech Recognition not supported in this browser. Use Chrome.')
      return
    }
    if (callState.isListening) {
      recognitionRef.current?.stop()
      setCallState(prev => ({ ...prev, isListening: false }))
      return
    }
    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.onresult = (event: any) => {
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript + ' '
      }
      finalTranscriptRef.current += final
    }
    rec.onend = () => {
      const text = finalTranscriptRef.current.trim()
      finalTranscriptRef.current = ''
      setCallState(prev => ({ ...prev, isListening: false }))
      if (text) sendCallMessage(text)
    }
    rec.onerror = () => {
      setCallState(prev => ({ ...prev, isListening: false }))
    }
    recognitionRef.current = rec
    rec.start()
    setCallState(prev => ({ ...prev, isListening: true }))
  }, [callState.isListening, sendCallMessage])

  // ═══════════════════════════════════════════════════════════════
  // Email broker (gmail sim)
  // ═══════════════════════════════════════════════════════════════
  const openEmailBroker = useCallback((load: DatLoad) => {
    localStorage.setItem('gmail_load_origin', `${load.origin?.city || ''}, ${load.origin?.state || ''}`)
    localStorage.setItem('gmail_load_destination', `${load.destination?.city || ''}, ${load.destination?.state || ''}`)
    localStorage.setItem('gmail_load_rate', String(load.rate || 0))
    localStorage.setItem('gmail_broker_name', load.broker?.name || 'Broker')
    localStorage.setItem('gmail_broker_company', load.broker?.company || '')
    window.open('/gmail-simulator', '_blank', 'width=1200,height=800')
  }, [])

  // ═══════════════════════════════════════════════════════════════
  // Document generation
  // ═══════════════════════════════════════════════════════════════
  const generateAndShowDoc = useCallback(async (docType: string) => {
    if (!currentLoadData && !bookedLoads[0]) return
    setDocLoading(true)
    setDocModalOpen(true)
    const load = currentLoadData
    try {
      const data = await apiGenerateDoc({
        doc_type: docType,
        load_details: load as unknown as Record<string, unknown> ?? {},
        rate: load?.rate ?? 0,
        student_email: loginEmail,
        student_name: loginName,
      })
      setDocContent(data.html)
    } catch {
      setDocContent('<p>Document generation failed. Please try again.</p>')
    } finally {
      setDocLoading(false)
    }
  }, [currentLoadData, bookedLoads, loginEmail, loginName])

  const closeDoc = useCallback(() => {
    setDocModalOpen(false)
    setDocContent('')
  }, [])

  // ═══════════════════════════════════════════════════════════════
  // Driver chat
  // ═══════════════════════════════════════════════════════════════
  const openDriverChat = useCallback((carrier: Carrier) => {
    setDriverChat({
      isOpen: true,
      driverName: carrier.driver || carrier.name || 'Driver',
      phone: carrier.phone || '',
      history: [],
      inputValue: '',
      isLoading: false,
    })
  }, [])

  const closeDriverChat = useCallback(() => {
    setDriverChat(prev => ({ ...prev, isOpen: false }))
  }, [])

  const setDriverChatInput = useCallback((value: string) => {
    setDriverChat(prev => ({ ...prev, inputValue: value }))
  }, [])

  const sendDriverChatMessage = useCallback(async () => {
    const text = driverChat.inputValue.trim()
    if (!text) return
    const newHistory: DriverChatMessage[] = [...driverChat.history, { role: 'user', content: text }]
    setDriverChat(prev => ({ ...prev, history: newHistory, inputValue: '', isLoading: true }))
    try {
      const data = await apiDriverChat({
        driver_name: driverChat.driverName,
        message: text,
        history: newHistory.map(m => ({ role: m.role, content: m.content })),
        student_email: loginEmail,
        student_name: loginName,
      })
      setDriverChat(prev => ({
        ...prev,
        history: [...prev.history, { role: 'assistant', content: data.reply }],
        isLoading: false,
      }))
    } catch {
      setDriverChat(prev => ({
        ...prev,
        history: [...prev.history, { role: 'assistant', content: 'Communication error. Try again.' }],
        isLoading: false,
      }))
    }
  }, [driverChat, loginEmail, loginName])

  // ═══════════════════════════════════════════════════════════════
  // Booked modal
  // ═══════════════════════════════════════════════════════════════
  const closeBookedModal = useCallback(() => setBookedModalOpen(false), [])

  const openDocFromBooked = useCallback((docType: string) => {
    setBookedModalOpen(false)
    generateAndShowDoc(docType)
  }, [generateAndShowDoc])

  // ═══════════════════════════════════════════════════════════════
  // BroadcastChannel listener (for call opened from search iframe)
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (typeof window === 'undefined') return
    const channel = new BroadcastChannel('dat-call-channel')
    channel.onmessage = (e) => {
      if (e.data?.type === 'OPEN_CALL' && e.data.loadData) {
        setCurrentLoadData(e.data.loadData)
        setCallState({
          isOpen: true,
          conversation: [],
          status: 'Connecting...',
          isListening: false,
          isProcessing: false,
        })
      }
    }
    return () => channel.close()
  }, [])

  return {
    // auth
    isLoggedIn,
    loginEmail, setLoginEmail,
    loginName, setLoginName,
    loginLoading, loginError,
    login, logout,

    // navigation
    view, navigate,
    sidebarOpen, toggleSidebar, closeSidebar,

    // search tabs
    searchTabs, activeTabId, activeTab,
    switchTab, addNewTab, closeTab, updateTabField,
    expandedLoadId, toggleExpandedRow,
    searchLoading, isAutoScanning,
    executeSearch, toggleAutoScan,

    // dashboard
    nationalLoads, natEquipment, natLoading,
    changeNatEquipment, loadNationalLoads,
    recommendedLoads, recLoading,
    loadRecommendedLoads, regenerateRecommendedLoads,

    // trucks
    carriers, trucksLoading,
    postedTrucks,
    loadTrucksData, loadPostedTrucksData,
    postOrigin, setPostOrigin,
    postDest, setPostDest,
    postEquip, setPostEquip,
    postDate, setPostDate,
    postLoading, postMessage,
    postTruckAction,

    // my loads
    bookedLoads, loadCount, revenue, loadsLoading,

    // AI call
    callState, currentLoadData,
    openCallBroker, closeCallModal,
    sendCallMessage, toggleVoiceRecognition,

    // email broker
    openEmailBroker,

    // doc
    docModalOpen, docContent, docLoading,
    generateAndShowDoc, closeDoc,

    // booked
    bookedModalOpen, scoreBadge,
    closeBookedModal, openDocFromBooked,

    // driver chat
    driverChat,
    openDriverChat, closeDriverChat,
    setDriverChatInput, sendDriverChatMessage,
  }
}

function speakText(text: string) {
  if (typeof window === 'undefined') return
  speechSynthesis.cancel()
  const cleaned = text.replace(/\*\*|_{1,2}|\*/g, '').trim()
  const utt = new SpeechSynthesisUtterance(cleaned)
  utt.rate = 1.1
  utt.pitch = 0.95
  const voices = speechSynthesis.getVoices()
  const preferred = voices.find(v => /Google US English|Samantha|Alex|Microsoft David/.test(v.name))
  if (preferred) utt.voice = preferred
  speechSynthesis.speak(utt)
}

function normalizeSpokenNumbers(text: string): string {
  const map: Record<string, string> = {
    'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
    'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
    'ten': '10', 'eleven': '11', 'twelve': '12', 'thirteen': '13',
    'fourteen': '14', 'fifteen': '15', 'sixteen': '16', 'seventeen': '17',
    'eighteen': '18', 'nineteen': '19', 'twenty': '20', 'thirty': '30',
    'forty': '40', 'fifty': '50', 'sixty': '60', 'seventy': '70',
    'eighty': '80', 'ninety': '90', 'hundred': '100', 'thousand': '000',
  }
  let result = text.toLowerCase()
  Object.entries(map).forEach(([word, num]) => {
    result = result.replace(new RegExp(`\\b${word}\\b`, 'g'), num)
  })
  return result
}
