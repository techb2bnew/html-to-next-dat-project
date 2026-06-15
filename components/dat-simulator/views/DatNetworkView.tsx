'use client'

const partners = [
  { name: 'TQL (Total Quality Logistics)', mc: '000000', city: 'Cincinnati, OH', credit: 98, dtp: 28, rating: '★★★☆☆' },
  { name: 'C.H. Robinson', mc: '111111', city: 'Eden Prairie, MN', credit: 99, dtp: 22, rating: '★★★★☆' },
  { name: 'Coyote Logistics', mc: '222222', city: 'Chicago, IL', credit: 95, dtp: 26, rating: '★★★★☆' },
]

export default function DatNetworkView() {
  return (
    <div id="dat-view-network" className="sub-view" style={{ padding: 30 }}>
      <h2 style={{ fontWeight: 800, fontSize: '1.5rem', margin: '0 0 20px 0' }}>Private Network Directory</h2>

      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <input type="text" placeholder="Search by MC#, DOT, or Company Name" style={{ flex: 1, padding: 10, border: '1px solid #cbd5e1', borderRadius: 4 }} />
          <button style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 4, fontWeight: 'bold', cursor: 'pointer' }}>Search</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 15 }} id="network-container">
          {partners.map((p) => (
            <div key={p.mc} style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: 15 }}>
              <div style={{ fontWeight: 'bold', color: '#1e3a8a', fontSize: '1.1rem' }}>{p.name}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 5 }}>MC# {p.mc} • {p.city}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 15, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#10b981' }}>{p.credit}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>CREDIT</div>
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{p.dtp}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>DTP</div>
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#f59e0b' }}>{p.rating}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>RATING</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
