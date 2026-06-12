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
    <div className="admin-tab-bar" style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`btn btn-tab${active === tab.id ? ' active' : ''}`}
          onClick={() => onChange(tab.id)}
          style={{
            background: 'transparent',
            border: '1px solid transparent',
            color: active === tab.id ? undefined : (tab.color ?? '#475569'),
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: 6,
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
