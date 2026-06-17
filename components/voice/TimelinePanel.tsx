'use client'
import { useEffect, useRef } from 'react';
import type { TimelineEvent } from '@/lib/types/voice';

interface Props {
  events: TimelineEvent[];
}

export default function TimelinePanel({ events }: Props) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="bg-[rgba(25,30,45,0.6)] border border-white/10 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-[10px] flex flex-col overflow-hidden max-lg:hidden">
      <div className="text-lg font-bold mb-5 text-blue-500 uppercase tracking-[1px] shrink-0">Conversation Timeline</div>
      <div
        className="flex-1 overflow-y-auto pr-[10px] flex flex-col gap-[15px] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-[10px] [&::-webkit-scrollbar-thumb:hover]:bg-white/20"
        ref={listRef}
      >
        {events.map(ev => (
          <div key={ev.id} className="relative pl-5 border-l-2 border-white/10 text-sm text-slate-400 before:content-[''] before:absolute before:-left-[6px] before:top-0 before:w-[10px] before:h-[10px] before:rounded-full before:bg-blue-500">
            <span className="text-xs opacity-60 mb-1 block">{ev.time}</span>
            <span className="text-slate-50 font-medium">{ev.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
