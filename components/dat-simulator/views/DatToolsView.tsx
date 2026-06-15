'use client'

const tools = [
  { icon: '📈', name: 'RateMate', desc: 'Access historical and 15-day average market rates.' },
  { icon: '🗺️', name: 'LaneMakers', desc: 'Discover which brokers have the most volume in any lane.' },
  { icon: '⛽', name: 'IFTA Calculator', desc: 'Calculate your state-by-state fuel taxes automatically.' },
  { icon: '⏱️', name: 'Detention Tracking', desc: 'Log arrival times to enforce detention pay easily.' },
]

export default function DatToolsView() {
  return (
    <div id="dat-view-tools" className="sub-view p-8">
      <h2 className="font-extrabold text-2xl m-0 mb-5">Broker &amp; Carrier Tools</h2>
      <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
        {tools.map(t => (
          <div
            key={t.name}
            className="bg-white border border-slate-200 rounded-lg p-5 text-center cursor-pointer transition-shadow duration-200 hover:shadow-lg"
          >
            <div className="text-5xl mb-2.5">{t.icon}</div>
            <h3 className="m-0 mb-2.5 text-slate-800">{t.name}</h3>
            <p className="text-sm text-slate-500 m-0">{t.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
