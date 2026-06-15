'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import type { PracticeCallMessage, BatchSession } from '@/lib/types/challenges'
import {
  apiStartPractice,
  apiAnswerPractice,
  apiNegotiateBrokerCall,
  apiFetchActiveSessions,
} from '@/lib/api/practice'

export interface SimCall {
  history: Array<{ q: string; a: string }>
  turnCount: number
}

export function usePracticeCall() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isSessionEnded, setIsSessionEnded] = useState(false)
  const [messages, setMessages] = useState<PracticeCallMessage[]>([])
  const [msgCounter, setMsgCounter] = useState(0)

  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [timerDisplay, setTimerDisplay] = useState('00:00')
  const [timerActive, setTimerActive] = useState(false)

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loaderMessage, setLoaderMessage] = useState('Processing...')

  const [isMuted, setIsMuted] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [selectedVoiceName, setSelectedVoiceName] = useState('')
  const [speechSpeed, setSpeechSpeed] = useState(1.0)
  const [voiceOptions, setVoiceOptions] = useState<{ value: string; label: string }[]>([])

  const [techModalOpen, setTechModalOpen] = useState(false)
  const [sessions, setSessions] = useState<BatchSession[]>([])
  const [selectedBatch, setSelectedBatch] = useState('Practice')
  const [studentName, setStudentName] = useState('')
  const [studentEmail, setStudentEmail] = useState('practice@b2bpractice.com')
  const [studentMobile, setStudentMobile] = useState('9999999999')
  const [studentCollege, setStudentCollege] = useState('')
  const [studentCourse, setStudentCourse] = useState('')
  const [studentSemester, setStudentSemester] = useState('')
  const [showPoolExtras, setShowPoolExtras] = useState(false)

  const [finalReport, setFinalReport] = useState<{ message: string } | null>(null)

  // Broker practice mode
  const [isBrokerMode, setIsBrokerMode] = useState(false)
  const [activeBrokerLoad, setActiveBrokerLoad] = useState<Record<string, unknown> | null>(null)
  const simCallRef = useRef<SimCall>({ history: [], turnCount: 0 })

  const mediaStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)
  const transcriptBufferRef = useRef('')
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recordingStartRef = useRef(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const sessionIdRef = useRef<string | null>(null)

  // Keep sessionIdRef in sync
  useEffect(() => { sessionIdRef.current = sessionId }, [sessionId])

  // Init on mount
  useEffect(() => {
    const saved = localStorage.getItem('preferred_voice_name') || ''
    const savedSpeed = parseFloat(localStorage.getItem('preferred_voice_speed') || '1.0')
    setSelectedVoiceName(saved)
    setSpeechSpeed(savedSpeed)

    initCamera()
    loadSessions()

    // Check for broker call redirect from localStorage
    const stored = localStorage.getItem('active_broker_call_load')
    if (stored) {
      try {
        const load = JSON.parse(stored) as Record<string, unknown>
        localStorage.removeItem('active_broker_call_load')
        setActiveBrokerLoad(load)
        setIsBrokerMode(true)
        simCallRef.current = { history: [], turnCount: 0 }
      } catch (_) {}
    }

    // Load voices for settings panel
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => buildVoiceOptions()
      window.speechSynthesis.onvoiceschanged = loadVoices
      buildVoiceOptions()
    }

    return () => {
      stopTimer()
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop())
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch (_) {}
      }
    }
  }, [])

  function buildVoiceOptions() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const voices = window.speechSynthesis.getVoices()
    const englishVoices = voices.filter(v => v.lang?.toLowerCase().startsWith('en'))

    englishVoices.sort((a, b) => {
      const aP = ['natural', 'online', 'google', 'neural', 'samantha', 'siri'].some(k => a.name.toLowerCase().includes(k))
      const bP = ['natural', 'online', 'google', 'neural', 'samantha', 'siri'].some(k => b.name.toLowerCase().includes(k))
      if (aP && !bP) return -1
      if (!aP && bP) return 1
      const aUS = a.lang.toLowerCase().startsWith('en-us')
      const bUS = b.lang.toLowerCase().startsWith('en-us')
      if (aUS && !bUS) return -1
      if (!aUS && bUS) return 1
      return a.name.localeCompare(b.name)
    })

    const cloudVoices = [
      { value: 'GoogleTranslateCloud_US', label: '🇺🇸 ✨ Premium Cloud - US Accent' },
      { value: 'GoogleTranslateCloud_GB', label: '🇬🇧 ✨ Premium Cloud - UK Accent' },
      { value: 'GoogleTranslateCloud_CA', label: '🇨🇦 ✨ Premium Cloud - Canadian Accent' },
      { value: 'GoogleTranslateCloud_AU', label: '🇦🇺 ✨ Premium Cloud - Aussie Accent' },
      { value: 'GoogleTranslateCloud_IN', label: '🇮🇳 ✨ Premium Cloud - Indian Accent' },
    ]

    const localVoices = englishVoices.map(v => {
      const isPremium = ['natural', 'online', 'google', 'neural', 'samantha', 'siri'].some(k =>
        v.name.toLowerCase().includes(k)
      )
      let prefix = '🌐'
      if (v.lang.toLowerCase().startsWith('en-us')) prefix = '🇺🇸'
      else if (v.lang.toLowerCase().startsWith('en-gb')) prefix = '🇬🇧'
      else if (v.lang.toLowerCase().startsWith('en-ca')) prefix = '🇨🇦'
      else if (v.lang.toLowerCase().startsWith('en-au')) prefix = '🇦🇺'
      else if (v.lang.toLowerCase().startsWith('en-in')) prefix = '🇮🇳'
      const quality = isPremium ? '✨ Premium Local' : 'Standard (Robotic)'
      const clean = v.name.replace(/Microsoft|Google|Desktop|Natural|Online|Voice/g, '').replace(/\s+/g, ' ').trim()
      return { value: v.name, label: `${prefix} ${quality} - ${clean}` }
    })

    setVoiceOptions([...cloudVoices, ...localVoices])

    if (!selectedVoiceName && cloudVoices.length > 0) {
      const defaultVoice = cloudVoices[0].value
      setSelectedVoiceName(defaultVoice)
      localStorage.setItem('preferred_voice_name', defaultVoice)
    }
  }

  async function initCamera() {
    try {
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err) {
      addMsg('System: Microphone unavailable. Please ensure permissions are granted.', 'system')
    }
  }

  async function loadSessions() {
    try {
      const batches = await apiFetchActiveSessions()
      const list = Array.isArray(batches) ? batches : []
      setSessions(list)
    } catch (_) {}
  }

  function addMsg(text: string, type: 'system' | 'me' | 'bot', isHtml = false) {
    if (!text) return
    setMsgCounter(n => n + 1)
    setMessages(msgs => [...msgs, { id: msgCounter + 1, type, text, isHtml }])
  }

  function showLoader(msg: string) {
    if (msg === 'Dispatcher is thinking...') return
    setLoaderMessage(msg)
    setIsLoading(true)
  }

  function hideLoader() {
    setIsLoading(false)
  }

  // Timer
  function startTimer() {
    stopTimer()
    recordingStartRef.current = Date.now()
    setTimerDisplay('00:00')
    setTimerActive(true)
    timerIntervalRef.current = setInterval(() => {
      const ms = Date.now() - recordingStartRef.current
      const total = Math.floor(ms / 1000)
      const m = String(Math.floor(total / 60)).padStart(2, '0')
      const s = String(total % 60).padStart(2, '0')
      setTimerDisplay(`${m}:${s}`)
    }, 500)
  }

  function stopTimer() {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    setTimerActive(false)
    setTimerDisplay('00:00')
  }

  // Recognition
  function initRecognition() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR: any =
      typeof window !== 'undefined'
        ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null)
        : null
    if (!SR) return
    const rec = new SR()
    rec.lang = 'en-US'
    rec.continuous = true
    rec.interimResults = true
    rec.onresult = (event: any) => {
      try {
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const r = event.results[i]
          if (r.isFinal && r[0]?.transcript) {
            transcriptBufferRef.current += (transcriptBufferRef.current ? ' ' : '') + r[0].transcript.trim()
          } else if (r[0]?.transcript) {
            interim += r[0].transcript
          }
        }
      } catch (_) {}
    }
    rec.onerror = () => {}
    rec.onend = () => {}
    recognitionRef.current = rec
  }

  function startRecognition() {
    if (!recognitionRef.current) initRecognition()
    if (!recognitionRef.current) return
    transcriptBufferRef.current = ''
    try { recognitionRef.current.start() } catch (_) {}
  }

  function stopRecognition() {
    try { recognitionRef.current?.stop() } catch (_) {}
  }

  // Recording
  async function startRecording() {
    if (!isBrokerMode && !sessionIdRef.current) {
      addMsg('System: Please start the practice session first.', 'system')
      return
    }
    if (isUploading || isRecording) return

    if (!mediaStreamRef.current) await initCamera()
    if (!mediaStreamRef.current) {
      addMsg('System: Recording not supported in this browser.', 'system')
      return
    }

    const audioStream = new MediaStream(mediaStreamRef.current.getAudioTracks())
    let rec: MediaRecorder
    try {
      rec = new MediaRecorder(audioStream, { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 32000 })
    } catch {
      try { rec = new MediaRecorder(audioStream) } catch { return }
    }

    recordedChunksRef.current = []
    setIsRecording(true)
    rec.ondataavailable = e => { if (e.data?.size > 0) recordedChunksRef.current.push(e.data) }
    rec.onstop = () => { setIsRecording(false); finalizeUpload() }
    rec.onerror = () => { addMsg('System: Recorder error.', 'system'); setIsRecording(false) }
    mediaRecorderRef.current = rec

    startTimer()
    setTimeout(() => {}, 1000)
    addMsg('System: Recording started. Speak your answer.', 'system')
    startRecognition()
    try { rec.start(1000) } catch { rec.start() }
  }

  function stopRecording() {
    stopRecognition()
    stopTimer()
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    } else {
      finalizeUpload()
    }
  }

  async function finalizeUpload() {
    stopRecognition()
    await new Promise(r => setTimeout(r, 500))

    const transcript = transcriptBufferRef.current.trim()
    if (isUploading) return
    if (recordedChunksRef.current.length === 0 && !transcript) {
      setIsRecording(false)
      return
    }

    setIsUploading(true)
    setIsRecording(false)
    stopTimer()

    const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' })
    recordedChunksRef.current = []
    const answerText = transcript || '[video_answer]'

    if (answerText && answerText !== '[video_answer]') {
      addMsg('You: ' + answerText, 'me')
    } else {
      addMsg('You: [Processing audio...]', 'me')
    }

    showLoader('Dispatcher is thinking...')
    setIsSpeaking(false)

    if (isBrokerMode && activeBrokerLoad) {
      await handleBrokerAnswer(answerText, blob)
      setIsUploading(false)
      hideLoader()
      return
    }

    try {
      const data = await apiAnswerPractice(sessionIdRef.current!, answerText, blob)

      const nextQ = data.next_question || null
      if (nextQ) {
        addMsg('Broker: ' + nextQ, 'bot')
        speak(nextQ, data.tts_url)
      } else {
        addMsg('System: Practice session complete.', 'system')
        setIsSessionEnded(true)
        if (data.report) setFinalReport(data.report)
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      addMsg('System: Server error - ' + msg, 'system')
    } finally {
      setIsUploading(false)
      hideLoader()
      setIsSpeaking(false)
    }
  }

  async function handleBrokerAnswer(text: string, audioBlob: Blob) {
    const sim = simCallRef.current
    sim.history.push({ q: '', a: text })
    sim.turnCount++

    const load = activeBrokerLoad!
    const bName = typeof load.broker === 'string'
      ? load.broker
      : ((load.broker as any)?.name || 'Broker')
    const loadId = load.load_id || load.reference_number || 'SIM-12345'

    try {
      const data = await apiNegotiateBrokerCall({
        load_id: loadId,
        broker_name: bName,
        student_offer: 0,
        history: sim.history,
        turn_count: sim.turnCount,
        load: load,
        user_reply: text,
      })

      if (data.dialogue) {
        sim.history[sim.history.length - 1].q = data.dialogue
        addMsg('Broker: ' + data.dialogue, 'bot')
        speak(data.dialogue, null)
      }

      if (data.status === 'Booked') {
        addMsg('System: Negotiation ' + data.status, 'system')
        const finalRate = data.counter_offer || data.agreed_rate || load.rate || 0
        const loadRef = load.load_id || load.reference_number
        addMsg(
          `<button onclick="window.bookLoadDirectly?.('${loadRef}')" class="btn-book" style="margin-top:10px;padding:12px;border-radius:8px;background:#10b981;color:white;font-weight:800;cursor:pointer;border:none;width:100%;">Book Load at $${finalRate}</button>`,
          'system',
          true
        )
      } else if (data.status === 'Hung Up') {
        addMsg('System: Negotiation ' + data.status, 'system')
        setTimeout(() => {
          setIsBrokerMode(false)
          setActiveBrokerLoad(null)
          window.location.href = '/dat-simulator'
        }, 3000)
      }
    } catch (e) {
      addMsg('System: Server error during negotiation.', 'system')
    }
  }

  // TTS / Speak
  function speak(text: string, ttsUrl: string | null) {
    if (!text) return
    const audio = audioRef.current
    if (ttsUrl && audio) {
      const apiBase = (typeof window !== 'undefined' ? (window as any).__APP_CONFIG__?.apiUrl : null) || 'https://b2b-bck.onrender.com'
      const fullUrl = ttsUrl.startsWith('http') ? ttsUrl : (apiBase + ttsUrl)
      audio.onplay = () => setIsSpeaking(true)
      audio.onended = () => setIsSpeaking(false)
      audio.onerror = () => browserSpeak(text)
      audio.src = fullUrl
      audio.muted = false
      audio.play().catch(() => browserSpeak(text))
    } else {
      browserSpeak(text)
    }
  }

  function browserSpeak(text: string) {
    if (selectedVoiceName.startsWith('GoogleTranslateCloud')) {
      let lang = 'en-US'
      if (selectedVoiceName.includes('GB')) lang = 'en-GB'
      else if (selectedVoiceName.includes('AU')) lang = 'en-AU'
      else if (selectedVoiceName.includes('CA')) lang = 'en-CA'
      else if (selectedVoiceName.includes('IN')) lang = 'en-IN'
      playCloudTTS(text, lang)
    } else {
      runLocalSpeech(text)
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
    if (!chunks.length) { setIsSpeaking(false); return }

    const audio = audioRef.current || new Audio()
    if (!audioRef.current) audioRef.current = audio
    let idx = 0

    setIsSpeaking(true)
    const playNext = () => {
      if (idx >= chunks.length) { setIsSpeaking(false); return }
      audio.src = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(chunks[idx])}`
      audio.onended = () => { idx++; playNext() }
      audio.onerror = () => runLocalSpeech(text)
      audio.play().catch(() => runLocalSpeech(text))
    }
    playNext()
  }

  function runLocalSpeech(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)

    const voices = window.speechSynthesis.getVoices()
    let preferred: SpeechSynthesisVoice | undefined
    if (selectedVoiceName) preferred = voices.find(v => v.name === selectedVoiceName)
    if (!preferred) {
      preferred = voices.find(v =>
        v.lang && v.name &&
        ['natural', 'online', 'google', 'neural', 'siri', 'samantha'].some(k => v.name.toLowerCase().includes(k)) &&
        (v.lang.startsWith('en-US') || v.lang.startsWith('en-CA'))
      ) || voices.find(v => v.lang?.startsWith('en-US')) || voices.find(v => v.lang?.startsWith('en'))
    }
    if (preferred) utterance.voice = preferred
    utterance.rate = speechSpeed
    utterance.pitch = 1.0
    utterance.volume = 1.0
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    if (voices.length === 0) {
      const handler = () => {
        window.speechSynthesis.onvoiceschanged = null
        window.speechSynthesis.speak(utterance)
      }
      window.speechSynthesis.onvoiceschanged = handler
      setTimeout(() => {
        window.speechSynthesis.onvoiceschanged = null
        if (window.speechSynthesis.getVoices().length > 0) window.speechSynthesis.speak(utterance)
      }, 500)
    } else {
      window.speechSynthesis.speak(utterance)
    }
  }

  // Session start
  async function startSession() {
    const savedName = localStorage.getItem('academy_name') || 'Guest'
    const savedEmail = localStorage.getItem('academy_email') || 'guest@dispatcheracademy.com'
    const name = studentName || savedName
    const email = studentEmail || savedEmail

    if (!name) {
      alert('Please fill in your name to start the session.')
      return
    }

    let batchId = selectedBatch === 'Practice' ? '' : selectedBatch

    showLoader('Starting practice...')
    try {
      const body = sessionIdRef.current
        ? { session_id: sessionIdRef.current }
        : {
            track: 'Dispatcher',
            student_name: name,
            email,
            mobile_number: studentMobile || '0000000000',
            batch_id: batchId,
            college: studentCollege,
            course: studentCourse,
            semester: studentSemester,
          }

      const data = await apiStartPractice(body)
      setTechModalOpen(false)
      setSessionId(data.session_id)
      sessionIdRef.current = data.session_id

      if (!data.session_id) {
        addMsg('System: Failed to start session (no session_id).', 'system')
        return
      }

      if (data.question) {
        addMsg('Broker: ' + data.question, 'bot')
        speak(data.question, data.tts_url)
      } else {
        addMsg('System: No question received from server.', 'system')
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      addMsg('System: Error starting session. ' + msg, 'system')
      setTechModalOpen(true)
    } finally {
      hideLoader()
    }
  }

  // End call
  async function endCall() {
    if (isBrokerMode) {
      if (confirm('Are you sure you want to hang up and end this negotiation call?')) {
        addMsg('System: Call hung up.', 'system')
        setIsBrokerMode(false)
        setActiveBrokerLoad(null)
        window.location.href = '/dat-simulator'
      }
      return
    }

    if (!sessionIdRef.current) {
      addMsg('System: No active call to end.', 'system')
      return
    }

    if (confirm('Are you sure you want to hang up, end this call simulation, and generate your performance report?')) {
      showLoader('Concluding call session...')
      try {
        const data = await apiAnswerPractice(sessionIdRef.current, '[Dispatcher ended the call]')
        addMsg('System: Call hung up.', 'system')
        if (data.report) {
          setFinalReport(data.report)
        } else {
          window.location.reload()
        }
      } catch {
        hideLoader()
        window.location.reload()
      } finally {
        hideLoader()
      }
    }
  }

  function toggleMic() {
    if (!mediaStreamRef.current) return
    const newMuted = !isMuted
    setIsMuted(newMuted)
    mediaStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !newMuted })
    addMsg(`System: Microphone ${newMuted ? 'muted' : 'active'}.`, 'system')
  }

  function changeVoice(name: string) {
    setSelectedVoiceName(name)
    localStorage.setItem('preferred_voice_name', name)
  }

  function changeSpeed(speed: number) {
    setSpeechSpeed(speed)
    localStorage.setItem('preferred_voice_speed', speed.toString())
  }

  function openTechModal() {
    setTechModalOpen(true)
    loadSessions()
  }

  function handleBatchChange(batchId: string) {
    setSelectedBatch(batchId)
    const batch = sessions.find(b => b.batch_id === batchId)
    const mode = batch?.mode || ''
    setShowPoolExtras(mode === 'pool_campus' || mode === 'college')
    if (mode === 'college') {
      setStudentCollege(batch?.college_name || '')
    } else {
      setStudentCollege('')
    }
  }

  function closeFinalReport() {
    setFinalReport(null)
  }

  return {
    // session
    sessionId,
    isSessionEnded,

    // messages
    messages,

    // recording
    isRecording,
    isUploading,
    timerDisplay,
    timerActive,
    startRecording,
    stopRecording,

    // TTS / Speaking
    isSpeaking,
    audioRef,
    speak,
    testVoice: () => browserSpeak("This is a voice check for the B2B dispatcher simulator. How does this sound?"),

    // Loader
    isLoading,
    loaderMessage,

    // Mic
    isMuted,
    toggleMic,

    // Voice settings
    settingsOpen,
    setSettingsOpen,
    voiceOptions,
    selectedVoiceName,
    changeVoice,
    speechSpeed,
    changeSpeed,

    // Tech modal (start session)
    techModalOpen,
    openTechModal,
    setTechModalOpen,
    sessions,
    selectedBatch,
    handleBatchChange,
    studentName,
    setStudentName,
    studentEmail,
    setStudentEmail,
    studentMobile,
    setStudentMobile,
    studentCollege,
    setStudentCollege,
    studentCourse,
    setStudentCourse,
    studentSemester,
    setStudentSemester,
    showPoolExtras,
    startSession,

    // End call
    endCall,

    // Final report
    finalReport,
    closeFinalReport,

    // Broker mode
    isBrokerMode,
    activeBrokerLoad,
  }
}
