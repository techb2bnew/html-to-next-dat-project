'use client'
import type { SimulationState } from '@/lib/types/voice';

interface Props {
  simState: SimulationState | null;
  callStatus: string;
  isSpeaking: boolean;
  isRecording: boolean;
  aiEmotion: string | null;
  aiObjection: string | null;
  onToggleMic: () => void;
  onEndCall: () => void;
}

export default function CallPanel({
  simState,
  callStatus,
  isSpeaking,
  isRecording,
  aiEmotion,
  aiObjection,
  onToggleMic,
  onEndCall,
}: Props) {
  const initial = simState?.ai_persona?.charAt(0) ?? 'AI';
  const sc = simState?.scenario;

  return (
    <div className="bg-[rgba(25,30,45,0.6)] border border-white/10 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-[10px] flex flex-col overflow-hidden items-center justify-between relative max-lg:rounded-none max-lg:border-none max-lg:h-full max-lg:justify-center">
      <div className="text-center mt-5 w-full max-lg:mt-0">
        <div className={`relative w-[120px] h-[120px] mx-auto mb-5`}>
          {isSpeaking && (
            <div className="absolute top-0 left-0 w-full h-full rounded-full bg-blue-500 z-[1] animate-[ripple_1.5s_infinite]" />
          )}
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex justify-center items-center text-[48px] text-white font-bold font-['Outfit',sans-serif] relative z-[2]">
            {initial}
          </div>
        </div>

        <div className="text-[28px] font-bold mb-[5px]">{simState?.ai_persona ?? 'Connecting...'}</div>
        <div className="text-sm text-blue-500 font-semibold uppercase tracking-[2px] mb-[15px]">
          {simState ? `${simState.ai_role} AI` : '--'}
        </div>

        <div className="flex gap-[10px] justify-center flex-wrap mt-5">
          <div className="px-3 py-[6px] rounded-[20px] text-xs font-semibold bg-white/5 border border-white/10">{callStatus}</div>
          {aiEmotion && (
            <div className="px-3 py-[6px] rounded-[20px] text-xs font-semibold bg-white/5 border border-amber-400 text-amber-400">
              Emotion: {aiEmotion}
            </div>
          )}
          {aiObjection && (
            <div className="px-3 py-[6px] rounded-[20px] text-xs font-semibold bg-white/5 border border-red-500 text-red-500">
              Objection: {aiObjection}
            </div>
          )}
        </div>

        {sc && (
          <div className="bg-black/30 rounded-2xl p-[15px] w-full mt-5 text-[13px] text-left max-lg:hidden">
            <div className="mb-[5px]"><span className="text-slate-400">Lane:</span> {sc.lane.origin} → {sc.lane.destination}</div>
            <div className="mb-[5px]"><span className="text-slate-400">Equipment:</span> {sc.equipment}</div>
            <div className="mb-[5px]"><span className="text-slate-400">Commodity:</span> {sc.commodity} ({sc.weight})</div>
            <div className="mb-[5px]"><span className="text-slate-400">Market:</span> {sc.market_condition}</div>
            <div className="mt-[10px] text-emerald-500"><span className="text-slate-400">Base Rate:</span> ${sc.base_rate}</div>
          </div>
        )}
      </div>

      <div className="flex gap-5 mb-[30px] shrink-0 max-lg:mb-[50px]">
        <button
          className={`w-[70px] h-[70px] rounded-full border-none cursor-pointer text-2xl flex justify-center items-center text-white transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 ${isRecording ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 animate-[pulseMic_1.5s_infinite]' : 'bg-gradient-to-br from-gray-600 to-gray-700'}`}
          onClick={onToggleMic}
          title="Toggle Microphone"
        >
          🎤
        </button>
        <button
          className="w-[70px] h-[70px] rounded-full border-none cursor-pointer text-2xl flex justify-center items-center text-white transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 bg-gradient-to-br from-red-500 to-red-600"
          onClick={onEndCall}
          title="End Call"
        >
          📞
        </button>
      </div>
    </div>
  );
}
