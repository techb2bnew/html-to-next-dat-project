'use client'
import type { Analytics } from '@/lib/types/admin';

interface Props {
  analytics: Analytics | null;
  loading: boolean;
}

export default function AnalyticsTab({ analytics, loading }: Props) {
  if (loading) return <div className="loading-state"><div className="spinner" /><span>Loading analytics…</span></div>;

  const data = analytics;

  return (
    <>
      <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 24 }}>
        <div className="card-admin-sec" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 48, fontWeight: 800, color: '#38bdf8', margin: '0 0 10px 0' }}>
            {data?.total_attempts ?? 0}
          </h1>
          <span style={{ color: '#475569', fontWeight: 700, textTransform: 'uppercase', fontSize: 12 }}>
            Total AI Challenge Attempts
          </span>
        </div>
        <div className="card-admin-sec" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 48, fontWeight: 800, color: '#10b981', margin: '0 0 10px 0' }}>
            {data?.avg_score ? `${(data.avg_score * 10).toFixed(0)}%` : '—'}
          </h1>
          <span style={{ color: '#475569', fontWeight: 700, textTransform: 'uppercase', fontSize: 12 }}>
            Global Average Competency
          </span>
        </div>
      </div>

      <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card-admin-sec">
          <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>⚠️ Hardest Scenarios (Lowest Student Averages)</h3>
          {(!data?.hardest_scenarios || data.hardest_scenarios.length === 0) ? (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>No failed scenario telemetry recorded yet.</p>
          ) : (
            <ul style={{ paddingLeft: 20, color: '#cbd5e1', lineHeight: 1.6 }}>
              {data.hardest_scenarios.map((item, i) => (
                <li key={i} style={{ marginBottom: 8, fontSize: 13, color: '#cbd5e1' }}>
                  <strong>{item.title}</strong>: Avg Score:{' '}
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>{(item.avg_score * 10).toFixed(0)}%</span>
                  {' '}(Attempts: {item.attempts})
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-admin-sec">
          <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>📊 Student Strengths Heatmap</h3>
          {(!data?.skill_heatmap || Object.keys(data.skill_heatmap).length === 0) ? (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>No skill charts telemetry recorded yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {Object.entries(data.skill_heatmap).map(([skill, val]) => (
                <li key={skill} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, color: '#cbd5e1' }}>
                    <span>{skill}</span><strong>{val}%</strong>
                  </div>
                  <div style={{ width: '100%', height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${val}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #38bdf8)', borderRadius: 3 }} />
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
