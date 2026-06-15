'use client'

import type { DatView } from '@/lib/types/dat'

interface Props {
  view: DatView
  sidebarOpen: boolean
  onNav: (v: DatView) => void
  onClose: () => void
  onLogout: () => void
}

const NAV_ITEMS: { view: DatView; icon: string; label: string }[] = [
  { view: 'dashboard', icon: '⌂', label: 'Dashboard' },
  { view: 'search', icon: '🔍', label: 'Search Loads' },
  { view: 'trucks', icon: '🚛', label: 'My Trucks (Active)' },
  { view: 'loads', icon: '📦', label: 'My Loads' },
  { view: 'network', icon: '🔒', label: 'Private Network' },
  { view: 'tools', icon: '🛠', label: 'Tools' },
]

export default function DatSidebar({ view, sidebarOpen, onNav, onClose, onLogout }: Props) {
  return (
    <div
      className={`dat-sidebar w-[250px] min-w-[250px] bg-[#111827] text-slate-400 flex flex-col border-r border-slate-800 z-50 transition-[left] duration-300${sidebarOpen ? ' open' : ''}`}
    >
      <div className="px-5 py-5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#2563eb] text-white font-black text-2xl px-3 py-2 leading-none tracking-tight rounded">DAT</div>
          <div>
            <div className="text-white font-extrabold">One</div>
            <div className="text-[0.75rem] font-semibold">Freight</div>
          </div>
        </div>
        <button
          className="dat-sidebar-close-btn hidden bg-transparent border-none text-slate-400 text-2xl cursor-pointer p-1"
          onClick={onClose}
        >✖</button>
      </div>

      <nav className="dat-nav flex-1 pt-3">
        {NAV_ITEMS.map(item => (
          <div
            key={item.view}
            className={`dat-nav-item flex items-center gap-4 px-5 py-4 font-semibold text-[0.95rem] cursor-pointer hover:text-white hover:bg-white/5 transition-all${view === item.view ? ' active' : ''}`}
            onClick={() => onNav(item.view)}
          >
            <span className="text-xl">{item.icon}</span> {item.label}
          </div>
        ))}
        {/* Post Truck — only nav, no sidebar highlight */}
        <div
          className="flex items-center gap-4 px-5 py-4 font-semibold text-[0.95rem] cursor-pointer hover:text-white hover:bg-white/5 transition-all"
          onClick={() => onNav('post_truck')}
        >
          <span className="text-xl">➕</span> Post a Truck
        </div>
      </nav>

      <div className="border-t border-slate-800 py-2">
        <div className="flex items-center gap-4 px-5 py-4 font-semibold text-[0.95rem] cursor-pointer hover:text-white hover:bg-white/5 transition-all">
          <span>🔔</span> Notifications
        </div>
        <div className="flex items-center gap-4 px-5 py-4 font-semibold text-[0.95rem] cursor-pointer hover:text-white hover:bg-white/5 transition-all">
          <span>❓</span> Support ⌄
        </div>
        <div className="flex items-center gap-4 px-5 py-4 font-semibold text-[0.95rem] cursor-pointer hover:text-white hover:bg-white/5 transition-all">
          <span>👤</span> My Account ⌄
        </div>
        <div
          className="flex items-center gap-4 px-5 py-4 font-semibold text-[0.95rem] cursor-pointer hover:bg-white/5 transition-all text-red-500"
          onClick={onLogout}
        >
          <span>🚪</span> Logout
        </div>
      </div>
    </div>
  )
}
