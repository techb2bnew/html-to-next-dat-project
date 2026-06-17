'use client'
import { useState, useEffect, useRef, useCallback } from 'react';
import type { SimMode, CallPhase, SimulationState, CallMessage, TimelineEvent, TranscriptMessage, ScoreData } from '@/lib/types/voice';
import { initCall, initiateDirectCall, chatWithAI, scoreCall } from '@/lib/api/voice';
import { getApiBase } from '@/lib/config';
import SetupModal from './SetupModal';
import ScoreModal from './ScoreModal';
import Dashboard from './Dashboard';

export default function VoiceSimulatorApp() {
  const [phase, setPhase] = useState<CallPhase>('setup');
  const [selectedMode, setSelectedMode] = useState<SimMode>('broker');
  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [callStatus, setCallStatus] = useState('Initializing');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [aiEmotion, setAiEmotion] = useState<string | null>(null);
  const [aiObjection, setAiObjection] = useState<string | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [transcriptMsgs, setTranscriptMsgs] = useState<TranscriptMessage[]>([]);
  const [scores, setScores] = useState<ScoreData | null>(null);

  // Refs — mutable values used inside async callbacks
  const simStateRef = useRef<SimulationState | null>(null);
  const callHistoryRef = useRef<CallMessage[]>([]);
  const callActiveRef = useRef(false);
  const isRecordingRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const aiVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const endCallRef = useRef<(manual?: boolean) => void>(() => {});
  const eventIdRef = useRef(0);
  const msgIdRef = useRef(0);

  useEffect(() => { simStateRef.current = simState; }, [simState]);

  // Lock body scroll + dark background
  useEffect(() => {
    document.body.style.backgroundColor = '#0b0f19';
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.overflow = '';
    };
  }, []);

  const addEvent = useCallback((text: string) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setTimelineEvents(prev => [...prev, { id: ++eventIdRef.current, time, text }]);
  }, []);

  const addTranscript = useCallback((speaker: string, text: string, type: TranscriptMessage['type']) => {
    setTranscriptMsgs(prev => [...prev, { id: ++msgIdRef.current, speaker, text, type }]);
  }, []);

  const onSpeakStart = useCallback(() => {
    setCallStatus('Speaking...');
    setIsSpeaking(true);
  }, []);

  const onSpeakEnd = useCallback(() => {
    setCallStatus('Connected');
    setIsSpeaking(false);
    setTimeout(() => {
      if (!callActiveRef.current || isRecordingRef.current || !recognitionRef.current) return;
      try {
        recognitionRef.current.start();
        isRecordingRef.current = true;
        setIsRecording(true);
        setCallStatus('Listening...');
      } catch (_) {}
    }, 500);
  }, []);

  const speakBrowserFallback = useCallback((text: string) => {
    const synth = synthRef.current;
    if (!synth) return;
    if (synth.speaking) synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (aiVoiceRef.current) utterance.voice = aiVoiceRef.current;
    utterance.rate = 1.05;
    utterance.onstart = onSpeakStart;
    utterance.onend = onSpeakEnd;
    synth.speak(utterance);
  }, [onSpeakStart, onSpeakEnd]);

  const speak = useCallback((text: string) => {
    if (!text) return;
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    const synth = synthRef.current;
    if (synth?.speaking) synth.cancel();

    setCallStatus('AI speaking...');

    fetch(`${getApiBase()}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
      .then(resp => {
        if (!resp.ok) throw new Error(`TTS HTTP ${resp.status}`);
        return resp.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        currentAudioRef.current = audio;
        audio.onplay = onSpeakStart;
        audio.onended = () => {
          URL.revokeObjectURL(url);
          currentAudioRef.current = null;
          onSpeakEnd();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          currentAudioRef.current = null;
          speakBrowserFallback(text);
        };
        audio.play().catch(() => speakBrowserFallback(text));
      })
      .catch(() => speakBrowserFallback(text));
  }, [onSpeakStart, onSpeakEnd, speakBrowserFallback]);

  const sendToBackend = useCallback((userText: string) => {
    if (!callActiveRef.current) return;
    if (userText) {
      callHistoryRef.current.push({ role: 'user', content: userText });
    }
    setCallStatus('AI is thinking...');

    const state = simStateRef.current;
    if (!state) return;

    chatWithAI({
      mode: state.mode,
      ai_role: state.ai_role,
      user_role: state.user_role,
      ai_persona: state.ai_persona,
      scenario: state.scenario,
      history: [...callHistoryRef.current],
    }).then(data => {
      if (!callActiveRef.current) return;
      setCallStatus('Connected');

      if (data.status === 'success') {
        const reply = data.reply;
        callHistoryRef.current.push({ role: 'assistant', content: reply });
        addTranscript(state.ai_persona, reply, 'ai');
        speak(reply);

        if (data.emotional_state && data.emotional_state !== 'Neutral') {
          setAiEmotion(data.emotional_state);
        }
        if (data.detected_objection && data.detected_objection !== 'None') {
          setAiObjection(data.detected_objection);
          addEvent(`AI raised objection: ${data.detected_objection}`);
        }

        if (data.action === 'hangup') {
          addEvent('AI hung up');
          setTimeout(() => endCallRef.current(false), 3000);
        } else if (data.action === 'book') {
          addEvent('Load Booked!');
          setTimeout(() => endCallRef.current(false), 3000);
        } else if (data.action === 'hold') {
          addEvent('AI placed call on hold');
        } else {
          addEvent('AI replied');
        }
      } else {
        addTranscript('System', `Error: ${data.message}`, 'system');
      }
    });
  }, [addTranscript, addEvent, speak]);

  const endCall = useCallback((manual = true) => {
    callActiveRef.current = false;
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    const synth = synthRef.current;
    if (synth?.speaking) synth.cancel();
    if (isRecordingRef.current && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setCallStatus('Call Ended');
    addEvent(manual ? 'User ended call' : 'Call disconnected');
    addTranscript('System', 'Call ended. Generating evaluation...', 'system');

    const state = simStateRef.current;
    if (!state) return;

    scoreCall({
      history: [...callHistoryRef.current],
      scenario: state.scenario,
      ai_role: state.ai_role,
      user_role: state.user_role,
      email: localStorage.getItem('studentEmail') || 'student@dispatcheracademy.com',
      student_name: localStorage.getItem('studentName') || 'Guest Student',
    }).then(data => {
      if (data.status === 'success') {
        setScores(data.scores);
        setPhase('score');
      }
    });
  }, [addEvent, addTranscript]);

  // Keep endCallRef up to date so sendToBackend can call latest endCall
  useEffect(() => { endCallRef.current = endCall; }, [endCall]);

  const setupSpeech = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        addTranscript('You', transcript, 'user');
        addEvent('User spoke');
        sendToBackend(transcript);
      };

      rec.onend = () => {
        isRecordingRef.current = false;
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    } else {
      addTranscript('System', 'Speech recognition not supported. Use Chrome.', 'system');
    }
  }, [addTranscript, addEvent, sendToBackend]);

  const toggleMic = useCallback(() => {
    if (!recognitionRef.current || !callActiveRef.current) return;
    if (isRecordingRef.current) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        isRecordingRef.current = true;
        setIsRecording(true);
        setCallStatus('Listening...');
      } catch (_) {}
    }
  }, []);

  const startCall = useCallback((state: SimulationState) => {
    simStateRef.current = state;
    setSimState(state);
    callActiveRef.current = true;
    setPhase('call');
    addEvent(`Connected to ${state.ai_persona} (${state.ai_role})`);
    addTranscript('System', 'Call connected. Initiating...', 'system');
    setupSpeech();
  }, [addEvent, addTranscript, setupSpeech]);

  const initializeCall = useCallback(async () => {
    addEvent('Initializing connection...');
    try {
      const data = await initCall(selectedMode);
      if (data.status === 'success') {
        startCall(data);
        setCallStatus('Connected');
        setTimeout(() => sendToBackend(''), 1000);
      }
    } catch (_) {
      addEvent('Connection failed');
    }
  }, [selectedMode, addEvent, startCall, sendToBackend]);

  const initializeDirectCall = useCallback(async (load: Record<string, any>) => {
    const bName = load.broker?.name ?? (typeof load.broker === 'string' ? load.broker : 'Broker');
    const originStr = typeof load.origin === 'string' ? load.origin : `${load.origin?.city}, ${load.origin?.state}`;
    const destStr = typeof load.destination === 'string' ? load.destination : `${load.destination?.city}, ${load.destination?.state}`;

    const state: SimulationState = {
      mode: 'broker',
      ai_role: 'Broker',
      user_role: 'Carrier',
      ai_persona: bName,
      scenario: {
        lane: { origin: originStr, destination: destStr },
        equipment: load.equipment?.type ?? 'Van',
        commodity: load.commodity ?? 'General Merchandise',
        weight: load.equipment?.weight ? `${load.equipment.weight.toLocaleString()} lbs` : '40,000 lbs',
        market_condition: 'Standard',
        base_rate: load.rate ?? 2000,
      },
    };

    startCall(state);
    setCallStatus('Connecting...');

    try {
      const data = await initiateDirectCall({
        load_id: load.load_id ?? 'SIM-123',
        broker_name: bName,
        load,
      });
      if (data.opening_line) {
        callHistoryRef.current.push({ role: 'assistant', content: data.opening_line });
        addTranscript(bName, data.opening_line, 'ai');
        speak(data.opening_line);
        addEvent('AI replied');
        setCallStatus('Connected');
      } else {
        setTimeout(() => sendToBackend(''), 1000);
      }
    } catch (_) {
      setTimeout(() => sendToBackend(''), 1000);
    }
  }, [startCall, addTranscript, addEvent, speak, sendToBackend]);

  // Mount: set up voices + check localStorage for direct-call bypass
  useEffect(() => {
    if (typeof window === 'undefined') return;

    synthRef.current = window.speechSynthesis;
    if (synthRef.current) {
      synthRef.current.onvoiceschanged = () => {
        const voices = synthRef.current!.getVoices();
        aiVoiceRef.current =
          voices.find(v => v.lang === 'en-US' && v.name.includes('Female')) ||
          voices[1] || null;
      };
    }

    const loadDataStr = localStorage.getItem('active_broker_call_load');
    if (loadDataStr) {
      try {
        const loadData = JSON.parse(loadDataStr);
        localStorage.removeItem('active_broker_call_load');
        initializeDirectCall(loadData);
      } catch (_) {}
    }
  }, [initializeDirectCall]);

  return (
    <div
      className="bg-[#0b0f19] text-slate-50 h-screen overflow-hidden flex flex-col"
      style={{
        fontFamily: "'Inter', sans-serif",
        backgroundImage: 'radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.1) 0px, transparent 50%)',
      }}
    >
      {phase === 'setup' && (
        <SetupModal
          selectedMode={selectedMode}
          onSelectMode={setSelectedMode}
          onStart={initializeCall}
        />
      )}

      {phase === 'score' && scores && (
        <ScoreModal scores={scores} />
      )}

      {phase !== 'setup' && (
        <Dashboard
          simState={simState}
          callStatus={callStatus}
          isSpeaking={isSpeaking}
          isRecording={isRecording}
          aiEmotion={aiEmotion}
          aiObjection={aiObjection}
          timelineEvents={timelineEvents}
          transcriptMessages={transcriptMsgs}
          onToggleMic={toggleMic}
          onEndCall={() => endCall(true)}
        />
      )}
    </div>
  );
}
