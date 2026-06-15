'use client'

export default function DatLoginView() {
  return (
    <div id="dat-view-login" className="dat-view active">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-box">DAT</div>
          <div style={{ textAlign: 'left', color: '#1e293b' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', lineHeight: '1' }}>Freight</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>&amp; Analytics</div>
          </div>
        </div>
        <h2 style={{ marginBottom: 25, fontWeight: 800 }}>Log In</h2>
        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 20 }}>
          To continue to your DAT account
        </p>
        <div style={{ position: 'relative', textAlign: 'left' }}>
          <span style={{ position: 'absolute', top: -8, left: 8, background: 'white', padding: '0 4px', fontSize: '0.7rem', color: '#0044cc', fontWeight: 600 }}>
            Email address*
          </span>
          <input id="student-email" type="email" className="login-input" placeholder="Enter your email address" autoComplete="email" />
        </div>
        <div style={{ position: 'relative', textAlign: 'left' }}>
          <span style={{ position: 'absolute', top: -8, left: 8, background: 'white', padding: '0 4px', fontSize: '0.7rem', color: '#0044cc', fontWeight: 600 }}>
            Your Name*
          </span>
          <input id="student-name" type="text" className="login-input" placeholder="Enter your full name" autoComplete="name" />
        </div>
        <button className="login-btn" onClick={() => (window as any).datLogin?.()}>CONTINUE</button>
        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Don&apos;t have an account?{' '}
          <span style={{ color: '#0044cc', fontWeight: 700, cursor: 'pointer' }}>Sign up</span>
        </div>
      </div>
    </div>
  )
}
