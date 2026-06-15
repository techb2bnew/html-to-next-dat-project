'use client'

export default function DatAiCallModal() {
  return (
    <div id="ai-call-modal" className="ai-modal-overlay">
      <div className="ai-modal">
        <div className="ai-modal-header">
          <h3 style={{ margin: 0 }}>📞 Call Simulator</h3>
          <span
            style={{ cursor: 'pointer', fontSize: '1.2rem' }}
            onClick={() => { const el = document.getElementById('ai-call-modal'); if (el) el.style.display = 'none'; }}
          >✖</span>
        </div>
        <div className="ai-modal-body" id="ai-call-transcript" style={{ display: 'flex', flexDirection: 'column', background: '#f8fafc', minHeight: 300 }}>
          <div style={{ textAlign: 'center', color: '#64748b', marginTop: 20 }} id="ai-call-status">
            Connecting...
          </div>
        </div>
        <div style={{ padding: 15, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10, background: 'white' }}>
          <button
            className="ai-btn"
            id="ai-call-btn"
            style={{ flex: 1, background: '#10b981', fontSize: '1.1rem', padding: 12 }}
            onClick={() => (window as any).toggleVoiceRecognition?.()}
          >
            🎙️ Click to Speak
          </button>
        </div>
      </div>
    </div>
  )
}
