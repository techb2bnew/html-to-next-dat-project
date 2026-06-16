'use client'
import type { LeaderboardUser } from '@/lib/types/challenges'

interface Props {
  leaderboard: LeaderboardUser[]
  heatmap: Record<string, number>
  studentEmail: string
}

const sidebarPanelCls = "bg-white/75 backdrop-blur-xl border border-black/[0.05] rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(15,23,42,0.05)]"
const sidebarPanelTitleCls = "m-0 mb-5 text-[1.15rem] font-bold border-b border-black/[0.06] pb-[10px] flex items-center gap-2 text-slate-900"

function leaderboardItemCls(rank: number, isSelf: boolean) {
  let cls = "flex justify-between items-center bg-black/[0.01] px-[14px] py-[10px] rounded-xl border border-black/[0.03]"
  if (rank <= 3) cls += " border-indigo-500/15"
  if (isSelf) cls += " bg-gradient-to-br from-indigo-500/[0.08] to-indigo-500/[0.02] !border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.08)]"
  return cls
}
function rankColor(rank: number) {
  if (rank === 1) return 'text-amber-700'
  if (rank === 2) return 'text-slate-600'
  if (rank === 3) return 'text-[#b45309]'
  return ''
}

export default function AcademyLeaderboardView({ leaderboard, heatmap, studentEmail }: Props) {
  return (
    <>
      {/* Skill heatmap */}
      <div className={`${sidebarPanelCls} mb-[30px]`}>
        <h3 className={sidebarPanelTitleCls}>📈 Your Dispatch Skill Heatmap</h3>
        <p className="text-[0.85rem] text-slate-600 mb-5">
          Real-time parameters extracted from your voice calls. Aim to level up your scores across negotiation, composure, and dispatcher accuracy.
        </p>
        <div className="flex flex-wrap gap-3">
          {Object.keys(heatmap).length === 0 ? (
            <div className="text-slate-600 p-5">Complete challenges to see your skill breakdown.</div>
          ) : Object.entries(heatmap).map(([skill, score]) => (
            <div key={skill} className="text-center min-w-[100px] bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.2)] rounded-xl px-4 py-[14px]">
              <div className="text-[1.4rem] font-extrabold text-[#818cf8]">{score.toFixed(0)}%</div>
              <div className="text-[0.7rem] text-slate-400 mt-1">{skill}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Global leaderboard */}
      <div className={sidebarPanelCls}>
        <h3 className={sidebarPanelTitleCls}>🏆 Global Rankings (Top 10 Dispatchers)</h3>
        <div className="flex flex-col gap-[15px]">
          {leaderboard.length === 0 ? (
            <div className="p-5 text-center text-slate-600">No entries yet. Start practicing!</div>
          ) : leaderboard.slice(0, 10).map((u, i) => {
            const rank = i + 1
            const isSelf = u.email === studentEmail
            return (
              <div key={u.email} className={leaderboardItemCls(rank, isSelf)}>
                <div className={`font-extrabold text-[0.9rem] w-5 ${rankColor(rank)}`}>{rank}</div>
                <div className="flex flex-col gap-[2px] flex-grow ml-[10px]">
                  <span className="text-[0.85rem] font-semibold text-slate-900">{u.name}{isSelf ? ' (You)' : ''}</span>
                  <span className="text-[0.65rem] text-slate-600">{u.rank}</span>
                </div>
                <div className="font-bold text-[0.8rem] text-sky-600">{u.xp} XP</div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
