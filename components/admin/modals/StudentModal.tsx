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
    <div className="student-modal-dark flex">
      <div className="bg-slate-800 border border-[#334155] rounded-2xl w-[95%] max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="student-modal-header-dark">
          <div>
            <h2 className="m-0 text-slate-50 text-[20px] font-extrabold">
              {student?.name || 'Student Performance'}
            </h2>
            <div className="text-[12px] text-slate-500 mt-[2px]">{student?.email}</div>
          </div>
          <button onClick={onClose} className="bg-[#334155] border border-slate-600 text-slate-400 px-3 py-[6px] rounded-md cursor-pointer text-[13px]">
            ✕ Close
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 py-3 border-b border-[#334155] bg-slate-900 overflow-x-auto">
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
          {loading && <div className="text-center p-10 text-slate-400">Loading student data…</div>}

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
                    <div className="text-[24px] mb-1">{stat.icon}</div>
                    <div className="text-[22px] font-extrabold" style={{ color: stat.color }}>{stat.value}</div>
                    <div className="text-[11px] text-slate-500 font-semibold">{stat.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!loading && activeTab === 'timeline' && (
            <div className="student-timeline-container">
              {activities.length === 0
                ? <p className="text-slate-600 text-center">No activity recorded yet.</p>
                : activities.map((act: any, i: number) => (
                  <div key={i} className="student-timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div className="flex justify-between items-baseline">
                        <strong className="text-slate-200 text-[13px]">{act.action}</strong>
                        <span className="text-[11px] text-slate-600">{act.time_str}</span>
                      </div>
                      <div className="text-[12px] text-slate-500 mt-[2px]">{act.detail}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {!loading && activeTab === 'loads' && (
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[#334155]">
                  {['Date', 'Broker', 'Route', 'Rate', 'Score', 'Grade'].map(h => (
                    <th key={h} className="px-[10px] py-2 text-slate-500 font-bold text-[11px] text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookedLoads.length === 0
                  ? <tr><td colSpan={6} className="text-center text-slate-600 p-5">No booked loads yet.</td></tr>
                  : bookedLoads.map((load: any, i: number) => (
                    <tr key={i} className="border-b border-slate-800">
                      <td className="px-[10px] py-2 text-slate-500 text-[11px]">{load.timestamp_str || ''}</td>
                      <td className="px-[10px] py-2 text-slate-300">{load.broker_name}</td>
                      <td className="px-[10px] py-2 text-slate-400 text-[12px]">{load.origin} → {load.destination}</td>
                      <td className="px-[10px] py-2 font-bold text-emerald-500">${(load.agreed_rate || 0).toLocaleString()}</td>
                      <td className="px-[10px] py-2 font-bold">{load.score_pct}%</td>
                      <td className="px-[10px] py-2">
                        <span className="bg-emerald-500/10 text-emerald-500 px-[6px] py-[2px] rounded text-[10px] font-bold">{load.grade}</span>
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
                  <h4 className="text-slate-400 text-[12px] font-bold m-0 mb-3 uppercase">📞 Phone Calls</h4>
                  {calls.map((call: any, i: number) => (
                    <div key={i} className="bg-slate-900 border border-[#334155] rounded-lg p-3 mb-[10px] flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-200 text-[13px]">
                          📞 Call with {call.broker_name || 'Broker'} — {call.origin || ''} → {call.destination || ''}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-[2px]">
                          {call.timestamp_str} · Score: <span className="text-emerald-500 font-bold">{call.score_pct}%</span> · {call.status}
                        </div>
                      </div>
                      <button
                        onClick={() => onViewTranscript(`Call – ${call.broker_name}`, formatCallHtml(call))}
                        className="bg-slate-800 border border-[#334155] text-slate-400 px-[10px] py-[5px] rounded cursor-pointer text-[11px] shrink-0"
                      >
                        📜 View
                      </button>
                    </div>
                  ))}
                </>
              )}
              {emails.length > 0 && (
                <>
                  <h4 className="text-slate-400 text-[12px] font-bold mt-4 mb-3 uppercase">✉️ Email Threads</h4>
                  {emails.map((email: any, i: number) => (
                    <div key={i} className="bg-slate-900 border border-[#334155] rounded-lg p-3 mb-[10px] flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-200 text-[13px]">
                          ✉️ Email to {email.broker_name || 'Broker'} — {email.origin || ''} → {email.destination || ''}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-[2px]">
                          {email.timestamp_str} · Score: <span className="text-[#a78bfa] font-bold">{email.score_pct}%</span> · {email.status}
                        </div>
                      </div>
                      <button
                        onClick={() => onViewEmail(`Email – ${email.broker_name}`, formatEmailHtml(email))}
                        className="bg-slate-800 border border-[#334155] text-slate-400 px-[10px] py-[5px] rounded cursor-pointer text-[11px] shrink-0"
                      >
                        📜 View
                      </button>
                    </div>
                  ))}
                </>
              )}
              {calls.length === 0 && emails.length === 0 && (
                <p className="text-slate-600 text-center p-5">No role-plays recorded yet.</p>
              )}
            </div>
          )}

          {!loading && activeTab === 'ai-review' && (
            <div>
              <div className="mb-4 flex justify-end">
                <button
                  onClick={onTriggerAiReview}
                  className="bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] border-none text-white px-[18px] py-2 rounded-lg cursor-pointer font-bold text-[13px]"
                >
                  🔄 Generate / Refresh AI Review
                </button>
              </div>
              {!aiReview ? (
                <p className="text-slate-600 text-center p-5">No AI review generated yet. Click the button above.</p>
              ) : (
                <div className="ai-review-layout">
                  <div className="ai-overall-card">
                    <div className="text-[36px] font-black text-sky-400">{aiReview.overall_score ?? '?'}<span className="text-[16px] text-slate-500">/10</span></div>
                    <div className="font-bold text-slate-200 mt-1">{aiReview.performance_tier || 'Evaluated'}</div>
                  </div>

                  {aiReview.competencies && (
                    <div>
                      <h4 className="text-slate-500 text-[12px] font-bold uppercase m-0 mb-3">Competencies</h4>
                      {Object.entries(aiReview.competencies).map(([key, val]: any) => (
                        <div key={key} className="competency-item">
                          <div className="competency-header">
                            <span className="text-slate-300 text-[12px]">{key.replace(/_/g, ' ')}</span>
                            <span className="text-sky-400 font-bold text-[12px]">{val}/10</span>
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
                      <h4 className="text-emerald-500 text-[12px] font-bold uppercase mt-4 mb-2">✅ Strengths</h4>
                      <ul className="ai-bullet-list">
                        {aiReview.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}

                  {aiReview.improvement_areas && aiReview.improvement_areas.length > 0 && (
                    <div>
                      <h4 className="text-amber-500 text-[12px] font-bold uppercase mt-4 mb-2">⚠️ Improvement Areas</h4>
                      <ul className="ai-bullet-list">
                        {aiReview.improvement_areas.map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}

                  {aiReview.personalized_tip && (
                    <div className="bg-indigo-500/10 border border-indigo-500 p-3 rounded-lg mt-4">
                      <div className="font-bold text-[#a5b4fc] text-[12px] mb-[6px]">💡 Personalized Tip</div>
                      <div className="text-slate-200 text-[13px]">{aiReview.personalized_tip}</div>
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
