'use client'
import { Home } from 'lucide-react';

export default function BackButton({ href = '/' }: { href?: string }) {
  return (
    <button
      onClick={() => { window.location.href = href; }}
      className="fixed bottom-5 right-5 z-[99999] px-6 py-3 bg-indigo-600 hover:scale-105 text-white border-none rounded-[30px] font-bold cursor-pointer shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] transition-transform duration-200 font-[Inter] flex items-center gap-2"
    >
      <Home size={18} /> Back to Dashboard
    </button>
  );
}
