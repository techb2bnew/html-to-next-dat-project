'use client'
import type { Challenge, DailyChallenge, LeaderboardUser, RecentAttempt, StudentProfile } from '@/lib/types/challenges'

interface Props {
  challenges: Challenge[]
  challengesLoading: boolean
  categoryFilter: string
  onFilterCategory: (cat: string) => void
  dailyChallenge: DailyChallenge | null
  dailyLoading: boolean
  onGenerateNewDaily: () => void
  onOpenBriefing: (id: string) => void
  leaderboard: LeaderboardUser[]
  studentEmail: string
  badgeDefs: Array<{ id: string; name: string; desc: string; icon: string }>
  studentBadges: string[]
  recentActivity: RecentAttempt[]
}

const CATEGORIES = ['ALL', 'BROKER NEGOTIATION', 'DRIVER MANAGEMENT', 'CRISIS MANAGEMENT', 'CUSTOMER SUPPORT']

export default function AcademyDashboardView({
  challenges,
  challengesLoading,
  categoryFilter,
  onFilterCategory,
  dailyChallenge,
  dailyLoading,
  onGenerateNewDaily,
  onOpenBriefing,
  leaderboard,
  studentEmail,
  badgeDefs,
  studentBadges,
  recentActivity,
}: Props) {
  const filtered = categoryFilter === 'ALL'
    ? challenges
    : challenges.filter(ch => ch.category === categoryFilter)

  return (
    <>
      {/* Daily challenge banner */}
      <div className="daily-challenge-banner">
        <div className="daily-content">
          <h2 className="text-white font-black [text-shadow:0px_1px_2px_rgba(0,0,0,0.1)]">
            <span className="daily-tag">Daily Challenge</span>
            <span>{dailyChallenge?.title ?? 'Negotiate $3,200 Reefer Load Under High Pressure'}</span>
          </h2>
          <p className="text-[#222] font-medium text-[1.05rem]">
            {dailyChallenge?.description ?? 'Salinas produce market is boiling. Manny from Salinas Hub has a load of continuous temp -2°F berries to Philly. Challenge your rate negotiation skills, handle his strict requirements, and claim double points today!'}
          </p>
        </div>
        <div className="flex gap-[10px] flex-col items-end">
          <button
            className="btn-primary-debrief shadow-[0_4px_20px_rgba(168,85,247,0.45)] bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-indigo)] px-6 py-3"
            onClick={() => onOpenBriefing(dailyChallenge?.challenge_id ?? 'ch_find_load')}
          >
            Accept Challenge ⚡
          </button>
          <button
            className="btn-primary-debrief bg-[rgba(168,85,247,0.1)] text-[#1e1b4b] px-4 py-2 rounded-lg text-[0.85rem] shadow-none border border-[rgba(168,85,247,0.3)]"
            onClick={onGenerateNewDaily}
            disabled={dailyLoading}
          >
            {dailyLoading ? 'Generating... ⏳' : 'Regenerate 🔄'}
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left: Challenges grid */}
        <div>
          <div className="section-header">
            <h3>Dispatcher Practice Directory</h3>
            <div className="category-filters">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`filter-chip ${categoryFilter === cat ? 'active' : ''}`}
                  onClick={() => onFilterCategory(cat)}
                >
                  {cat === 'ALL' ? 'ALL SCENARIOS' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="challenges-grid" id="challenges-grid-container">
            {challengesLoading && (
              <div className="loading-state col-span-full">
                <div className="spinner" /> Loading Challenges...
              </div>
            )}
            {!challengesLoading && filtered.length === 0 && (
              <div className="text-center p-10 text-[var(--text-muted)] col-span-full">
                No challenges found in this logistics category.
              </div>
            )}
            {filtered.map(ch => {
              const bestScoreStr = ch.best_score > 0 ? `${(ch.best_score * 10).toFixed(0)}/100` : 'No attempts yet'
              return (
                <div key={ch.challenge_id} className={`challenge-card ${ch.locked ? 'locked' : ''}`}>
                  <div className="card-header-meta">
                    <span className="company-type">{ch.company_type}</span>
                    <div className="flex gap-[5px] items-center">
                      {ch.completed && (
                        <span className="difficulty-badge bg-[rgba(16,185,129,0.15)] text-[var(--neon-green)]">✓ COMPLETED</span>
                      )}
                      <span className={`difficulty-badge ${ch.difficulty.toLowerCase()}`}>{ch.difficulty}</span>
                    </div>
                  </div>
                  <h4 className="challenge-title">{ch.title}</h4>
                  <p className="challenge-desc">{ch.description}</p>
                  <div className="skill-tags">
                    {ch.skill_tags.map(t => <span key={t} className="skill-tag">{t}</span>)}
                  </div>
                  <div className="card-footer">
                    <div className="challenge-stats">
                      <div className="stat-row"><span className="stat-icon">⏱️</span> <span>Est: <strong>{ch.duration}</strong></span></div>
                      <div className="stat-row"><span className="stat-icon">🏆</span> <span>Best: <strong>{bestScoreStr}</strong></span></div>
                      <div className="stat-row"><span className="stat-icon">📞</span> <span>Attempts: <strong>{ch.attempts_count || 0}</strong></span></div>
                    </div>
                    <button className="btn-start-challenge" onClick={() => onOpenBriefing(ch.challenge_id)}>
                      Practice Scenario
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div>
          {/* Leaderboard */}
          <div className="sidebar-panel">
            <h3>🏆 Weekly Dispatch Leaderboard</h3>
            <div className="leaderboard-list" id="weekly-leaderboard-list">
              {leaderboard.length === 0 ? (
                <div className="p-5 text-center text-[var(--text-muted)]">No entries yet. Start practicing!</div>
              ) : leaderboard.slice(0, 5).map((u, i) => {
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

          {/* Badges */}
          <div className="sidebar-panel">
            <h3>🎖️ Completed Achievements</h3>
            <div className="badges-showcase flex flex-wrap gap-[10px]" id="weekly-badges-grid">
              {badgeDefs.map(b => {
                const unlocked = studentBadges.includes(b.id)
                return (
                  <div
                    key={b.id}
                    className={`badge-cell text-center px-[14px] py-[10px] rounded-[10px] cursor-default ${unlocked ? 'unlocked border border-[rgba(99,102,241,0.4)] bg-[rgba(99,102,241,0.08)] opacity-100' : 'locked border border-white/[0.06] bg-white/[0.02] opacity-45'}`}
                    title={`${b.name}: ${b.desc}`}
                  >
                    <div className="text-[1.5rem]">{b.icon}</div>
                    <span className={`text-[0.65rem] block mt-1 ${unlocked ? 'text-[#a5b4fc]' : 'text-slate-500'}`}>{b.name}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent activity */}
          {recentActivity.length > 0 && (
            <div className="sidebar-panel" id="recent-activity-panel">
              <h3>🕒 Recent Practice Log</h3>
              <div className="activity-list flex flex-col gap-[10px]">
                {recentActivity.map((att, i) => {
                  const score = att.score || 0
                  const scoreColor = score >= 8.5 ? 'var(--neon-green)' : score >= 6.5 ? 'var(--neon-amber)' : 'var(--neon-red)'
                  return (
                    <div key={i} className="flex justify-between items-center bg-black/[0.01] px-[14px] py-[10px] rounded-xl border border-black/[0.03]">
                      <div className="flex flex-col gap-[2px]">
                        <span className="text-[0.8rem] font-bold text-[#0f172a]">{att.challenge_title || 'Practice Call'}</span>
                        <span className="text-[0.65rem] text-[var(--text-muted)]">{att.created_at_str || 'Just now'}</span>
                      </div>
                      <div className="font-extrabold text-[0.85rem] bg-black/[0.02] px-2 py-1 rounded-md" style={{ color: scoreColor }}>
                        {score}/10
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
