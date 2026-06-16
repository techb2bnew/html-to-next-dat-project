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
    <div className="w-full max-w-[850px] mx-auto relative flex flex-col items-center justify-center min-h-[70vh] p-[10px] gap-4">
      <div className="text-slate-600 text-[0.85rem] text-center mb-5">
        💡 <strong>Practice Mode:</strong> Direct freeform interactive phone simulator. Connect call to practice general dispatcher communications.
      </div>

      <div
        className="relative w-full max-w-[340px] bg-black rounded-[40px] p-[10px] shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_0_2px_2px_rgba(255,255,255,0.2)] mx-auto my-[15px] border-4 border-slate-800"
        id="ai-avatar-wrapper"
      >
        <div className="bg-gradient-to-b from-slate-900 to-[#020617] rounded-[32px] h-[520px] overflow-hidden relative flex flex-col text-white p-[14px]">
          {/* Phone header */}
          <div className="flex flex-col items-center w-full z-10">
            <div className="w-[100px] h-5 bg-black rounded-b-xl absolute top-0 left-1/2 -translate-x-1/2" />
            <div className="flex justify-between items-center w-full mt-2 px-[10px] text-[0.7rem] font-semibold text-white/85">
              <span>9:41</span>
              <div className="flex gap-1 font-bold text-green-600 text-[0.65rem] tracking-[0.05em] items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full shadow-[0_0_10px_#16a34a] animate-[blink_1.5s_infinite_ease-in-out]" /> B2B LIVE
              </div>
              <div className="flex gap-[6px] items-center">
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
          <div className="flex-1 flex flex-col items-center justify-center mt-[15px]">
            <div
              className={`relative w-[110px] h-[110px] rounded-full bg-[radial-gradient(circle,#1e293b_0%,#0f172a_100%)] flex items-center justify-center overflow-hidden transition-all duration-300 ${
                ctx.isSpeaking
                  ? 'border-2 border-indigo-600 shadow-[0_0_25px_rgba(79,70,229,0.15)] scale-[1.02]'
                  : 'border-2 border-white/[0.12] shadow-[0_10px_25px_rgba(0,0,0,0.5)]'
              }`}
            >
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
            <h1 className="text-[1.45rem] font-extrabold mt-[15px] mb-1 text-white text-center">B2B Broker</h1>
            <div className="text-[0.75rem] text-slate-400 font-bold uppercase tracking-[0.05em] mb-[2px]">Active Call</div>
            <div className="font-mono text-base font-bold text-green-600 mb-[5px]">
              <span className={ctx.timerActive ? 'text-red-600' : ''}>{ctx.timerDisplay}</span>
            </div>
            <div className={`flex items-end gap-[3px] h-5 mt-3 transition-opacity ${ctx.isSpeaking ? 'opacity-100' : 'opacity-0'}`}>
              {[
                { h: 10, delay: '0.0s' },
                { h: 15, delay: '0.1s' },
                { h: 20, delay: '0.2s' },
                { h: 15, delay: '0.15s' },
                { h: 10, delay: '0.05s' },
              ].map((w, i) => (
                <span
                  key={i}
                  className="w-[3px] bg-indigo-600 rounded-[3px] animate-[wave_1s_infinite_ease-in-out]"
                  style={{ height: w.h, animationDelay: w.delay }}
                />
              ))}
            </div>
          </div>

          {/* Action grid */}
          <div className="grid grid-cols-3 gap-3 w-full px-[6px] py-2 mb-3">
            <div className="flex flex-col items-center">
              <button
                id="mic-toggle"
                className={`w-12 h-12 rounded-full flex items-center justify-center border cursor-pointer transition p-0 ${
                  ctx.isMuted
                    ? 'bg-amber-500/20 border-amber-600 text-amber-600'
                    : 'bg-white/[0.06] border-white/[0.08] text-white hover:bg-white/15 hover:scale-[1.03]'
                }`}
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
              <span className="text-[0.65rem] text-slate-400 mt-1 capitalize font-medium">mute</span>
            </div>

            <div className="flex flex-col items-center">
              <button
                id="record"
                className={`w-12 h-12 rounded-full flex items-center justify-center border-none cursor-pointer transition p-0 text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)] ${
                  ctx.isRecording ? 'bg-red-600 animate-[call-pulse-green_1.5s_infinite]' : 'bg-green-600 hover:bg-green-700'
                }`}
                type="button"
                title="Record Response"
                disabled={ctx.isUploading}
                onClick={ctx.startRecording}
              >
                {ctx.isRecording ? (
                  <span className="w-[14px] h-[14px] bg-white rounded-[2px] block" />
                ) : (
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                )}
              </button>
              <span className="text-[0.65rem] text-slate-400 mt-1 capitalize font-bold text-white">speak</span>
            </div>

            <div className="flex flex-col items-center">
              <button
                id="stop"
                className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition p-0 bg-white/10 text-white border border-white/20"
                type="button"
                title="Submit Response"
                disabled={!ctx.isRecording}
                onClick={ctx.stopRecording}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
              <span className="text-[0.65rem] text-slate-400 mt-1 capitalize font-medium">submit</span>
            </div>
          </div>

          {/* End call */}
          <div className="flex justify-center w-full pb-2">
            <button
              id="end-call-btn"
              className="w-14 h-14 rounded-full bg-red-600 text-white border-none flex items-center justify-center cursor-pointer shadow-[0_6px_18px_rgba(239,68,68,0.35)] transition p-0 hover:bg-red-700 hover:scale-[1.03] hover:rotate-[-135deg]"
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
          <div className="absolute inset-0 flex items-center justify-center z-[100] bg-slate-900/40 backdrop-blur-md p-4">
            <div className="bg-[rgba(17,24,39,0.98)] border border-[rgba(99,102,241,0.12)] shadow-[0_8px_32px_0_rgba(15,23,42,0.05)] p-4 rounded-xl w-[90%] max-w-[320px] max-h-[90vh] overflow-hidden flex flex-col animate-[modalScaleUpY_0.4s_cubic-bezier(0.16,1,0.3,1)]">
              <div className="flex justify-between items-center mb-[15px] border-b border-white/10 pb-[10px]">
                <h3 className="text-white m-0 text-[1rem]">🔊 Voice &amp; Speech Settings</h3>
                <button
                  onClick={() => ctx.setSettingsOpen(false)}
                  className="bg-transparent border-none text-slate-400 cursor-pointer text-[1.2rem] outline-none leading-none"
                >
                  &times;
                </button>
              </div>

              <div className="bg-transparent border-none p-0">
                <div className="mb-[15px]">
                  <label className="text-[0.85rem] text-slate-300 block mb-[5px]">Accent &amp; Voice</label>
                  <select
                    value={ctx.selectedVoiceName}
                    onChange={e => ctx.changeVoice(e.target.value)}
                    className="block w-full bg-slate-800 border border-white/15 text-white px-3 py-2 rounded-xl text-[0.85rem] outline-none cursor-pointer"
                  >
                    {ctx.voiceOptions.map(v => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-[15px]">
                  <label className="text-[0.85rem] text-slate-300 block mb-[5px]">Speech Rate</label>
                  <div className="flex gap-[10px] items-center">
                    <input
                      type="range"
                      className="flex-1 block h-[6px] rounded-[3px] bg-white/20 outline-none cursor-pointer accent-indigo-600"
                      min="0.8"
                      max="1.5"
                      step="0.1"
                      value={ctx.speechSpeed}
                      onChange={e => ctx.changeSpeed(parseFloat(e.target.value))}
                    />
                    <span className="font-mono text-[0.85rem] text-slate-300 min-w-[32px]">{ctx.speechSpeed.toFixed(1)}x</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full text-[0.85rem] px-3 py-2 mt-[10px] bg-[rgba(79,70,229,0.25)] border border-[rgba(79,70,229,0.45)] text-white cursor-pointer rounded-md hover:-translate-y-0.5 transition"
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

      {/* Tech modal */}
      {ctx.techModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="bg-[rgba(17,24,39,0.95)] border border-[rgba(99,102,241,0.12)] shadow-[0_8px_32px_0_rgba(15,23,42,0.05)] rounded-xl p-6 max-w-[400px] w-[90%] max-h-[90vh] overflow-hidden flex flex-col animate-[modalScaleUpY_0.4s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="border-b border-white/10 pb-4 mb-5">
              <h3 className="text-white m-0">Start Your Practice Call</h3>
              <div className="mt-[15px]">
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
            <div className="pt-2">
              <button
                id="start-session-btn"
                className="w-full rounded-xl text-[1rem] p-[14px] bg-gradient-to-br from-indigo-600 to-[#4f46e5] text-white border-none shadow-[0_4px_10px_rgba(79,70,229,0.3)] cursor-pointer hover:-translate-y-0.5 transition"
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
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 backdrop-blur-lg py-5 px-5 overflow-y-auto">
          <div className="bg-[rgba(15,23,42,0.98)] border border-white/[0.08] rounded-[20px] p-10 max-w-[500px] w-[90%] text-center shadow-[0_32px_64px_rgba(0,0,0,0.5)] animate-[modalScaleUp_0.5s_cubic-bezier(0.16,1,0.3,1)]">
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
              className="mx-auto block w-fit bg-[#3b82f6] px-6 py-3 rounded-lg text-white border-none cursor-pointer font-bold hover:-translate-y-0.5 transition"
            >
              Return to Home
            </button>
          </div>
        </div>
      )}

      {/* Global loader */}
      {ctx.isLoading && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/50 backdrop-blur-md flex-col gap-3 text-white">
          <div className="w-12 h-12 border-4 border-white/10 rounded-full border-t-indigo-600 animate-spin mb-6" />
          <div className="text-[1.1rem] font-medium text-slate-50">{ctx.loaderMessage}</div>
        </div>
      )}
    </div>
  )
}
