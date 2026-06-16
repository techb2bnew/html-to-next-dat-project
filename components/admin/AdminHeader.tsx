'use client'

interface Props {
  user: string;
  onRefresh: () => void;
  onClearAll: () => void;
  onLogout: () => void;
}

export default function AdminHeader({ user, onRefresh, onClearAll, onLogout }: Props) {
  return (
    <div className="flex justify-between items-center mb-8 pb-6 border-b border-black/[0.08] flex-wrap gap-6">
      <div>
        <h1 className="text-[1.75rem] font-extrabold bg-gradient-to-br from-blue-400 to-violet-400 bg-clip-text text-transparent">Dispatcher Practice Admin</h1>
        <p className="text-slate-600 text-sm">View practice sessions · AI scoring · Manual grading</p>
      </div>
      <div className="flex gap-[10px] items-center">
        {user && <span className="text-[12px] text-slate-500">👤 {user}</span>}
        <button
          className="px-5 py-[10px] rounded-xl font-bold text-sm cursor-pointer inline-flex items-center gap-2 border-none bg-indigo-600 text-white hover:bg-indigo-800 hover:-translate-y-px transition"
          onClick={onRefresh}
        >
          🔄 Refresh List
        </button>
        <button
          className="px-5 py-[10px] rounded-xl font-bold text-sm cursor-pointer inline-flex items-center gap-2 border-none bg-red-600 text-white hover:bg-red-700 hover:-translate-y-px transition"
          onClick={onClearAll}
        >
          🗑️ Clear All Sessions
        </button>
        <button
          className="px-5 py-[10px] rounded-xl font-bold text-sm cursor-pointer inline-flex items-center gap-2 bg-white border border-red-400 text-red-400 hover:bg-red-50 transition"
          onClick={onLogout}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
