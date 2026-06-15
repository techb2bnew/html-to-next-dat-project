'use client'
import type { AdminSession, GradeRow } from '@/lib/types/admin';

interface Props {
  open: boolean;
  session: AdminSession | null;
  grades: GradeRow[];
  totalScore: number;
  improvements: string;
  aiSummaryHtml: string;
  aiSummaryLoading: boolean;
  apiBase: string;
  onClose: () => void;
  onGradeChange: (index: number, field: 'score' | 'feedback', value: string) => void;
  onSaveGrade: (index: number) => void;
  onGenerateAISummary: () => void;
  onSendResults: () => void;
  onViewReport: () => void;
  onDelete: () => void;
  onImprovementsChange: (v: string) => void;
}

export default function EvalModal({
  open, session, grades, totalScore, improvements, aiSummaryHtml, aiSummaryLoading,
  apiBase, onClose, onGradeChange, onSaveGrade, onGenerateAISummary,
  onSendResults, onViewReport, onDelete, onImprovementsChange,
}: Props) {
  if (!open) return null;

  const answers = session?.answers || [];

  return (
    <div id="eval-modal" className="modal active">
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>{session?.student_name || 'Student Name'}</h2>
            <div className="modal-header-meta">
              <span>Practice Mode: {session?.track || 'Dispatcher'}</span>
            </div>
          </div>
          <button className="btn btn-close" onClick={onClose}>✕ Close</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div id="modal-qa-container">
            {answers.length === 0 ? (
              <div className="empty-state">No answers recorded yet.</div>
            ) : answers.map((ans, index) => {
              const aiScore = ans.ai_score;
              const scoreColor = (aiScore !== null && aiScore !== undefined)
                ? (Number(aiScore) >= 8 ? '#16a34a' : Number(aiScore) >= 5 ? '#d97706' : '#dc2626')
                : '#94a3b8';

              const audioUrl = ans.media_path
                ? (ans.media_path.startsWith('http') ? ans.media_path : apiBase + ans.media_path)
                : '';

              const grade = grades[index] || { score: '', feedback: '' };

              return (
                <div key={index} className="qa-block">
                  <div className="qa-header">
                    <div className="q-text">Q{index + 1}: {ans.question}</div>
                    <div className="ai-score-badge" style={{ background: `${scoreColor}22`, color: scoreColor, border: `1px solid ${scoreColor}44` }}>
                      AI Score: <strong>{aiScore !== null && aiScore !== undefined ? `${aiScore}/10` : 'N/A'}</strong>
                    </div>
                  </div>

                  <div className="a-text">
                    <strong className="answer-label">STUDENT RESPONSE:</strong>
                    <div className="answer-body">
                      {ans.answer_text === '[Processing audio...]'
                        ? <div className="processing-glow">Transcribing audio…</div>
                        : (ans.answer_text || <em className="text-[#999]">No answer recorded</em>)
                      }
                    </div>
                    {audioUrl && <div className="audio-wrap"><audio controls src={audioUrl} /></div>}
                  </div>

                  <div className="ai-analysis">
                    <div className="insight-block feedback">
                      <div className="insight-label">🤖 AI Feedback</div>
                      <div className="insight-text">{ans.ai_feedback || 'No AI feedback available.'}</div>
                    </div>
                    {ans.weak_points && ans.weak_points !== 'None' && ans.weak_points.trim() ? (
                      <div className="insight-block weak">
                        <div className="insight-label">⚠️ Weak Points</div>
                        <div className="insight-text">{ans.weak_points}</div>
                      </div>
                    ) : (
                      <div className="insight-block strong"><div className="insight-label">✅ No major weak points</div></div>
                    )}
                    {ans.improvements && ans.improvements.trim() && (
                      <div className="insight-block improve">
                        <div className="insight-label">💡 How to Improve</div>
                        <div className="insight-text">{ans.improvements}</div>
                      </div>
                    )}
                  </div>

                  <div className="grading-area">
                    <div className="grade-input-group">
                      <label>Manual Score (0–10)</label>
                      <input
                        type="number"
                        value={grade.score}
                        min={0} max={10}
                        placeholder="—"
                        onChange={e => onGradeChange(index, 'score', e.target.value)}
                      />
                    </div>
                    <div className="grade-input-group flex-1">
                      <label>Admin Feedback (Optional)</label>
                      <input
                        type="text"
                        value={grade.feedback}
                        placeholder="Add your notes…"
                        onChange={e => onGradeChange(index, 'feedback', e.target.value)}
                      />
                    </div>
                    <button className="btn btn-save" onClick={() => onSaveGrade(index)}>Save</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Summary */}
          <div className="ai-summary-container">
            <div className="assessment-header">
              <h3>🧠 AI Overall Assessment (Logistics)</h3>
              <button className="btn btn-ai" onClick={onGenerateAISummary} disabled={aiSummaryLoading}>
                {aiSummaryLoading ? 'Generating…' : '✨ Generate AI Summary'}
              </button>
            </div>
            {aiSummaryHtml && (
              <div dangerouslySetInnerHTML={{ __html: aiSummaryHtml }} />
            )}
          </div>

          {/* Manual Grading */}
          <div className="final-grading-section">
            <div className="score-row">
              <div className="score-display">
                Total Manual Score: <span id="total-score">{totalScore}</span>
                <span className="score-hint">/60</span>
              </div>
              <div className="score-hint">(Sum of individual answer scores)</div>
            </div>
            <div className="improvements-area">
              <label className="improvements-label">📝 Final Improvements & Feedback to Send to Student</label>
              <textarea
                value={improvements}
                onChange={e => onImprovementsChange(e.target.value)}
                placeholder="Summarise key improvement areas and feedback to email the student…"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="footer-actions">
            <button className="btn btn-close" onClick={onClose}>Close</button>
            <button className="btn bg-[#334155] text-slate-900 border border-slate-600" onClick={onViewReport}>
              📄 View Full Performance Report (PDF)
            </button>
            <button className="btn btn-danger" onClick={onDelete}>🗑️ Delete Session</button>
            <button className="btn btn-send" onClick={onSendResults}>📧 Send Marks & Improvements to Email</button>
          </div>
        </div>
      </div>
    </div>
  );
}
