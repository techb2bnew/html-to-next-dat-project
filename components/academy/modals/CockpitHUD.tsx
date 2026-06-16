'use client'
import { useState } from 'react'
import type { CockpitState } from '@/lib/types/challenges'

interface Props {
  cockpit: CockpitState
  onToggleMic: () => void
  onSubmitText: (text: string) => void
  onDecline: () => void
  onToggleMute: () => void
  audioRef: React.RefObject<HTMLAudioElement | null>
}

export default function CockpitHUD({ cockpit, onToggleMic, onSubmitText, onDecline, onToggleMute, audioRef }: Props) {
  const [keyboardText, setKeyboardText] = useState('')
  const [showKeyboard, setShowKeyboard] = useState(false)

  function handleTextSubmit() {
    const val = keyboardText.trim()
    if (!val) return
    onSubmitText(val)
    setKeyboardText('')
  }

  const gaugePercent = (val: number) => Math.min(100, Math.max(0, val * 10))

  return (
    <div className="fixed inset-0 z-[9500] bg-[#0f172a] overflow-y-auto flex flex-col p-5 box-border font-[Inter,sans-serif] animate-[fadeIn_0.4s_ease-out_forwards]">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-white/[0.06]">
        <div className="flex flex-col gap-1">
          <h2 className="m-0 text-[1.1rem] text-white">AI Dispatch Simulation Cockpit</h2>
          <div className="text-[0.7rem] text-slate-500 mt-[2px]">Live practice evaluation channel: secure B2B link</div>
        </div>
        <div className="flex gap-2">
          <div className="bg-black/[0.02] px-3 py-[5px] rounded-[20px] border border-[rgba(99,102,241,0.3)] text-[0.75rem] text-[#a5b4fc]">
            Turn: {cockpit.turnNumber} / 6
          </div>
          <div className="bg-black/[0.02] flex items-center gap-[6px] px-3 py-[5px] rounded-[20px] border border-[rgba(244,63,94,0.3)] text-[0.75rem] text-[#fb7185]">
            <span className="w-[6px] h-[6px] rounded-full bg-[#fb7185] inline-block animate-[blink_1.2s_infinite_ease-in-out]"></span> RECORDING ENCRYPTED
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-[280px_1fr_280px] gap-5 p-5 flex-1 min-h-0">
        {/* Left: Dossier */}
        <div className="bg-white/[0.02] rounded-[14px] border border-white/[0.06] p-5 flex flex-col overflow-y-auto">
          <h3 className="mt-0 mb-4 text-[0.85rem] text-slate-100">📌 Dispatch Mission Dossier</h3>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[0.7rem] text-slate-500 uppercase tracking-[0.05em] block mb-1">AI Actor Personality</span>
              <span className="text-[0.8rem] text-slate-300">{cockpit.personality || 'Retrieving...'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[0.7rem] text-slate-500 uppercase tracking-[0.05em] block mb-1">Operational Directives</span>
              <span className="text-[0.75rem] text-slate-400 max-h-[200px] overflow-y-auto block">
                {cockpit.scenario || 'Loading...'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Calling station */}
        <div className="flex flex-col items-center justify-center relative bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.08)_0%,rgba(9,13,22,0)_80%)]">
          <div className="relative overflow-hidden backdrop-blur-xl shadow-[0_15px_50px_rgba(15,23,42,0.08)] bg-white/[0.02] border border-[rgba(99,102,241,0.15)] rounded-[20px] p-7 w-full max-w-[380px] flex flex-col items-center gap-4">
            <div className="text-[0.65rem] text-slate-600 tracking-[0.1em] uppercase">SECURE VOICE LINK</div>

            {/* Avatar */}
            <div className="text-center flex flex-col items-center gap-2">
              <div
                className="relative mb-4 shadow-[0_0_30px_rgba(99,102,241,0.25)] w-20 h-20 rounded-full bg-[rgba(99,102,241,0.15)] border-2 border-[rgba(99,102,241,0.4)] flex items-center justify-center text-[2.5rem]"
              >
                🗣️
              </div>
              <div className="font-bold text-[1.1rem] text-white mb-1">{cockpit.callerName}</div>
              <div className="text-[0.75rem] text-slate-400 font-bold uppercase tracking-[0.05em] flex items-center gap-[6px]">{cockpit.roleLabel}</div>
              <div className="bg-black/[0.02] border border-black/[0.04] rounded-xl px-4 py-2 mt-[15px] font-bold flex items-center gap-2 uppercase text-[0.75rem] text-slate-500">
                State: <strong style={{ color: cockpit.emotionState === 'Listening' ? '#4ade80' : cockpit.emotionState === 'Analyzing' ? '#fbbf24' : '#818cf8' }}>{cockpit.emotionState.toUpperCase()}</strong>
              </div>
              <div className="flex gap-[3px] items-center h-6 mt-3">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className="inline-block w-[3px] bg-indigo-600 rounded-[2px] transition-[height] duration-300" style={{ height: cockpit.isProcessing ? 20 : 8 }} />
                ))}
              </div>
            </div>

            {/* Transcript */}
            <div
              className="w-full bg-black/20 border border-black/[0.05] border-l-4 border-l-indigo-600 rounded-lg px-[14px] py-[10px] text-[0.8rem] text-slate-300 min-h-[40px] max-h-[95px] overflow-y-auto text-center leading-[1.45]"
              dangerouslySetInnerHTML={{ __html: cockpit.transcript }}
            />

            {/* Controls */}
            <div className="flex gap-3 items-center w-full mt-auto px-1 pt-[10px] pb-1">
              <button
                className="w-11 h-11 rounded-full border border-white/15 cursor-pointer text-[1.2rem] flex items-center justify-center flex-shrink-0"
                onClick={onToggleMute}
                title="Toggle speaker"
                style={{ background: cockpit.isTtsMuted ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)' }}
              >
                {cockpit.isTtsMuted ? '🔇' : '🔊'}
              </button>

              <button
                className="flex-1 py-3 rounded-[24px] cursor-pointer text-white font-semibold flex items-center justify-center gap-2"
                onClick={onToggleMic}
                disabled={cockpit.isProcessing && !cockpit.isRecording}
                style={{ border: cockpit.isRecording ? '2px solid #ef4444' : '1px solid rgba(99,102,241,0.4)', background: cockpit.isRecording ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)' }}
              >
                <span>{cockpit.isRecording ? '⏹️' : '🎙️'}</span>
                <span>{cockpit.isRecording ? 'Stop & Submit' : cockpit.isProcessing ? 'Broker is Speaking...' : 'Tap to Speak'}</span>
              </button>

              <button
                className="w-11 h-11 rounded-full border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.15)] cursor-pointer text-[1.2rem] flex items-center justify-center flex-shrink-0"
                onClick={onDecline}
                title="End Call & Score"
              >
                📞
              </button>
            </div>

            {/* Keyboard toggle */}
            <button
              onClick={() => setShowKeyboard(k => !k)}
              className="text-[0.75rem] text-slate-500 bg-transparent border-none cursor-pointer"
            >
              {showKeyboard ? '⌨️ Hide Keyboard' : '⌨️ Type Response'}
            </button>

            {showKeyboard && (
              <div className="flex gap-2 w-full">
                <input
                  type="text"
                  value={keyboardText}
                  onChange={e => setKeyboardText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleTextSubmit() }}
                  placeholder="Type your response..."
                  className="flex-1 px-3 py-2 bg-white/[0.06] border border-white/10 rounded-lg text-white text-[0.85rem]"
                />
                <button
                  onClick={handleTextSubmit}
                  className="px-[14px] py-2 bg-[rgba(99,102,241,0.3)] border border-[rgba(99,102,241,0.4)] rounded-lg text-white cursor-pointer"
                >
                  Send
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Scoring dials */}
        <div className="bg-white/[0.02] rounded-[14px] border border-white/[0.06] p-5 flex flex-col gap-4 overflow-y-auto">
          <h3 className="mt-0 mb-4 text-[0.85rem] text-slate-100">📊 Live Dispatch Analytics</h3>

          {([
            { key: 'negotiation', label: 'Negotiation Pushes', val: cockpit.metrics.negotiation },
            { key: 'professionalism', label: 'Professionalism & Composure', val: cockpit.metrics.professionalism },
            { key: 'accuracy', label: 'Dispatcher Knowledge / Accuracy', val: cockpit.metrics.dispatcher_accuracy },
            { key: 'problem', label: 'Problem Solving / Solutions', val: cockpit.metrics.problem_solving },
          ] as const).map(({ key, label, val }) => (
            <div key={key} className="flex flex-col gap-[6px] mb-[14px]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[0.75rem] text-slate-400">{label}</span>
                <span className="text-[0.75rem] font-bold text-[#a5b4fc]">{gaugePercent(val).toFixed(0)}%</span>
              </div>
              <div className="w-full overflow-hidden h-[6px] bg-white/[0.06] rounded-[3px]">
                <div
                  className="h-full bg-gradient-to-r from-[#4f46e5] to-[#6366f1] rounded-[3px] transition-[width] duration-500 ease-in-out shadow-[0_0_8px_rgba(56,189,248,0.15)]"
                  style={{ width: `${gaugePercent(val)}%` }}
                />
              </div>
            </div>
          ))}

          <div className="bg-[rgba(251,191,36,0.05)] border border-[rgba(251,191,36,0.15)] rounded-[10px] p-3 mt-4 flex flex-col gap-2">
            <div className="text-[0.65rem] text-amber-900 font-bold uppercase tracking-[0.05em] mb-2">
              💡 Tactical Assistance Drones
            </div>
            {cockpit.suggestions.map((s, i) => (
              <div key={i} className="text-[0.75rem] text-amber-900 leading-[1.5] mb-1 font-medium flex items-start gap-[6px]">
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      <audio ref={audioRef} playsInline />
    </div>
  )
}
