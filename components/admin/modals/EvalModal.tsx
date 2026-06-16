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
  const btnCls = "px-5 py-[10px] rounded-xl font-bold text-sm cursor-pointer inline-flex items-center gap-2 border-none transition";

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[1000] flex items-center justify-center p-6">
      <div className="bg-slate-50 w-full max-w-[1000px] max-h-[90vh] rounded-3xl border border-black/[0.08] flex flex-col overflow-hidden animate-[modalScaleUp_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        {/* Header */}
        <div className="px-8 py-6 bg-white flex justify-between items-center border-b border-black/[0.08]">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{session?.student_name || 'Student Name'}</h2>
            <div className="text-sm text-slate-600 mt-1">
              <span>Practice Mode: {session?.track || 'Dispatcher'}</span>
            </div>
          </div>
          <button className={`${btnCls} bg-white text-slate-600 border border-black/[0.08] hover:bg-slate-200 hover:text-slate-900`} onClick={onClose}>✕ Close</button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto flex-1 flex flex-col gap-8">
          <div>
            {answers.length === 0 ? (
              <div className="text-center text-slate-500 py-10">No answers recorded yet.</div>
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
                <div key={index} className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 bg-black/[0.02] flex justify-between items-center gap-4">
                    <div className="font-bold text-base">Q{index + 1}: {ans.question}</div>
                    <div
                      className="text-xs px-[10px] py-1 rounded-full border whitespace-nowrap"
                      style={{ background: `${scoreColor}22`, color: scoreColor, border: `1px solid ${scoreColor}44` }}
                    >
                      AI Score: <strong>{aiScore !== null && aiScore !== undefined ? `${aiScore}/10` : 'N/A'}</strong>
                    </div>
                  </div>

                  <div className="p-6 border-b border-black/[0.08]">
                    <strong className="block text-xs font-bold uppercase text-slate-600 tracking-wide mb-2">STUDENT RESPONSE:</strong>
                    <div className="text-slate-700 text-[0.9375rem] whitespace-pre-wrap">
                      {ans.answer_text === '[Processing audio...]'
                        ? <div className="italic text-slate-500 animate-pulse">Transcribing audio…</div>
                        : (ans.answer_text || <em className="text-[#999]">No answer recorded</em>)
                      }
                    </div>
                    {audioUrl && <div className="mt-3"><audio controls src={audioUrl} /></div>}
                  </div>

                  <div className="px-6 py-5 flex flex-col gap-3">
                    <div className="p-[14px] rounded-xl text-sm border-l-4 bg-blue-500/10 border-l-blue-500">
                      <div className="text-[0.6875rem] font-extrabold uppercase text-slate-600 mb-1">🤖 AI Feedback</div>
                      <div className="text-sm text-slate-700">{ans.ai_feedback || 'No AI feedback available.'}</div>
                    </div>
                    {ans.weak_points && ans.weak_points !== 'None' && ans.weak_points.trim() ? (
                      <div className="p-[14px] rounded-xl text-sm border-l-4 bg-red-500/10 border-l-red-500">
                        <div className="text-[0.6875rem] font-extrabold uppercase text-slate-600 mb-1">⚠️ Weak Points</div>
                        <div className="text-sm text-slate-700">{ans.weak_points}</div>
                      </div>
                    ) : (
                      <div className="p-[14px] rounded-xl text-sm border-l-4 bg-emerald-500/10 border-l-emerald-500">
                        <div className="text-[0.6875rem] font-extrabold uppercase text-slate-600 mb-1">✅ No major weak points</div>
                      </div>
                    )}
                    {ans.improvements && ans.improvements.trim() && (
                      <div className="p-[14px] rounded-xl text-sm border-l-4 bg-amber-500/10 border-l-amber-500">
                        <div className="text-[0.6875rem] font-extrabold uppercase text-slate-600 mb-1">💡 How to Improve</div>
                        <div className="text-sm text-slate-700">{ans.improvements}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 items-end pt-5 px-6 pb-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.6875rem] font-bold uppercase text-slate-600">Manual Score (0–10)</label>
                      <input
                        type="number"
                        value={grade.score}
                        min={0} max={10}
                        placeholder="—"
                        onChange={e => onGradeChange(index, 'score', e.target.value)}
                        className="px-4 py-[10px] bg-slate-50 border border-black/[0.08] rounded-lg text-slate-900"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className="text-[0.6875rem] font-bold uppercase text-slate-600">Admin Feedback (Optional)</label>
                      <input
                        type="text"
                        value={grade.feedback}
                        placeholder="Add your notes…"
                        onChange={e => onGradeChange(index, 'feedback', e.target.value)}
                        className="px-4 py-[10px] bg-slate-50 border border-black/[0.08] rounded-lg text-slate-900"
                      />
                    </div>
                    <button className={`${btnCls} bg-green-600 text-white`} onClick={() => onSaveGrade(index)}>Save</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Summary */}
          <div>
            <div className="flex justify-between items-center mb-5 pt-6 border-t border-black/[0.08]">
              <h3 className="text-lg font-bold text-slate-900">🧠 AI Overall Assessment (Logistics)</h3>
              <button
                className={`${btnCls} bg-gradient-to-br from-violet-600 to-indigo-600 text-white hover:opacity-90 hover:-translate-y-px disabled:opacity-60`}
                onClick={onGenerateAISummary}
                disabled={aiSummaryLoading}
              >
                {aiSummaryLoading ? 'Generating…' : '✨ Generate AI Summary'}
              </button>
            </div>
            {aiSummaryHtml && (
              <div dangerouslySetInnerHTML={{ __html: aiSummaryHtml }} />
            )}
          </div>

          {/* Manual Grading */}
          <div className="pt-8 border-t-2 border-dashed border-black/[0.08] flex flex-col gap-6">
            <div className="flex justify-between items-center bg-green-500/5 px-6 py-4 rounded-xl border border-green-500/20">
              <div className="text-lg font-bold text-green-600">
                Total Manual Score: <span className="text-2xl text-slate-900">{totalScore}</span>
                <span className="text-[0.8125rem] text-slate-600 font-normal"> /60</span>
              </div>
              <div className="text-[0.8125rem] text-slate-600">(Sum of individual answer scores)</div>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold uppercase text-slate-600 tracking-wide">📝 Final Improvements & Feedback to Send to Student</label>
              <textarea
                value={improvements}
                onChange={e => onImprovementsChange(e.target.value)}
                placeholder="Summarise key improvement areas and feedback to email the student…"
                className="w-full min-h-[120px] bg-slate-50 border border-black/[0.08] rounded-xl p-4 text-slate-900 font-[inherit] text-[0.9375rem] leading-relaxed resize-y transition focus:outline-none focus:border-indigo-600 focus:shadow-[0_0_0_4px_rgba(79,70,229,0.15)]"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-white border-t border-black/[0.08] flex justify-end gap-4">
          <div className="flex w-full gap-3 flex-wrap flex-col sm:flex-row justify-end">
            <button className={`${btnCls} w-full sm:w-auto justify-center bg-white text-slate-600 border border-black/[0.08] hover:bg-slate-200 hover:text-slate-900`} onClick={onClose}>Close</button>
            <button className={`${btnCls} w-full sm:w-auto justify-center bg-[#334155] text-slate-900 border border-slate-600`} onClick={onViewReport}>
              📄 View Full Performance Report (PDF)
            </button>
            <button className={`${btnCls} w-full sm:w-auto justify-center bg-red-600 text-white hover:bg-red-700 hover:-translate-y-px`} onClick={onDelete}>🗑️ Delete Session</button>
            <button className={`${btnCls} w-full sm:w-auto justify-center bg-indigo-600 text-white hover:bg-indigo-800 hover:-translate-y-px`} onClick={onSendResults}>📧 Send Marks & Improvements to Email</button>
          </div>
        </div>
      </div>
    </div>
  );
}
