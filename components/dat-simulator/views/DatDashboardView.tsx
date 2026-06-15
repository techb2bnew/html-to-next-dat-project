'use client'

export default function DatDashboardView() {
  return (
    <div id="dat-view-dashboard" className="sub-view active">
      <div className="dashboard-header">Dashboard</div>
      <div className="dashboard-content">

        {/* Left Column */}
        <div className="dashboard-main-col">
          <div className="dashboard-action-btns">
            <button className="dash-action-btn" onClick={() => (window as any).datNav?.('post_truck')}>⊕ POST A TRUCK</button>
            <button className="dash-action-btn" onClick={() => (window as any).datNav?.('search')}>🔍 SEARCH LOADS</button>
            <button className="dash-action-btn" onClick={() => (window as any).datNav?.('trucks')}>🔍 SEARCH TRUCKS</button>
          </div>

          <div className="dash-cards-row">
            <div className="dash-card">
              <h3 style={{ marginTop: 0, fontSize: '0.9rem' }}>DAT One Mobile</h3>
              <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
                The Most Loads Available. Real Loads, Real Money, GUARANTEED!
              </p>
              <a href="#" style={{ color: '#0044cc', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}>GET THE APP &gt;</a>
            </div>
            <div className="dash-card">
              <h3 style={{ marginTop: 0, fontSize: '0.9rem' }}>Help Center</h3>
              <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
                Contact information, trouble shooting, FAQ&apos;s, and training videos.
              </p>
              <a href="#" style={{ color: '#0044cc', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}>HELP CENTER &gt;</a>
            </div>
          </div>

          {/* Recommended Loads Widget */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: 25, marginTop: 25, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: 15, marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
                  ✨ Recommended Loads
                  <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: '0.7rem', fontWeight: 'bold', padding: '3px 8px', borderRadius: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Tailored Match
                  </span>
                </h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Freshly matched with your active trucks&apos; types and locations.
                </p>
              </div>
              <button
                id="re-rec-btn"
                onClick={() => (window as any).regenerateRecommendedLoads?.()}
                onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8' }}
                onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#2563eb' }}
                style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'background-color 0.2s, transform 0.1s', outline: 'none', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }}
              >
                Regenerate Loads
              </button>
            </div>

            <div id="recommended-loads-loading" style={{ display: 'none', padding: '40px 20px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 15, display: 'inline-block', animation: 'spin 1s linear infinite' }}>🔄</div>
              <div>Matching your active trucks with high-paying loads...</div>
            </div>

            <div className="table-container" style={{ borderTop: 'none', overflow: 'visible', marginTop: 10 }} id="recommended-loads-table-container">
              <table className="dat-table" style={{ width: '100%' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: 10, fontSize: '0.75rem' }}>Age</th>
                    <th style={{ padding: 10, fontSize: '0.75rem' }}>Rate</th>
                    <th style={{ padding: 10, fontSize: '0.75rem' }}>Miles</th>
                    <th style={{ padding: 10, fontSize: '0.75rem' }}>Origin</th>
                    <th style={{ padding: 10, fontSize: '0.75rem' }}></th>
                    <th style={{ padding: 10, fontSize: '0.75rem' }}>Destination</th>
                    <th style={{ padding: 10, fontSize: '0.75rem' }}>Pickup</th>
                    <th style={{ padding: 10, fontSize: '0.75rem' }}>Equipment</th>
                    <th style={{ padding: 10, fontSize: '0.75rem' }}>Broker</th>
                    <th style={{ padding: 10, fontSize: '0.75rem' }}>Phone</th>
                    <th style={{ padding: 10, fontSize: '0.75rem', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody id="recommended-loads-tbody">
                  {/* Dynamically rendered by JS */}
                </tbody>
              </table>
            </div>
          </div>

          {/* What's New */}
          <div className="dash-whats-new">
            <h3 style={{ marginTop: 0, fontSize: '1rem' }}>What&apos;s New</h3>
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>NEW December 17th, 2024</div>
              <ul style={{ fontSize: '0.85rem', color: '#1e293b', paddingLeft: 20 }}>
                <li>Carriers can now use <strong>Quick Post</strong> when posting trucks using smaller screens.</li>
              </ul>
            </div>
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>November 21st, 2024</div>
              <ul style={{ fontSize: '0.85rem', color: '#1e293b', paddingLeft: 20 }}>
                <li>Carriers can now have advanced sorting capabilities within the Rate and Company columns.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column — National Loads Count */}
        <div className="dashboard-side-col">
          <div className="nat-load-header">
            <div style={{ display: 'inline-block', background: '#0044cc', color: 'white', fontWeight: 900, fontSize: '1.5rem', letterSpacing: 2, padding: '2px 8px', borderRadius: 2 }}>
              D A T
            </div>
            <div style={{ fontWeight: 900, fontSize: '1.4rem', marginTop: 8 }}>National Loads Count</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginTop: 4 }}>Where the Loads Are</div>
          </div>

          <div style={{ padding: '10px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569', fontSize: '0.75rem', fontWeight: 600, marginBottom: 10 }}>
              <span style={{ fontSize: '1.1rem' }}>↻</span> refreshed at 12:28 PM
            </div>
            <select id="nat-loads-equipment" style={{ width: '100%', border: '1px solid #94a3b8', borderRadius: 4, padding: '10px 12px', fontSize: '0.85rem', color: '#1e293b', fontWeight: 500, background: 'white', cursor: 'pointer' }}>
              <option>Vans (Standard)</option>
              <option>Reefers</option>
              <option>Flatbeds</option>
              <option>Power Only</option>
              <option>Hotshot</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f172a', fontWeight: 800, fontSize: '0.7rem', letterSpacing: 1, padding: '10px 20px', borderBottom: '1px solid #e2e8f0', marginBottom: 10 }}>
            <span>ST</span><span>LOADS IN</span><span>LOADS OUT</span>
          </div>

          <div className="nat-load-list" id="sim-nat-loads-list">
            {/* JS injected 50 states */}
          </div>
        </div>
      </div>
    </div>
  )
}
