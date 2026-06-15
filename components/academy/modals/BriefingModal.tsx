'use client'
import type { Challenge } from '@/lib/types/challenges'

interface Props {
  challenge: Challenge
  onClose: () => void
  onStart: (id: string) => void
}

export default function BriefingModal({ challenge: ch, onClose, onStart }: Props) {
  return (
    <div className="briefing-overlay fixed inset-0 z-[9000] flex items-center justify-center bg-black/80 backdrop-blur-[6px] p-5">
      <div className="briefing-card bg-[rgba(15,23,42,0.98)] border border-[rgba(99,102,241,0.25)] rounded-[20px] p-7 max-w-[700px] w-full max-h-[90vh] overflow-y-auto">
        <div className="briefing-header flex justify-between items-start mb-6 gap-3">
          <div>
            <span className="company-type text-[0.8rem]">{ch.category} Briefing</span>
            <h2 className="mt-[5px] mb-0 text-white">{ch.title}</h2>
          </div>
          <span className={`difficulty-badge ${ch.difficulty.toLowerCase()} text-[0.8rem] px-[10px] py-1 whitespace-nowrap`}>
            {ch.difficulty} ({ch.xp_reward} XP)
          </span>
        </div>

        <div className="briefing-grid grid grid-cols-2 gap-4 mb-6">
          <div className="briefing-panel">
            <h4>📋 Scenario Objective</h4>
            <p>{ch.scenario_brief}</p>
          </div>
          <div className="briefing-panel">
            <h4>👤 AI Character Dossier</h4>
            <div className="char-profile flex gap-3 mb-3 items-center">
              <div className="char-avatar-box text-[2rem]">🗣️</div>
              <div className="char-details">
                <span className="char-name block font-bold text-white">{ch.character.name}</span>
                <span className="char-role-label text-[0.8rem] text-slate-400">Role: {ch.character.role}</span>
              </div>
            </div>
            <div className="dossier-row flex flex-col gap-1">
              <span className="dossier-label">Personality</span>
              <span className="dossier-val text-[0.75rem] text-slate-400">{ch.character.personality}</span>
            </div>
          </div>
        </div>

        <div className="briefing-actions flex gap-3 justify-end">
          <button className="btn-cancel" onClick={onClose}>Back to Academy</button>
          <button
            className="btn-primary-debrief shadow-[0_4px_15px_rgba(99,102,241,0.45)]"
            onClick={() => onStart(ch.challenge_id)}
          >
            🚀 Connect AI Call Simulation
          </button>
        </div>
      </div>
    </div>
  )
}
