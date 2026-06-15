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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10000]">
      <div className="bg-white rounded-xl w-[90%] max-w-[700px] max-h-[85vh] flex flex-col overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.5)]">
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-[#f8fafc]">
          <h3 className="m-0 text-slate-800 text-[16px] font-bold">{title}</h3>
          <button onClick={onClose} className="bg-slate-200 border border-slate-300 text-slate-600 px-[10px] py-[5px] rounded-md cursor-pointer">✕</button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 text-slate-800" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
