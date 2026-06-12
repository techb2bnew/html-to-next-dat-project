'use client'
import { useState, useLayoutEffect, useRef } from 'react'

const PAGE_PASSWORD = 'RISHI71'
const SESSION_KEY = 'b2b_academy_page_unlocked'

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  // null = still checking (SSR/before hydration), true/false = result
  const [unlocked, setUnlocked] = useState<boolean | null>(null)
  const [inputVal, setInputVal] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [shake, setShake] = useState(false)
  const [showError, setShowError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // useLayoutEffect fires synchronously before the browser paints —
  // so there is no visible flash of locked/unlocked content.
  useLayoutEffect(() => {
    setUnlocked(sessionStorage.getItem(SESSION_KEY) === 'true')
  }, [])

  // Focus input once gate is shown
  useLayoutEffect(() => {
    if (unlocked === false) {
      inputRef.current?.focus()
    }
  }, [unlocked])

  function unlock() {
    sessionStorage.setItem(SESSION_KEY, 'true')
    setUnlocked(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (inputVal === PAGE_PASSWORD) {
      unlock()
    } else {
      setShowError(true)
      setShake(true)
      setInputVal('')
      setTimeout(() => setShake(false), 500)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  function closeError() {
    setShowError(false)
    inputRef.current?.focus()
  }

  // While checking sessionStorage (SSR + first paint), show the gate so
  // content never flashes through before we know the unlock state.
  if (unlocked === true) return <>{children}</>

  return (
    <>
      {/* Gate overlay */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(135deg, #eef2ff, #e0e7ff, #dbeafe)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 999999,
      }}>
        <div
          id="page-gate-card"
          style={{
            background: '#ffffff',
            borderRadius: 24,
            padding: '48px 40px',
            width: '100%',
            maxWidth: 420,
            boxShadow: '0 25px 60px rgba(99,102,241,0.18), 0 10px 30px rgba(0,0,0,0.1)',
            textAlign: 'center',
            animation: shake ? 'pageGateShake 0.5s ease' : undefined,
          }}
        >
          <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🔐</span>
          <h2 style={{ margin: '0 0 8px 0', fontSize: 22, fontWeight: 800, color: '#1e1b4b' }}>
            B2B Dispatcher Academy
          </h2>
          <p style={{ margin: '0 0 28px 0', color: '#6b7280', fontSize: 14 }}>
            Enter your password to continue
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <input
                ref={inputRef}
                type={showPw ? 'text' : 'password'}
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '14px 50px 14px 18px',
                  border: '2px solid #e0e7ff',
                  borderRadius: 12,
                  fontSize: 16,
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#f8faff',
                  color: '#1e1b4b',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = '#6366f1')}
                onBlur={e => (e.target.style.borderColor = '#e0e7ff')}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                title={showPw ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 18, padding: 4, lineHeight: 1,
                }}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px 0',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.02em',
              }}
            >
              Unlock Access
            </button>
          </form>
        </div>
      </div>

      {/* Wrong password popup */}
      {showError && (
        <div
          onClick={e => { if (e.target === e.currentTarget) closeError() }}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000000,
          }}
        >
          <div style={{
            background: '#fff',
            borderRadius: 20,
            padding: '40px 36px',
            textAlign: 'center',
            maxWidth: 340,
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <span style={{ fontSize: 44, display: 'block', marginBottom: 14 }}>❌</span>
            <h3 style={{ margin: '0 0 8px 0', color: '#1e1b4b', fontSize: 20, fontWeight: 800 }}>
              Wrong Password
            </h3>
            <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: 14 }}>
              That password is incorrect. Please try again.
            </p>
            <button
              onClick={closeError}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', border: 'none', borderRadius: 10,
                padding: '12px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Shake keyframes */}
      <style>{`
        @keyframes pageGateShake {
          10%, 90% { transform: translateX(-4px); }
          20%, 80% { transform: translateX(6px); }
          30%, 50%, 70% { transform: translateX(-6px); }
          40%, 60% { transform: translateX(6px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}
