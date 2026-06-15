'use client'

export default function DatBookedModal() {
  return (
    <div id="ai-booked-modal" className="ai-modal-overlay">
      <div className="ai-modal" style={{ maxWidth: 500 }}>
        <div className="ai-modal-header" style={{ background: '#10b981' }}>
          <h3 style={{ margin: 0 }}>🎉 Load Booked Successfully!</h3>
          <span
            style={{ cursor: 'pointer', fontSize: '1.2rem' }}
            onClick={() => { const el = document.getElementById('ai-booked-modal'); if (el) el.style.display = 'none'; }}
          >✖</span>
        </div>
        <div className="ai-modal-body" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.1rem', color: '#334155', marginBottom: 20 }}>
            Congratulations! You successfully negotiated and booked this load. The following documents have been generated:
          </p>
          <div id="booked-score-badge"></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
            <button
              className="ai-btn"
              style={{ width: '80%', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1' }}
              onClick={() => (window as any).generateAndShowDoc?.('rate_con')}
            >
              📄 Rate Confirmation
            </button>
            <button
              className="ai-btn"
              style={{ width: '80%', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1' }}
              onClick={() => (window as any).generateAndShowDoc?.('setup_packet')}
            >
              📄 Broker Setup Packet
            </button>
            <button
              className="ai-btn"
              style={{ width: '80%', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1' }}
              onClick={() => (window as any).generateAndShowDoc?.('dispatch')}
            >
              📄 Dispatch Sheet
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
