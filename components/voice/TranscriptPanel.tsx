'use client'
import { useEffect, useRef } from 'react';
import type { TranscriptMessage } from '@/lib/types/voice';

interface Props {
  messages: TranscriptMessage[];
}

export default function TranscriptPanel({ messages }: Props) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="bg-[rgba(25,30,45,0.6)] border border-white/10 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-[10px] flex flex-col overflow-hidden max-lg:hidden">
      <div className="text-lg font-bold mb-5 text-blue-500 uppercase tracking-[1px] shrink-0">Live Transcript</div>
      <div
        className="flex-1 overflow-y-auto flex flex-col gap-[15px] pr-[10px] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-[10px] [&::-webkit-scrollbar-thumb:hover]:bg-white/20"
        ref={listRef}
      >
        {messages.map(msg => {
          if (msg.type === 'system') {
            return (
              <div key={msg.id} className="px-4 py-3 rounded-2xl max-w-[85%] text-[15px] leading-[1.5] self-center bg-white/5 text-slate-400 text-xs text-center">
                {msg.text}
              </div>
            );
          }
          const isAi = msg.type === 'ai';
          return (
            <div
              key={msg.id}
              className={`px-4 py-3 rounded-2xl max-w-[85%] text-[15px] leading-[1.5] ${isAi ? 'self-start bg-blue-500/15 border border-blue-500/30 rounded-bl-[4px]' : 'self-end bg-emerald-500/15 border border-emerald-500/30 rounded-br-[4px]'}`}
            >
              <div className="text-[11px] font-bold opacity-70 mb-1 uppercase">{msg.speaker}</div>
              {msg.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
