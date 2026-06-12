'use client'

interface Props {
  open: boolean;
  title: string;
  html: string;
  onClose: () => void;
}

export default function TranscriptModal({ open, title, html, onClose }: Props) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, width: '90%', maxWidth: 700, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: 16, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: '#334155', border: '1px solid #475569', color: '#94a3b8', padding: '5px 10px', borderRadius: 6, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
