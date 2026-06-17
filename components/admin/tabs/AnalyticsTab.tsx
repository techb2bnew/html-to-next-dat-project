'use client'
import type { Analytics } from '@/lib/types/admin';

interface Props {
  analytics: Analytics | null;
  loading: boolean;
}

export default function AnalyticsTab({ analytics, loading }: Props) {
  if (loading) return (
    <div className="flex items-center gap-3 justify-center py-10 text-slate-600 text-sm">
      <div className="w-5 h-5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
      <span>Loading analytics…</span>
    </div>
  );

  const data = analytics;

  const cardCls = "bg-white border border-slate-200 rounded-xl p-6 shadow-[0_4px_6px_rgba(0,0,0,0.1)]";

  return (
    <>
      <div className="grid grid-cols-2 gap-[15px] mt-[15px] mb-6">
        <div className={`${cardCls} text-center`}>
          <h1 className="text-[48px] font-extrabold text-sky-400 m-0 mb-[10px]">
            {data?.total_attempts ?? 0}
          </h1>
          <span className="text-slate-600 font-bold uppercase text-[12px]">
            Total AI Challenge Attempts
          </span>
        </div>
        <div className={`${cardCls} text-center`}>
          <h1 className="text-[48px] font-extrabold text-emerald-500 m-0 mb-[10px]">
            {data?.avg_score ? `${(data.avg_score * 10).toFixed(0)}%` : '—'}
          </h1>
          <span className="text-slate-600 font-bold uppercase text-[12px]">
            Global Average Competency
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[15px] mt-[15px]">
        <div className={cardCls}>
          <h3 className="m-0 mb-5 text-slate-900">⚠️ Hardest Scenarios (Lowest Student Averages)</h3>
          {(!data?.hardest_scenarios || data.hardest_scenarios.length === 0) ? (
            <p className="text-slate-400 text-[13px]">No failed scenario telemetry recorded yet.</p>
          ) : (
            <ul className="pl-5 text-slate-300 leading-[1.6]">
              {data.hardest_scenarios.map((item, i) => (
                <li key={i} className="mb-2 text-[13px] text-slate-300">
                  <strong>{item.title}</strong>: Avg Score:{' '}
                  <span className="text-red-400 font-bold">{(item.avg_score * 10).toFixed(0)}%</span>
                  {' '}(Attempts: {item.attempts})
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={cardCls}>
          <h3 className="m-0 mb-5 text-slate-900">📊 Student Strengths Heatmap</h3>
          {(!data?.skill_heatmap || Object.keys(data.skill_heatmap).length === 0) ? (
            <p className="text-slate-400 text-[13px]">No skill charts telemetry recorded yet.</p>
          ) : (
            <ul className="list-none p-0 m-0">
              {Object.entries(data.skill_heatmap).map(([skill, val]) => (
                <li key={skill} className="mb-[10px]">
                  <div className="flex justify-between text-[12px] mb-1 text-slate-300">
                    <span>{skill}</span><strong>{val}%</strong>
                  </div>
                  <div className="w-full h-[6px] bg-slate-800 rounded-[3px] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-[3px]" style={{ width: `${val}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
