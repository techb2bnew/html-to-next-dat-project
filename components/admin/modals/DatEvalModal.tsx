'use client'

interface Props {
  open: boolean;
  evalData: Record<string, any>;
  onClose: () => void;
}

export default function DatEvalModal({ open, evalData, onClose }: Props) {
  if (!open) return null;

  const hasData = evalData && Object.keys(evalData).length > 0;

  const scoreColor = (score: number) =>
    score >= 8 ? '#10b981' : score >= 6 ? '#f59e0b' : '#ef4444';

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[10001]">
      <div className="bg-slate-800 border border-[#334155] rounded-2xl w-[92%] max-w-[650px] max-h-[88vh] flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-[#334155] flex justify-between items-center bg-slate-900">
          <h3 className="m-0 text-slate-50 text-[17px] font-bold">🤖 AI Negotiation Review</h3>
          <button onClick={onClose} className="bg-[#334155] border border-slate-600 text-slate-400 px-3 py-[5px] rounded-md cursor-pointer">✕</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {!hasData ? (
            <p className="text-slate-600 text-center">No AI evaluation data available.</p>
          ) : (
            <>
              {/* Score metrics */}
              {typeof evalData.overall_score === 'number' && (
                <div className="text-center mb-6 p-5 bg-[rgba(56,189,248,0.05)] border border-[#334155] rounded-xl">
                  <div className="text-[48px] font-black text-sky-400">
                    {evalData.overall_score}<span className="text-[20px] text-slate-600">/10</span>
                  </div>
                  {evalData.tier && <div className="font-bold text-slate-200 mt-1">{evalData.tier}</div>}
                </div>
              )}

              {/* Individual metrics */}
              {evalData.scores && typeof evalData.scores === 'object' && (
                <div className="mb-5">
                  <h4 className="text-slate-500 text-[11px] font-bold uppercase m-0 mb-3">Score Breakdown</h4>
                  {Object.entries(evalData.scores).map(([key, val]: any) => {
                    const numVal = Number(val);
                    const sc = scoreColor(numVal);
                    return (
                      <div key={key} className="mb-[10px]">
                        <div className="flex justify-between text-[12px] mb-1">
                          <span className="text-slate-300">{key.replace(/_/g, ' ')}</span>
                          <span style={{ color: sc }} className="font-bold">{numVal}/10</span>
                        </div>
                        <div className="bg-slate-900 h-[6px] rounded-[3px] overflow-hidden">
                          <div style={{ width: `${numVal * 10}%`, height: '100%', background: `linear-gradient(90deg, ${sc}, ${sc}99)`, borderRadius: 3 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Strengths */}
              {evalData.strengths && evalData.strengths.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-emerald-500 text-[11px] font-bold uppercase m-0 mb-2">✅ Strengths</h4>
                  <ul className="m-0 pl-5 text-slate-400 text-[13px] leading-[1.7]">
                    {evalData.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {evalData.weaknesses && evalData.weaknesses.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-red-400 text-[11px] font-bold uppercase m-0 mb-2">⚠️ Weaknesses</h4>
                  <ul className="m-0 pl-5 text-slate-400 text-[13px] leading-[1.7]">
                    {evalData.weaknesses.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {evalData.recommendations && evalData.recommendations.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-amber-500 text-[11px] font-bold uppercase m-0 mb-2">💡 Recommendations</h4>
                  <ul className="m-0 pl-5 text-slate-400 text-[13px] leading-[1.7]">
                    {evalData.recommendations.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              {/* Narrative / feedback text */}
              {evalData.feedback && (
                <div className="bg-[rgba(99,102,241,0.08)] border border-indigo-500 p-[14px] rounded-lg mt-2">
                  <div className="font-bold text-[#a5b4fc] text-[12px] mb-[6px]">📝 AI Narrative</div>
                  <div className="text-slate-200 text-[13px] leading-[1.6]">{evalData.feedback}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
