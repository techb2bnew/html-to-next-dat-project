'use client'
import { useChallenges } from '@/lib/hooks/useChallenges'
import { usePracticeCall } from '@/lib/hooks/usePracticeCall'
import ProfileSetupModal from '@/components/academy/modals/ProfileSetupModal'
import BriefingModal from '@/components/academy/modals/BriefingModal'
import CockpitHUD from '@/components/academy/modals/CockpitHUD'
import PerformanceDebriefModal from '@/components/academy/modals/PerformanceDebriefModal'
import AcademyDashboardView from '@/components/academy/views/AcademyDashboardView'
import AcademyLeaderboardView from '@/components/academy/views/AcademyLeaderboardView'
import PracticeCallPanel from '@/components/academy/PracticeCallPanel'

const tabCls = "bg-transparent border border-transparent text-slate-600 px-[18px] py-[10px] rounded-[10px] font-semibold text-[0.9rem] cursor-pointer transition flex items-center gap-2 hover:text-indigo-600 hover:bg-indigo-500/5"
const tabActiveCls = "text-indigo-600 bg-gradient-to-br from-indigo-500/10 to-indigo-500/[0.03] border-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
const hudItemCls = "flex items-center gap-2 bg-black/[0.02] px-[14px] py-[6px] rounded-full border border-black/[0.04] text-[0.85rem] font-semibold whitespace-nowrap"

export default function AcademyApp() {
  const ch = useChallenges()
  const pc = usePracticeCall()

  // Show practice mode (phone panel) when broker mode is active or user navigates to it
  const showPractice = pc.isBrokerMode

  function handleNavTab(view: string) {
    if (view === 'dat-simulator') {
      window.open('/dat-simulator', '_blank', 'noopener')
      return
    }
    if (view === 'admin-portal') {
      window.open('/admin', '_blank', 'noopener')
      return
    }
    if (view === 'practice-mode') {
      pc.openTechModal()
      return
    }
    ch.switchView(view as any)
  }

  function logout() {
    localStorage.removeItem('academy_email')
    localStorage.removeItem('academy_name')
    localStorage.removeItem('sim_academy_email')
    localStorage.removeItem('sim_academy_name')
    localStorage.removeItem('studentEmail')
    localStorage.removeItem('studentName')
    window.location.reload()
  }

  return (
    <>
      <div className="w-full max-w-[1280px] mx-auto px-5 pt-5 pb-[120px] box-border font-[Inter,sans-serif] text-slate-900">

        {/* Mobile header */}
        <div className="hidden max-[1024px]:flex items-center p-[15px] bg-slate-900 text-white text-xl fixed top-0 left-0 w-full z-[999] shadow-[0_2px_5px_rgba(0,0,0,0.2)]">
          <div className="cursor-pointer mr-[15px] p-[5px]">☰</div>
          <div>B2B Academy</div>
        </div>

        {/* Navigation */}
        <nav className="flex justify-between items-center bg-white/70 backdrop-blur-xl border border-black/[0.06] rounded-2xl px-6 py-3 mb-[30px] shadow-[0_8px_32px_0_rgba(15,23,42,0.05)] z-10 sticky top-[15px] flex-wrap gap-3">
          <div className="flex gap-2 flex-wrap">
            <button
              className={`${tabCls} ${ch.view === 'dashboard' ? tabActiveCls : ''}`}
              onClick={() => handleNavTab('dashboard')}
            >
              🌐 Academy Hub
            </button>
            <button
              className={tabCls}
              onClick={() => handleNavTab('dat-simulator')}
            >
              🚛 DAT Simulator
            </button>
            <button
              className={`${tabCls} ${ch.view === 'leaderboard' ? tabActiveCls : ''}`}
              onClick={() => handleNavTab('leaderboard')}
            >
              🏆 Rankings &amp; Stats
            </button>
            <button
              className={tabCls}
              onClick={() => handleNavTab('admin-portal')}
            >
              🏢 Admin Portal
            </button>
          </div>

          <div className="flex items-center gap-5">
            <div className={`${hudItemCls} border-amber-500/30 text-amber-700`}>🔥 {ch.profile.streak} Days</div>
            <div className={`${hudItemCls} border-sky-400/30 text-sky-600`}>{ch.profile.xp} XP</div>
            <button
              className={`${hudItemCls} !bg-transparent !text-[#ef4444] !border !border-[#ef4444] !cursor-pointer`}
              onClick={logout}
            >
              🚪 Logout
            </button>
          </div>
        </nav>

        {/* Main content */}
        <div className={showPractice ? 'hidden' : 'block'}>
          {ch.view === 'dashboard' && (
            <AcademyDashboardView
              challenges={ch.challenges}
              challengesLoading={ch.challengesLoading}
              categoryFilter={ch.categoryFilter}
              onFilterCategory={ch.setCategoryFilter}
              dailyChallenge={ch.dailyChallenge}
              dailyLoading={ch.dailyLoading}
              onGenerateNewDaily={ch.generateNewDaily}
              onOpenBriefing={ch.openBriefing}
              leaderboard={ch.leaderboard}
              studentEmail={ch.profile.email}
              badgeDefs={ch.BADGE_DEFS}
              studentBadges={ch.profile.badges}
              recentActivity={ch.recentActivity}
            />
          )}

          {ch.view === 'leaderboard' && (
            <AcademyLeaderboardView
              leaderboard={ch.leaderboard}
              heatmap={ch.heatmap}
              studentEmail={ch.profile.email}
            />
          )}
        </div>

        {/* Standard practice call (broker mode or standalone) */}
        <div className={showPractice ? 'block' : 'hidden'}>
          <PracticeCallPanel ctx={pc} />
        </div>

      </div>

      {/* Profile setup */}
      {ch.showProfileSetup && (
        <ProfileSetupModal
          name={ch.profileSetupName}
          email={ch.profileSetupEmail}
          onNameChange={ch.setProfileSetupName}
          onEmailChange={ch.setProfileSetupEmail}
          onSave={ch.saveProfile}
        />
      )}

      {/* Briefing modal */}
      {ch.briefingOpen && ch.selectedChallenge && (
        <BriefingModal
          challenge={ch.selectedChallenge}
          onClose={ch.closeBriefing}
          onStart={ch.startChallenge}
        />
      )}

      {/* Cockpit HUD */}
      {ch.cockpit.isOpen && (
        <CockpitHUD
          cockpit={ch.cockpit}
          onToggleMic={ch.toggleMicrophone}
          onSubmitText={ch.submitTextResponse}
          onDecline={ch.declineCall}
          onToggleMute={ch.toggleTtsMute}
          audioRef={ch.audioRef}
        />
      )}

      {/* Debrief modal */}
      {ch.debrief.isOpen && ch.debrief.debrief && (
        <PerformanceDebriefModal
          debrief={ch.debrief.debrief}
          rewards={ch.debrief.rewards}
          onReplay={ch.replayChallenge}
          onClose={ch.closeDebrief}
        />
      )}
    </>
  )
}
