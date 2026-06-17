'use client'
import { useState } from 'react';
import type { Challenge } from '@/lib/types/admin';
import { createCustomChallengeApi } from '@/lib/api/admin';
import { getApiBase } from '@/lib/config';

interface Props {
  challenges: Challenge[];
  loading: boolean;
  token: string;
  onDelete: (id: string) => void;
  onCreated: () => void;
}

const inputCls = "bg-[#f8fafc] border border-slate-200 text-slate-900 px-[10px] py-2 rounded-md text-[13px] w-full box-border";
const labelCls = "text-[12px] font-bold text-slate-600 uppercase tracking-[0.05em] block mb-1";
const cardCls = "bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-[0_4px_6px_rgba(0,0,0,0.1)]";
const tableCls = "w-full border-collapse mt-[15px] [&_th]:text-left [&_td]:text-left [&_th]:p-3 [&_td]:p-3 [&_th]:border-b [&_td]:border-b [&_th]:border-slate-200 [&_td]:border-slate-200 [&_th]:text-[13px] [&_td]:text-[13px] [&_th]:text-slate-600 [&_th]:font-bold [&_th]:bg-white";

export default function ChallengesTab({ challenges, loading, token, onDelete, onCreated }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Freight Negotiation');
  const [difficulty, setDifficulty] = useState('Rookie');
  const [company, setCompany] = useState('Mid-size Carrier');
  const [xp, setXp] = useState('100');
  const [duration, setDuration] = useState('8 min');
  const [tags, setTags] = useState('');
  const [charName, setCharName] = useState('');
  const [charRole, setCharRole] = useState('Freight Broker');
  const [charPersonality, setCharPersonality] = useState('');
  const [scenario, setScenario] = useState('');
  const [formError, setFormError] = useState('');

  async function handleCreate() {
    if (!title.trim() || !scenario.trim() || !charName.trim()) {
      setFormError('Please fill in Scenario Title, Actor Name, and Scenario Briefing.');
      return;
    }
    setFormError('');
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: `Custom dispatcher simulation scenario with ${charName.trim()}.`,
        difficulty,
        duration,
        xp_reward: parseInt(xp) || 100,
        category,
        company_type: company,
        skill_tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        scenario_brief: scenario.trim(),
        character: {
          name: charName.trim(),
          role: charRole.trim(),
          personality: charPersonality.trim(),
          difficulty_level: difficulty === 'Rookie' ? 'Easy' : difficulty === 'Expert' ? 'Hard' : 'Medium',
        },
      };
      const data = await createCustomChallengeApi(token, payload);
      if (data.status === 'success') {
        setTitle(''); setScenario(''); setCharName(''); setCharPersonality(''); setTags('');
        setShowForm(false);
        onCreated();
      } else {
        setFormError(data.error || 'Failed to create scenario.');
      }
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={cardCls}>
        <h3 className="m-0 mb-[10px] text-slate-900">🧠 Dynamic AI Challenge Engine</h3>
        <p className="m-0 mb-5 text-[13px] text-slate-600">
          The academy now utilizes a 100% dynamic AI generation engine. Challenges, broker personas, logistics details,
          and negotiations are procedurally generated in real-time.
        </p>
        <div className="bg-indigo-500/10 border border-indigo-500 p-4 rounded-lg text-[#4338ca] font-semibold flex items-center gap-[10px]">
          <span className="text-[1.5rem]">✨</span>
          <span>AI Procedural Scenario Engine is Active</span>
        </div>
      </div>

      {/* Custom Challenge Creation */}
      <div className={`${cardCls} mt-6`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="m-0 text-slate-900">➕ Create Custom Scenario</h3>
          <button
            onClick={() => { setShowForm(f => !f); setFormError(''); }}
            className={`border border-indigo-500 px-[14px] py-[6px] rounded-md font-bold text-[12px] cursor-pointer ${showForm ? 'bg-slate-100 text-indigo-500' : 'bg-indigo-500 text-white'}`}
          >
            {showForm ? '✕ Cancel' : '+ New Scenario'}
          </button>
        </div>

        {showForm && (
          <div className="flex flex-col gap-[14px]">
            <div className="grid gap-[14px] grid-cols-2">
              <div>
                <label className={labelCls}>Scenario Title *</label>
                <input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Rush Hour Reefer Run" />
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <select className={inputCls} value={category} onChange={e => setCategory(e.target.value)}>
                  <option>Freight Negotiation</option>
                  <option>Carrier Relations</option>
                  <option>Crisis Management</option>
                  <option>Rate Optimization</option>
                  <option>Customer Service</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Difficulty</label>
                <select className={inputCls} value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                  <option>Rookie</option>
                  <option>Intermediate</option>
                  <option>Expert</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Company Type</label>
                <input className={inputCls} value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Mid-size Carrier" />
              </div>
              <div>
                <label className={labelCls}>XP Reward</label>
                <input className={inputCls} type="number" value={xp} onChange={e => setXp(e.target.value)} placeholder="100" />
              </div>
              <div>
                <label className={labelCls}>Duration</label>
                <input className={inputCls} value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 8 min" />
              </div>
              <div>
                <label className={labelCls}>Skill Tags (comma-separated)</label>
                <input className={inputCls} value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. negotiation, urgency, reefer" />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-[14px]">
              <p className="m-0 mb-3 text-[12px] font-bold text-slate-600 uppercase tracking-[0.05em]">AI Actor Details</p>
              <div className="grid gap-[14px] grid-cols-2">
                <div>
                  <label className={labelCls}>Actor Name *</label>
                  <input className={inputCls} value={charName} onChange={e => setCharName(e.target.value)} placeholder="e.g. Marcus Taylor" />
                </div>
                <div>
                  <label className={labelCls}>Actor Role</label>
                  <input className={inputCls} value={charRole} onChange={e => setCharRole(e.target.value)} placeholder="e.g. Freight Broker" />
                </div>
                <div className="col-span-full">
                  <label className={labelCls}>Personality / Tone</label>
                  <input className={inputCls} value={charPersonality} onChange={e => setCharPersonality(e.target.value)} placeholder="e.g. Aggressive negotiator, impatient, pressures on time" />
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Scenario Briefing *</label>
              <textarea
                className={`${inputCls} min-h-[100px] resize-y`}
                value={scenario}
                onChange={e => setScenario(e.target.value)}
                placeholder="Describe the full dispatch scenario context, load details, and what the student must accomplish..."
              />
            </div>

            {formError && (
              <p className="text-red-400 text-[13px] m-0 font-semibold">{formError}</p>
            )}

            <div>
              <button
                onClick={handleCreate}
                disabled={saving}
                className={`bg-indigo-500 text-white border-none px-6 py-[9px] rounded-md font-bold text-[13px] ${saving ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {saving ? '⏳ Saving...' : '✅ Create Scenario'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Scenarios List */}
      <div className={`${cardCls} mt-6`}>
        <h3 className="m-0 mb-[15px] text-slate-900">⚙️ Active Dispatch Academy Scenarios</h3>
        <table className={tableCls}>
          <thead>
            <tr>
              <th>Scenario Title</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>AI Actor Details</th>
              <th>Stats</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="text-center p-5">Loading scenarios...</td></tr>
            )}
            {!loading && challenges.length === 0 && (
              <tr><td colSpan={6} className="text-center text-slate-400">No custom scenarios loaded.</td></tr>
            )}
            {challenges.map(ch => (
              <tr key={ch.challenge_id}>
                <td className="font-bold text-white">{ch.title}</td>
                <td>
                  <span className="px-[10px] py-1 rounded-full uppercase tracking-[0.05em] bg-[rgba(99,102,241,0.2)] text-[#a5b4fc] border border-[rgba(99,102,241,0.3)] text-[10px] font-bold">
                    {ch.category}
                  </span>
                </td>
                <td><strong className="text-slate-300">{ch.difficulty}</strong></td>
                <td className="text-slate-400">{ch.character.name} ({ch.character.role})</td>
                <td className="text-slate-400">⏱️ {ch.duration} | 🏆 {ch.xp_reward} XP</td>
                <td>
                  <button
                    className="font-bold px-2 py-1 text-[11px] bg-red-400 border-none text-white rounded cursor-pointer"
                    onClick={() => onDelete(ch.challenge_id)}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
