'use client'

interface Props {
  email: string;
  password: string;
  error: string;
  loading: boolean;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onLogin: () => void;
}

export default function LoginOverlay({ email, password, error, loading, onEmailChange, onPasswordChange, onLogin }: Props) {
  return (
    <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,#f1f5f9,#e2e8f0_40%),radial-gradient(circle_at_bottom_left,#e2e8f0,#cbd5e1)] flex items-center justify-center z-[9999] p-6 backdrop-blur-md">
      <div className="bg-white border border-black/[0.08] rounded-3xl p-8 sm:p-12 w-full max-w-[420px] shadow-[0_20px_45px_-12px_rgba(15,23,42,0.08)] animate-[slideUp_0.5s_ease-out]">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">🏢</span>
          <h1 className="text-2xl font-extrabold bg-gradient-to-br from-blue-400 to-violet-400 bg-clip-text text-transparent mb-1">B2B Dispatcher</h1>
          <p className="text-slate-600 text-sm">Practice Admin Portal — Secure Access Only</p>
        </div>

        <div className="mb-5">
          <label htmlFor="login-email" className="block text-xs font-bold uppercase text-slate-600 mb-2 tracking-[0.05em]">Email Address</label>
          <input
            type="email"
            id="login-email"
            placeholder="admin@example.com"
            autoComplete="username"
            value={email}
            onChange={e => onEmailChange(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-black/[0.08] rounded-xl text-slate-900 text-base transition focus:outline-none focus:border-indigo-600 focus:shadow-[0_0_0_4px_rgba(79,70,229,0.15)]"
          />
        </div>

        <div className="mb-5">
          <label htmlFor="login-password" className="block text-xs font-bold uppercase text-slate-600 mb-2 tracking-[0.05em]">Password</label>
          <input
            type="password"
            id="login-password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={e => onPasswordChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onLogin()}
            className="w-full px-4 py-3 bg-slate-50 border border-black/[0.08] rounded-xl text-slate-900 text-base transition focus:outline-none focus:border-indigo-600 focus:shadow-[0_0_0_4px_rgba(79,70,229,0.15)]"
          />
        </div>

        <button
          className="w-full p-4 mt-4 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-none rounded-xl font-bold cursor-pointer transition hover:-translate-y-0.5 hover:shadow-[0_10px_15px_-3px_rgba(79,70,229,0.4)] disabled:opacity-60"
          onClick={onLogin}
          disabled={loading}
        >
          {loading ? 'Signing in...' : '🔐 Sign In to Admin Panel'}
        </button>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mt-4 text-sm text-center">{error}</div>
        )}

        <div className="text-center text-xs text-slate-500 mt-6">
          Protected system · Unauthorized access is prohibited
        </div>
      </div>
    </div>
  );
}
