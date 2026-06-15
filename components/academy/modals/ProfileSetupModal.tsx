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
    <div className="profile-modal-overlay fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-[4px]">
      <div className="profile-modal-card bg-[rgba(15,23,42,0.98)] border border-[rgba(99,102,241,0.3)] rounded-2xl p-8 max-w-[420px] w-[90%]">
        <div className="profile-modal-header text-center mb-6">
          <span className="profile-modal-badge bg-[rgba(99,102,241,0.2)] text-[#818cf8] text-[0.7rem] tracking-[0.1em] uppercase px-3 py-1 rounded-[20px] inline-block mb-3">
            cadet enrollment
          </span>
          <h2 className="text-white mt-0 mb-2 text-[1.4rem]">🚀 Dispatcher Academy Setup</h2>
          <p className="text-slate-400 text-[0.85rem] m-0">
            Register your cadet profile to sync XP, win achievements, and claim your place on the live B2B Leaderboard.
          </p>
        </div>

        <form className="profile-modal-form" onSubmit={e => { e.preventDefault(); onSave() }}>
          <div className="profile-form-group mb-4">
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

          <div className="profile-form-group mb-6">
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
            className="btn-profile-submit w-full py-[14px] bg-gradient-to-br from-[#4f46e5] to-[#6366f1] text-white border-none rounded-[10px] font-bold text-[1rem] cursor-pointer"
          >
            ⚡ Initialize Academy Interface
          </button>
        </form>
      </div>
    </div>
  )
}
