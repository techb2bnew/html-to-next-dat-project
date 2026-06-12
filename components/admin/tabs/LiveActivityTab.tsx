'use client'
import type { LiveActivity, LiveStudent } from '@/lib/types/admin';

interface Props {
  activities: LiveActivity[];
  students: LiveStudent[];
  onSync: () => void;
  onViewStudent: (email: string) => void;
}

export default function LiveActivityTab({ activities, students, onSync, onViewStudent }: Props) {
  return (
    <div className="form-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
      {/* Online Students */}
      <div className="card-admin-sec">
        <h3 style={{ margin: '0 0 15px 0', color: '#10b981' }}>🟢 Online Students</h3>
        <p style={{ margin: '0 0 20px 0', fontSize: 13, color: '#475569' }}>
          Currently tracked students interacting with the DAT Simulator.
        </p>
        <table className="table-admin">
          <thead>
            <tr><th>Student</th><th>Current Rank</th><th>Loads</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8' }}>No active students.</td></tr>
            ) : students.map(st => (
              <tr key={st.email}>
                <td style={{ color: '#fff' }}>
                  <div style={{ fontWeight: 700 }}>{st.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{st.email}</div>
                </td>
                <td>
                  <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>
                    {st.level_info?.title || 'Dispatcher'}
                  </span>
                </td>
                <td style={{ color: '#cbd5e1', fontWeight: 700 }}>{st.booked_loads || 0}</td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => onViewStudent(st.email)}
                    style={{ padding: '4px 8px', fontSize: 11, cursor: 'pointer', background: '#6366f1' }}
                  >
                    View Performance
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Activity Feed */}
      <div className="card-admin-sec">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <h3 style={{ margin: 0, color: '#0f172a' }}>📡 Real-time Activity Feed</h3>
          <button
            onClick={onSync}
            style={{ background: '#334155', border: '1px solid #475569', color: '#0f172a', padding: '5px 10px', borderRadius: 4, cursor: 'pointer' }}
          >
            🔄 Sync Now
          </button>
        </div>
        <table className="table-admin">
          <thead>
            <tr><th>Time</th><th>Student</th><th>Action</th><th>Details</th></tr>
          </thead>
          <tbody>
            {activities.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8' }}>No recent activity logged.</td></tr>
            ) : activities.map((act, i) => (
              <tr key={i}>
                <td style={{ color: '#cbd5e1', fontSize: 12 }}>{act.time_str}</td>
                <td style={{ color: '#fff', fontWeight: 600 }}>{act.name || act.email}</td>
                <td style={{ color: '#38bdf8' }}>{act.action}</td>
                <td style={{ color: '#94a3b8', fontSize: 12 }}>{act.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
