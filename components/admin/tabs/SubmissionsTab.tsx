'use client'
import type { AdminSession } from '@/lib/types/admin';

interface Props {
  submissions: AdminSession[];
  loading: boolean;
  error: string;
  onOpen: (sessionId: string) => void;
}

export default function SubmissionsTab({ submissions, loading, error, onOpen }: Props) {
  return (
    <div className="admin-grid">
      <div className="submissions-column">
        <div className="card card-main">
          <div className="column-header">
            <h3>👥 All Submissions</h3>
            <div className="filter-status">Showing all students</div>
          </div>

          <div className="submission-list">
            {loading && (
              <div className="loading-state">
                <div className="spinner" />
                <span>Loading sessions…</span>
              </div>
            )}

            {error && <div className="error-state">{error}</div>}

            {!loading && !error && submissions.length === 0 && (
              <div className="empty-state">📋 No submissions found.</div>
            )}

            {!loading && submissions.map(sub => {
              const date = new Date(sub.created_at).toLocaleString();
              const statusClass = sub.status === 'completed' ? 'badge-completed' : 'badge-progress';
              const statusLabel = sub.status === 'completed' ? 'Completed' : 'In Progress';
              const answers = sub.answers || [];
              const scored = answers.filter(a => a.ai_score !== null && a.ai_score !== undefined);
              const avgAI = scored.length
                ? (scored.reduce((s, a) => s + Number(a.ai_score), 0) / scored.length).toFixed(1)
                : '—';

              return (
                <div key={sub.session_id} className="submission-item cursor-pointer" onClick={() => onOpen(sub.session_id)}>
                  <div className="sub-info">
                    <div className="sub-name">{sub.student_name || 'Guest'}</div>
                    <div className="sub-meta">USA Logistics Dispatcher Practice Mode</div>
                  </div>
                  <div className="sub-right">
                    <div className="ai-score-pill">AI Avg: <strong>{avgAI}/10</strong></div>
                    <div className="sub-date">{date}</div>
                    <span className={`badge ${statusClass}`}>{statusLabel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
