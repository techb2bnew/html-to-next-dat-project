'use client'

interface Props {
  name: string
  email: string
  onNameChange: (v: string) => void
  onEmailChange: (v: string) => void
  onSave: () => void
}

export default function ProfileSetupModal({ name, email, onNameChange, onEmailChange, onSave }: Props) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-[4px] p-5 animate-[fadeIn_0.3s_ease-out_forwards]">
      <div className="relative overflow-hidden bg-[rgba(15,23,42,0.98)] border border-[rgba(99,102,241,0.3)] rounded-2xl p-8 max-w-[420px] w-[90%] shadow-[0_25px_60px_rgba(15,23,42,0.15),0_0_30px_rgba(99,102,241,0.1)] animate-[modalScaleUpY_0.35s_cubic-bezier(0.16,1,0.3,1)_forwards]">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-600 to-violet-600" />

        <div className="text-center mb-6">
          <span className="bg-[rgba(99,102,241,0.2)] text-[#818cf8] text-[0.7rem] tracking-[0.1em] uppercase px-3 py-1 rounded-[20px] inline-block mb-3">
            cadet enrollment
          </span>
          <h2 className="text-white mt-0 mb-2 text-[1.4rem]">🚀 Dispatcher Academy Setup</h2>
          <p className="text-slate-400 text-[0.85rem] m-0">
            Register your cadet profile to sync XP, win achievements, and claim your place on the live B2B Leaderboard.
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); onSave() }}>
          <div className="flex flex-col gap-[6px] mb-4">
            <label className="block text-slate-300 text-[0.85rem] mb-[6px]">
              👤 Cadet Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => onNameChange(e.target.value)}
              placeholder="Ace Dispatcher"
              className="w-full px-[14px] py-[10px] bg-white/5 border border-white/10 rounded-lg text-white box-border"
            />
          </div>

          <div className="flex flex-col gap-[6px] mb-6">
            <label className="block text-slate-300 text-[0.85rem] mb-[6px]">
              📧 B2B Terminal Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => onEmailChange(e.target.value)}
              placeholder="student@b2b.com"
              className="w-full px-[14px] py-[10px] bg-white/5 border border-white/10 rounded-lg text-white box-border"
            />
          </div>

          <button
            type="submit"
            className="w-full py-[14px] bg-gradient-to-br from-[#4f46e5] to-[#6366f1] text-white border-none rounded-[10px] font-bold text-[1rem] cursor-pointer shadow-[0_5px_15px_rgba(99,102,241,0.3)] mt-[10px] flex items-center justify-center gap-2 transition hover:shadow-[0_8px_25px_rgba(99,102,241,0.45)] hover:-translate-y-px"
          >
            ⚡ Initialize Academy Interface
          </button>
        </form>
      </div>
    </div>
  )
}
