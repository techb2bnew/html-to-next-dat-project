'use client'

import type { BookedLoad } from '@/lib/types/dat'

interface Props {
  bookedLoads: BookedLoad[]
  loadCount: number
  revenue: number
  loading: boolean
}

export default function DatLoadsView({ bookedLoads, loadCount, revenue, loading }: Props) {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-8">
      <h2 className="font-extrabold text-2xl m-0 mb-5">My Loads (History &amp; Active)</h2>

      {/* Stats */}
      <div className="flex gap-5 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex-1 text-center">
          <div className="text-3xl font-extrabold text-blue-600">{loadCount}</div>
          <div className="text-xs text-slate-500 font-semibold mt-1">LOADS BOOKED</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex-1 text-center">
          <div className="text-3xl font-extrabold text-green-600">${revenue.toLocaleString()}</div>
          <div className="text-xs text-slate-500 font-semibold mt-1">TOTAL REVENUE</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5">
        {loading ? (
          <p className="text-slate-500 text-sm">Loading booked loads...</p>
        ) : bookedLoads.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <div className="text-4xl mb-3">📦</div>
            <div className="font-semibold mb-1">No loads yet</div>
            <div className="text-sm">Book a load via the Call Broker feature to see it here.</div>
          </div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200">
                {['Ref #','Origin','Destination','Rate','Status','Broker'].map(h => (
                  <th key={h} className="p-2.5 text-xs font-semibold text-slate-500 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookedLoads.map((load, i) => {
                const broker = typeof load.broker === 'string'
                  ? load.broker
                  : load.broker?.company || load.broker?.name || '-'
                return (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-2.5 text-xs font-mono">{load.load_id || load.reference_number || `#${i + 1}`}</td>
                    <td className="p-2.5 text-xs">{load.origin ? `${load.origin.city}, ${load.origin.state}` : '-'}</td>
                    <td className="p-2.5 text-xs">{load.destination ? `${load.destination.city}, ${load.destination.state}` : '-'}</td>
                    <td className="p-2.5 font-bold text-green-700">${(load.rate || 0).toLocaleString()}</td>
                    <td className="p-2.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        load.status === 'Delivered' ? 'bg-green-100 text-green-700'
                        : load.status === 'In Transit' ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {load.status || 'Booked'}
                      </span>
                    </td>
                    <td className="p-2.5 text-xs">{broker}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
