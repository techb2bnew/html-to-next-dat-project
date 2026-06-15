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
    <div id="login-overlay">
      <div className="login-card">
        <div className="login-logo">
          <span className="logo-icon">🏢</span>
          <h1>B2B Dispatcher</h1>
          <p>Practice Admin Portal — Secure Access Only</p>
        </div>

        <div className="login-field">
          <label htmlFor="login-email">Email Address</label>
          <input
            type="email"
            id="login-email"
            placeholder="admin@example.com"
            autoComplete="username"
            value={email}
            onChange={e => onEmailChange(e.target.value)}
          />
        </div>

        <div className="login-field">
          <label htmlFor="login-password">Password</label>
          <input
            type="password"
            id="login-password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={e => onPasswordChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onLogin()}
          />
        </div>

        <button className="login-btn" onClick={onLogin} disabled={loading}>
          {loading ? 'Signing in...' : '🔐 Sign In to Admin Panel'}
        </button>

        {error && (
          <div id="login-error" className="block">{error}</div>
        )}

        <div className="login-footer">
          Protected system · Unauthorized access is prohibited
        </div>
      </div>
    </div>
  );
}
