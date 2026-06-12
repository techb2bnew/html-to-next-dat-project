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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }}>
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, width: '92%', maxWidth: 650, maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a' }}>
          <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: 17, fontWeight: 700 }}>🤖 AI Negotiation Review</h3>
          <button onClick={onClose} style={{ background: '#334155', border: '1px solid #475569', color: '#94a3b8', padding: '5px 12px', borderRadius: 6, cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          {!hasData ? (
            <p style={{ color: '#475569', textAlign: 'center' }}>No AI evaluation data available.</p>
          ) : (
            <>
              {/* Score metrics */}
              {typeof evalData.overall_score === 'number' && (
                <div style={{ textAlign: 'center', marginBottom: 24, padding: '20px', background: 'rgba(56,189,248,0.05)', border: '1px solid #334155', borderRadius: 12 }}>
                  <div style={{ fontSize: 48, fontWeight: 900, color: '#38bdf8' }}>
                    {evalData.overall_score}<span style={{ fontSize: 20, color: '#475569' }}>/10</span>
                  </div>
                  {evalData.tier && <div style={{ fontWeight: 700, color: '#e2e8f0', marginTop: 4 }}>{evalData.tier}</div>}
                </div>
              )}

              {/* Individual metrics */}
              {evalData.scores && typeof evalData.scores === 'object' && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 12px 0' }}>Score Breakdown</h4>
                  {Object.entries(evalData.scores).map(([key, val]: any) => {
                    const numVal = Number(val);
                    const sc = scoreColor(numVal);
                    return (
                      <div key={key} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: '#cbd5e1' }}>{key.replace(/_/g, ' ')}</span>
                          <span style={{ color: sc, fontWeight: 700 }}>{numVal}/10</span>
                        </div>
                        <div style={{ background: '#0f172a', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${numVal * 10}%`, height: '100%', background: `linear-gradient(90deg, ${sc}, ${sc}99)`, borderRadius: 3 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Strengths */}
              {evalData.strengths && evalData.strengths.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ color: '#10b981', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 8px 0' }}>✅ Strengths</h4>
                  <ul style={{ margin: 0, paddingLeft: 20, color: '#94a3b8', fontSize: 13, lineHeight: 1.7 }}>
                    {evalData.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {evalData.weaknesses && evalData.weaknesses.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ color: '#ef4444', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 8px 0' }}>⚠️ Weaknesses</h4>
                  <ul style={{ margin: 0, paddingLeft: 20, color: '#94a3b8', fontSize: 13, lineHeight: 1.7 }}>
                    {evalData.weaknesses.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {evalData.recommendations && evalData.recommendations.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ color: '#f59e0b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 8px 0' }}>💡 Recommendations</h4>
                  <ul style={{ margin: 0, paddingLeft: 20, color: '#94a3b8', fontSize: 13, lineHeight: 1.7 }}>
                    {evalData.recommendations.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              {/* Narrative / feedback text */}
              {evalData.feedback && (
                <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid #6366f1', padding: 14, borderRadius: 8, marginTop: 8 }}>
                  <div style={{ fontWeight: 700, color: '#a5b4fc', fontSize: 12, marginBottom: 6 }}>📝 AI Narrative</div>
                  <div style={{ color: '#e2e8f0', fontSize: 13, lineHeight: 1.6 }}>{evalData.feedback}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
