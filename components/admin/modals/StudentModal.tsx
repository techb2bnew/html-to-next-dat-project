'use client'
import type { StudentSimData, StudentModalTab } from '@/lib/types/admin';

interface Props {
  open: boolean;
  data: StudentSimData | null;
  activeTab: StudentModalTab;
  loading: boolean;
  onClose: () => void;
  onTabChange: (tab: StudentModalTab) => void;
  onTriggerAiReview: () => void;
  onViewTranscript: (title: string, html: string) => void;
  onViewEmail: (title: string, html: string) => void;
}

function formatCallHtml(call: any): string {
  const history: any[] = call.history || [];
  if (!history.length) return '<p style="color:#94a3b8">No transcript available.</p>';
  return history.map(m => {
    const isUser = m.role === 'user';
    return `<div style="margin-bottom:12px;text-align:${isUser ? 'right' : 'left'}">
      <strong style="color:${isUser ? '#38bdf8' : '#10b981'};font-size:11px">${isUser ? 'You' : 'AI Broker'}</strong>
      <div style="background:${isUser ? 'rgba(56,189,248,0.1)' : 'rgba(16,185,129,0.1)'};border:1px solid ${isUser ? '#38bdf850' : '#10b98150'};padding:8px 12px;border-radius:8px;margin-top:4px;font-size:13px;color:#e2e8f0;display:inline-block;max-width:80%">${m.content}</div>
    </div>`;
  }).join('');
}

function formatEmailHtml(email: any): string {
  const thread: any[] = email.thread || email.messages || [];
  if (!thread.length) {
    const body = email.email_content || email.body || '';
    return `<div style="font-family:sans-serif;padding:16px;background:#fff;border-radius:8px;color:#1e293b"><pre style="white-space:pre-wrap;font-family:inherit">${body}</pre></div>`;
  }
  return thread.map(m => {
    const from = m.from || m.role || 'Unknown';
    const body = m.body || m.content || '';
    return `<div style="margin-bottom:16px;padding:12px;border-left:3px solid #6366f1;background:#f8fafc">
      <div style="font-weight:700;font-size:12px;color:#6366f1;margin-bottom:6px">From: ${from}</div>
      <div style="font-size:13px;color:#1e293b;white-space:pre-wrap">${body}</div>
    </div>`;
  }).join('');
}

const TABS: { id: StudentModalTab; label: string }[] = [
  { id: 'overview', label: '📊 Overview' },
  { id: 'timeline', label: '📋 Timeline' },
  { id: 'loads', label: '📦 Booked Loads' },
  { id: 'roleplays', label: '🎙️ Role-Plays' },
  { id: 'ai-review', label: '🤖 AI Review' },
];

export default function StudentModal({
  open, data, activeTab, loading, onClose, onTabChange,
  onTriggerAiReview, onViewTranscript, onViewEmail,
}: Props) {
  if (!open) return null;

  const student = data?.student;
  const activities = data?.activities || [];
  const calls = data?.calls || [];
  const emails = data?.emails || [];
  const bookedLoads = student?.booked_load_history || [];
  const aiReview = student?.ai_review;

  return (
    <div className="student-modal-dark" style={{ display: 'flex' }}>
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, width: '95%', maxWidth: 900, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="student-modal-header-dark">
          <div>
            <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: 20, fontWeight: 800 }}>
              {student?.name || 'Student Performance'}
            </h2>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{student?.email}</div>
          </div>
          <button onClick={onClose} style={{ background: '#334155', border: '1px solid #475569', color: '#94a3b8', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
            ✕ Close
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '12px 20px', borderBottom: '1px solid #334155', background: '#0f172a', overflowX: 'auto' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              className={`modal-tab-btn${activeTab === t.id ? ' active' : ''}`}
              onClick={() => onTabChange(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="student-modal-body-dark">
          {loading && <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading student data…</div>}

          {!loading && activeTab === 'overview' && (
            <>
              <div className="student-stat-grid">
                {[
                  { label: 'XP Earned', value: student?.xp || 0, icon: '⚡', color: '#f59e0b' },
                  { label: 'Booked Loads', value: student?.booked_loads || 0, icon: '📦', color: '#10b981' },
                  { label: 'Calls Made', value: student?.calls_made || 0, icon: '📞', color: '#38bdf8' },
                  { label: 'Emails Sent', value: student?.emails_sent || 0, icon: '✉️', color: '#a78bfa' },
                  { label: 'Rank', value: student?.level_info?.title || 'Dispatcher', icon: '🏅', color: '#6366f1' },
                  { label: 'Revenue', value: `$${(student?.revenue || 0).toLocaleString()}`, icon: '💰', color: '#f97316' },
                ].map(stat => (
                  <div key={stat.label} className="student-stat-card" style={{ borderTop: `3px solid ${stat.color}` }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{stat.icon}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!loading && activeTab === 'timeline' && (
            <div className="student-timeline-container">
              {activities.length === 0
                ? <p style={{ color: '#475569', textAlign: 'center' }}>No activity recorded yet.</p>
                : activities.map((act: any, i: number) => (
                  <div key={i} className="student-timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <strong style={{ color: '#e2e8f0', fontSize: 13 }}>{act.action}</strong>
                        <span style={{ fontSize: 11, color: '#475569' }}>{act.time_str}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{act.detail}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {!loading && activeTab === 'loads' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  {['Date', 'Broker', 'Route', 'Rate', 'Score', 'Grade'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', color: '#64748b', fontWeight: 700, fontSize: 11, textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookedLoads.length === 0
                  ? <tr><td colSpan={6} style={{ textAlign: 'center', color: '#475569', padding: 20 }}>No booked loads yet.</td></tr>
                  : bookedLoads.map((load: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '8px 10px', color: '#64748b', fontSize: 11 }}>{load.timestamp_str || ''}</td>
                      <td style={{ padding: '8px 10px', color: '#cbd5e1' }}>{load.broker_name}</td>
                      <td style={{ padding: '8px 10px', color: '#94a3b8', fontSize: 12 }}>{load.origin} → {load.destination}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: '#10b981' }}>${(load.agreed_rate || 0).toLocaleString()}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 700 }}>{load.score_pct}%</td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>{load.grade}</span>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          )}

          {!loading && activeTab === 'roleplays' && (
            <div>
              {calls.length > 0 && (
                <>
                  <h4 style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700, margin: '0 0 12px 0', textTransform: 'uppercase' }}>📞 Phone Calls</h4>
                  {calls.map((call: any, i: number) => (
                    <div key={i} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: 12, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 13 }}>
                          📞 Call with {call.broker_name || 'Broker'} — {call.origin || ''} → {call.destination || ''}
                        </div>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                          {call.timestamp_str} · Score: <span style={{ color: '#10b981', fontWeight: 700 }}>{call.score_pct}%</span> · {call.status}
                        </div>
                      </div>
                      <button
                        onClick={() => onViewTranscript(`Call – ${call.broker_name}`, formatCallHtml(call))}
                        style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11, flexShrink: 0 }}
                      >
                        📜 View
                      </button>
                    </div>
                  ))}
                </>
              )}
              {emails.length > 0 && (
                <>
                  <h4 style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700, margin: '16px 0 12px 0', textTransform: 'uppercase' }}>✉️ Email Threads</h4>
                  {emails.map((email: any, i: number) => (
                    <div key={i} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: 12, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 13 }}>
                          ✉️ Email to {email.broker_name || 'Broker'} — {email.origin || ''} → {email.destination || ''}
                        </div>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                          {email.timestamp_str} · Score: <span style={{ color: '#a78bfa', fontWeight: 700 }}>{email.score_pct}%</span> · {email.status}
                        </div>
                      </div>
                      <button
                        onClick={() => onViewEmail(`Email – ${email.broker_name}`, formatEmailHtml(email))}
                        style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11, flexShrink: 0 }}
                      >
                        📜 View
                      </button>
                    </div>
                  ))}
                </>
              )}
              {calls.length === 0 && emails.length === 0 && (
                <p style={{ color: '#475569', textAlign: 'center', padding: 20 }}>No role-plays recorded yet.</p>
              )}
            </div>
          )}

          {!loading && activeTab === 'ai-review' && (
            <div>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={onTriggerAiReview}
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
                >
                  🔄 Generate / Refresh AI Review
                </button>
              </div>
              {!aiReview ? (
                <p style={{ color: '#475569', textAlign: 'center', padding: 20 }}>No AI review generated yet. Click the button above.</p>
              ) : (
                <div className="ai-review-layout">
                  <div className="ai-overall-card">
                    <div style={{ fontSize: 36, fontWeight: 900, color: '#38bdf8' }}>{aiReview.overall_score ?? '?'}<span style={{ fontSize: 16, color: '#64748b' }}>/10</span></div>
                    <div style={{ fontWeight: 700, color: '#e2e8f0', marginTop: 4 }}>{aiReview.performance_tier || 'Evaluated'}</div>
                  </div>

                  {aiReview.competencies && (
                    <div>
                      <h4 style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 12px 0' }}>Competencies</h4>
                      {Object.entries(aiReview.competencies).map(([key, val]: any) => (
                        <div key={key} className="competency-item">
                          <div className="competency-header">
                            <span style={{ color: '#cbd5e1', fontSize: 12 }}>{key.replace(/_/g, ' ')}</span>
                            <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: 12 }}>{val}/10</span>
                          </div>
                          <div className="competency-bar-bg">
                            <div className="competency-bar-fill" style={{ width: `${val * 10}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {aiReview.strengths && aiReview.strengths.length > 0 && (
                    <div>
                      <h4 style={{ color: '#10b981', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', margin: '16px 0 8px 0' }}>✅ Strengths</h4>
                      <ul className="ai-bullet-list">
                        {aiReview.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}

                  {aiReview.improvement_areas && aiReview.improvement_areas.length > 0 && (
                    <div>
                      <h4 style={{ color: '#f59e0b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', margin: '16px 0 8px 0' }}>⚠️ Improvement Areas</h4>
                      <ul className="ai-bullet-list">
                        {aiReview.improvement_areas.map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}

                  {aiReview.personalized_tip && (
                    <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid #6366f1', padding: 12, borderRadius: 8, marginTop: 16 }}>
                      <div style={{ fontWeight: 700, color: '#a5b4fc', fontSize: 12, marginBottom: 6 }}>💡 Personalized Tip</div>
                      <div style={{ color: '#e2e8f0', fontSize: 13 }}>{aiReview.personalized_tip}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
