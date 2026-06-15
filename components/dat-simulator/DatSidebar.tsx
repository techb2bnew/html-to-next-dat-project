'use client'

export default function DatSidebar() {
  return (
    <div className="dat-sidebar">
      <div className="dat-sidebar-logo" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: '#2563eb', color: 'white', fontWeight: 900, fontSize: '1.5rem', padding: '8px 12px', lineHeight: '1', letterSpacing: '-1px', borderRadius: 4 }}>
            DAT
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 800 }}>One</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Freight</div>
          </div>
        </div>
        <button className="dat-sidebar-close-btn" onClick={() => (window as any).toggleDatSidebar?.()}>✖</button>
      </div>

      <div className="dat-nav">
        <div className="dat-nav-item active" id="nav-dashboard" onClick={() => (window as any).datNav?.('dashboard')}>
          <span style={{ fontSize: '1.2rem' }}>⌂</span> Dashboard
        </div>
        <div className="dat-nav-item" id="nav-search" onClick={() => (window as any).datNav?.('search')}>
          <span style={{ fontSize: '1.2rem' }}>🔍</span> Search Loads
        </div>
        <div className="dat-nav-item" id="nav-trucks" onClick={() => (window as any).datNav?.('trucks')}>
          <span style={{ fontSize: '1.2rem' }}>🚛</span> My Trucks (Active)
        </div>
        <div className="dat-nav-item" id="nav-loads" onClick={() => (window as any).datNav?.('loads')}>
          <span style={{ fontSize: '1.2rem' }}>📦</span> My Loads
        </div>
        <div className="dat-nav-item" id="nav-network" onClick={() => (window as any).datNav?.('network')}>
          <span style={{ fontSize: '1.2rem' }}>🔒</span> Private Network
        </div>
        <div className="dat-nav-item" id="nav-tools" onClick={() => (window as any).datNav?.('tools')}>
          <span style={{ fontSize: '1.2rem' }}>🛠</span> Tools
        </div>
      </div>

      <div className="dat-bottom-nav">
        <div className="dat-nav-item"><span>🔔</span> Notifications</div>
        <div className="dat-nav-item"><span>❓</span> Support ⌄</div>
        <div className="dat-nav-item"><span>👤</span> My Account ⌄</div>
        <div className="dat-nav-item" style={{ color: '#ef4444' }} onClick={() => (window as any).logoutSimulator?.()}>
          <span>🚪</span> Logout
        </div>
      </div>
    </div>
  )
}
