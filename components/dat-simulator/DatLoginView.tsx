'use client'

interface Props {
  email: string
  name: string
  loading: boolean
  error: string
  onEmailChange: (v: string) => void
  onNameChange: (v: string) => void
  onLogin: () => void
}

export default function DatLoginView({ email, name, loading, error, onEmailChange, onNameChange, onLogin }: Props) {
  return (
    <div className="fixed inset-0 bg-slate-800 flex items-center justify-center z-[100]">
      <div className="bg-white p-10 rounded-lg w-[360px] shadow-2xl text-center">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="bg-[#0044cc] text-white font-black text-3xl px-2 py-1 leading-none tracking-tighter rounded-sm">DAT</div>
          <div className="text-left text-slate-800">
            <div className="font-extrabold text-lg leading-none">Freight</div>
            <div className="text-sm font-semibold">&amp; Analytics</div>
          </div>
        </div>

        <h2 className="mb-6 font-extrabold text-xl">Log In</h2>
        <p className="text-sm text-slate-500 mb-5">To continue to your DAT account</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2 mb-4">{error}</div>
        )}

        <div className="relative text-left mb-5">
          <span className="absolute -top-2 left-2 bg-white px-1 text-[0.7rem] text-[#0044cc] font-semibold z-10">Email address*</span>
          <input
            type="email"
            value={email}
            onChange={e => onEmailChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onLogin()}
            className="w-full p-3 border border-[#0044cc] rounded text-sm outline-none box-border"
            placeholder="Enter your email address"
            autoComplete="email"
          />
        </div>

        <div className="relative text-left mb-5">
          <span className="absolute -top-2 left-2 bg-white px-1 text-[0.7rem] text-[#0044cc] font-semibold z-10">Your Name*</span>
          <input
            type="text"
            value={name}
            onChange={e => onNameChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onLogin()}
            className="w-full p-3 border border-[#0044cc] rounded text-sm outline-none box-border"
            placeholder="Enter your full name"
            autoComplete="name"
          />
        </div>

        <button
          onClick={onLogin}
          disabled={loading}
          className="w-full bg-[#0044cc] text-white border-none py-3.5 rounded-3xl font-bold cursor-pointer mb-5 disabled:opacity-60"
        >
          {loading ? 'Connecting...' : 'CONTINUE'}
        </button>

        <div className="text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <span className="text-[#0044cc] font-bold cursor-pointer">Sign up</span>
        </div>
      </div>
    </div>
  )
}
