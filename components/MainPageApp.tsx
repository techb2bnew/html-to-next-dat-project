'use client'
import Script from 'next/script'

// The simulator section is intentionally removed — the DAT Simulator tab opens
// /dat-simulator in a new tab (challenges.js:switchView). Only the academy hub
// and standard-practice sections need to live here.

const practiceCallHTML = `
<div class="container" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:70vh;padding:10px;">
  <div style="color:var(--text-muted);font-size:0.85rem;text-align:center;margin-bottom:20px;">
    💡 <strong>Practice Mode:</strong> Direct freeform interactive phone simulator. Connect call to practice general dispatcher communications.
  </div>

  <div class="smartphone-frame" id="ai-avatar-wrapper">
    <div class="smartphone-screen">
      <div class="phone-header">
        <div class="phone-notch"></div>
        <div class="phone-bar">
          <span class="phone-time">9:41</span>
          <div style="display:flex;gap:4px;font-weight:700;color:var(--success);font-size:0.65rem;letter-spacing:0.05em;align-items:center;">
            <span class="status-dot"></span> B2B LIVE
          </div>
          <div class="phone-icons" style="display:flex;gap:6px;align-items:center;">
            <span>📶</span><span>🔋</span>
            <button id="voice-settings-toggle" type="button" style="background:none;border:none;color:rgba(255,255,255,0.75);cursor:pointer;padding:2px 0 0 4px;display:flex;align-items:center;justify-content:center;outline:none;" title="Voice Settings">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="phone-call-body">
        <div class="caller-avatar-circle">
          <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="display:block;">
            <defs>
              <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#4f46e5"/>
                <stop offset="100%" stop-color="#312e81"/>
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#avatarGrad)"/>
            <path d="M15 90 C 20 65, 80 65, 85 90 Z" fill="#1e293b"/>
            <path d="M35 70 L50 82 L65 70 Z" fill="#ffffff"/>
            <path d="M48 70 L52 70 L50 82 Z" fill="#4f46e5"/>
            <path d="M35 70 L50 82 L50 90 L15 90 C 20 65, 35 68, 35 70 Z" fill="#0f172a"/>
            <path d="M65 70 L50 82 L50 90 L85 90 C 80 65, 65 68, 65 70 Z" fill="#0f172a"/>
            <circle cx="50" cy="45" r="18" fill="#ffedd5"/>
            <path d="M44 50 Q 50 53, 56 50" stroke="#c2410c" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            <path d="M32 42 Q 50 25, 68 42 Q 50 35, 32 42" fill="#1e1b4b"/>
            <circle cx="43" cy="41" r="2" fill="#1e1b4b"/>
            <circle cx="57" cy="41" r="2" fill="#1e1b4b"/>
            <path d="M30 45 A 20 20 0 0 1 70 45" stroke="#64748b" stroke-width="3" fill="none" stroke-linecap="round"/>
            <rect x="29" y="42" width="4" height="10" rx="2" fill="#1e293b"/>
            <rect x="67" y="42" width="4" height="10" rx="2" fill="#1e293b"/>
            <path d="M31 48 L44 54" stroke="#64748b" stroke-width="2" fill="none" stroke-linecap="round"/>
            <circle cx="44" cy="54" r="2" fill="#ef4444"/>
          </svg>
        </div>
        <h1 class="caller-name">B2B Broker</h1>
        <div class="caller-status">Active Call</div>
        <div class="call-timer-container"><span id="timer">00:00</span></div>
        <div class="phone-wave-pulse"><span></span><span></span><span></span><span></span><span></span></div>
      </div>

      <div class="phone-action-grid">
        <div class="action-item">
          <button id="mic-toggle" class="phone-circle-btn muted-btn" type="button" title="Mute Microphone">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="1" y1="1" x2="23" y2="23"></line>
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6"></path>
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
              <line x1="12" y1="19" x2="12" y2="22"></line>
            </svg>
          </button>
          <span class="action-label">mute</span>
        </div>
        <div class="action-item">
          <button id="record" class="phone-circle-btn record-btn" type="button" title="Record Response">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
              <path d="M19 10v1a7 7 0 0 1-14 0v-1"></path>
              <line x1="12" x2="12" y1="19" y2="22"></line>
            </svg>
          </button>
          <span class="action-label" style="font-weight:700;color:white;">speak</span>
        </div>
        <div class="action-item">
          <button id="stop" class="phone-circle-btn" style="background:rgba(255,255,255,0.1);color:white;border-color:rgba(255,255,255,0.2);" type="button" title="Submit Response">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>
          <span class="action-label">submit</span>
        </div>
      </div>

      <div class="phone-end-call-area">
        <button id="end-call-btn" class="phone-decline-btn" type="button" title="End Call & Wrap Up">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
            <line x1="23" y1="1" x2="1" y2="23"></line>
          </svg>
        </button>
      </div>
    </div>

    <div id="voice-settings-overlay" class="modal-overlay" style="display:none;">
      <div class="modal-content" style="background:rgba(17,24,39,0.98);border:1px solid var(--border-glow);box-shadow:var(--shadow-glow);padding:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:10px;">
          <h3 style="color:#ffffff;margin:0;font-size:1rem;">🔊 Voice & Speech Settings</h3>
          <button id="close-voice-settings" type="button" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:1.2rem;outline:none;line-height:1;">&times;</button>
        </div>
        <div class="voice-settings-panel" style="background:transparent;border:none;padding:0;">
          <div class="voice-setting-row" style="margin-bottom:15px;">
            <label class="voice-setting-label" style="font-size:0.85rem;color:#cbd5e1;display:block;margin-bottom:5px;">Accent & Voice</label>
            <select id="voice-accent-selector" class="voice-accent-select" style="display:block !important;"></select>
          </div>
          <div class="voice-setting-row" style="margin-bottom:15px;">
            <label class="voice-setting-label" style="font-size:0.85rem;color:#cbd5e1;display:block;margin-bottom:5px;">Speech Rate</label>
            <div class="voice-slider-container">
              <input type="range" id="voice-speed-slider" class="voice-slider" min="0.8" max="1.5" step="0.1" defaultValue="1.0" style="display:block !important;" />
              <span id="voice-speed-value" class="voice-slider-value">1.0x</span>
            </div>
          </div>
          <button id="test-voice-btn" type="button" class="primary-btn" style="width:100%;font-size:0.85rem;padding:8px 12px;margin-top:10px;background:rgba(79,70,229,0.25);border:1px solid rgba(79,70,229,0.45);color:#fff;cursor:pointer;">
            Test Selected Voice 🗣️
          </button>
        </div>
      </div>
    </div>

    <button id="start" type="button" style="display:none;"></button>
    <audio id="botVoice" playsInline></audio>
  </div>

  <div id="chat" class="chat" style="display:none !important;"></div>

  <div id="tech-modal" class="modal-overlay" style="display:none;">
    <div class="modal-content" style="background:rgba(17,24,39,0.95);border:1px solid var(--border-glow);box-shadow:var(--shadow-glow);">
      <div class="modal-header" style="border-bottom:1px solid rgba(255,255,255,0.1);">
        <h3 style="color:#ffffff;">Start Your Practice Call</h3>
        <input type="hidden" id="selected-tech" value="Dispatcher" />
        <div class="user-info-section" style="margin-top:15px;">
          <div>
            <label for="student-name" style="font-size:0.95rem;font-weight:700;color:#fff;">Full Name</label>
            <input type="text" id="student-name" placeholder="Enter your full name to connect call" required style="margin-top:8px;background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);color:#fff;padding:10px;border-radius:6px;" />
          </div>
          <div style="display:none;">
            <label for="student-session">Practice Session</label>
            <select id="student-session" required><option value="">Loading sessions...</option></select>
          </div>
          <div style="display:none;">
            <label for="student-email">Email Address</label>
            <input type="email" id="student-email" defaultValue="practice@b2bpractice.com" required />
          </div>
          <div style="display:none;">
            <label for="student-mobile">Mobile Number</label>
            <input type="tel" id="student-mobile" defaultValue="9999999999" required />
          </div>
          <div id="pool-campus-extras" style="display:none;">
            <input type="text" id="student-college" defaultValue="" />
            <input type="text" id="student-course" defaultValue="" />
            <input type="text" id="student-semester" defaultValue="" />
          </div>
        </div>
      </div>
      <div class="modal-footer" style="padding-top:8px;">
        <button id="start-session-btn" class="primary-btn" style="width:100%;border-radius:var(--radius-md);font-size:1rem;padding:14px;background:linear-gradient(135deg,var(--neon-indigo),#4f46e5);color:#fff;border:none;box-shadow:0 4px 10px rgba(79,70,229,0.3);">Connect Call 📞</button>
      </div>
    </div>
  </div>

  <div id="global-loader" class="loader-overlay">
    <div class="spinner"></div>
    <div class="loader-text" id="loader-message">Processing...</div>
  </div>
</div>
`

export default function MainPageApp() {
  return (
    <>
      <div className="academy-wrapper">

        {/* Mobile header */}
        <div className="mobile-header" style={{ display: 'none' }}>
          <div className="hamburger" onClick={() => document.querySelector('.academy-nav')?.classList.toggle('open')}>☰</div>
          <div className="logo">B2B Academy</div>
        </div>

        {/* Navigation */}
        <nav className="academy-nav">
          <div
            className="hamburger"
            onClick={() => document.querySelector('.academy-nav')?.classList.toggle('open')}
            style={{ alignSelf: 'flex-end', display: 'none', fontSize: 24, marginBottom: 20 }}
          >
            ✖
          </div>

          <div className="academy-tabs">
            <button className="academy-tab-btn active" data-view="dashboard">🌐 Academy Hub</button>
            <button className="academy-tab-btn" data-view="dat-simulator">🚛 DAT Simulator</button>
            <button className="academy-tab-btn" data-view="leaderboard">🏆 Rankings &amp; Stats</button>
            <button className="academy-tab-btn" data-view="admin-portal">🏢 Admin Portal</button>
          </div>

          <div className="academy-hud">
            <div className="hud-item streak" id="hud-streak-val">🔥 0 Days</div>
            <div className="hud-item xp" id="hud-xp-val">0 XP</div>
            <button
              className="hud-item"
              onClick={() => typeof window !== 'undefined' && (window as any).logoutSimulator?.()}
              style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', cursor: 'pointer' }}
            >
              🚪 Logout
            </button>
          </div>
        </nav>

        {/* Main content */}
        <div id="challenges-academy-hub">

          {/* Dashboard view */}
          <div id="view-dashboard" style={{ display: 'block' }}>
            <div className="daily-challenge-banner">
              <div className="daily-content">
                <h2 style={{ color: '#ffffff', fontWeight: 900, textShadow: '0px 1px 2px rgba(0,0,0,0.1)' }}>
                  <span className="daily-tag">Daily Challenge</span>
                  <span>Negotiate $3,200 Reefer Load Under High Pressure</span>
                </h2>
                <p style={{ color: '#222', fontWeight: 500, fontSize: '1.05rem' }}>
                  Salinas produce market is boiling. Manny from Salinas Hub has a load of continuous temp -2°F berries to Philly. Challenge your rate negotiation skills, handle his strict requirements, and claim double points today!
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexDirection: 'column', alignItems: 'flex-end' }}>
                <button
                  className="btn-primary-debrief"
                  onClick={() => typeof window !== 'undefined' && (window as any).openBriefingModal?.('ch_find_load')}
                  style={{ boxShadow: '0 4px 20px rgba(168,85,247,0.45)', background: 'linear-gradient(135deg, var(--neon-purple), var(--neon-indigo))', padding: '12px 24px' }}
                >
                  Accept Challenge ⚡
                </button>
                <button
                  className="btn-primary-debrief"
                  onClick={() => typeof window !== 'undefined' && (window as any).generateNewDailyChallenge?.()}
                  style={{ background: 'rgba(168,85,247,0.1)', color: '#1e1b4b', padding: '8px 16px', borderRadius: 8, fontSize: '0.85rem', boxShadow: 'none', border: '1px solid rgba(168,85,247,0.3)' }}
                >
                  Regenerate 🔄
                </button>
              </div>
            </div>

            <div className="dashboard-grid">
              <div>
                <div className="section-header">
                  <h3>Dispatcher Practice Directory</h3>
                  <div className="category-filters">
                    <button className="filter-chip active" onClick={e => typeof window !== 'undefined' && (window as any).filterCategory?.('ALL', e.currentTarget)}>ALL SCENARIOS</button>
                    <button className="filter-chip" onClick={e => typeof window !== 'undefined' && (window as any).filterCategory?.('BROKER NEGOTIATION', e.currentTarget)}>BROKER NEGOTIATION</button>
                    <button className="filter-chip" onClick={e => typeof window !== 'undefined' && (window as any).filterCategory?.('DRIVER MANAGEMENT', e.currentTarget)}>DRIVER MANAGEMENT</button>
                    <button className="filter-chip" onClick={e => typeof window !== 'undefined' && (window as any).filterCategory?.('CRISIS MANAGEMENT', e.currentTarget)}>CRISIS MANAGEMENT</button>
                    <button className="filter-chip" onClick={e => typeof window !== 'undefined' && (window as any).filterCategory?.('CUSTOMER SUPPORT', e.currentTarget)}>CUSTOMER SUPPORT</button>
                  </div>
                </div>
                <div className="challenges-grid" id="challenges-grid-container" />
              </div>

              <div>
                <div className="sidebar-panel">
                  <h3>🏆 Weekly Dispatch Leaderboard</h3>
                  <div className="leaderboard-list" id="weekly-leaderboard-list" />
                </div>
                <div className="sidebar-panel">
                  <h3>🎖️ Completed Achievements</h3>
                  <div className="badges-showcase" id="weekly-badges-grid" />
                </div>
                <div className="sidebar-panel" id="recent-activity-panel" style={{ display: 'none' }}>
                  <h3>🕒 Recent Practice Log</h3>
                  <div className="activity-list" id="recent-activity-list" style={{ display: 'flex', flexDirection: 'column', gap: 10 }} />
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard view */}
          <div id="view-leaderboards" style={{ display: 'none' }}>
            <div className="sidebar-panel" style={{ marginBottom: 30 }}>
              <h3>📈 Your Dispatch Skill Heatmap</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                Real-time parameters extracted from your voice calls. Aim to level up your scores across negotiation, composure, and dispatcher accuracy.
              </p>
              <div className="heatmap-grid" id="analytics-heatmap-container" />
            </div>
            <div className="sidebar-panel">
              <h3>🏆 Global Rankings (Top 10 Dispatchers)</h3>
              <div className="leaderboard-list" id="global-rankings-board-full" style={{ gap: 15 }} />
            </div>
          </div>

        </div>

        {/* Standard practice call */}
        <div id="standard-practice-wrapper" style={{ display: 'none' }}>
          <div dangerouslySetInnerHTML={{ __html: practiceCallHTML }} />
        </div>

      </div>

      {/* Scripts — loaded after DOM is interactive */}
      <Script src="/js/script.js" strategy="afterInteractive" />
      <Script src="/js/challenges.js" strategy="afterInteractive" />
    </>
  )
}
