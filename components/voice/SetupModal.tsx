'use client'
import type { SimMode } from '@/lib/types/voice';

interface Props {
  selectedMode: SimMode;
  onSelectMode: (mode: SimMode) => void;
  onStart: () => void;
}

export default function SetupModal({ selectedMode, onSelectMode, onStart }: Props) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur flex justify-center items-center z-[1000]">
      <div className="bg-[rgba(25,30,45,0.6)] border border-white/10 rounded-3xl p-10 w-[90%] max-w-[500px] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-center max-lg:rounded-none max-lg:h-full max-lg:w-full max-lg:max-w-full max-lg:overflow-y-auto max-lg:flex max-lg:flex-col max-lg:justify-center">
        <h2 className="font-['Outfit',sans-serif] text-[28px] mb-5 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
          DAT Simulation Initialization
        </h2>
        <p className="text-slate-400 mb-[30px]">
          Select your role in the upcoming freight negotiation.
        </p>

        <div className="mb-[30px] flex flex-col gap-[15px]">
          <button
            className={`border px-5 py-[15px] rounded-xl text-slate-50 text-base font-semibold cursor-pointer transition-all duration-300 font-['Inter',sans-serif] hover:bg-white/10 hover:-translate-y-0.5 ${selectedMode === 'broker' ? 'bg-blue-500 border-blue-500' : 'bg-white/5 border-white/10'}`}
            onClick={() => onSelectMode('broker')}
          >
            I am a Carrier (Broker AI)
          </button>
          <button
            className={`border px-5 py-[15px] rounded-xl text-slate-50 text-base font-semibold cursor-pointer transition-all duration-300 font-['Inter',sans-serif] hover:bg-white/10 hover:-translate-y-0.5 ${selectedMode === 'carrier' ? 'bg-blue-500 border-blue-500' : 'bg-white/5 border-white/10'}`}
            onClick={() => onSelectMode('carrier')}
          >
            I am a Broker (Carrier AI)
          </button>
          <button
            className={`border px-5 py-[15px] rounded-xl text-slate-50 text-base font-semibold cursor-pointer transition-all duration-300 font-['Inter',sans-serif] hover:bg-white/10 hover:-translate-y-0.5 ${selectedMode === 'mixed' ? 'bg-blue-500 border-blue-500' : 'bg-white/5 border-white/10'}`}
            onClick={() => onSelectMode('mixed')}
          >
            Surprise Me (Mixed Mode)
          </button>
        </div>

        <button
          className="bg-emerald-500 text-white border-none w-full px-5 py-[15px] rounded-xl font-semibold cursor-pointer transition-all duration-300 mt-[10px] hover:bg-white/10 hover:-translate-y-0.5"
          onClick={onStart}
        >
          Start Simulation
        </button>
      </div>
    </div>
  );
}
