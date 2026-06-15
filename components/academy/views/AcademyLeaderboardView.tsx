'use client'
import type { LeaderboardUser } from '@/lib/types/challenges'

interface Props {
  leaderboard: LeaderboardUser[]
  heatmap: Record<string, number>
  studentEmail: string
}

export default function AcademyLeaderboardView({ leaderboard, heatmap, studentEmail }: Props) {
  return (
    <>
      {/* Skill heatmap */}
      <div className="sidebar-panel mb-[30px]">
        <h3>📈 Your Dispatch Skill Heatmap</h3>
        <p className="text-[0.85rem] text-[var(--text-muted)] mb-5">
          Real-time parameters extracted from your voice calls. Aim to level up your scores across negotiation, composure, and dispatcher accuracy.
        </p>
        <div className="heatmap-grid flex flex-wrap gap-3" id="analytics-heatmap-container">
          {Object.keys(heatmap).length === 0 ? (
            <div className="text-[var(--text-muted)] p-5">Complete challenges to see your skill breakdown.</div>
          ) : Object.entries(heatmap).map(([skill, score]) => (
            <div key={skill} className="heatmap-cell text-center min-w-[100px] bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.2)] rounded-xl px-4 py-[14px]">
              <div className="heatmap-val text-[1.4rem] font-extrabold text-[#818cf8]">{score.toFixed(0)}%</div>
              <div className="heatmap-lbl text-[0.7rem] text-slate-400 mt-1">{skill}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Global leaderboard */}
      <div className="sidebar-panel">
        <h3>🏆 Global Rankings (Top 10 Dispatchers)</h3>
        <div className="leaderboard-list flex flex-col gap-[15px]" id="global-rankings-board-full">
          {leaderboard.length === 0 ? (
            <div className="p-5 text-center text-[var(--text-muted)]">No entries yet. Start practicing!</div>
          ) : leaderboard.slice(0, 10).map((u, i) => {
            const rank = i + 1
            const isSelf = u.email === studentEmail
            return (
              <div key={u.email} className={`leaderboard-item ${rank <= 3 ? 'top-three' : ''} ${isSelf ? 'current-user' : ''}`}>
                <div className={`leaderboard-rank rank-${rank}`}>{rank}</div>
                <div className="leaderboard-user">
                  <span className="user-name">{u.name}{isSelf ? ' (You)' : ''}</span>
                  <span className="user-rank-title">{u.rank}</span>
                </div>
                <div className="leaderboard-xp">{u.xp} XP</div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
