'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import type {
  AcademyView,
  CockpitMetrics,
  ChallengeSession,
  StudentProfile,
  Challenge,
  DailyChallenge,
  LeaderboardUser,
  RecentAttempt,
  CockpitState,
  DebriefState,
} from '@/lib/types/challenges'
import {
  apiFetchChallenges,
  apiStartChallenge,
  apiAnswerChallenge,
  apiCompleteChallenge,
  apiFetchProfile,
  apiFetchLeaderboard,
  apiFetchAnalytics,
  apiFetchDailyChallenge,
  apiGenerateDailyChallenge,
} from '@/lib/api/challenges'

const DEFAULT_METRICS: CockpitMetrics = {
  confidence: 5,
  negotiation: 5,
  professionalism: 5,
  communication: 5,
  decision_making: 5,
  problem_solving: 5,
  dispatcher_accuracy: 5,
}

const DEFAULT_PROFILE: StudentProfile = {
  name: 'Guest',
  email: 'guest@dispatcheracademy.com',
  xp: 0,
  rank: 'Rookie Dispatcher',
  streak: 0,
  badges: [],
  completed_challenges: {},
}

const BADGE_DEFS = [
  { id: 'first_call', name: 'First Contact', desc: 'Connected your first dispatcher call simulation.', icon: '📞' },
  { id: 'negotiation_expert', name: 'Tough Negotiator', desc: 'Negotiation metrics of 8.5+ with an aggressive broker.', icon: '💼' },
  { id: 'streak_five', name: 'Dedicated Dispatcher', desc: 'Maintained a 5-day streak of daily practice.', icon: '🔥' },
  { id: 'perfect_score', name: 'Logistics Virtuoso', desc: 'Scored a near perfect 9.5+ rating in a high-pressure scenario.', icon: '🏆' },
]

export function useChallenges() {
  const [view, setView] = useState<AcademyView>('dashboard')
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_PROFILE)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [profileSetupName, setProfileSetupName] = useState('Ace Dispatcher')
  const [profileSetupEmail, setProfileSetupEmail] = useState('student@b2b.com')

  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [challengesLoading, setChallengesLoading] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null)
  const [dailyLoading, setDailyLoading] = useState(false)

  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [briefingOpen, setBriefingOpen] = useState(false)

  const [cockpit, setCockpit] = useState<CockpitState>({
    isOpen: false,
    callerName: 'AI Character',
    roleLabel: 'Connecting...',
    emotionState: 'Listening',
    personality: '',
    scenario: '',
    transcript: 'Connecting line... Please prepare.',
    turnNumber: 0,
    metrics: DEFAULT_METRICS,
    suggestions: ['Always justify your rates using operating costs (fuel, deadhead, lane demand).'],
    isRecording: false,
    isTtsMuted: false,
    isProcessing: false,
  })

  const [debrief, setDebrief] = useState<DebriefState>({ isOpen: false, debrief: null, rewards: null })

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [heatmap, setHeatmap] = useState<Record<string, number>>({})
  const [recentActivity, setRecentActivity] = useState<RecentAttempt[]>([])

  const sessionRef = useRef<ChallengeSession>({
    sessionId: null,
    challengeId: null,
    studentName: 'Guest',
    studentEmail: 'guest@dispatcheracademy.com',
    turnNumber: 0,
    history: [],
    currentMetrics: DEFAULT_METRICS,
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // — Auth / Profile init —
  useEffect(() => {
    const savedEmail =
      localStorage.getItem('academy_email') ||
      localStorage.getItem('sim_academy_email') ||
      localStorage.getItem('studentEmail')
    const savedName =
      localStorage.getItem('academy_name') ||
      localStorage.getItem('sim_academy_name') ||
      localStorage.getItem('studentName')

    if (savedEmail && savedName) {
      localStorage.setItem('academy_email', savedEmail)
      localStorage.setItem('academy_name', savedName)
      sessionRef.current.studentEmail = savedEmail
      sessionRef.current.studentName = savedName
      setProfile(p => ({ ...p, email: savedEmail, name: savedName }))
      refreshHub(savedEmail, savedName)
    } else {
      setTimeout(() => setShowProfileSetup(true), 1000)
    }
  }, [])

  // — Setup SpeechRecognition on mount —
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR: any =
      typeof window !== 'undefined'
        ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null)
        : null
    if (!SR) return
    const rec = new SR()
    rec.continuous = false
    rec.interimResults = true
    rec.lang = 'en-US'

    rec.onresult = (event: any) => {
      let finalT = ''
      let interimT = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalT += event.results[i][0].transcript
        } else {
          interimT += event.results[i][0].transcript
        }
      }
      const live = finalT || interimT
      setCockpit(c => ({ ...c, transcript: `Dispatcher: "${live}"` }))
    }

    rec.onend = () => {
      if (sessionRef.current.sessionId && cockpit.isRecording) {
        stopAndSubmit()
      }
    }
    recognitionRef.current = rec
  }, [])

  function refreshHub(email: string, name: string) {
    loadProfile(email, name)
    loadChallenges(email)
    setTimeout(() => {
      loadDaily()
      loadLeaderboard(email)
    }, 300)
  }

  async function loadProfile(email: string, name: string) {
    try {
      const data = await apiFetchProfile(email, name)
      if (data.profile) {
        setProfile(data.profile)
        sessionRef.current.studentEmail = data.profile.email
        sessionRef.current.studentName = data.profile.name
      }
      if (data.attempts) setRecentActivity(data.attempts.slice(0, 3))
    } catch (e) {
      console.error('[Academy] Profile load failed:', e)
    }
  }

  async function loadChallenges(email: string) {
    setChallengesLoading(true)
    try {
      const list = await apiFetchChallenges(email)
      const seen = new Set<string>()
      const deduped = list.filter((ch: Challenge) => {
        if (seen.has(ch.challenge_id)) return false
        seen.add(ch.challenge_id)
        return true
      })
      setChallenges(deduped)
    } catch (e) {
      console.error('[Academy] Challenges load failed:', e)
    } finally {
      setChallengesLoading(false)
    }
  }

  async function loadDaily() {
    setDailyLoading(true)
    try {
      const daily = await apiFetchDailyChallenge()
      setDailyChallenge(daily)
    } catch (e) {
      console.error('[Academy] Daily challenge load failed:', e)
    } finally {
      setDailyLoading(false)
    }
  }

  async function loadLeaderboard(email: string) {
    try {
      const users = await apiFetchLeaderboard()
      setLeaderboard(users)
    } catch (e) {
      console.error('[Academy] Leaderboard load failed:', e)
    }
    try {
      const data = await apiFetchAnalytics(email)
      if (data.student_heatmap) setHeatmap(data.student_heatmap)
    } catch (e) {
      console.error('[Academy] Analytics load failed:', e)
    }
  }

  // — Profile setup save —
  function saveProfile() {
    const name = profileSetupName.trim() || 'Ace Dispatcher'
    const email = profileSetupEmail.trim() || 'student@b2b.com'
    localStorage.setItem('academy_email', email)
    localStorage.setItem('academy_name', name)
    sessionRef.current.studentEmail = email
    sessionRef.current.studentName = name
    setProfile(p => ({ ...p, name, email }))
    setShowProfileSetup(false)
    refreshHub(email, name)
  }

  // — Nav —
  function switchView(v: AcademyView) {
    setView(v)
    if (v === 'leaderboard') {
      loadLeaderboard(sessionRef.current.studentEmail)
    }
  }

  // — Daily challenge regenerate —
  async function generateNewDaily() {
    setDailyLoading(true)
    try {
      await apiGenerateDailyChallenge()
      await loadDaily()
    } catch (e) {
      console.error('[Academy] Generate daily failed:', e)
    } finally {
      setDailyLoading(false)
    }
  }

  // — Briefing modal —
  function openBriefing(challengeId: string) {
    const ch = challenges.find(c => c.challenge_id === challengeId)
    if (!ch) return
    setSelectedChallenge(ch)
    setBriefingOpen(true)
  }
  function closeBriefing() {
    setBriefingOpen(false)
    setSelectedChallenge(null)
  }

  // — Start challenge call —
  async function startChallenge(challengeId: string) {
    closeBriefing()
    setCockpit(c => ({
      ...c,
      isOpen: true,
      transcript: 'Connecting line... Please prepare.',
      callerName: 'AI Character',
      roleLabel: 'Connecting...',
      emotionState: 'Connecting',
      turnNumber: 0,
      isProcessing: false,
      isRecording: false,
    }))

    const { studentName, studentEmail } = sessionRef.current
    try {
      const data = await apiStartChallenge(challengeId, studentName, studentEmail)
      sessionRef.current.sessionId = data.session_id
      sessionRef.current.challengeId = challengeId
      sessionRef.current.turnNumber = 0
      sessionRef.current.history = []

      setCockpit(c => ({
        ...c,
        callerName: data.character_name || 'AI Character',
        roleLabel: `Active ${data.character_role || 'Broker'}`,
        emotionState: 'Responding',
        personality: data.character_personality || '',
        scenario: data.scenario || '',
      }))

      speakAI(data.opening_line || 'Hello, this is your practice scenario.')
    } catch (e) {
      console.error(e)
      alert('Server connection failed during simulation bootstrap.')
      exitCockpit()
    }
  }

  function exitCockpit() {
    stopSpeechAndRecording()
    setCockpit(c => ({ ...c, isOpen: false }))
    sessionRef.current.sessionId = null
  }

  // — Microphone toggle —
  async function toggleMicrophone() {
    if (cockpit.isRecording) {
      stopAndSubmit()
    } else {
      audioChunksRef.current = []
      setCockpit(c => ({ ...c, isRecording: true, transcript: 'Connecting microphone...' }))

      if (recognitionRef.current) {
        try { recognitionRef.current.start() } catch (_) {}
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        let rec: MediaRecorder
        try {
          rec = new MediaRecorder(stream, { mimeType: 'audio/webm' })
        } catch {
          rec = new MediaRecorder(stream)
        }
        rec.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
        rec.onstop = () => stream.getTracks().forEach(t => t.stop())
        rec.start(250)
        mediaRecorderRef.current = rec
      } catch (err) {
        console.error('[Audio] Microphone failed:', err)
        stopAndSubmit()
      }
    }
  }

  function stopAndSubmit() {
    setCockpit(c => ({ ...c, isRecording: false }))
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (_) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    submitResponse()
  }

  function submitTextResponse(text: string) {
    setCockpit(c => ({ ...c, transcript: `Dispatcher: "${text}"` }))
    sendResponse(text, null)
  }

  function submitResponse() {
    const text = cockpit.transcript.replace(/^Dispatcher: "/, '').replace(/"$/, '')
    const blob =
      audioChunksRef.current.length > 0
        ? new Blob(audioChunksRef.current, { type: 'audio/webm' })
        : null
    audioChunksRef.current = []

    if (!text.trim() && !blob) {
      setCockpit(c => ({ ...c, transcript: 'No speech detected. Click Speak and try again!' }))
      return
    }

    sendResponse(text, blob)
  }

  async function sendResponse(text: string, audioBlob: Blob | null) {
    const sess = sessionRef.current
    if (!sess.sessionId) return

    sess.turnNumber += 1
    setCockpit(c => ({
      ...c,
      emotionState: 'Analyzing',
      isProcessing: true,
      turnNumber: sess.turnNumber,
    }))

    try {
      const data = await apiAnswerChallenge(sess.sessionId, text, audioBlob)

      if (data.user_transcribed) {
        setCockpit(c => ({ ...c, transcript: `Dispatcher: "${data.user_transcribed}"` }))
      }

      if (data.metrics) {
        sess.currentMetrics = data.metrics
        setCockpit(c => ({ ...c, metrics: data.metrics }))
      }

      if (data.suggestions) {
        setCockpit(c => ({ ...c, suggestions: data.suggestions }))
      }

      setCockpit(c => ({ ...c, emotionState: data.status || 'Responding', isProcessing: false }))

      sess.history.push({ q: data.next_question || '', a: data.user_transcribed || text })

      if (data.concluded) {
        setTimeout(() => completeChallenge(data.success), 2000)
      } else {
        speakAI(data.next_question || '')
      }
    } catch (e) {
      console.error(e)
      setCockpit(c => ({
        ...c,
        transcript: 'Network timeout. Check backend service.',
        isProcessing: false,
      }))
    }
  }

  async function completeChallenge(_isSuccess: boolean) {
    stopSpeechAndRecording()
    setCockpit(c => ({ ...c, transcript: 'Finalizing logistics assessment...' }))
    const sess = sessionRef.current

    try {
      const data = await apiCompleteChallenge(sess.sessionId!, sess.currentMetrics as unknown as Record<string, unknown>)
      exitCockpit()
      setDebrief({ isOpen: true, debrief: data.debrief, rewards: data.rewards })
    } catch (e) {
      console.error(e)
      alert('Server failed to compile final challenge reports.')
      exitCockpit()
    }
  }

  function declineCall() {
    if (confirm('Decline this call? This will end the active negotiation and evaluate your performance up to this turn.')) {
      completeChallenge(false)
    }
  }

  function toggleTtsMute() {
    const muted = !cockpit.isTtsMuted
    setCockpit(c => ({ ...c, isTtsMuted: muted }))
    if (muted && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    if (audioRef.current && muted) {
      audioRef.current.pause()
    }
  }

  function stopSpeechAndRecording() {
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel()
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (_) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop() } catch (_) {}
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
    setCockpit(c => ({ ...c, isRecording: false }))
  }

  function speakAI(text: string) {
    if (!text || cockpit.isTtsMuted) return

    setCockpit(c => ({
      ...c,
      transcript: `AI: "${text}"`,
      emotionState: 'Responding',
      isProcessing: true,
    }))

    const preferredName = localStorage.getItem('preferred_voice_name') || 'GoogleTranslateCloud_US'

    if (preferredName.startsWith('GoogleTranslateCloud')) {
      let lang = 'en-US'
      if (preferredName.includes('GB')) lang = 'en-GB'
      else if (preferredName.includes('CA')) lang = 'en-CA'
      else if (preferredName.includes('AU')) lang = 'en-AU'
      else if (preferredName.includes('IN')) lang = 'en-IN'
      playCloudTTS(text, lang)
    } else {
      playLocalTTS(text)
    }
  }

  function playCloudTTS(text: string, lang: string) {
    const sentences = text.match(/[^.!?]+[.!?]*|[^.!?]+/g) || [text]
    const chunks: string[] = []
    sentences.forEach(s => {
      let clean = s.trim()
      while (clean.length > 150) {
        let idx = clean.lastIndexOf(' ', 150)
        if (idx === -1) idx = 150
        chunks.push(clean.slice(0, idx).trim())
        clean = clean.slice(idx).trim()
      }
      if (clean) chunks.push(clean)
    })
    if (chunks.length === 0) { onTTSEnd(); return }

    let idx = 0
    const audio = audioRef.current || new Audio()
    if (!audioRef.current) audioRef.current = audio

    const playNext = () => {
      if (idx >= chunks.length) { onTTSEnd(); return }
      audio.src = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(chunks[idx])}`
      audio.onended = () => { idx++; playNext() }
      audio.onerror = () => playLocalTTS(text)
      audio.play().catch(() => playLocalTTS(text))
    }
    playNext()
  }

  function playLocalTTS(text: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis) { onTTSEnd(); return }
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    const preferredSpeed = parseFloat(localStorage.getItem('preferred_voice_speed') || '1.05')
    utterance.rate = preferredSpeed

    utterance.onend = onTTSEnd
    utterance.onerror = onTTSEnd

    const voices = window.speechSynthesis.getVoices()
    const preferredName = localStorage.getItem('preferred_voice_name')
    let voice: SpeechSynthesisVoice | undefined

    if (preferredName) voice = voices.find(v => v.name === preferredName)
    if (!voice) {
      voice = voices.find(
        v =>
          v.lang &&
          v.name &&
          (v.name.toLowerCase().includes('natural') ||
            v.name.toLowerCase().includes('google') ||
            v.name.toLowerCase().includes('online') ||
            v.name.toLowerCase().includes('siri') ||
            v.name.toLowerCase().includes('samantha')) &&
          (v.lang.startsWith('en-US') || v.lang.startsWith('en-CA'))
      ) ||
        voices.find(v => v.lang && v.lang.startsWith('en-US')) ||
        voices.find(v => v.lang && v.lang.startsWith('en'))
    }
    if (voice) utterance.voice = voice
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  function onTTSEnd() {
    setCockpit(c => ({ ...c, emotionState: 'Listening', isProcessing: false }))
  }

  // — Debrief actions —
  function replayChallenge() {
    setDebrief({ isOpen: false, debrief: null, rewards: null })
    if (sessionRef.current.challengeId) {
      startChallenge(sessionRef.current.challengeId)
    }
  }

  function closeDebrief() {
    setDebrief({ isOpen: false, debrief: null, rewards: null })
    refreshHub(sessionRef.current.studentEmail, sessionRef.current.studentName)
  }

  return {
    // nav
    view,
    switchView,

    // profile
    profile,
    showProfileSetup,
    profileSetupName,
    profileSetupEmail,
    setProfileSetupName,
    setProfileSetupEmail,
    saveProfile,

    // challenges
    challenges,
    challengesLoading,
    categoryFilter,
    setCategoryFilter,

    // daily
    dailyChallenge,
    dailyLoading,
    generateNewDaily,

    // briefing
    selectedChallenge,
    briefingOpen,
    openBriefing,
    closeBriefing,

    // cockpit
    cockpit,
    audioRef,
    startChallenge,
    exitCockpit,
    toggleMicrophone,
    submitTextResponse,
    declineCall,
    toggleTtsMute,

    // debrief
    debrief,
    replayChallenge,
    closeDebrief,

    // leaderboard
    leaderboard,
    heatmap,
    BADGE_DEFS,

    // activity
    recentActivity,

    // helpers
    refreshHub,
  }
}
