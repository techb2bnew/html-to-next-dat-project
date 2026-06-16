'use client'
import { useState, useEffect } from 'react';
import type { DatResult, DatLeaderboardEntry } from '@/lib/types/admin';
import { fetchDatConfigApi, saveDatConfigApi } from '@/lib/api/admin';

interface Props {
  results: DatResult[];
  leaderboard: DatLeaderboardEntry[];
  loading: boolean;
  onRefresh: () => void;
  onViewEval: (evalData: Record<string, any>) => void;
}

const DIFFICULTY_OPTIONS = [
  'Rookie (Easy Mode)',
  'Intermediate (Standard)',
  'Expert (Hard Mode)',
  'Ruthless (Nightmare)',
];
const CRISIS_OPTIONS = [
  'Rare (1 per 5 loads)',
  'Occasional (1 per 3 loads)',
  'Frequent (1 per 2 loads)',
  'Constant (Every Load)',
];
const MARKET_OPTIONS = [
  'Bull Market (High Rates)',
  'Normal Market',
  'Bear Market (Low Rates)',
  'Mixed Market',
];

export default function DatTab({ results, leaderboard, loading, onRefresh, onViewEval }: Props) {
  const [filter, setFilter] = useState('');

  // DAT Settings state
  const [brokerDifficulty, setBrokerDifficulty] = useState(DIFFICULTY_OPTIONS[1]);
  const [crisisFrequency, setCrisisFrequency] = useState(CRISIS_OPTIONS[1]);
  const [marketCondition, setMarketCondition] = useState(MARKET_OPTIONS[1]);
  const [configLoading, setConfigLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    fetchDatConfigApi()
      .then(data => {
        if (data.status === 'success' && data.config) {
          const c = data.config;
          if (c.broker_difficulty) setBrokerDifficulty(c.broker_difficulty);
          if (c.crisis_frequency) setCrisisFrequency(c.crisis_frequency);
          if (c.market_condition) setMarketCondition(c.market_condition);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSaveConfig() {
    setSaveStatus('saving');
    setConfigLoading(true);
    try {
      const res = await saveDatConfigApi({ broker_difficulty: brokerDifficulty, crisis_frequency: crisisFrequency, market_condition: marketCondition });
      if (res.status === 'success' || res.ok || res.message) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setConfigLoading(false);
    }
  }

  const filtered = filter
    ? results.filter(r =>
        (r.student_email || '').toLowerCase().includes(filter.toLowerCase()) ||
        (r.student_name || '').toLowerCase().includes(filter.toLowerCase())
      )
    : results;

  const scoreColor = (pct: number) =>
    pct >= 115 ? '#10b981' : pct >= 100 ? '#3b82f6' : pct >= 90 ? '#f59e0b' : '#ef4444';

  const selectCls = "bg-[#f8fafc] border border-slate-200 text-slate-900 px-[10px] py-[7px] rounded-md text-[13px] flex-1 min-w-[180px] cursor-pointer";
  const cardCls = "bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-[0_4px_6px_rgba(0,0,0,0.1)]";
  const tableCls = "w-full border-collapse mt-[15px] [&_th]:text-left [&_td]:text-left [&_th]:p-3 [&_td]:p-3 [&_th]:border-b [&_td]:border-b [&_th]:border-slate-200 [&_td]:border-slate-200 [&_th]:text-[13px] [&_td]:text-[13px] [&_th]:text-slate-600 [&_th]:font-bold [&_th]:bg-white";

  return (
    <>
      {/* Engine status */}
      <div className={cardCls}>
        <h3 className="m-0 mb-[10px] text-slate-900">🚛 DAT Load Board Simulator Engine</h3>
        <p className="m-0 mb-5 text-[13px] text-slate-600">
          The Simulator Engine is now 100% dynamic and AI-driven. All market conditions, broker difficulty,
          and crisis events are procedurally generated in real-time.
        </p>
        <div className="bg-emerald-500/10 border border-emerald-500 p-4 rounded-lg text-[#047857] font-semibold flex items-center gap-[10px]">
          <span className="text-[1.5rem]">✨</span>
          <span>AI Dynamic Generation Engine is Active</span>
        </div>
      </div>

      {/* DAT Settings */}
      <div className={`${cardCls} mt-6`}>
        <h3 className="m-0 mb-[6px] text-slate-900">⚙️ Simulator Settings</h3>
        <p className="m-0 mb-5 text-[13px] text-slate-600">
          Configure global market parameters for the DAT dispatcher simulator.
        </p>
        <div className="flex flex-wrap gap-4 mb-5">
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-[12px] font-bold text-slate-600 uppercase tracking-[0.05em]">Broker Difficulty</label>
            <select className={selectCls} value={brokerDifficulty} onChange={e => setBrokerDifficulty(e.target.value)}>
              {DIFFICULTY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-[12px] font-bold text-slate-600 uppercase tracking-[0.05em]">Crisis Frequency</label>
            <select className={selectCls} value={crisisFrequency} onChange={e => setCrisisFrequency(e.target.value)}>
              {CRISIS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-[12px] font-bold text-slate-600 uppercase tracking-[0.05em]">Market Condition</label>
            <select className={selectCls} value={marketCondition} onChange={e => setMarketCondition(e.target.value)}>
              {MARKET_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={handleSaveConfig}
          disabled={configLoading || saveStatus === 'saving'}
          className="text-white border-none px-[22px] py-[9px] rounded-md font-bold text-[13px] transition-[background] duration-200"
          style={{
            background: saveStatus === 'saved' ? '#10b981' : saveStatus === 'error' ? '#ef4444' : '#6366f1',
            cursor: configLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {saveStatus === 'saving' ? '⏳ Saving...' : saveStatus === 'saved' ? '✅ Saved!' : saveStatus === 'error' ? '❌ Error' : '💾 Save Settings'}
        </button>
      </div>

      {/* Leaderboard */}
      <div className={`${cardCls} mt-6`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="m-0 text-slate-900">🏆 Negotiation Leaderboard</h3>
          <button onClick={onRefresh} disabled={loading} className="bg-slate-50 border border-slate-300 text-slate-900 px-3 py-[6px] rounded cursor-pointer text-[12px] font-bold">
            {loading ? '⏳ Loading...' : '🔄 Refresh'}
          </button>
        </div>
        <p className="m-0 mb-4 text-[13px] text-slate-600">
          Students ranked by average negotiation score. &gt;100% means the student negotiated above the listed rate.
        </p>
        <table className={tableCls}>
          <thead>
            <tr>
              <th className="w-[30px]">#</th><th>Student</th><th>Avg Score</th>
              <th>Calls</th><th>Booked</th><th>Max Rate</th><th>Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-slate-600">No negotiations recorded yet.</td></tr>
            ) : leaderboard.map((s, idx) => {
              const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`;
              const sc = scoreColor(s.avg_score);
              return (
                <tr key={s._id}>
                  <td className="font-extrabold text-[1rem]">{medal}</td>
                  <td>
                    <div className="font-bold text-slate-900">{s.student_name || s._id}</div>
                    <div className="text-[11px] text-slate-600">{s._id}</div>
                  </td>
                  <td><span className="font-black text-[1.1rem]" style={{ color: sc }}>{s.avg_score}%</span></td>
                  <td className="text-slate-600">{s.total_calls}</td>
                  <td><span className="text-emerald-500 font-bold">{s.booked_count}</span></td>
                  <td className="font-bold">${(s.max_rate || 0).toLocaleString()}</td>
                  <td className="text-sky-400 font-bold">${(s.total_revenue || 0).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* All Results */}
      <div className={`${cardCls} mt-6`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="m-0 text-slate-900">📋 All Negotiation Results</h3>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Filter by student..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="bg-white border border-slate-200 text-slate-900 px-[10px] py-[6px] rounded text-[12px] w-[180px]"
            />
            <span className="text-[12px] text-slate-600">{filtered.length} {filter ? 'shown' : 'total'}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className={tableCls}>
            <thead>
              <tr>
                <th>Time</th><th>Type</th><th>Student</th><th>Broker</th>
                <th>Route</th><th>Posted Rate</th><th>Agreed Rate</th>
                <th>Score</th><th>Result</th><th>AI Review</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="text-center text-slate-600">No results yet.</td></tr>
              ) : filtered.map((r, i) => {
                const sc = scoreColor(r.score_pct);
                const statusBadge = r.status === 'Booked'
                  ? <span className="bg-emerald-500 text-slate-900 px-[7px] py-[2px] rounded-[10px] text-[11px] font-bold">✅ BOOKED</span>
                  : <span className="bg-slate-600 text-slate-900 px-[7px] py-[2px] rounded-[10px] text-[11px] font-bold">❌ HUNG UP</span>;
                const typeBadge = r.type === 'Email'
                  ? <span className="bg-[#e0e7ff] text-[#4f46e5] px-[6px] py-[2px] rounded text-[10px] font-extrabold border border-[#c7d2fe] inline-block mr-[6px]">✉️ EMAIL</span>
                  : <span className="bg-[#fce8e6] text-[#d93025] px-[6px] py-[2px] rounded text-[10px] font-extrabold border border-[#f8bbd0] inline-block mr-[6px]">📞 CALL</span>;
                return (
                  <tr key={i}>
                    <td className="text-[11px] text-slate-600">{r.timestamp_str || ''}</td>
                    <td>{typeBadge}</td>
                    <td>
                      <div className="font-bold text-slate-900 text-[12px]">{r.student_name || r.student_email}</div>
                      <div className="text-[10px] text-slate-600">{r.student_email}</div>
                    </td>
                    <td className="text-slate-600 text-[12px]">{r.broker_name}</td>
                    <td className="text-[12px]">{r.origin} → {r.destination}</td>
                    <td className="text-[12px]">${(r.posted_rate || 0).toLocaleString()}</td>
                    <td className="font-bold text-[12px]">${(r.agreed_rate || 0).toLocaleString()}</td>
                    <td>
                      <span className="font-black text-[1rem]" style={{ color: sc }}>{r.score_pct}%</span>
                      <div className="text-[10px] mt-[2px]" style={{ color: sc }}>{r.grade}</div>
                    </td>
                    <td>{statusBadge}</td>
                    <td>
                      <button
                        className="font-bold rounded bg-slate-50 border border-slate-300 text-slate-900 px-2 py-1 text-[11px]"
                        onClick={() => onViewEval(r.ai_evaluation || {})}
                      >
                        🤖 View Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
