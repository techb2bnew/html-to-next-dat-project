'use client'
import type { DebriefData, DebriefRewards } from '@/lib/types/challenges'

interface Props {
  debrief: DebriefData
  rewards: DebriefRewards | null
  onReplay: () => void
  onClose: () => void
}

const btnCancelCls = "bg-transparent border border-black/10 text-slate-600 px-5 py-[10px] rounded-lg font-semibold text-[0.85rem] cursor-pointer transition hover:text-slate-900 hover:bg-black/[0.03]"
const btnPrimaryCls = "bg-gradient-to-br from-indigo-600 to-[#4f46e5] text-white border-none px-6 py-3 rounded-[10px] text-[0.85rem] font-bold cursor-pointer transition hover:-translate-y-px"

export default function PerformanceDebriefModal({ debrief, rewards, onReplay, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[9800] flex items-center justify-center bg-black/[0.85] backdrop-blur-[8px] p-5 animate-[fadeIn_0.3s_ease-out_forwards]">
      <div className="relative bg-[rgba(15,23,42,0.99)] border border-[rgba(99,102,241,0.3)] rounded-[20px] p-7 max-w-[700px] w-full max-h-[90vh] overflow-y-auto shadow-[0_8px_32px_0_rgba(15,23,42,0.05)]">
        <h2 className="mt-0 mb-[5px] text-[1.5rem] text-center text-white">
          🏁 Debriefing Report &amp; Logistics Score
        </h2>
        <div className="text-[0.75rem] text-center text-slate-500 mb-5 tracking-[0.1em] uppercase">
          Dispatcher Assessment Academy Verified
        </div>

        <div>
          {rewards?.new_badges && rewards.new_badges.length > 0 && rewards.new_badges.map(b => (
            <div key={b.id} className="flex items-center gap-3 bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.2)] rounded-xl px-4 py-3 mb-3 animate-[slideUp_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]">
              <span className="text-[2rem]">{b.icon}</span>
              <div>
                <span className="block font-bold text-[#a5b4fc] text-[0.9rem]">
                  🎉 Achievement Unlocked: {b.name}
                </span>
                <span className="text-[0.8rem] text-slate-400">{b.desc}</span>
              </div>
            </div>
          ))}

          <div className="flex justify-center items-center gap-8 mb-6">
            <div className="text-center w-[100px] h-[100px] rounded-full border-[3px] border-[rgba(99,102,241,0.5)] flex flex-col items-center justify-center">
              <div className="text-[2rem] font-black text-[#818cf8]">{debrief.overall_score}</div>
              <div className="text-[0.6rem] text-slate-500 text-center leading-[1.2]">Global Competency Rating</div>
            </div>
            <div className="flex flex-col gap-[10px]">
              <div className="flex flex-col gap-1 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.25)] rounded-[10px] px-[14px] py-2 text-center">
                <span className="block font-extrabold text-[#4ade80] text-[1.1rem]">+{rewards?.xp_added ?? 100} XP</span>
                <span className="text-[0.7rem] text-slate-400">Added Academy points</span>
              </div>
              <div className="flex flex-col gap-1 bg-[rgba(251,191,36,0.08)] border border-[rgba(251,191,36,0.2)] rounded-[10px] px-[14px] py-2 text-center">
                <span className="block font-extrabold text-[#fbbf24] text-[1.1rem]">🔥 {rewards?.streak ?? 1}</span>
                <span className="text-[0.7rem] text-slate-400">Days Active Streak</span>
              </div>
            </div>
          </div>

          <div className="mb-5 border-l-4 border-[#6366f1] pl-4 bg-black/[0.01] rounded-[14px] p-[18px]">
            <h4 className="text-[#60a5fa] mt-0 mb-2 text-[0.85rem] uppercase tracking-[0.05em] flex items-center gap-2">🧠 Director&apos;s Assessment</h4>
            <p className="m-0 text-[0.85rem] leading-[1.5] text-slate-300">{debrief.overall_summary}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.15)] rounded-xl p-4">
              <h4 className="text-[#f87171] mt-0 mb-2 text-[0.8rem] uppercase tracking-[0.05em] flex items-center gap-2">⚠️ Identified Mistakes / Gaps</h4>
              <ul className="m-0 pl-[18px] text-[0.8rem] text-slate-300 leading-[1.7]">
                {(debrief.mistakes_made || []).map((m, i) => <li key={i} className="mb-2">{m}</li>)}
              </ul>
            </div>
            <div className="bg-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.15)] rounded-xl p-4">
              <h4 className="text-[#a5b4fc] mt-0 mb-2 text-[0.8rem] uppercase tracking-[0.05em] flex items-center gap-2">💡 Standard Better Responses</h4>
              <ul className="m-0 pl-[18px] text-[0.8rem] text-slate-300 leading-[1.7]">
                {(debrief.better_responses || []).map((br, i) => <li key={i} className="mb-2">{br}</li>)}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.15)] rounded-xl p-4">
              <h4 className="text-[#4ade80] mt-0 mb-2 text-[0.8rem] uppercase tracking-[0.05em] flex items-center gap-2">📦 Operational Best Practices</h4>
              <ul className="m-0 pl-[18px] text-[0.8rem] text-slate-300 leading-[1.7]">
                {(debrief.dispatcher_best_practices || []).map((bp, i) => <li key={i} className="mb-2">{bp}</li>)}
              </ul>
            </div>
            <div className="bg-[rgba(251,191,36,0.05)] border border-[rgba(251,191,36,0.15)] rounded-xl p-4">
              <h4 className="text-[#fbbf24] mt-0 mb-2 text-[0.8rem] uppercase tracking-[0.05em] flex items-center gap-2">📈 Negotiation Optimizations</h4>
              <ul className="m-0 pl-[18px] text-[0.8rem] text-slate-300 leading-[1.7]">
                {(debrief.negotiation_improvements || []).map((ni, i) => <li key={i} className="mb-2">{ni}</li>)}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center mt-6">
          <button className={btnCancelCls} onClick={onReplay}>Replay Scenario</button>
          <button className={btnPrimaryCls} onClick={onClose}>Exit Academy Hub</button>
        </div>
      </div>
    </div>
  )
}
