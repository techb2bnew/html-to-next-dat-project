'use client'

import type { Carrier, PostedTruck } from '@/lib/types/dat'

interface Props {
  carriers: Carrier[]
  loading: boolean
  postedTrucks: PostedTruck[]
  onDriverChat: (carrier: Carrier) => void
}

const STATUS_COLORS: Record<string, string> = {
  'In Transit': 'bg-green-100 text-green-700',
  'Available': 'bg-blue-100 text-blue-700',
  'Loading': 'bg-yellow-100 text-yellow-700',
  'Delayed': 'bg-red-100 text-red-700',
  'On Break': 'bg-orange-100 text-orange-700',
}

export default function DatTrucksView({ carriers, loading, postedTrucks, onDriverChat }: Props) {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-8">
      {/* Posted Trucks */}
      <div className="mb-10">
        <h2 className="font-extrabold text-2xl m-0 mb-4">My Posted Trucks</h2>
        {postedTrucks.length === 0 ? (
          <div className="text-slate-500 text-sm">No posted trucks yet. Go to &quot;Post a Truck&quot; to post.</div>
        ) : (
          <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
            {postedTrucks.map((t, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="font-bold text-slate-800">{t.equipment}</div>
                  <span className="text-xs text-slate-500">{t.date_available}</span>
                </div>
                <div className="text-sm text-slate-600">{t.origin} → {t.destination}</div>
                <div className="text-xs text-slate-400 mt-2">{t.posted_at}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Dispatches */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="font-extrabold text-2xl m-0">Active Dispatches</h2>
      </div>

      {loading ? (
        <div className="text-slate-500 text-sm">Loading dispatches...</div>
      ) : carriers.length === 0 ? (
        <div className="text-slate-500 text-sm">No active trucks. Complete a search and book a load to see trucks here.</div>
      ) : (
        <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
          {carriers.map((c, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-bold text-slate-800 text-lg">{c.name}</div>
                  <div className="text-xs text-slate-500">{c.truck_type}</div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLORS[c.status] || 'bg-slate-100 text-slate-600'}`}>
                  {c.status}
                </span>
              </div>
              <div className="flex gap-4 text-sm text-slate-600 mb-4">
                <div><span className="font-semibold">Driver:</span> {c.driver}</div>
              </div>
              <div className="text-sm text-slate-600 mb-4">
                <span className="font-semibold">Location:</span> {c.city}, {c.state}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onDriverChat(c)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border-none px-3 py-2 rounded font-semibold text-sm cursor-pointer"
                >
                  💬 Chat Driver
                </button>
                <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-none px-3 py-2 rounded font-semibold text-sm cursor-pointer">
                  📍 Track
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
