'use client'

import { useRef, useEffect } from 'react'
import type { DriverChatState } from '@/lib/hooks/useDatSim'

interface Props {
  driverChat: DriverChatState
  onClose: () => void
  onSend: () => void
  onInputChange: (v: string) => void
}

export default function DatDriverChatModal({ driverChat, onClose, onSend, onInputChange }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [driverChat.history])

  if (!driverChat.isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-xl w-[90%] max-w-[520px] max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="bg-slate-800 text-white px-5 py-4 flex justify-between items-center flex-shrink-0">
          <div>
            <h3 className="m-0 font-bold text-base">💬 Driver Chat</h3>
            <div className="text-xs text-slate-400 mt-0.5">
              {driverChat.driverName}{driverChat.phone ? ` · ${driverChat.phone}` : ''}
            </div>
          </div>
          <span className="cursor-pointer text-xl" onClick={onClose}>✖</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-3">
          {driverChat.history.length === 0 && (
            <div className="text-center text-slate-500 text-sm mt-8">
              Start a conversation with {driverChat.driverName}
            </div>
          )}
          {driverChat.history.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[78%] px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white self-end rounded-br-none'
                  : 'bg-white text-slate-800 self-start rounded-bl-none shadow-sm border border-slate-200'
              }`}
            >
              {msg.content}
            </div>
          ))}
          {driverChat.isLoading && (
            <div className="bg-white text-slate-400 self-start px-4 py-2.5 rounded-xl rounded-bl-none shadow-sm border border-slate-200 text-sm italic">
              Typing...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-slate-200 bg-white flex gap-2 flex-shrink-0">
          <input
            type="text"
            value={driverChat.inputValue}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !driverChat.isLoading && onSend()}
            placeholder="Message driver..."
            className="flex-1 border border-slate-300 rounded px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />
          <button
            onClick={onSend}
            disabled={driverChat.isLoading || !driverChat.inputValue.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white border-none rounded px-4 py-2.5 font-bold cursor-pointer text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
