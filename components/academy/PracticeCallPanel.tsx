'use client'
import { useEffect } from 'react'
import type { usePracticeCall } from '@/lib/hooks/usePracticeCall'

type PracticeCallCtx = ReturnType<typeof usePracticeCall>

interface Props {
  ctx: PracticeCallCtx
}

export default function PracticeCallPanel({ ctx }: Props) {
  // Unlock audio on first interaction
  useEffect(() => {
    let unlocked = false
    const unlock = () => {
      if (unlocked) return
      unlocked = true
      // Prime audio context
      try {
        const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext
        if (AudioCtx) {
          const actx = new AudioCtx()
          if (actx.state === 'suspended') actx.resume()
        }
      } catch (_) {}
      // Prime speech synthesis
      if ('speechSynthesis' in window && !window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
        const u = new SpeechSynthesisUtterance(' ')
        u.volume = 0
        window.speechSynthesis.speak(u)
      }
      document.removeEventListener('click', unlock)
      document.removeEventListener('touchstart', unlock)
      document.removeEventListener('keydown', unlock)
    }
    document.addEventListener('click', unlock)
    document.addEventListener('touchstart', unlock)
    document.addEventListener('keydown', unlock)
    return () => {
      document.removeEventListener('click', unlock)
      document.removeEventListener('touchstart', unlock)
      document.removeEventListener('keydown', unlock)
    }
  }, [])

  return (
    <div className="container flex flex-col items-center justify-center min-h-[70vh] p-[10px]">
      <div className="text-[var(--text-muted)] text-[0.85rem] text-center mb-5">
        💡 <strong>Practice Mode:</strong> Direct freeform interactive phone simulator. Connect call to practice general dispatcher communications.
      </div>

      <div
        className={`smartphone-frame ${ctx.isSpeaking ? 'speaking' : ''} relative`}
        id="ai-avatar-wrapper"
      >
        <div className="smartphone-screen">
          {/* Phone header */}
          <div className="phone-header">
            <div className="phone-notch" />
            <div className="phone-bar">
              <span className="phone-time">9:41</span>
              <div className="flex gap-1 font-bold text-[var(--success)] text-[0.65rem] tracking-[0.05em] items-center">
                <span className="status-dot" /> B2B LIVE
              </div>
              <div className="phone-icons flex gap-[6px] items-center">
                <span>📶</span><span>🔋</span>
                <button
                  type="button"
                  onClick={() => ctx.setSettingsOpen(true)}
                  className="bg-transparent border-none text-white/75 cursor-pointer pt-[2px] pl-1 flex items-center justify-center outline-none"
                  title="Voice Settings"
                >
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Call body */}
          <div className="phone-call-body">
            <div className="caller-avatar-circle">
              <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="block">
                <defs>
                  <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#312e81" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="48" fill="url(#avatarGrad)" />
                <path d="M15 90 C 20 65, 80 65, 85 90 Z" fill="#1e293b" />
                <path d="M35 70 L50 82 L65 70 Z" fill="#ffffff" />
                <path d="M48 70 L52 70 L50 82 Z" fill="#4f46e5" />
                <circle cx="50" cy="45" r="18" fill="#ffedd5" />
                <path d="M44 50 Q 50 53, 56 50" stroke="#c2410c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d="M32 42 Q 50 25, 68 42 Q 50 35, 32 42" fill="#1e1b4b" />
                <circle cx="43" cy="41" r="2" fill="#1e1b4b" />
                <circle cx="57" cy="41" r="2" fill="#1e1b4b" />
                <path d="M30 45 A 20 20 0 0 1 70 45" stroke="#64748b" strokeWidth="3" fill="none" strokeLinecap="round" />
                <rect x="29" y="42" width="4" height="10" rx="2" fill="#1e293b" />
                <rect x="67" y="42" width="4" height="10" rx="2" fill="#1e293b" />
              </svg>
            </div>
            <h1 className="caller-name">B2B Broker</h1>
            <div className="caller-status">Active Call</div>
            <div className="call-timer-container">
              <span id="timer" className={ctx.timerActive ? 'on' : ''}>{ctx.timerDisplay}</span>
            </div>
            <div className="phone-wave-pulse">
              <span /><span /><span /><span /><span />
            </div>
          </div>

          {/* Action grid */}
          <div className="phone-action-grid">
            <div className="action-item">
              <button
                id="mic-toggle"
                className={`phone-circle-btn muted-btn ${ctx.isMuted ? 'active' : ''}`}
                type="button"
                title={ctx.isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                onClick={ctx.toggleMic}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {ctx.isMuted ? (
                    <>
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                      <line x1="12" x2="12" y1="19" y2="22" />
                    </>
                  ) : (
                    <>
                      <line x1="1" y1="1" x2="23" y2="23" />
                      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6" />
                      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                      <line x1="12" y1="19" x2="12" y2="22" />
                    </>
                  )}
                </svg>
              </button>
              <span className="action-label">mute</span>
            </div>

            <div className="action-item">
              <button
                id="record"
                className={`phone-circle-btn record-btn ${ctx.isRecording ? 'recording' : ''}`}
                type="button"
                title="Record Response"
                disabled={ctx.isUploading}
                onClick={ctx.startRecording}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              </button>
              <span className="action-label font-bold text-white">speak</span>
            </div>

            <div className="action-item">
              <button
                id="stop"
                className="phone-circle-btn bg-white/10 text-white border-white/20"
                type="button"
                title="Submit Response"
                disabled={!ctx.isRecording}
                onClick={ctx.stopRecording}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
              <span className="action-label">submit</span>
            </div>
          </div>

          {/* End call */}
          <div className="phone-end-call-area">
            <button
              id="end-call-btn"
              className="phone-decline-btn"
              type="button"
              title="End Call & Wrap Up"
              onClick={ctx.endCall}
            >
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
                <line x1="23" y1="1" x2="1" y2="23" />
              </svg>
            </button>
          </div>
        </div>

        {/* Voice settings overlay */}
        {ctx.settingsOpen && (
          <div className="modal-overlay absolute inset-0 flex items-center justify-center z-[100]">
            <div className="modal-content bg-[rgba(17,24,39,0.98)] border border-[var(--border-glow)] shadow-[var(--shadow-glow)] p-4 rounded-xl w-[90%] max-w-[320px]">
              <div className="flex justify-between items-center mb-[15px] border-b border-white/10 pb-[10px]">
                <h3 className="text-white m-0 text-[1rem]">🔊 Voice &amp; Speech Settings</h3>
                <button
                  onClick={() => ctx.setSettingsOpen(false)}
                  className="bg-transparent border-none text-slate-400 cursor-pointer text-[1.2rem] outline-none leading-none"
                >
                  &times;
                </button>
              </div>

              <div className="voice-settings-panel bg-transparent border-none p-0">
                <div className="mb-[15px]">
                  <label className="text-[0.85rem] text-slate-300 block mb-[5px]">Accent &amp; Voice</label>
                  <select
                    value={ctx.selectedVoiceName}
                    onChange={e => ctx.changeVoice(e.target.value)}
                    className="voice-accent-select block w-full"
                  >
                    {ctx.voiceOptions.map(v => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-[15px]">
                  <label className="text-[0.85rem] text-slate-300 block mb-[5px]">Speech Rate</label>
                  <div className="voice-slider-container flex gap-[10px] items-center">
                    <input
                      type="range"
                      className="voice-slider flex-1 block"
                      min="0.8"
                      max="1.5"
                      step="0.1"
                      value={ctx.speechSpeed}
                      onChange={e => ctx.changeSpeed(parseFloat(e.target.value))}
                    />
                    <span className="voice-slider-value">{ctx.speechSpeed.toFixed(1)}x</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="primary-btn w-full text-[0.85rem] px-3 py-2 mt-[10px] bg-[rgba(79,70,229,0.25)] border border-[rgba(79,70,229,0.45)] text-white cursor-pointer rounded-md"
                  onClick={ctx.testVoice}
                >
                  Test Selected Voice 🗣️
                </button>
              </div>
            </div>
          </div>
        )}

        <audio ref={ctx.audioRef} playsInline />
      </div>

      {/* Chat (hidden) */}
      <div id="chat" className="chat hidden" />

      {/* Tech modal */}
      {ctx.techModalOpen && (
        <div className="modal-overlay fixed inset-0 z-[200] flex items-center justify-center">
          <div className="modal-content bg-[rgba(17,24,39,0.95)] border border-[var(--border-glow)] shadow-[var(--shadow-glow)] rounded-xl p-6 max-w-[400px] w-[90%]">
            <div className="modal-header border-b border-white/10 pb-4 mb-5">
              <h3 className="text-white m-0">Start Your Practice Call</h3>
              <div className="user-info-section mt-[15px]">
                <div className="mb-3">
                  <label htmlFor="student-name" className="text-[0.95rem] font-bold text-white block mb-[6px]">Full Name</label>
                  <input
                    type="text"
                    id="student-name"
                    value={ctx.studentName}
                    onChange={e => ctx.setStudentName(e.target.value)}
                    placeholder="Enter your full name to connect call"
                    required
                    className="w-full bg-[rgba(15,23,42,0.8)] border border-white/10 text-white p-[10px] rounded-md box-border"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer pt-2">
              <button
                id="start-session-btn"
                className="primary-btn w-full rounded-[var(--radius-md)] text-[1rem] p-[14px] bg-gradient-to-br from-[var(--neon-indigo)] to-[#4f46e5] text-white border-none shadow-[0_4px_10px_rgba(79,70,229,0.3)] cursor-pointer"
                onClick={ctx.startSession}
              >
                Connect Call 📞
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final report */}
      {ctx.finalReport && (
        <div className="report-overlay fixed inset-0 z-[300] flex items-center justify-center bg-black/85">
          <div className="report-card bg-[rgba(15,23,42,0.98)] border border-white/[0.08] rounded-[20px] p-10 max-w-[500px] w-[90%] text-center">
            <h1 className="text-white mb-4">Practice Session Completed</h1>
            <div className="text-[3rem] mb-5">✅</div>
            <p className="text-slate-300">{ctx.finalReport.message || 'Practice Completed. Thank you!'}</p>
            <div className="bg-[rgba(15,23,42,0.3)] p-5 rounded-xl mb-8 border border-white/[0.05] text-left">
              <p className="text-slate-400 text-[0.9rem] m-0">
                Your responses have been recorded and sent for review. You will receive an email with your results and feedback soon.
              </p>
            </div>
            <button
              onClick={ctx.closeFinalReport}
              className="primary-btn mx-auto block w-fit bg-[#3b82f6] px-6 py-3 rounded-lg text-white border-none cursor-pointer font-bold"
            >
              Return to Home
            </button>
          </div>
        </div>
      )}

      {/* Global loader */}
      {ctx.isLoading && (
        <div className="loader-overlay fixed inset-0 z-[400] flex items-center justify-center bg-black/50 flex-col gap-3">
          <div className="spinner" />
          <div className="loader-text">{ctx.loaderMessage}</div>
        </div>
      )}
    </div>
  )
}
