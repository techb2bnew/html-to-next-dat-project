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
    <div className="cockpit-wrapper fixed inset-0 z-[9500] bg-[var(--surface-primary,#0f172a)] overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="cockpit-header flex justify-between items-center px-6 py-4 border-b border-white/[0.06]">
        <div className="cockpit-title-info">
          <h2 className="m-0 text-[1.1rem] text-white">AI Dispatch Simulation Cockpit</h2>
          <div className="cockpit-subtitle text-[0.7rem] text-slate-500 mt-[2px]">Live practice evaluation channel: secure B2B link</div>
        </div>
        <div className="flex gap-2">
          <div className="hud-pill px-3 py-[5px] rounded-[20px] border border-[rgba(99,102,241,0.3)] text-[0.75rem] text-[#a5b4fc]">
            Turn: {cockpit.turnNumber} / 6
          </div>
          <div className="hud-pill flex items-center gap-[6px] px-3 py-[5px] rounded-[20px] border border-[rgba(244,63,94,0.3)] text-[0.75rem] text-[#fb7185]">
            <span className="status-dot-blink w-[6px] h-[6px] rounded-full bg-[#fb7185] inline-block"></span> RECORDING ENCRYPTED
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="cockpit-grid grid grid-cols-[280px_1fr_280px] gap-5 p-5 flex-1 min-h-0">
        {/* Left: Dossier */}
        <div className="cockpit-side-panel bg-white/[0.02] rounded-[14px] border border-white/[0.06] p-5">
          <h3 className="mt-0 mb-4 text-[0.85rem] text-slate-100">📌 Dispatch Mission Dossier</h3>
          <div className="dossier-list flex flex-col gap-3">
            <div className="dossier-row">
              <span className="dossier-label text-[0.7rem] text-slate-500 uppercase tracking-[0.05em] block mb-1">AI Actor Personality</span>
              <span className="dossier-val text-[0.8rem] text-slate-300">{cockpit.personality || 'Retrieving...'}</span>
            </div>
            <div className="dossier-row">
              <span className="dossier-label text-[0.7rem] text-slate-500 uppercase tracking-[0.05em] block mb-1">Operational Directives</span>
              <span className="dossier-val text-[0.75rem] text-slate-400 max-h-[200px] overflow-y-auto block">
                {cockpit.scenario || 'Loading...'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Calling station */}
        <div className="cockpit-center-station flex flex-col items-center">
          <div className="cockpit-phone-frame bg-white/[0.02] border border-[rgba(99,102,241,0.15)] rounded-[20px] p-7 w-full max-w-[380px] flex flex-col items-center gap-4">
            <div className="text-[0.65rem] text-slate-600 tracking-[0.1em] uppercase">SECURE VOICE LINK</div>

            {/* Avatar */}
            <div className="cockpit-avatar-station text-center flex flex-col items-center gap-2">
              <div
                className={`cockpit-avatar-ring ${cockpit.isProcessing ? 'speaking pulsing' : ''} w-20 h-20 rounded-full bg-[rgba(99,102,241,0.15)] border-2 border-[rgba(99,102,241,0.4)] flex items-center justify-center text-[2.5rem]`}
              >
                🗣️
              </div>
              <div className="cockpit-caller-name font-bold text-[1.1rem] text-white">{cockpit.callerName}</div>
              <div className="cockpit-call-status text-[0.75rem] text-slate-400">{cockpit.roleLabel}</div>
              <div className="live-emotion-console text-[0.75rem] text-slate-500">
                State: <strong style={{ color: cockpit.emotionState === 'Listening' ? '#4ade80' : cockpit.emotionState === 'Analyzing' ? '#fbbf24' : '#818cf8' }}>{cockpit.emotionState.toUpperCase()}</strong>
              </div>
              <div className={`cockpit-wave-pulse ${cockpit.isProcessing ? 'speaking' : ''} flex gap-[3px]`}>
                {[1,2,3,4,5].map(i => (
                  <span key={i} className="inline-block w-[3px] bg-[var(--neon-indigo,#6366f1)] rounded-[2px] transition-[height] duration-300" style={{ height: cockpit.isProcessing ? 20 : 8 }} />
                ))}
              </div>
            </div>

            {/* Transcript */}
            <div
              className="cockpit-transcript-bar w-full bg-black/20 rounded-lg px-[14px] py-[10px] text-[0.8rem] text-slate-300 min-h-[40px] text-center"
              dangerouslySetInnerHTML={{ __html: cockpit.transcript }}
            />

            {/* Controls */}
            <div className="cockpit-control-panel flex gap-3 items-center w-full">
              <button
                className={`cockpit-mute-btn ${cockpit.isTtsMuted ? 'active' : ''} w-11 h-11 rounded-full border border-white/15 cursor-pointer text-[1.2rem] flex items-center justify-center flex-shrink-0`}
                onClick={onToggleMute}
                title="Toggle speaker"
                style={{ background: cockpit.isTtsMuted ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)' }}
              >
                {cockpit.isTtsMuted ? '🔇' : '🔊'}
              </button>

              <button
                className={`cockpit-speak-btn ${cockpit.isRecording ? 'recording' : ''} flex-1 py-3 rounded-[24px] cursor-pointer text-white font-semibold flex items-center justify-center gap-2`}
                onClick={onToggleMic}
                disabled={cockpit.isProcessing && !cockpit.isRecording}
                style={{ border: cockpit.isRecording ? '2px solid #ef4444' : '1px solid rgba(99,102,241,0.4)', background: cockpit.isRecording ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)' }}
              >
                <span>{cockpit.isRecording ? '⏹️' : '🎙️'}</span>
                <span>{cockpit.isRecording ? 'Stop & Submit' : cockpit.isProcessing ? 'Broker is Speaking...' : 'Tap to Speak'}</span>
              </button>

              <button
                className="cockpit-hangup-btn w-11 h-11 rounded-full border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.15)] cursor-pointer text-[1.2rem] flex items-center justify-center flex-shrink-0"
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
        <div className="scoring-hud-panel bg-white/[0.02] rounded-[14px] border border-white/[0.06] p-5">
          <h3 className="mt-0 mb-4 text-[0.85rem] text-slate-100">📊 Live Dispatch Analytics</h3>

          {([
            { key: 'negotiation', label: 'Negotiation Pushes', val: cockpit.metrics.negotiation },
            { key: 'professionalism', label: 'Professionalism & Composure', val: cockpit.metrics.professionalism },
            { key: 'accuracy', label: 'Dispatcher Knowledge / Accuracy', val: cockpit.metrics.dispatcher_accuracy },
            { key: 'problem', label: 'Problem Solving / Solutions', val: cockpit.metrics.problem_solving },
          ] as const).map(({ key, label, val }) => (
            <div key={key} className="meter-row mb-[14px]">
              <div className="meter-meta flex justify-between mb-1">
                <span className="meter-name text-[0.75rem] text-slate-400">{label}</span>
                <span className="meter-value text-[0.75rem] font-bold text-[#a5b4fc]">{gaugePercent(val).toFixed(0)}%</span>
              </div>
              <div className="meter-bar-bg h-[6px] bg-white/[0.06] rounded-[3px]">
                <div
                  className="meter-bar-fill h-full bg-gradient-to-r from-[#4f46e5] to-[#6366f1] rounded-[3px] transition-[width] duration-500 ease-in-out"
                  style={{ width: `${gaugePercent(val)}%` }}
                />
              </div>
            </div>
          ))}

          <div className="suggestions-hud-panel bg-[rgba(251,191,36,0.05)] border border-[rgba(251,191,36,0.15)] rounded-[10px] p-3 mt-4">
            <div className="text-[0.65rem] text-amber-900 font-bold uppercase tracking-[0.05em] mb-2">
              💡 Tactical Assistance Drones
            </div>
            {cockpit.suggestions.map((s, i) => (
              <div key={i} className="suggestion-hint-item text-[0.75rem] text-amber-900 leading-[1.5] mb-1">
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
