'use client'

interface Props {
  email: string;
  password: string;
  error: string;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: () => void;
}

export default function LoginOverlay({ email, password, error, onEmailChange, onPasswordChange, onSubmit }: Props) {
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
            onKeyDown={e => e.key === 'Enter' && onSubmit()}
          />
        </div>

        <button className="login-btn" onClick={onSubmit}>
          🔐 Sign In to Admin Panel
        </button>

        {error && (
          <div id="login-error" style={{ display: 'block' }}>{error}</div>
        )}

        <div className="login-footer">
          Protected system · Unauthorized access is prohibited
        </div>
      </div>
    </div>
  );
}
