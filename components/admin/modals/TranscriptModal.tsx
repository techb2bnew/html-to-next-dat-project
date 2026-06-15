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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10000]">
      <div className="bg-slate-800 border border-[#334155] rounded-xl w-[90%] max-w-[700px] max-h-[85vh] flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-[#334155] flex justify-between items-center">
          <h3 className="m-0 text-slate-50 text-[16px] font-bold">{title}</h3>
          <button onClick={onClose} className="bg-[#334155] border border-slate-600 text-slate-400 px-[10px] py-[5px] rounded-md cursor-pointer">✕</button>
        </div>
        <div className="p-5 overflow-y-auto flex-1" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
