'use client'

interface Props {
  content: string;
  onClose: () => void;
}

export default function DocumentModal({ content, onClose }: Props) {
  return (
    <div style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 9999, justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: '#f4f5f7', width: '90%', maxWidth: 900, height: '90%', borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ background: '#333', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 'bold' }}>Document Viewer</div>
          <div>
            <button style={{ background: '#0052cc', color: 'white', border: 'none', padding: '5px 15px', borderRadius: 4, marginRight: 10, cursor: 'pointer' }} onClick={() => window.print()}>
              Print / Save PDF
            </button>
            <button style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: 20 }} onClick={onClose}>
              &times;
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }} dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
}
