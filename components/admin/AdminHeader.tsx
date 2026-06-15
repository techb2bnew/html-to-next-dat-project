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
      <div className="flex gap-[10px] items-center">
        {user && <span className="text-[12px] text-slate-500">👤 {user}</span>}
        <button className="btn btn-primary" onClick={onRefresh}>🔄 Refresh List</button>
        <button
          className="btn btn-danger bg-red-400 border border-[#dc2626] text-white"
          onClick={onClearAll}
        >
          🗑️ Clear All Sessions
        </button>
        <button
          className="btn btn-close border border-red-400 text-[#f87171]"
          onClick={onLogout}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
