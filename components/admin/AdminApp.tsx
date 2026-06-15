'use client'
import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  AdminTab, StudentModalTab, AdminSession, Challenge,
  Analytics, DatResult, DatLeaderboardEntry, LiveActivity,
  LiveStudent, StudentSimData, GradeRow,
} from '@/lib/types/admin';
import {
  adminLogin, fetchSubmissions, fetchSubmissionDetail, generateAISummary,
  saveGradeApi, sendFinalResultsApi, deleteSubmissionApi, clearAllSessionsApi,
  fetchChallengesApi, deleteChallengeApi, fetchAnalyticsApi, fetchSimLiveApi,
  fetchStudentProfileApi, triggerStudentAiReviewApi, fetchDatResultsApi,
  getReportUrl,
} from '@/lib/api/admin';
import { getApiBase } from '@/lib/config';

import LoginOverlay from './LoginOverlay';
import AdminHeader from './AdminHeader';
import AdminTabBar from './AdminTabBar';
import SubmissionsTab from './tabs/SubmissionsTab';
import ChallengesTab from './tabs/ChallengesTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import DatTab from './tabs/DatTab';
import LiveActivityTab from './tabs/LiveActivityTab';
import EvalModal from './modals/EvalModal';
import StudentModal from './modals/StudentModal';
import TranscriptModal from './modals/TranscriptModal';
import EmailModal from './modals/EmailModal';
import DatEvalModal from './modals/DatEvalModal';

const SESSION_STORAGE_KEY = 'admin_token';
const USER_STORAGE_KEY = 'admin_user';

export default function AdminApp() {
  // --- Auth ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [adminUser, setAdminUser] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // --- Tab ---
  const [activeTab, setActiveTab] = useState<AdminTab>('submissions');

  // --- Submissions ---
  const [submissions, setSubmissions] = useState<AdminSession[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [subsError, setSubsError] = useState('');

  // --- Eval modal ---
  const [evalOpen, setEvalOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState<AdminSession | null>(null);
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [improvements, setImprovements] = useState('');
  const [aiSummaryHtml, setAiSummaryHtml] = useState('');
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);

  const totalScore = grades.reduce((sum, g) => sum + (Number(g.score) || 0), 0);

  // --- Challenges ---
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengesLoading, setChallengesLoading] = useState(false);

  // --- Analytics ---
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // --- DAT ---
  const [datResults, setDatResults] = useState<DatResult[]>([]);
  const [datLeaderboard, setDatLeaderboard] = useState<DatLeaderboardEntry[]>([]);
  const [datLoading, setDatLoading] = useState(false);

  // --- DAT eval modal ---
  const [datEvalOpen, setDatEvalOpen] = useState(false);
  const [datEvalData, setDatEvalData] = useState<Record<string, any>>({});

  // --- Live activity ---
  const [liveActivities, setLiveActivities] = useState<LiveActivity[]>([]);
  const [liveStudents, setLiveStudents] = useState<LiveStudent[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Student modal ---
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [studentData, setStudentData] = useState<StudentSimData | null>(null);
  const [studentModalTab, setStudentModalTab] = useState<StudentModalTab>('overview');
  const [studentModalLoading, setStudentModalLoading] = useState(false);
  const [currentStudentEmail, setCurrentStudentEmail] = useState('');

  // --- Sub-modals ---
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [transcriptTitle, setTranscriptTitle] = useState('');
  const [transcriptHtml, setTranscriptHtml] = useState('');
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTitle, setEmailTitle] = useState('');
  const [emailHtml, setEmailHtml] = useState('');

  // ── Restore session ──────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
    const savedUser = sessionStorage.getItem(USER_STORAGE_KEY);
    if (saved) {
      setToken(saved);
      setAdminUser(savedUser || 'Admin');
      setIsLoggedIn(true);
    }
  }, []);

  // ── Auto-load tab data on first switch ─────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) return;
    if (activeTab === 'submissions' && submissions.length === 0 && !subsLoading) loadSubmissions();
    if (activeTab === 'challenges' && challenges.length === 0 && !challengesLoading) loadChallenges();
    if (activeTab === 'analytics' && !analytics && !analyticsLoading) loadAnalytics();
    if (activeTab === 'dat' && datResults.length === 0 && !datLoading) loadDatResults();
    if (activeTab === 'sim-live') startLivePoll();
    else stopLivePoll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isLoggedIn]);

  // ── Login ─────────────────────────────────────────────────────────────────
  async function handleLogin() {
    if (!loginEmail || !loginPassword) { setLoginError('Enter email and password.'); return; }
    setLoginLoading(true);
    setLoginError('');
    try {
      const data = await adminLogin(loginEmail, loginPassword);
      if (data.token) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, data.token);
        sessionStorage.setItem(USER_STORAGE_KEY, data.user || loginEmail);
        setToken(data.token);
        setAdminUser(data.user || loginEmail);
        setIsLoggedIn(true);
      } else {
        setLoginError(data.message || data.error || 'Invalid credentials.');
      }
    } catch {
      setLoginError('Network error. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
    setIsLoggedIn(false);
    setToken('');
    setAdminUser('');
    setSubmissions([]);
    stopLivePoll();
  }

  // ── Submissions ────────────────────────────────────────────────────────────
  async function loadSubmissions() {
    setSubsLoading(true);
    setSubsError('');
    try {
      const data = await fetchSubmissions(token);
      if (data.sessions) setSubmissions(data.sessions);
      else if (data.error === 'UNAUTHORIZED' || data.message?.includes('Unauthorized')) {
        setSubsError('Session expired. Please log in again.');
        handleLogout();
      } else {
        setSubsError(data.error || 'Failed to load submissions.');
      }
    } catch (e: any) {
      if (e.message === 'UNAUTHORIZED') {
        setSubsError('Session expired.');
        handleLogout();
      } else {
        setSubsError('Network error loading submissions.');
      }
    } finally {
      setSubsLoading(false);
    }
  }

  async function openEvalModal(sessionId: string) {
    setEvalOpen(true);
    setCurrentSession(null);
    setGrades([]);
    setImprovements('');
    setAiSummaryHtml('');
    try {
      const data = await fetchSubmissionDetail(token, sessionId);
      const sess: AdminSession = data.session || data;
      setCurrentSession(sess);
      const answers = sess.answers || [];
      setGrades(answers.map(a => ({
        score: a.manual_score !== undefined ? String(a.manual_score) : '',
        feedback: a.admin_feedback || '',
      })));
    } catch {
      alert('Failed to load session details.');
      setEvalOpen(false);
    }
  }

  function handleGradeChange(index: number, field: 'score' | 'feedback', value: string) {
    setGrades(prev => prev.map((g, i) => i === index ? { ...g, [field]: value } : g));
  }

  async function handleSaveGrade(index: number) {
    if (!currentSession) return;
    const g = grades[index];
    if (!g.score) { alert('Enter a score first.'); return; }
    try {
      await saveGradeApi(token, currentSession.session_id, index, Number(g.score), g.feedback);
      alert('Grade saved!');
    } catch {
      alert('Failed to save grade.');
    }
  }

  async function handleGenerateAISummary() {
    if (!currentSession) return;
    setAiSummaryLoading(true);
    try {
      const data = await generateAISummary(token, currentSession.session_id);
      setAiSummaryHtml(data.summary_html || data.summary || '<p>No summary generated.</p>');
    } catch {
      setAiSummaryHtml('<p style="color:red">Failed to generate summary.</p>');
    } finally {
      setAiSummaryLoading(false);
    }
  }

  async function handleSendResults() {
    if (!currentSession) return;
    if (!confirm('Send results email to student?')) return;
    try {
      const data = await sendFinalResultsApi(token, currentSession.session_id, totalScore, improvements);
      if (data.message) alert(data.message);
      else alert('Results sent!');
    } catch {
      alert('Failed to send results.');
    }
  }

  function handleViewReport() {
    if (!currentSession) return;
    window.open(getReportUrl(token, currentSession.session_id), '_blank');
  }

  async function handleDeleteSubmission() {
    if (!currentSession) return;
    if (!confirm('Delete this session? This cannot be undone.')) return;
    try {
      await deleteSubmissionApi(token, currentSession.session_id);
      setEvalOpen(false);
      setSubmissions(prev => prev.filter(s => s.session_id !== currentSession.session_id));
    } catch {
      alert('Failed to delete session.');
    }
  }

  async function handleClearAll() {
    if (!confirm('Delete ALL sessions? This CANNOT be undone.')) return;
    try {
      await clearAllSessionsApi(token);
      setSubmissions([]);
      alert('All sessions cleared.');
    } catch {
      alert('Failed to clear sessions.');
    }
  }

  // ── Challenges ─────────────────────────────────────────────────────────────
  async function loadChallenges() {
    setChallengesLoading(true);
    try {
      const data = await fetchChallengesApi();
      setChallenges(data.challenges || []);
    } catch {
      // silent
    } finally {
      setChallengesLoading(false);
    }
  }

  async function handleDeleteChallenge(id: string) {
    if (!confirm('Delete this challenge?')) return;
    try {
      await deleteChallengeApi(token, id);
      setChallenges(prev => prev.filter(c => c.challenge_id !== id));
    } catch {
      alert('Failed to delete challenge.');
    }
  }

  // ── Analytics ──────────────────────────────────────────────────────────────
  async function loadAnalytics() {
    setAnalyticsLoading(true);
    try {
      const data = await fetchAnalyticsApi();
      setAnalytics(data);
    } catch {
      // silent
    } finally {
      setAnalyticsLoading(false);
    }
  }

  // ── DAT ────────────────────────────────────────────────────────────────────
  async function loadDatResults() {
    setDatLoading(true);
    try {
      const data = await fetchDatResultsApi();
      setDatResults(data.results || []);
      setDatLeaderboard(data.leaderboard || []);
    } catch {
      // silent
    } finally {
      setDatLoading(false);
    }
  }

  // ── Live activity ──────────────────────────────────────────────────────────
  async function fetchLive() {
    try {
      const data = await fetchSimLiveApi();
      setLiveActivities(data.activities || []);
      setLiveStudents(data.students || []);
    } catch {
      // silent
    }
  }

  function startLivePoll() {
    fetchLive();
    if (!pollRef.current) {
      pollRef.current = setInterval(fetchLive, 15000);
    }
  }

  function stopLivePoll() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  useEffect(() => () => stopLivePoll(), []);

  // ── Student modal ──────────────────────────────────────────────────────────
  async function openStudentModal(email: string) {
    setCurrentStudentEmail(email);
    setStudentModalOpen(true);
    setStudentModalLoading(true);
    setStudentData(null);
    setStudentModalTab('overview');
    try {
      const data = await fetchStudentProfileApi(email);
      setStudentData(data);
    } catch {
      alert('Failed to load student data.');
      setStudentModalOpen(false);
    } finally {
      setStudentModalLoading(false);
    }
  }

  async function handleTriggerAiReview() {
    if (!currentStudentEmail) return;
    try {
      await triggerStudentAiReviewApi(currentStudentEmail);
      const data = await fetchStudentProfileApi(currentStudentEmail);
      setStudentData(data);
    } catch {
      alert('Failed to generate AI review.');
    }
  }

  function handleRefresh() {
    if (activeTab === 'submissions') loadSubmissions();
    else if (activeTab === 'challenges') loadChallenges();
    else if (activeTab === 'analytics') loadAnalytics();
    else if (activeTab === 'dat') loadDatResults();
    else if (activeTab === 'sim-live') fetchLive();
  }

  const apiBase = getApiBase();

  return (
    <div className="admin-app">
      <link rel="stylesheet" href="/css/admin.css" />

      {!isLoggedIn ? (
        <LoginOverlay
          email={loginEmail}
          password={loginPassword}
          error={loginError}
          loading={loginLoading}
          onEmailChange={setLoginEmail}
          onPasswordChange={setLoginPassword}
          onLogin={handleLogin}
        />
      ) : (
        <>
          <AdminHeader
            user={adminUser}
            onRefresh={handleRefresh}
            onClearAll={handleClearAll}
            onLogout={handleLogout}
          />

          <AdminTabBar active={activeTab} onChange={tab => setActiveTab(tab)} />

          <div className="admin-content">
            {activeTab === 'submissions' && (
              <SubmissionsTab
                submissions={submissions}
                loading={subsLoading}
                error={subsError}
                onOpen={openEvalModal}
              />
            )}
            {activeTab === 'challenges' && (
              <ChallengesTab
                challenges={challenges}
                loading={challengesLoading}
                token={token}
                onDelete={handleDeleteChallenge}
                onCreated={loadChallenges}
              />
            )}
            {activeTab === 'analytics' && (
              <AnalyticsTab analytics={analytics} loading={analyticsLoading} />
            )}
            {activeTab === 'dat' && (
              <DatTab
                results={datResults}
                leaderboard={datLeaderboard}
                loading={datLoading}
                onRefresh={loadDatResults}
                onViewEval={data => { setDatEvalData(data); setDatEvalOpen(true); }}
              />
            )}
            {activeTab === 'sim-live' && (
              <LiveActivityTab
                activities={liveActivities}
                students={liveStudents}
                onSync={fetchLive}
                onViewStudent={openStudentModal}
              />
            )}
          </div>

          {/* Eval modal */}
          <EvalModal
            open={evalOpen}
            session={currentSession}
            grades={grades}
            totalScore={totalScore}
            improvements={improvements}
            aiSummaryHtml={aiSummaryHtml}
            aiSummaryLoading={aiSummaryLoading}
            apiBase={apiBase}
            onClose={() => setEvalOpen(false)}
            onGradeChange={handleGradeChange}
            onSaveGrade={handleSaveGrade}
            onGenerateAISummary={handleGenerateAISummary}
            onSendResults={handleSendResults}
            onViewReport={handleViewReport}
            onDelete={handleDeleteSubmission}
            onImprovementsChange={setImprovements}
          />

          {/* Student modal */}
          <StudentModal
            open={studentModalOpen}
            data={studentData}
            activeTab={studentModalTab}
            loading={studentModalLoading}
            onClose={() => setStudentModalOpen(false)}
            onTabChange={setStudentModalTab}
            onTriggerAiReview={handleTriggerAiReview}
            onViewTranscript={(title, html) => { setTranscriptTitle(title); setTranscriptHtml(html); setTranscriptOpen(true); }}
            onViewEmail={(title, html) => { setEmailTitle(title); setEmailHtml(html); setEmailOpen(true); }}
          />

          {/* Sub-modals */}
          <TranscriptModal open={transcriptOpen} title={transcriptTitle} html={transcriptHtml} onClose={() => setTranscriptOpen(false)} />
          <EmailModal open={emailOpen} title={emailTitle} html={emailHtml} onClose={() => setEmailOpen(false)} />
          <DatEvalModal open={datEvalOpen} evalData={datEvalData} onClose={() => setDatEvalOpen(false)} />
        </>
      )}
    </div>
  );
}
