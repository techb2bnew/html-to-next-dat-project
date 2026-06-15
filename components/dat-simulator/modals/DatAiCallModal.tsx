'use client'

import { useRef, useEffect } from 'react'
import type { CallState, CurrentLoadData } from '@/lib/types/dat'

interface Props {
  callState: CallState
  currentLoad: CurrentLoadData | null
  onClose: () => void
  onToggleVoice: () => void
  onSendMessage: (msg: string) => void
}

export default function DatAiCallModal({ callState, currentLoad, onClose, onToggleVoice, onSendMessage }: Props) {
  const transcriptRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [callState.conversation])

  if (!callState.isOpen) return null

  const handleTextSend = () => {
    const val = inputRef.current?.value.trim()
    if (!val) return
    if (inputRef.current) inputRef.current.value = ''
    onSendMessage(val)
  }

  return (
    <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-xl w-[90%] max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center flex-shrink-0">
          <div>
            <h3 className="m-0 font-bold text-base">📞 Call Simulator</h3>
            {currentLoad && (
              <div className="text-xs text-slate-400 mt-0.5">
                {currentLoad.origin} → {currentLoad.destination} | ${(currentLoad.rate || 0).toLocaleString()} | {currentLoad.broker}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
              callState.status === 'On Call' ? 'bg-green-600 text-white'
              : callState.status === 'Call Ended' ? 'bg-red-600 text-white'
              : 'bg-yellow-500 text-white'
            }`}>{callState.status}</span>
            <span className="cursor-pointer text-xl" onClick={onClose}>✖</span>
          </div>
        </div>

        {/* Transcript */}
        <div
          ref={transcriptRef}
          className="p-5 flex flex-col bg-slate-50 flex-1 overflow-y-auto gap-3 min-h-[250px]"
        >
          {callState.conversation.length === 0 && (
            <div className="text-center text-slate-500 mt-5 text-sm">{callState.status}</div>
          )}
          {callState.conversation.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[80%] px-4 py-3 rounded-xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white self-end rounded-br-none'
                  : 'bg-white text-slate-800 self-start rounded-bl-none shadow-sm border border-slate-200'
              }`}
            >
              {msg.role === 'broker' && (
                <div className="text-xs font-bold text-slate-400 mb-1">Broker</div>
              )}
              {msg.content}
            </div>
          ))}
          {callState.isProcessing && (
            <div className="bg-white text-slate-500 self-start px-4 py-3 rounded-xl rounded-bl-none shadow-sm border border-slate-200 text-sm">
              <span className="animate-pulse">Broker is typing...</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 border-t border-slate-200 bg-white flex flex-col gap-2 flex-shrink-0">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type your message..."
              className="flex-1 border border-slate-300 rounded px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              onKeyDown={e => e.key === 'Enter' && handleTextSend()}
            />
            <button
              onClick={handleTextSend}
              disabled={callState.isProcessing}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white border-none rounded px-4 py-2.5 font-bold cursor-pointer text-sm"
            >Send</button>
          </div>
          <button
            onClick={onToggleVoice}
            disabled={callState.isProcessing || callState.status === 'Call Ended'}
            className={`w-full border-none rounded px-4 py-3 font-bold cursor-pointer text-lg disabled:opacity-50 ${
              callState.isListening
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            {callState.isListening ? '🔴 Listening... (click to stop)' : '🎙️ Click to Speak'}
          </button>
        </div>
      </div>
    </div>
  )
}
