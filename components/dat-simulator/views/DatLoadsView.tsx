'use client'

export default function DatLoadsView() {
  return (
    <div id="dat-view-loads" className="sub-view" style={{ padding: 30 }}>
      <h2 style={{ fontWeight: 800, fontSize: '1.5rem', margin: '0 0 20px 0' }}>My Loads (History &amp; Active)</h2>
      <div id="loads-container" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20 }}>
        <p style={{ color: '#64748b' }}>Loading booked loads...</p>
      </div>
    </div>
  )
}
