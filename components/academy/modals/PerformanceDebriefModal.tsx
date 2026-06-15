'use client'
import type { DebriefData, DebriefRewards } from '@/lib/types/challenges'

interface Props {
  debrief: DebriefData
  rewards: DebriefRewards | null
  onReplay: () => void
  onClose: () => void
}

export default function PerformanceDebriefModal({ debrief, rewards, onReplay, onClose }: Props) {
  return (
    <div className="debrief-overlay fixed inset-0 z-[9800] flex items-center justify-center bg-black/[0.85] backdrop-blur-[8px] p-5">
      <div className="debrief-card bg-[rgba(15,23,42,0.99)] border border-[rgba(99,102,241,0.3)] rounded-[20px] p-7 max-w-[700px] w-full max-h-[90vh] overflow-y-auto">
        <h2 className="mt-0 mb-[5px] text-[1.5rem] text-center text-white">
          🏁 Debriefing Report &amp; Logistics Score
        </h2>
        <div className="text-[0.75rem] text-center text-slate-500 mb-5 tracking-[0.1em] uppercase">
          Dispatcher Assessment Academy Verified
        </div>

        <div className="debrief-body">
          {rewards?.new_badges && rewards.new_badges.length > 0 && rewards.new_badges.map(b => (
            <div key={b.id} className="badge-unlock-banner flex items-center gap-3 bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.2)] rounded-xl px-4 py-3 mb-3">
              <span className="text-[2rem]">{b.icon}</span>
              <div>
                <span className="badge-unlock-title block font-bold text-[#a5b4fc] text-[0.9rem]">
                  🎉 Achievement Unlocked: {b.name}
                </span>
                <span className="badge-unlock-desc text-[0.8rem] text-slate-400">{b.desc}</span>
              </div>
            </div>
          ))}

          <div className="debrief-hero flex justify-center items-center gap-8 mb-6">
            <div className="debrief-score-wheel text-center w-[100px] h-[100px] rounded-full border-[3px] border-[rgba(99,102,241,0.5)] flex flex-col items-center justify-center">
              <div className="score-number text-[2rem] font-black text-[#818cf8]">{debrief.overall_score}</div>
              <div className="score-label text-[0.6rem] text-slate-500 text-center leading-[1.2]">Global Competency Rating</div>
            </div>
            <div className="debrief-rewards-hud flex flex-col gap-[10px]">
              <div className="reward-pill bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.25)] rounded-[10px] px-[14px] py-2 text-center">
                <span className="reward-val xp-val block font-extrabold text-[#4ade80] text-[1.1rem]">+{rewards?.xp_added ?? 100} XP</span>
                <span className="reward-lbl text-[0.7rem] text-slate-400">Added Academy points</span>
              </div>
              <div className="reward-pill bg-[rgba(251,191,36,0.08)] border border-[rgba(251,191,36,0.2)] rounded-[10px] px-[14px] py-2 text-center">
                <span className="reward-val streak-val block font-extrabold text-[#fbbf24] text-[1.1rem]">🔥 {rewards?.streak ?? 1}</span>
                <span className="reward-lbl text-[0.7rem] text-slate-400">Days Active Streak</span>
              </div>
            </div>
          </div>

          <div className="debrief-section mb-5 border-l-4 border-[#6366f1] pl-4">
            <h4 className="text-[#60a5fa] mt-0 mb-2 text-[0.85rem]">🧠 Director&apos;s Assessment</h4>
            <p className="m-0 text-[0.85rem] leading-[1.5] text-slate-300">{debrief.overall_summary}</p>
          </div>

          <div className="debrief-sections-grid grid grid-cols-2 gap-4 mb-4">
            <div className="debrief-section bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.15)] rounded-xl p-4">
              <h4 className="mistakes-title text-[#f87171] mt-0 mb-2 text-[0.8rem]">⚠️ Identified Mistakes / Gaps</h4>
              <ul className="m-0 pl-[18px] text-[0.8rem] text-slate-300 leading-[1.7]">
                {(debrief.mistakes_made || []).map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
            <div className="debrief-section bg-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.15)] rounded-xl p-4">
              <h4 className="suggestions-title text-[#a5b4fc] mt-0 mb-2 text-[0.8rem]">💡 Standard Better Responses</h4>
              <ul className="m-0 pl-[18px] text-[0.8rem] text-slate-300 leading-[1.7]">
                {(debrief.better_responses || []).map((br, i) => <li key={i}>{br}</li>)}
              </ul>
            </div>
          </div>

          <div className="debrief-sections-grid grid grid-cols-2 gap-4">
            <div className="debrief-section bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.15)] rounded-xl p-4">
              <h4 className="practices-title text-[#4ade80] mt-0 mb-2 text-[0.8rem]">📦 Operational Best Practices</h4>
              <ul className="m-0 pl-[18px] text-[0.8rem] text-slate-300 leading-[1.7]">
                {(debrief.dispatcher_best_practices || []).map((bp, i) => <li key={i}>{bp}</li>)}
              </ul>
            </div>
            <div className="debrief-section bg-[rgba(251,191,36,0.05)] border border-[rgba(251,191,36,0.15)] rounded-xl p-4">
              <h4 className="strengths-title text-[#fbbf24] mt-0 mb-2 text-[0.8rem]">📈 Negotiation Optimizations</h4>
              <ul className="m-0 pl-[18px] text-[0.8rem] text-slate-300 leading-[1.7]">
                {(debrief.negotiation_improvements || []).map((ni, i) => <li key={i}>{ni}</li>)}
              </ul>
            </div>
          </div>
        </div>

        <div className="debrief-actions flex gap-3 justify-center mt-6">
          <button className="btn-cancel" onClick={onReplay}>Replay Scenario</button>
          <button className="btn-primary-debrief" onClick={onClose}>Exit Academy Hub</button>
        </div>
      </div>
    </div>
  )
}
