'use client'
import type { AdminTab } from '@/lib/types/admin';

interface Props {
  active: AdminTab;
  onChange: (tab: AdminTab) => void;
}

const TABS: { id: AdminTab; label: string; color?: string }[] = [
  { id: 'submissions', label: '👥 Submissions Tracker' },
  { id: 'challenges', label: '⚙️ AI Challenge Manager' },
  { id: 'dat', label: '🚛 DAT Simulator' },
  { id: 'sim-live', label: '📡 Live Simulator Activity', color: '#10b981' },
  { id: 'analytics', label: '📊 Aggregated Analytics' },
];

export default function AdminTabBar({ active, onChange }: Props) {
  return (
    <div className="admin-tab-bar flex gap-3 mb-6 border-b border-slate-200 pb-3">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`btn btn-tab${active === tab.id ? ' active' : ''} bg-transparent border border-transparent font-bold text-[14px] cursor-pointer px-3 py-[6px] rounded-md`}
          onClick={() => onChange(tab.id)}
          style={{
            color: active === tab.id ? undefined : (tab.color ?? '#475569'),
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
