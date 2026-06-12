'use client'
import { useState } from 'react';
import type { DatResult, DatLeaderboardEntry } from '@/lib/types/admin';

interface Props {
  results: DatResult[];
  leaderboard: DatLeaderboardEntry[];
  loading: boolean;
  onRefresh: () => void;
  onViewEval: (evalData: Record<string, any>) => void;
}

export default function DatTab({ results, leaderboard, loading, onRefresh, onViewEval }: Props) {
  const [filter, setFilter] = useState('');

  const filtered = filter
    ? results.filter(r =>
        (r.student_email || '').toLowerCase().includes(filter.toLowerCase()) ||
        (r.student_name || '').toLowerCase().includes(filter.toLowerCase())
      )
    : results;

  const scoreColor = (pct: number) =>
    pct >= 115 ? '#10b981' : pct >= 100 ? '#3b82f6' : pct >= 90 ? '#f59e0b' : '#ef4444';

  return (
    <>
      <div className="card-admin-sec">
        <h3 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>🚛 DAT Load Board Simulator Engine</h3>
        <p style={{ margin: '0 0 20px 0', fontSize: 13, color: '#475569' }}>
          The Simulator Engine is now 100% dynamic and AI-driven. All market conditions, broker difficulty,
          and crisis events are procedurally generated in real-time.
        </p>
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', padding: 16, borderRadius: 8, color: '#047857', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.5rem' }}>✨</span>
          <span>AI Dynamic Generation Engine is Active</span>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card-admin-sec" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: '#0f172a' }}>🏆 Negotiation Leaderboard</h3>
          <button onClick={onRefresh} disabled={loading} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f172a', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            {loading ? '⏳ Loading...' : '🔄 Refresh'}
          </button>
        </div>
        <p style={{ margin: '0 0 16px 0', fontSize: 13, color: '#475569' }}>
          Students ranked by average negotiation score. &gt;100% means the student negotiated above the listed rate.
        </p>
        <table className="table-admin">
          <thead>
            <tr>
              <th style={{ width: 30 }}>#</th><th>Student</th><th>Avg Score</th>
              <th>Calls</th><th>Booked</th><th>Max Rate</th><th>Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#475569' }}>No negotiations recorded yet.</td></tr>
            ) : leaderboard.map((s, idx) => {
              const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`;
              const sc = scoreColor(s.avg_score);
              return (
                <tr key={s._id}>
                  <td style={{ fontWeight: 800, fontSize: '1rem' }}>{medal}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{s.student_name || s._id}</div>
                    <div style={{ fontSize: 11, color: '#475569' }}>{s._id}</div>
                  </td>
                  <td><span style={{ fontWeight: 900, fontSize: '1.1rem', color: sc }}>{s.avg_score}%</span></td>
                  <td style={{ color: '#475569' }}>{s.total_calls}</td>
                  <td><span style={{ color: '#10b981', fontWeight: 700 }}>{s.booked_count}</span></td>
                  <td style={{ fontWeight: 700 }}>${(s.max_rate || 0).toLocaleString()}</td>
                  <td style={{ color: '#38bdf8', fontWeight: 700 }}>${(s.total_revenue || 0).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* All Results */}
      <div className="card-admin-sec" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: '#0f172a' }}>📋 All Negotiation Results</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Filter by student..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a', padding: '6px 10px', borderRadius: 4, fontSize: 12, width: 180 }}
            />
            <span style={{ fontSize: 12, color: '#475569' }}>{filtered.length} {filter ? 'shown' : 'total'}</span>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-admin">
            <thead>
              <tr>
                <th>Time</th><th>Type</th><th>Student</th><th>Broker</th>
                <th>Route</th><th>Posted Rate</th><th>Agreed Rate</th>
                <th>Score</th><th>Result</th><th>AI Review</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', color: '#475569' }}>No results yet.</td></tr>
              ) : filtered.map((r, i) => {
                const sc = scoreColor(r.score_pct);
                const statusBadge = r.status === 'Booked'
                  ? <span style={{ background: '#10b981', color: '#0f172a', padding: '2px 7px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>✅ BOOKED</span>
                  : <span style={{ background: '#475569', color: '#0f172a', padding: '2px 7px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>❌ HUNG UP</span>;
                const typeBadge = r.type === 'Email'
                  ? <span style={{ background: '#e0e7ff', color: '#4f46e5', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 800, border: '1px solid #c7d2fe', display: 'inline-block', marginRight: 6 }}>✉️ EMAIL</span>
                  : <span style={{ background: '#fce8e6', color: '#d93025', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 800, border: '1px solid #f8bbd0', display: 'inline-block', marginRight: 6 }}>📞 CALL</span>;
                return (
                  <tr key={i}>
                    <td style={{ fontSize: 11, color: '#475569' }}>{r.timestamp_str || ''}</td>
                    <td>{typeBadge}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 12 }}>{r.student_name || r.student_email}</div>
                      <div style={{ fontSize: 10, color: '#475569' }}>{r.student_email}</div>
                    </td>
                    <td style={{ color: '#475569', fontSize: 12 }}>{r.broker_name}</td>
                    <td style={{ fontSize: 12 }}>{r.origin} → {r.destination}</td>
                    <td style={{ fontSize: 12 }}>${(r.posted_rate || 0).toLocaleString()}</td>
                    <td style={{ fontWeight: 700, fontSize: 12 }}>${(r.agreed_rate || 0).toLocaleString()}</td>
                    <td>
                      <span style={{ fontWeight: 900, color: sc, fontSize: '1rem' }}>{r.score_pct}%</span>
                      <div style={{ fontSize: 10, color: sc, marginTop: 2 }}>{r.grade}</div>
                    </td>
                    <td>{statusBadge}</td>
                    <td>
                      <button
                        className="btn"
                        style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f172a', padding: '4px 8px', borderRadius: 4, fontSize: 11 }}
                        onClick={() => onViewEval(r.ai_evaluation || {})}
                      >
                        🤖 View Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
