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
      <link rel="stylesheet" href="/css/style.css" />
      <link rel="stylesheet" href="/css/challenges.css" />
      <div className="academy-wrapper">

        {/* Mobile header */}
        <div className="mobile-header hidden">
          <div className="hamburger">☰</div>
          <div className="logo">B2B Academy</div>
        </div>

        {/* Navigation */}
        <nav className="academy-nav">
          <div className="academy-tabs">
            <button
              className={`academy-tab-btn ${ch.view === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNavTab('dashboard')}
            >
              🌐 Academy Hub
            </button>
            <button
              className="academy-tab-btn"
              onClick={() => handleNavTab('dat-simulator')}
            >
              🚛 DAT Simulator
            </button>
            <button
              className={`academy-tab-btn ${ch.view === 'leaderboard' ? 'active' : ''}`}
              onClick={() => handleNavTab('leaderboard')}
            >
              🏆 Rankings &amp; Stats
            </button>
            <button
              className="academy-tab-btn"
              onClick={() => handleNavTab('admin-portal')}
            >
              🏢 Admin Portal
            </button>
          </div>

          <div className="academy-hud">
            <div className="hud-item streak" id="hud-streak-val">🔥 {ch.profile.streak} Days</div>
            <div className="hud-item xp" id="hud-xp-val">{ch.profile.xp} XP</div>
            <button
              className="hud-item !bg-transparent !text-[#ef4444] !border !border-[#ef4444] !cursor-pointer"
              onClick={logout}
            >
              🚪 Logout
            </button>
          </div>
        </nav>

        {/* Main content */}
        <div id="challenges-academy-hub" className={showPractice ? 'hidden' : 'block'}>
          {ch.view === 'dashboard' && (
            <div id="view-dashboard">
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
            </div>
          )}

          {ch.view === 'leaderboard' && (
            <div id="view-leaderboards">
              <AcademyLeaderboardView
                leaderboard={ch.leaderboard}
                heatmap={ch.heatmap}
                studentEmail={ch.profile.email}
              />
            </div>
          )}
        </div>

        {/* Standard practice call (broker mode or standalone) */}
        <div id="standard-practice-wrapper" className={showPractice ? 'block' : 'hidden'}>
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
