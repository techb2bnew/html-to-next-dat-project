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
      <div className="fixed inset-0 bg-gradient-to-br from-[#eef2ff] via-[#e0e7ff] to-[#dbeafe] flex items-center justify-center z-[999999]">
        <div
          id="page-gate-card"
          className={`bg-white rounded-[24px] px-10 py-12 w-full max-w-[420px] shadow-[0_25px_60px_rgba(99,102,241,0.18),0_10px_30px_rgba(0,0,0,0.1)] text-center ${shake ? 'animate-[pageGateShake_0.5s_ease]' : ''}`}
        >
          <span className="text-[48px] block mb-4">🔐</span>
          <h2 className="mt-0 mb-2 text-[22px] font-extrabold text-[#1e1b4b]">
            B2B Dispatcher Academy
          </h2>
          <p className="mt-0 mb-7 text-[#6b7280] text-[14px]">
            Enter your password to continue
          </p>

          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <input
                ref={inputRef}
                type={showPw ? 'text' : 'password'}
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                className="w-full px-[18px] py-[14px] pr-[50px] border-2 border-[#e0e7ff] rounded-xl text-[16px] outline-none box-border bg-[#f8faff] text-[#1e1b4b] transition-[border-color] duration-200 focus:border-[#6366f1]"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                title={showPw ? 'Hide password' : 'Show password'}
                className="absolute right-[14px] top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[18px] p-1 leading-none"
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-[14px] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white border-none rounded-xl text-[16px] font-bold cursor-pointer tracking-[0.02em]"
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000000]"
        >
          <div className="bg-white rounded-[20px] px-9 py-10 text-center max-w-[340px] w-[90%] shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <span className="text-[44px] block mb-[14px]">❌</span>
            <h3 className="mt-0 mb-2 text-[#1e1b4b] text-[20px] font-extrabold">
              Wrong Password
            </h3>
            <p className="mt-0 mb-6 text-[#6b7280] text-[14px]">
              That password is incorrect. Please try again.
            </p>
            <button
              onClick={closeError}
              className="bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white border-none rounded-[10px] px-8 py-3 text-[15px] font-bold cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

    </>
  )
}
