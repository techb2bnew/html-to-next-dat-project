'use client'

interface Props {
  isOpen: boolean
  content: string
  loading: boolean
  onClose: () => void
}

export default function DatDocModal({ isOpen, content, loading, onClose }: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999]">
      <div className="bg-[#f4f5f7] w-[90%] max-w-[900px] h-[90%] rounded-lg flex flex-col overflow-hidden">
        <div className="bg-[#333] text-white px-5 py-4 flex justify-between items-center flex-shrink-0">
          <div className="font-bold">Document Viewer</div>
          <div className="flex items-center gap-2">
            <button
              className="bg-[#0052cc] text-white border-none px-4 py-1 rounded cursor-pointer"
              onClick={() => window.print()}
            >
              Print / Save PDF
            </button>
            <button
              className="bg-transparent text-white border-none cursor-pointer text-xl leading-none"
              onClick={onClose}
            >
              &times;
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              <div className="text-center">
                <div className="text-4xl mb-4 animate-spin">🔄</div>
                <div>Generating document...</div>
              </div>
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          )}
        </div>
      </div>
    </div>
  )
}
