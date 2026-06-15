'use client'

const tools = [
  { icon: '📈', name: 'RateMate', desc: 'Access historical and 15-day average market rates.' },
  { icon: '🗺️', name: 'LaneMakers', desc: 'Discover which brokers have the most volume in any lane.' },
  { icon: '⛽', name: 'IFTA Calculator', desc: 'Calculate your state-by-state fuel taxes automatically.' },
  { icon: '⏱️', name: 'Detention Tracking', desc: 'Log arrival times to enforce detention pay easily.' },
]

export default function DatToolsView() {
  return (
    <div id="dat-view-tools" className="sub-view" style={{ padding: 30 }}>
      <h2 style={{ fontWeight: 800, fontSize: '1.5rem', margin: '0 0 20px 0' }}>Broker &amp; Carrier Tools</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
        {tools.map((t) => (
          <div
            key={t.name}
            style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20, textAlign: 'center', cursor: 'pointer', transition: '0.2s' }}
            onMouseOver={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)' }}
            onMouseOut={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: 10 }}>{t.icon}</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>{t.name}</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>{t.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
