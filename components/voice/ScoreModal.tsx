'use client'
import type { ScoreData } from '@/lib/types/voice';

interface Props {
  scores: ScoreData;
}

const METRICS: { key: keyof ScoreData; label: string }[] = [
  { key: 'negotiation_score', label: 'Negotiation' },
  { key: 'communication_score', label: 'Communication' },
  { key: 'objection_handling_score', label: 'Objection Handling' },
  { key: 'closing_score', label: 'Closing' },
  { key: 'professionalism_score', label: 'Professionalism' },
  { key: 'confidence_score', label: 'Confidence' },
  { key: 'industry_knowledge_score', label: 'Industry Knowledge' },
];

export default function ScoreModal({ scores }: Props) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur flex justify-center items-center z-[1000]">
      <div className="bg-[rgba(25,30,45,0.6)] border border-white/10 rounded-3xl p-10 w-[90%] max-w-[600px] max-h-[90vh] overflow-y-auto shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-center max-lg:rounded-none max-lg:h-full max-lg:w-full max-lg:max-w-full max-lg:flex max-lg:flex-col max-lg:justify-center">
        <h2 className="font-['Outfit',sans-serif] text-[28px] mb-5 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
          Call Evaluation
        </h2>

        <div className="text-[48px] font-extrabold text-emerald-500 mb-5">{scores.overall_rating}/100</div>

        <div className="grid grid-cols-2 gap-[15px] text-left my-5">
          {METRICS.map(({ key, label }) => (
            <div key={key} className="bg-black/30 p-[10px] rounded-lg flex justify-between items-center">
              <span>{label}</span>
              <span className="text-xl font-bold text-blue-500">{(scores[key] as number) || 0}</span>
            </div>
          ))}
        </div>

        <div className="text-left mt-5 text-sm">
          <strong>Strengths</strong>
          <ul className="ml-5 text-slate-400 mb-[10px]">{scores.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
          <strong>Weaknesses</strong>
          <ul className="ml-5 text-slate-400 mb-[10px]">{scores.weaknesses.map((s, i) => <li key={i}>{s}</li>)}</ul>
          <strong>Recommendations</strong>
          <ul className="ml-5 text-slate-400 mb-[10px]">{scores.recommendations.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>

        <button
          className="bg-blue-500 text-white border-none w-full px-5 py-[15px] rounded-xl font-semibold cursor-pointer transition-all duration-300 mt-5 hover:bg-white/10 hover:-translate-y-0.5"
          onClick={() => window.location.reload()}
        >
          New Simulation
        </button>
        <button
          className="bg-transparent text-slate-400 border-none w-full px-5 py-[15px] rounded-xl font-semibold cursor-pointer transition-all duration-300 mt-[10px] hover:bg-white/10 hover:-translate-y-0.5"
          onClick={() => { window.location.href = '/dat-simulator'; }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
