'use client'
import type { LiveActivity, LiveStudent } from '@/lib/types/admin';

interface Props {
  activities: LiveActivity[];
  students: LiveStudent[];
  onSync: () => void;
  onViewStudent: (email: string) => void;
}

const cardCls = "bg-white border border-slate-200 rounded-xl p-6 shadow-[0_4px_6px_rgba(0,0,0,0.1)]";
const tableCls = "w-full border-collapse mt-[15px] [&_th]:text-left [&_td]:text-left [&_th]:p-3 [&_td]:p-3 [&_th]:border-b [&_td]:border-b [&_th]:border-slate-200 [&_td]:border-slate-200 [&_th]:text-[13px] [&_td]:text-[13px] [&_th]:text-slate-600 [&_th]:font-bold [&_th]:bg-white";

export default function LiveActivityTab({ activities, students, onSync, onViewStudent }: Props) {
  return (
    <div className="grid grid-cols-[1fr_2fr] gap-[15px] mt-[15px]">
      {/* Online Students */}
      <div className={cardCls}>
        <h3 className="m-0 mb-[15px] text-emerald-500">🟢 Online Students</h3>
        <p className="m-0 mb-5 text-[13px] text-slate-600">
          Currently tracked students interacting with the DAT Simulator.
        </p>
        <table className={tableCls}>
          <thead>
            <tr><th>Student</th><th>Current Rank</th><th>Loads</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan={4} className="text-center text-slate-400">No active students.</td></tr>
            ) : students.map(st => (
              <tr key={st.email}>
                <td className="text-white">
                  <div className="font-bold">{st.name}</div>
                  <div className="text-[11px] text-slate-500">{st.email}</div>
                </td>
                <td>
                  <span className="bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded text-[12px] font-bold">
                    {st.level_info?.title || 'Dispatcher'}
                  </span>
                </td>
                <td className="text-slate-300 font-bold">{st.booked_loads || 0}</td>
                <td>
                  <button
                    className="font-bold rounded-xl text-white px-2 py-1 text-[11px] cursor-pointer bg-indigo-500"
                    onClick={() => onViewStudent(st.email)}
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
      <div className={cardCls}>
        <div className="flex justify-between items-center mb-[15px]">
          <h3 className="m-0 text-slate-900">📡 Real-time Activity Feed</h3>
          <button
            onClick={onSync}
            className="bg-[#334155] border border-slate-600 text-slate-900 px-[10px] py-[5px] rounded cursor-pointer"
          >
            🔄 Sync Now
          </button>
        </div>
        <table className={tableCls}>
          <thead>
            <tr><th>Time</th><th>Student</th><th>Action</th><th>Details</th></tr>
          </thead>
          <tbody>
            {activities.length === 0 ? (
              <tr><td colSpan={4} className="text-center text-slate-400">No recent activity logged.</td></tr>
            ) : activities.map((act, i) => (
              <tr key={i}>
                <td className="text-slate-300 text-[12px]">{act.time_str}</td>
                <td className="text-white font-semibold">{act.name || act.email}</td>
                <td className="text-sky-400">{act.action}</td>
                <td className="text-slate-400 text-[12px]">{act.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
