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
    <div className="grid grid-cols-1 gap-6 items-start">
      <div className="bg-white/85 backdrop-blur-md border border-black/[0.08] rounded-2xl p-7 shadow-[0_8px_32px_rgba(0,0,0,0.3)] h-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900">👥 All Submissions</h3>
          <div className="text-xs text-slate-600">Showing all students</div>
        </div>

        <div className="flex flex-col gap-3">
          {loading && (
            <div className="flex items-center gap-3 justify-center py-10 text-slate-600 text-sm">
              <div className="w-5 h-5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
              <span>Loading sessions…</span>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-3 rounded-lg text-sm text-center">{error}</div>
          )}

          {!loading && !error && submissions.length === 0 && (
            <div className="text-center text-slate-500 py-10">📋 No submissions found.</div>
          )}

          {!loading && submissions.map(sub => {
            const date = new Date(sub.created_at).toLocaleString();
            const isCompleted = sub.status === 'completed';
            const statusLabel = isCompleted ? 'Completed' : 'In Progress';
            const answers = sub.answers || [];
            const scored = answers.filter(a => a.ai_score !== null && a.ai_score !== undefined);
            const avgAI = scored.length
              ? (scored.reduce((s, a) => s + Number(a.ai_score), 0) / scored.length).toFixed(1)
              : '—';

            return (
              <div
                key={sub.session_id}
                className="flex justify-between items-center p-5 bg-white/60 border border-black/[0.08] rounded-xl cursor-pointer transition hover:bg-white/95 hover:border-indigo-600 hover:translate-x-1"
                onClick={() => onOpen(sub.session_id)}
              >
                <div>
                  <div className="font-bold text-base text-slate-900">{sub.student_name || 'Guest'}</div>
                  <div className="text-[0.8125rem] text-slate-600">USA Logistics Dispatcher Practice Mode</div>
                </div>
                <div className="text-right flex flex-col gap-1">
                  <div className="text-xs bg-black/[0.03] px-[10px] py-1 rounded-full border border-black/[0.08]">AI Avg: <strong>{avgAI}/10</strong></div>
                  <div className="text-[0.6875rem] text-slate-600">{date}</div>
                  <span className={`px-[10px] py-1 rounded-full text-[0.6875rem] font-extrabold uppercase tracking-[0.05em] ${
                    isCompleted ? 'bg-emerald-500/15 text-emerald-500' : 'bg-blue-500/15 text-blue-500'
                  }`}>
                    {statusLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
