'use client'

interface Props {
  open: boolean;
  title: string;
  html: string;
  onClose: () => void;
}

export default function EmailModal({ open, title, html, onClose }: Props) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
      <div style={{ background: '#ffffff', borderRadius: 12, width: '90%', maxWidth: 700, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 80px rgba(0,0,0,0.5)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <h3 style={{ margin: 0, color: '#1e293b', fontSize: 16, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: '#e2e8f0', border: '1px solid #cbd5e1', color: '#475569', padding: '5px 10px', borderRadius: 6, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ padding: 20, overflowY: 'auto', flex: 1, color: '#1e293b' }} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
