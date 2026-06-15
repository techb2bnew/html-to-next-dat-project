'use client'

export default function DatPostTruckView() {
  return (
    <div id="dat-view-post-truck" className="sub-view" style={{ padding: 30 }}>
      <h2 style={{ fontWeight: 800, fontSize: '1.5rem', margin: '0 0 20px 0' }}>Post a Truck</h2>
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20, maxWidth: 800 }}>
        <div style={{ display: 'flex', gap: 15, marginBottom: 15 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: 5 }}>Origin (City, ST)</label>
            <input type="text" id="post-origin" placeholder="e.g. Dallas, TX" autoComplete="off" style={{ width: '100%', padding: 10, border: '1px solid #cbd5e1', borderRadius: 4, boxSizing: 'border-box' }} />
            <div className="autocomplete-list" id="autocomplete-post-origin"></div>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: 5 }}>Destination</label>
            <input type="text" id="post-dest" placeholder="Anywhere" autoComplete="off" style={{ width: '100%', padding: 10, border: '1px solid #cbd5e1', borderRadius: 4, boxSizing: 'border-box' }} />
            <div className="autocomplete-list" id="autocomplete-post-dest"></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 15, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: 5 }}>Equipment</label>
            <select id="post-equip" style={{ width: '100%', padding: 10, border: '1px solid #cbd5e1', borderRadius: 4, boxSizing: 'border-box' }}>
              <option value="Dry Van">Dry Van</option>
              <option value="Reefer">Reefer</option>
              <option value="Flatbed">Flatbed</option>
              <option value="Power Only">Power Only</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: 5 }}>Date Available</label>
            <input type="text" id="post-date" defaultValue="Today" style={{ width: '100%', padding: 10, border: '1px solid #cbd5e1', borderRadius: 4, boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <button
            onClick={(e) => (window as any).postTruckAction?.(e)}
            style={{ background: '#2563eb', padding: '12px 30px', fontWeight: 'bold', fontSize: '1rem', borderRadius: 4, border: 'none', color: 'white', cursor: 'pointer' }}
          >
            ⊕ POST TRUCK
          </button>
        </div>
      </div>
    </div>
  )
}
