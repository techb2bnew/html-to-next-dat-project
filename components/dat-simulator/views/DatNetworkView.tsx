'use client'

const partners = [
  { name: 'TQL (Total Quality Logistics)', mc: '000000', city: 'Cincinnati, OH', credit: 98, dtp: 28, rating: '★★★☆☆' },
  { name: 'C.H. Robinson', mc: '111111', city: 'Eden Prairie, MN', credit: 99, dtp: 22, rating: '★★★★☆' },
  { name: 'Coyote Logistics', mc: '222222', city: 'Chicago, IL', credit: 95, dtp: 26, rating: '★★★★☆' },
]

export default function DatNetworkView() {
  return (
    <div id="dat-view-network" className="sub-view p-8">
      <h2 className="font-extrabold text-2xl m-0 mb-5">Private Network Directory</h2>
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex gap-2.5 mb-5">
          <input type="text" placeholder="Search by MC#, DOT, or Company Name" className="flex-1 p-2.5 border border-slate-300 rounded" />
          <button className="bg-blue-600 text-white border-none px-5 py-2.5 rounded font-bold cursor-pointer">Search</button>
        </div>

        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]" id="network-container">
          {partners.map(p => (
            <div key={p.mc} className="border border-slate-200 rounded p-4">
              <div className="font-bold text-blue-900 text-lg">{p.name}</div>
              <div className="text-sm text-slate-500 mt-1">MC# {p.mc} • {p.city}</div>
              <div className="flex justify-between mt-4 pt-2.5 border-t border-slate-100">
                <div><div className="font-bold text-emerald-500">{p.credit}</div><div className="text-[0.7rem] text-slate-500">CREDIT</div></div>
                <div><div className="font-bold text-slate-800">{p.dtp}</div><div className="text-[0.7rem] text-slate-500">DTP</div></div>
                <div><div className="font-bold text-amber-400">{p.rating}</div><div className="text-[0.7rem] text-slate-500">RATING</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
