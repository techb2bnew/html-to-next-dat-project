'use client'

export default function DatSearchView() {
  return (
    <div id="dat-view-search" className="sub-view">
      {/* Multi-Tab Bar — tabs rendered by JS */}
      <div className="search-tabs-bar" id="search-tabs-bar"></div>

      {/* Search Input Form */}
      <div className="search-section">
        <div className="search-row">
          <div className="input-box origin-dest">
            <span className="input-label">Origin</span>
            <input type="text" id="sim-search-origin" placeholder="City, State or Zip" />
            <div className="autocomplete-list" id="autocomplete-origin"></div>
          </div>

          <div className="input-box dh">
            <span className="input-label">DH-O</span>
            <input type="number" id="sim-filter-dho" defaultValue={150} style={{ textAlign: 'center' }} />
          </div>

          <div style={{ color: '#3b82f6', fontWeight: 900, padding: '0 2px', cursor: 'pointer', fontSize: '1.1rem' }}>⇄</div>

          <div className="input-box origin-dest">
            <span className="input-label">Destination</span>
            <input type="text" id="sim-search-dest" placeholder="City, State or Zip" />
            <div className="autocomplete-list" id="autocomplete-dest"></div>
          </div>

          <div className="input-box dh">
            <span className="input-label">DH-D</span>
            <input type="number" id="sim-filter-dhd" defaultValue={150} style={{ textAlign: 'center' }} />
          </div>
        </div>

        <div className="search-row">
          <div className="input-box dropdown custom-dropdown" tabIndex={0} id="equip-dropdown-container" style={{ width: 200 }}>
            <span className="input-label">Equipment Type*</span>
            <div className="dropdown-selected" id="sim-search-equip-display">Vans (Standard)</div>
            <input type="hidden" id="sim-search-equip" defaultValue="Dry Van" />
            <div className="custom-dropdown-list" style={{ minWidth: 240 }}>
              <div className="cd-item cd-all">ALL</div>
              <div className="cd-item active" data-val="Dry Van"><span>Vans (Standard)</span><span className="cd-shortcut">V</span></div>
              <div className="cd-item" data-val="Flatbed"><span>Flatbeds</span><span className="cd-shortcut">F</span></div>
              <div className="cd-item" data-val="Reefer"><span>Reefers</span><span className="cd-shortcut">R</span></div>
              <div className="cd-item" data-val="Conestoga"><span>Conestogas</span><span className="cd-shortcut">N</span></div>
              <div className="cd-item" data-val="Container"><span>Containers</span><span className="cd-shortcut">C</span></div>
              <div className="cd-item" data-val="Decks Spec"><span>Decks (Specialized)</span><span className="cd-shortcut">K</span></div>
              <div className="cd-item" data-val="Decks Std"><span>Decks (Standard)</span><span className="cd-shortcut">D</span></div>
            </div>
          </div>

          <div className="input-box dropdown custom-dropdown" tabIndex={0} id="loadtype-dropdown-container" style={{ width: 140 }}>
            <span className="input-label">Load Type</span>
            <div className="dropdown-selected" id="sim-filter-loadtype-display">Full &amp; Partial</div>
            <input type="hidden" id="sim-filter-loadtype" defaultValue="Full" />
            <div className="custom-dropdown-list" style={{ minWidth: 140 }}>
              <div className="cd-item active" data-val="Full">Full &amp; Partial</div>
              <div className="cd-item" data-val="FullOnly">Full</div>
              <div className="cd-item" data-val="Partial">Partial</div>
            </div>
          </div>

          <div className="input-box" style={{ width: 100 }}>
            <span className="input-label">Length ft</span>
            <input type="number" id="sim-filter-length" placeholder="" />
          </div>

          <div className="input-box" style={{ width: 100 }}>
            <span className="input-label">Weight lbs</span>
            <input type="number" id="sim-filter-weight" placeholder="" />
          </div>

          <div className="input-box" style={{ width: 200, position: 'relative' }}>
            <span className="input-label">Date Range*</span>
            <input type="date" id="sim-filter-daterange" onChange={() => (window as any).saveCurrentInputs?.()} style={{ paddingRight: 10 }} />
          </div>

          <button className="search-btn" id="sim-load-search-btn" onClick={(e) => (window as any).executeSearch?.(e)}>
            🔍 SEARCH
          </button>
          <button
            className="search-btn"
            id="auto-scan-btn"
            onClick={(e) => (window as any).toggleAutoScan?.(e.currentTarget)}
            style={{ background: '#e2e8f0', color: '#475569', marginLeft: 10 }}
          >
            ⚡ Auto-Scan: OFF
          </button>
          <span style={{ color: '#64748b', fontWeight: 'bold', fontSize: '1.2rem', marginLeft: 8, cursor: 'pointer' }}>⋮</span>
        </div>

        <div className="filters-row">
          <div className="filter-tag custom-dropdown" tabIndex={0} id="filter-dropdown-req">
            <span id="filter-req-display">LOAD REQUIREMENTS ▾</span>
            <div className="custom-dropdown-list" style={{ minWidth: 200 }}>
              <div className="cd-item">✅ Factoring Eligible</div>
              <div className="cd-item">✅ TIA Member</div>
              <div className="cd-item">✅ Assure</div>
            </div>
          </div>
          <div className="filter-tag custom-dropdown" tabIndex={0} id="filter-dropdown-back">
            <span id="filter-back-display">SEARCH BACK - 24 HRS ▾</span>
            <div className="custom-dropdown-list" style={{ minWidth: 180 }}>
              <div className="cd-item">2 Hours</div>
              <div className="cd-item">8 Hours</div>
              <div className="cd-item active">24 Hours</div>
              <div className="cd-item">48 Hours</div>
            </div>
          </div>
          <div className="filter-tag custom-dropdown" tabIndex={0} id="filter-dropdown-comp">
            <span id="filter-comp-display">COMPANY ▾</span>
            <div className="custom-dropdown-list" style={{ minWidth: 180 }}>
              <div className="cd-item">Favorites Only</div>
              <div className="cd-item">Exclude Blocked</div>
            </div>
          </div>
          <div className="filter-tag custom-dropdown" tabIndex={0} id="filter-dropdown-priv">
            <span id="filter-priv-display">PRIVATE LOADS ▾</span>
            <div className="custom-dropdown-list" style={{ minWidth: 180 }}>
              <div className="cd-item">All Loads</div>
              <div className="cd-item">Private Only</div>
            </div>
          </div>
          <div className="filter-tag custom-dropdown" tabIndex={0} id="filter-dropdown-book">
            <span id="filter-book-display">BOOK/BID ▾</span>
            <div className="custom-dropdown-list" style={{ minWidth: 180 }}>
              <div className="cd-item">Show All</div>
              <div className="cd-item">Book Now Only</div>
              <div className="cd-item">Bid Loads Only</div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div id="dat-search-empty" style={{ alignItems: 'flex-start', paddingTop: 20 }}>
        <div className="empty-state-tabs">
          <div className="empty-tab active">SAVED SEARCHES</div>
          <div className="empty-tab">RECENT SEARCHES (1)</div>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1e293b', marginBottom: 40, textAlign: 'center', lineHeight: 1.1 }}></div>
          <img
            src="save_search_graphic.png"
            alt="Save search"
            style={{ width: 500, display: 'block', margin: '0 auto', borderRadius: 6, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
          />
          <p style={{ color: '#475569', width: 400, textAlign: 'center', fontSize: '1rem', marginTop: 30, lineHeight: 1.5 }}>
            Click the <strong>&quot;Save Search&quot;</strong> option in the drop down menu when you run a search and they will show up here for easy access.
          </p>
        </div>
      </div>

      {/* Results State */}
      <div id="dat-search-results" style={{ display: 'none' }}>
        <div className="results-stats-row">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span id="dat-results-num" style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 10px', fontWeight: 800, fontSize: '1.1rem', borderRadius: 4 }}>467 Results</span>
            <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500, marginLeft: 12 }}>+3027 Similar Results</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: '0.8rem', fontWeight: 800, color: '#1e293b' }}>
            <span><span style={{ color: '#64748b', fontWeight: 600, marginRight: 4 }}>LANE RATE:</span> $2,091 <span style={{ color: '#64748b', fontWeight: 600 }}>($2.92/MI)</span></span>
            <span><span style={{ color: '#64748b', fontWeight: 600, marginRight: 4 }}>TRI-HAUL:</span> <span style={{ color: '#16a34a' }}>+$1647</span></span>
          </div>
        </div>

        <div className="table-container">
          <table className="dat-table">
            <thead>
              <tr>
                <th className="col-checkbox"><input type="checkbox" /></th>
                <th>Age</th>
                <th>Rate</th>
                <th>ⓘ</th>
                <th>Trip</th>
                <th>Origin</th>
                <th>DH-O</th>
                <th>Destination</th>
                <th>DH-D</th>
                <th>Pick Up</th>
                <th>Equipment ▾</th>
                <th>Company</th>
                <th>Contact</th>
                <th>CS<br />DTP ▾</th>
              </tr>
            </thead>
            <tbody id="sim-loads-tbody">
              {/* Loads injected here by JS */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
