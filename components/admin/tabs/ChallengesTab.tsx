'use client'
import type { Challenge } from '@/lib/types/admin';

interface Props {
  challenges: Challenge[];
  loading: boolean;
  onDelete: (id: string) => void;
}

export default function ChallengesTab({ challenges, loading, onDelete }: Props) {
  return (
    <>
      <div className="card-admin-sec">
        <h3 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>🧠 Dynamic AI Challenge Engine</h3>
        <p style={{ margin: '0 0 20px 0', fontSize: 13, color: '#475569' }}>
          The academy now utilizes a 100% dynamic AI generation engine. Challenges, broker personas, logistics details,
          and negotiations are procedurally generated in real-time. Manual static challenge creation has been deprecated.
        </p>
        <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid #6366f1', padding: 16, borderRadius: 8, color: '#4338ca', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.5rem' }}>✨</span>
          <span>AI Procedural Scenario Engine is Active</span>
        </div>
      </div>

      <div className="card-admin-sec">
        <h3 style={{ margin: '0 0 15px 0', color: '#0f172a' }}>⚙️ Active Dispatch Academy Scenarios</h3>
        <table className="table-admin">
          <thead>
            <tr>
              <th>Scenario Title</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>AI Actor Details</th>
              <th>Stats</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20 }}>Loading scenarios...</td></tr>
            )}
            {!loading && challenges.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8' }}>No custom scenarios loaded.</td></tr>
            )}
            {challenges.map(ch => (
              <tr key={ch.challenge_id}>
                <td style={{ fontWeight: 700, color: '#fff' }}>{ch.title}</td>
                <td>
                  <span className="badge badge-completed" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', fontSize: 10, fontWeight: 700 }}>
                    {ch.category}
                  </span>
                </td>
                <td><strong style={{ color: '#cbd5e1' }}>{ch.difficulty}</strong></td>
                <td style={{ color: '#94a3b8' }}>{ch.character.name} ({ch.character.role})</td>
                <td style={{ color: '#94a3b8' }}>⏱️ {ch.duration} | 🏆 {ch.xp_reward} XP</td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => onDelete(ch.challenge_id)}
                    style={{ padding: '4px 8px', fontSize: 11, background: '#ef4444', border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer' }}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
