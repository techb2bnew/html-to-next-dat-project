'use client'

interface Props {
  content: string;
  onClose: () => void;
}

export default function DocumentModal({ content, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex justify-center items-center">
      <div className="bg-[#f4f5f7] w-[90%] max-w-[900px] h-[90%] rounded-lg flex flex-col overflow-hidden">
        <div className="bg-[#333] text-white px-5 py-[15px] flex justify-between items-center">
          <div className="font-bold">Document Viewer</div>
          <div>
            <button
              className="bg-[#0052cc] text-white border-none px-[15px] py-[5px] rounded mr-[10px] cursor-pointer"
              onClick={() => window.print()}
            >
              Print / Save PDF
            </button>
            <button
              className="bg-transparent text-white border-none cursor-pointer text-xl"
              onClick={onClose}
            >
              &times;
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
}
