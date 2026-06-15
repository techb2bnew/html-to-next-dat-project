'use client'

export default function DatTrucksView() {
  return (
    <div id="dat-view-trucks" className="sub-view" style={{ padding: 30 }}>
      <div id="posted-trucks-section" style={{ marginBottom: 40 }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.5rem', margin: '0 0 15px 0' }}>My Posted Trucks</h2>
        <div id="posted-trucks-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading posted trucks...</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>Active Dispatches</h2>
        <button
          onClick={() => (window as any).simulateCrisisEvent?.()}
          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: 4, fontWeight: 'bold', cursor: 'pointer' }}
        >
          [TEST] Trigger Crisis
        </button>
      </div>

      <div id="trucks-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {/* JS Injected Trucks */}
      </div>
    </div>
  )
}
