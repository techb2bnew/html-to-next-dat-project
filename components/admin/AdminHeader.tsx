'use client'

interface Props {
  user: string;
  onRefresh: () => void;
  onClearAll: () => void;
  onLogout: () => void;
}

export default function AdminHeader({ user, onRefresh, onClearAll, onLogout }: Props) {
  return (
    <div className="page-header">
      <div>
        <h1>Dispatcher Practice Admin</h1>
        <p>View practice sessions · AI scoring · Manual grading</p>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {user && <span style={{ fontSize: 12, color: '#64748b' }}>👤 {user}</span>}
        <button className="btn btn-primary" onClick={onRefresh}>🔄 Refresh List</button>
        <button
          className="btn btn-danger"
          onClick={onClearAll}
          style={{ background: '#ef4444', border: '1px solid #dc2626', color: '#fff' }}
        >
          🗑️ Clear All Sessions
        </button>
        <button
          className="btn btn-close"
          onClick={onLogout}
          style={{ border: '1px solid #ef4444', color: '#f87171' }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
