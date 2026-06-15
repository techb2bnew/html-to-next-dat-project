'use client'

import type { DatView, DatLoad, NationalLoadItem } from '@/lib/types/dat'

interface Props {
  nationalLoads: NationalLoadItem[]
  natEquipment: string
  natLoading: boolean
  onChangeEquip: (e: string) => void
  recommendedLoads: DatLoad[]
  recLoading: boolean
  onRegenerate: () => void
  onNav: (v: DatView) => void
  onCallBroker: (load: DatLoad) => void
  onEmailBroker: (load: DatLoad) => void
}

export default function DatDashboardView({
  nationalLoads, natEquipment, natLoading,
  onChangeEquip,
  recommendedLoads, recLoading, onRegenerate,
  onNav, onCallBroker, onEmailBroker,
}: Props) {
  const maxIn = Math.max(...nationalLoads.map(n => n.loads_in), 1)
  const maxOut = Math.max(...nationalLoads.map(n => n.loads_out), 1)

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="bg-white px-8 py-4 text-2xl font-extrabold border-b border-slate-200 flex-shrink-0">Dashboard</div>

      <div className="p-8 flex gap-8 overflow-y-auto flex-1">
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              className="bg-white border border-slate-300 px-4 py-2 rounded-full text-xs font-bold cursor-pointer flex items-center gap-1.5 hover:bg-slate-50"
              onClick={() => onNav('post_truck')}
            >⊕ POST A TRUCK</button>
            <button
              className="bg-white border border-slate-300 px-4 py-2 rounded-full text-xs font-bold cursor-pointer flex items-center gap-1.5 hover:bg-slate-50"
              onClick={() => onNav('search')}
            >🔍 SEARCH LOADS</button>
            <button
              className="bg-white border border-slate-300 px-4 py-2 rounded-full text-xs font-bold cursor-pointer flex items-center gap-1.5 hover:bg-slate-50"
              onClick={() => onNav('trucks')}
            >🚛 SEARCH TRUCKS</button>
          </div>

          {/* Info cards */}
          <div className="flex gap-5">
            <div className="flex-1 bg-white p-5 border border-slate-200 rounded">
              <h3 className="mt-0 text-sm font-bold">DAT One Mobile</h3>
              <p className="text-slate-500 text-xs">The Most Loads Available. Real Loads, Real Money, GUARANTEED!</p>
              <a href="#" className="text-[#0044cc] text-xs font-bold no-underline">GET THE APP &gt;</a>
            </div>
            <div className="flex-1 bg-white p-5 border border-slate-200 rounded">
              <h3 className="mt-0 text-sm font-bold">Help Center</h3>
              <p className="text-slate-500 text-xs">Contact information, trouble shooting, FAQ&apos;s, and training videos.</p>
              <a href="#" className="text-[#0044cc] text-xs font-bold no-underline">HELP CENTER &gt;</a>
            </div>
          </div>

          {/* Recommended Loads */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center border-b-2 border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="m-0 text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  ✨ Recommended Loads
                  <span className="bg-blue-50 text-blue-600 text-[0.7rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Tailored Match</span>
                </h3>
                <p className="mt-1 text-xs text-slate-500">Freshly matched with your active trucks&apos; types and locations.</p>
              </div>
              <button
                onClick={onRegenerate}
                className="bg-blue-600 hover:bg-blue-700 text-white border-none px-4 py-2 rounded text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                Regenerate Loads
              </button>
            </div>

            {recLoading ? (
              <div className="py-10 text-center text-slate-500 text-sm">
                <div className="text-4xl mb-4 inline-block animate-spin">🔄</div>
                <div>Matching your active trucks with high-paying loads...</div>
              </div>
            ) : recommendedLoads.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-sm">No recommended loads yet. Click &quot;Regenerate Loads&quot; to match.</div>
            ) : (
              <div className="overflow-x-auto mt-2.5">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-slate-500">
                      {['Age','Rate','Miles','Origin','','Destination','Pickup','Equipment','Broker','Phone','Action'].map(h => (
                        <th key={h} className="p-2.5 text-xs font-semibold text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recommendedLoads.map((load, i) => {
                      const rate = load.rate || 0
                      const miles = load.trip_miles || load.distance || 0
                      const rpm = miles > 0 ? (rate / miles).toFixed(2) : '-'
                      const origin = `${load.origin?.city || ''}, ${load.origin?.state || ''}`
                      const dest = `${load.destination?.city || ''}, ${load.destination?.state || ''}`
                      const broker = load.broker?.company || load.broker?.name || '-'
                      const phone = load.broker?.phone || '-'
                      return (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-2.5 text-xs text-slate-500">{load.age || '2m'}</td>
                          <td className="p-2.5 font-bold text-green-700">${rate.toLocaleString()} <span className="text-slate-400 font-normal text-[0.7rem]">${rpm}/mi</span></td>
                          <td className="p-2.5 text-xs">{miles > 0 ? miles.toLocaleString() : '-'}</td>
                          <td className="p-2.5 text-xs font-medium">{origin}</td>
                          <td className="p-2.5 text-slate-400">→</td>
                          <td className="p-2.5 text-xs font-medium">{dest}</td>
                          <td className="p-2.5 text-xs">{load.pickup_date || 'Today'}</td>
                          <td className="p-2.5 text-xs">{load.equipment?.type || 'Dry Van'}</td>
                          <td className="p-2.5 text-xs">{broker}</td>
                          <td className="p-2.5 text-xs">{phone}</td>
                          <td className="p-2.5">
                            <button
                              className="recommended-match-btn"
                              onClick={() => onCallBroker(load)}
                            >
                              📞 Call Broker
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* What's New */}
          <div className="bg-white p-8 border border-slate-200 rounded min-h-[200px]">
            <h3 className="mt-0 text-base font-bold">What&apos;s New</h3>
            <div className="mt-5">
              <div className="text-xs font-bold text-slate-500">NEW December 17th, 2024</div>
              <ul className="text-sm text-slate-800 pl-5 mt-1">
                <li>Carriers can now use <strong>Quick Post</strong> when posting trucks using smaller screens.</li>
              </ul>
            </div>
            <div className="mt-5">
              <div className="text-xs font-bold text-slate-500">November 21st, 2024</div>
              <ul className="text-sm text-slate-800 pl-5 mt-1">
                <li>Carriers can now have advanced sorting capabilities within the Rate and Company columns.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column — National Loads Count */}
        <div className="w-[340px] bg-white border border-slate-200 rounded flex flex-col overflow-hidden max-h-[600px] flex-shrink-0">
          <div className="text-center px-5 pt-8 pb-2.5">
            <div className="inline-block bg-[#0044cc] text-white font-black text-2xl tracking-[2px] px-2 py-0.5 rounded-sm">D A T</div>
            <div className="font-black text-[1.4rem] mt-2">National Loads Count</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Where the Loads Are</div>
          </div>

          <div className="px-5 py-2.5">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-2.5">
              <span className="text-lg">↻</span> Live Data
            </div>
            <select
              value={natEquipment}
              onChange={e => onChangeEquip(e.target.value)}
              className="w-full border border-slate-400 rounded px-3 py-2.5 text-sm text-slate-800 font-medium bg-white cursor-pointer"
            >
              <option>Vans (Standard)</option>
              <option>Reefers</option>
              <option>Flatbeds</option>
              <option>Power Only</option>
              <option>Hotshot</option>
            </select>
          </div>

          <div className="flex justify-between text-slate-900 font-extrabold text-[0.7rem] tracking-widest px-5 py-2.5 border-b border-slate-200 mb-2.5">
            <span>ST</span><span>LOADS IN</span><span>LOADS OUT</span>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-5">
            {natLoading ? (
              <div className="text-center text-slate-500 text-xs py-5">Loading...</div>
            ) : nationalLoads.length === 0 ? (
              <div className="text-center text-slate-500 text-xs py-5">No data</div>
            ) : (
              nationalLoads.map((item, i) => {
                const inPct = Math.round((item.loads_in / maxIn) * 100)
                const outPct = Math.round((item.loads_out / maxOut) * 100)
                return (
                  <div key={i} className="flex items-center gap-2.5 py-1.5 border-b border-slate-100 last:border-0">
                    <div className="font-extrabold text-[0.8rem] text-slate-800 w-7">{item.state}</div>
                    <div className="flex-1">
                      <div
                        className="bg-blue-600 h-3 rounded-sm mb-0.5 text-white text-[0.6rem] font-bold flex items-center px-1"
                        style={{ width: `${Math.max(inPct, 5)}%` }}
                      >{item.loads_in}</div>
                      <div
                        className="bg-orange-400 h-3 rounded-sm text-white text-[0.6rem] font-bold flex items-center px-1"
                        style={{ width: `${Math.max(outPct, 5)}%` }}
                      >{item.loads_out}</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
