'use client'
import type { Challenge } from '@/lib/types/challenges'

interface Props {
  challenge: Challenge
  onClose: () => void
  onStart: (id: string) => void
}

const DIFFICULTY_COLORS: Record<string, string> = {
  rookie: 'bg-green-500/10 text-green-700',
  specialist: 'bg-sky-400/10 text-sky-600',
  expert: 'bg-amber-500/10 text-amber-700',
  commander: 'bg-purple-500/10 text-violet-600',
  master: 'bg-rose-500/10 text-rose-600',
}

const btnCancelCls = "bg-transparent border border-black/10 text-slate-600 px-5 py-[10px] rounded-lg font-semibold text-[0.85rem] cursor-pointer transition hover:text-slate-900 hover:bg-black/[0.03]"
const btnPrimaryCls = "bg-gradient-to-br from-indigo-600 to-[#4f46e5] text-white border-none px-6 py-3 rounded-[10px] text-[0.85rem] font-bold cursor-pointer transition hover:-translate-y-px"

export default function BriefingModal({ challenge: ch, onClose, onStart }: Props) {
  const diffKey = ch.difficulty.toLowerCase()

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/80 backdrop-blur-[6px] p-5 animate-[fadeIn_0.25s_ease-out_forwards]">
      <div className="relative bg-[rgba(15,23,42,0.98)] border border-[rgba(99,102,241,0.25)] rounded-[20px] p-7 max-w-[700px] w-full max-h-[90vh] overflow-y-auto shadow-[0_8px_32px_0_rgba(15,23,42,0.05)] animate-[slideUp_0.35s_cubic-bezier(0.16,1,0.3,1)_forwards]">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-600 to-violet-600" />

        <div className="flex justify-between items-start mb-6 gap-3">
          <div>
            <span className="text-[0.8rem] font-bold text-sky-600 uppercase tracking-[0.05em]">{ch.category} Briefing</span>
            <h2 className="mt-[5px] mb-0 text-white">{ch.title}</h2>
          </div>
          <span className={`font-extrabold uppercase rounded tracking-[0.05em] text-[0.8rem] px-[10px] py-1 whitespace-nowrap ${DIFFICULTY_COLORS[diffKey] ?? 'bg-black/[0.04] text-slate-400'}`}>
            {ch.difficulty} ({ch.xp_reward} XP)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black/[0.01] border border-black/[0.04] rounded-xl p-4">
            <h4 className="text-[0.8rem] text-sky-600 uppercase tracking-[0.05em] m-0 mb-[10px] flex items-center gap-2">📋 Scenario Objective</h4>
            <p className="m-0 text-[0.85rem] leading-[1.45] text-slate-300">{ch.scenario_brief}</p>
          </div>
          <div className="bg-black/[0.01] border border-black/[0.04] rounded-xl p-4">
            <h4 className="text-[0.8rem] text-sky-600 uppercase tracking-[0.05em] m-0 mb-[10px] flex items-center gap-2">👤 AI Character Dossier</h4>
            <div className="flex gap-3 mb-3 items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-[2rem] text-white">🗣️</div>
              <div className="flex flex-col gap-[2px]">
                <span className="block font-bold text-white text-[0.9rem]">{ch.character.name}</span>
                <span className="text-[0.8rem] text-slate-400">Role: {ch.character.role}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[0.65rem] text-slate-500 uppercase font-bold">Personality</span>
              <span className="text-[0.75rem] text-slate-400">{ch.character.personality}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button className={btnCancelCls} onClick={onClose}>Back to Academy</button>
          <button
            className={`${btnPrimaryCls} shadow-[0_4px_15px_rgba(99,102,241,0.45)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.6)]`}
            onClick={() => onStart(ch.challenge_id)}
          >
            🚀 Connect AI Call Simulation
          </button>
        </div>
      </div>
    </div>
  )
}
