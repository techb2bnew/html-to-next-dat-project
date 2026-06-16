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

const DIFFICULTY_COLORS: Record<string, string> = {
  rookie: 'bg-green-500/10 text-green-700',
  specialist: 'bg-sky-400/10 text-sky-600',
  expert: 'bg-amber-500/10 text-amber-700',
  commander: 'bg-purple-500/10 text-violet-600',
  master: 'bg-rose-500/10 text-rose-600',
}
const difficultyBadgeCls = "font-extrabold uppercase rounded tracking-[0.05em] text-[0.65rem] px-2 py-[3px]"
const sidebarPanelCls = "bg-white/75 backdrop-blur-xl border border-black/[0.05] rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(15,23,42,0.05)]"
const sidebarPanelTitleCls = "m-0 mb-5 text-[1.15rem] font-bold border-b border-black/[0.06] pb-[10px] flex items-center gap-2 text-slate-900"
const btnPrimaryCls = "bg-gradient-to-br from-indigo-600 to-[#4f46e5] text-white border-none px-4 py-[10px] rounded-[10px] text-[0.85rem] font-bold cursor-pointer transition hover:-translate-y-px"

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
      <div className="bg-gradient-to-br from-indigo-100 to-purple-100 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-[30px] mb-10 flex justify-between items-center relative overflow-hidden shadow-[0_10px_40px_rgba(168,85,247,0.05)] flex-wrap gap-4">
        <div>
          <h2 className="font-black [text-shadow:0px_1px_2px_rgba(0,0,0,0.1)] text-[#1e1b4b] m-0 mb-[10px] text-[1.6rem] font-extrabold flex items-center gap-[10px]">
            <span className="text-white text-[0.7rem] uppercase font-bold px-[10px] py-1 rounded-full tracking-[0.1em]">Daily Challenge</span>
            <span>{dailyChallenge?.title ?? 'Negotiate $3,200 Reefer Load Under High Pressure'}</span>
          </h2>
          <p className="text-[#222] font-medium text-[1.05rem] m-0 max-w-[700px] leading-[1.5]">
            {dailyChallenge?.description ?? 'Salinas produce market is boiling. Manny from Salinas Hub has a load of continuous temp -2°F berries to Philly. Challenge your rate negotiation skills, handle his strict requirements, and claim double points today!'}
          </p>
        </div>
        <div className="flex gap-[10px] flex-col items-end">
          <button
            className={`${btnPrimaryCls} shadow-[0_4px_20px_rgba(168,85,247,0.45)] bg-gradient-to-br from-violet-600 to-indigo-600 px-6 py-3`}
            onClick={() => onOpenBriefing(dailyChallenge?.challenge_id ?? 'ch_find_load')}
          >
            Accept Challenge ⚡
          </button>
          <button
            className={`${btnPrimaryCls} bg-[rgba(168,85,247,0.1)] text-[#1e1b4b] px-4 py-2 rounded-lg text-[0.85rem] shadow-none border border-[rgba(168,85,247,0.3)]`}
            onClick={onGenerateNewDaily}
            disabled={dailyLoading}
          >
            {dailyLoading ? 'Generating... ⏳' : 'Regenerate 🔄'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2.8fr_1.2fr] gap-[30px]">
        {/* Left: Challenges grid */}
        <div>
          <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
            <h3 className="text-[1.3rem] font-bold tracking-[0.02em] m-0">Dispatcher Practice Directory</h3>
            <div className="flex gap-2 overflow-x-auto pb-[6px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`bg-black/[0.02] border text-[0.75rem] font-semibold cursor-pointer whitespace-nowrap px-[14px] py-[6px] rounded-full transition ${
                    categoryFilter === cat
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                      : 'border-black/[0.06] text-slate-600 hover:text-indigo-600 hover:bg-indigo-500/5'
                  }`}
                  onClick={() => onFilterCategory(cat)}
                >
                  {cat === 'ALL' ? 'ALL SCENARIOS' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5 mb-10">
            {challengesLoading && (
              <div className="col-span-full flex items-center justify-center gap-3 py-10 text-slate-600 text-sm">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" /> Loading Challenges...
              </div>
            )}
            {!challengesLoading && filtered.length === 0 && (
              <div className="text-center p-10 text-slate-600 col-span-full">
                No challenges found in this logistics category.
              </div>
            )}
            {filtered.map(ch => {
              const bestScoreStr = ch.best_score > 0 ? `${(ch.best_score * 10).toFixed(0)}/100` : 'No attempts yet'
              const diffKey = ch.difficulty.toLowerCase()
              return (
                <div
                  key={ch.challenge_id}
                  className={`relative overflow-hidden bg-white/75 backdrop-blur-xl border border-black/[0.05] rounded-[18px] p-5 flex flex-col justify-between min-h-[250px] transition shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:-translate-y-[5px] hover:border-indigo-500/25 hover:shadow-[0_12px_30px_rgba(99,102,241,0.08)] ${
                    ch.locked ? 'grayscale-[0.8] opacity-[0.65] cursor-not-allowed pointer-events-none' : ''
                  }`}
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sky-600 to-indigo-600 opacity-75" />
                  {ch.locked && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/95 border border-white/10 rounded-lg px-4 py-2 text-[0.75rem] font-bold text-slate-400">
                      🔒 LOCKED
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[0.7rem] font-bold text-sky-600 uppercase tracking-[0.05em]">{ch.company_type}</span>
                    <div className="flex gap-[5px] items-center">
                      {ch.completed && (
                        <span className={`${difficultyBadgeCls} bg-[rgba(16,185,129,0.15)] text-green-700`}>✓ COMPLETED</span>
                      )}
                      <span className={`${difficultyBadgeCls} ${DIFFICULTY_COLORS[diffKey] ?? 'bg-black/[0.04] text-slate-400'}`}>{ch.difficulty}</span>
                    </div>
                  </div>
                  <h4 className="m-0 mb-2 text-[1.15rem] font-bold leading-[1.3] text-slate-900">{ch.title}</h4>
                  <p className="m-0 mb-4 text-[0.8rem] text-slate-600 leading-[1.45] flex-1">{ch.description}</p>
                  <div className="flex flex-wrap gap-[6px] mb-4">
                    {ch.skill_tags.map(t => <span key={t} className="bg-black/[0.02] border border-black/[0.04] text-slate-700 text-[0.65rem] font-semibold px-[6px] py-[2px] rounded">{t}</span>)}
                  </div>
                  <div className="flex flex-col gap-3 border-t border-black/[0.04] pt-[14px] mt-auto">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-[6px] text-[0.75rem] text-slate-600"><span className="text-[0.85rem]">⏱️</span> <span>Est: <strong>{ch.duration}</strong></span></div>
                      <div className="flex items-center gap-[6px] text-[0.75rem] text-slate-600"><span className="text-[0.85rem]">🏆</span> <span>Best: <strong>{bestScoreStr}</strong></span></div>
                      <div className="flex items-center gap-[6px] text-[0.75rem] text-slate-600"><span className="text-[0.85rem]">📞</span> <span>Attempts: <strong>{ch.attempts_count || 0}</strong></span></div>
                    </div>
                    <button
                      className="bg-gradient-to-br from-indigo-600 to-[#4f46e5] text-white border-none px-4 py-[10px] rounded-[10px] text-[0.8rem] font-bold cursor-pointer transition shadow-[0_4px_10px_rgba(79,70,229,0.25)] w-full flex items-center justify-center gap-[6px] hover:shadow-[0_6px_15px_rgba(79,70,229,0.4)] hover:-translate-y-[1.5px]"
                      onClick={() => onOpenBriefing(ch.challenge_id)}
                    >
                      Practice Scenario
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="lg:sticky lg:top-[95px] lg:self-start flex flex-col gap-5">
          {/* Leaderboard */}
          <div className={sidebarPanelCls}>
            <h3 className={sidebarPanelTitleCls}>🏆 Weekly Dispatch Leaderboard</h3>
            <div className="flex flex-col gap-3">
              {leaderboard.length === 0 ? (
                <div className="p-5 text-center text-slate-600">No entries yet. Start practicing!</div>
              ) : leaderboard.slice(0, 5).map((u, i) => {
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

          {/* Badges */}
          <div className={sidebarPanelCls}>
            <h3 className={sidebarPanelTitleCls}>🎖️ Completed Achievements</h3>
            <div className="flex flex-wrap gap-[10px]">
              {badgeDefs.map(b => {
                const unlocked = studentBadges.includes(b.id)
                return (
                  <div
                    key={b.id}
                    className={`flex flex-col items-center gap-[6px] relative text-center px-[14px] py-[10px] rounded-[10px] cursor-default ${unlocked ? 'unlocked border border-[rgba(99,102,241,0.4)] bg-[rgba(99,102,241,0.08)] opacity-100' : 'locked border border-white/[0.06] bg-white/[0.02] opacity-45'}`}
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
            <div className={sidebarPanelCls}>
              <h3 className={sidebarPanelTitleCls}>🕒 Recent Practice Log</h3>
              <div className="flex flex-col gap-[10px]">
                {recentActivity.map((att, i) => {
                  const score = att.score || 0
                  const scoreColor = score >= 8.5 ? '#15803d' : score >= 6.5 ? '#b45309' : '#e11d48'
                  return (
                    <div key={i} className="flex justify-between items-center bg-black/[0.01] px-[14px] py-[10px] rounded-xl border border-black/[0.03]">
                      <div className="flex flex-col gap-[2px]">
                        <span className="text-[0.8rem] font-bold text-[#0f172a]">{att.challenge_title || 'Practice Call'}</span>
                        <span className="text-[0.65rem] text-slate-600">{att.created_at_str || 'Just now'}</span>
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
