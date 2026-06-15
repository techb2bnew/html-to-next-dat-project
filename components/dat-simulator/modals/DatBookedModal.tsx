'use client'

interface Props {
  isOpen: boolean
  scoreBadge: string
  onClose: () => void
  onGenerateDoc: (docType: string) => void
}

export default function DatBookedModal({ isOpen, scoreBadge, onClose, onGenerateDoc }: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-xl w-[90%] max-w-[500px] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="bg-emerald-500 text-white px-5 py-4 flex justify-between items-center">
          <h3 className="m-0 font-bold">🎉 Load Booked Successfully!</h3>
          <span className="cursor-pointer text-xl" onClick={onClose}>✖</span>
        </div>

        <div className="p-5 overflow-y-auto flex-1 text-center">
          <p className="text-lg text-slate-700 mb-5">
            Congratulations! You successfully negotiated and booked this load.
          </p>

          {scoreBadge && (
            <div
              className="text-2xl font-extrabold mb-5 py-3 px-6 inline-block rounded-lg bg-slate-50 border border-slate-200"
              dangerouslySetInnerHTML={{ __html: scoreBadge }}
            />
          )}

          <p className="text-sm text-slate-500 mb-4">Generate your documents:</p>

          <div className="flex flex-col gap-2.5 items-center">
            {[
              { key: 'rate_con', label: '📄 Rate Confirmation' },
              { key: 'setup_packet', label: '📄 Broker Setup Packet' },
              { key: 'dispatch', label: '📄 Dispatch Sheet' },
            ].map(d => (
              <button
                key={d.key}
                className="w-4/5 bg-slate-50 text-slate-900 border border-slate-300 px-4 py-2 rounded font-bold cursor-pointer hover:bg-slate-100"
                onClick={() => onGenerateDoc(d.key)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
