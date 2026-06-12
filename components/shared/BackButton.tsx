'use client'
import { Home } from 'lucide-react';

export default function BackButton({ href = '/' }: { href?: string }) {
  return (
    <button
      onClick={() => { window.location.href = href; }}
      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 99999,
        padding: '12px 24px', background: '#4f46e5', color: 'white',
        border: 'none', borderRadius: 30, fontWeight: 700, cursor: 'pointer',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', transition: 'transform 0.2s',
        fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: 8,
      }}
    >
      <Home size={18} /> Back to Dashboard
    </button>
  );
}
