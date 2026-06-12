'use client'
import Script from 'next/script'
import { Home } from 'lucide-react'

const bodyHTML = `
<!-- ═══════════════ ACADEMY GLOBAL WRAPPER ═══════════════ -->
    <div class="academy-wrapper">

        <div class="mobile-header" style="display: none;">
            <div class="hamburger" onclick="document.querySelector('.academy-nav').classList.toggle('open')">☰</div>
            <div class="logo">B2B Academy</div>
        </div>

        <!-- Navigation Header & Gamified HUD -->
        <nav class="academy-nav">
            <div class="hamburger" onclick="document.querySelector('.academy-nav').classList.toggle('open')" style="align-self: flex-end; display: none; font-size: 24px; margin-bottom: 20px;">✖</div>

            <div class="academy-tabs">
                <button class="academy-tab-btn active" data-view="dashboard">🌐 Academy Hub</button>
                <button class="academy-tab-btn" data-view="dat-simulator">🚛 DAT Simulator</button>
                <button class="academy-tab-btn" data-view="leaderboard">🏆 Rankings &amp; Stats</button>
                <button class="academy-tab-btn" data-view="admin-portal">🏢 Admin Portal</button>
            </div>

            <div class="academy-hud">
                <div class="hud-item streak" id="hud-streak-val">🔥 0 Days</div>
                <div class="hud-item xp" id="hud-xp-val">0 XP</div>
                <button class="hud-item" onclick="logoutSimulator()" style="background: transparent; color: #ef4444; border: 1px solid #ef4444; cursor: pointer;">🚪 Logout</button>
            </div>
        </nav>

        <!-- ═══════════════ TABS CONTENT ═══════════════ -->
        <div id="challenges-academy-hub">

            <!-- TAB 1: ACADEMY CHALLENGES HUB -->
            <div id="view-dashboard" style="display: block;">
                <!-- Glowing Daily Challenge Banner -->
                <div class="daily-challenge-banner">
                    <div class="daily-content">
                        <h2 style="color: #ffffff; font-weight: 900; text-shadow: 0px 1px 2px rgba(0,0,0,0.1);">
                            <span class="daily-tag">Daily Challenge</span>
                            <span>Negotiate $3,200 Reefer Load Under High Pressure</span>
                        </h2>
                        <p style="color: #222; font-weight: 500; font-size: 1.05rem;">Salinas produce market is boiling.
                            Manny from Salinas Hub has a load of continuous temp -2°F berries to Philly. Challenge your
                            rate negotiation skills, handle his strict requirements, and claim double points today!</p>
                    </div>
                    <div style="display: flex; gap: 10px; flex-direction: column; align-items: flex-end;">
                        <button class="btn-primary-debrief" onclick="openBriefingModal('ch_find_load')"
                            style="box-shadow: 0 4px 20px rgba(168, 85, 247, 0.45); background: linear-gradient(135deg, var(--neon-purple), var(--neon-indigo)); padding: 12px 24px;">
                            Accept Challenge ⚡
                        </button>
                        <button class="btn-primary-debrief" onclick="generateNewDailyChallenge()"
                            style="background: rgba(168, 85, 247, 0.1); color: #1e1b4b; padding: 8px 16px; border-radius: 8px; font-size: 0.85rem; box-shadow: none; border: 1px solid rgba(168, 85, 247, 0.3);">
                            Regenerate 🔄
                        </button>
                    </div>
                </div>

                <div class="dashboard-grid">
                    <!-- Challenges Directory -->
                    <div>
                        <div class="section-header">
                            <h3>Dispatcher Practice Directory</h3>
                            <div class="category-filters">
                                <button class="filter-chip active" onclick="filterCategory('ALL', this)">ALL
                                    SCENARIOS</button>
                                <button class="filter-chip" onclick="filterCategory('BROKER NEGOTIATION', this)">BROKER
                                    NEGOTIATION</button>
                                <button class="filter-chip" onclick="filterCategory('DRIVER MANAGEMENT', this)">DRIVER
                                    MANAGEMENT</button>
                                <button class="filter-chip" onclick="filterCategory('CRISIS MANAGEMENT', this)">CRISIS
                                    MANAGEMENT</button>
                                <button class="filter-chip" onclick="filterCategory('CUSTOMER SUPPORT', this)">CUSTOMER
                                    SUPPORT</button>
                            </div>
                        </div>

                        <div class="challenges-grid" id="challenges-grid-container">
                            <!-- Injected dynamically by challenges.js -->
                        </div>
                    </div>

                    <!-- Sidebar Panels -->
                    <div>
                        <!-- Streaks / Leaderboards -->
                        <div class="sidebar-panel">
                            <h3>🏆 Weekly Dispatch Leaderboard</h3>
                            <div class="leaderboard-list" id="weekly-leaderboard-list">
                                <!-- Loaded from API -->
                            </div>
                        </div>

                        <!-- Achievements Badges Grid -->
                        <div class="sidebar-panel">
                            <h3>🎖️ Completed Achievements</h3>
                            <div class="badges-showcase" id="weekly-badges-grid">
                                <!-- Loaded dynamically -->
                            </div>
                        </div>

                        <!-- Recent Activity Log -->
                        <div class="sidebar-panel" id="recent-activity-panel" style="display: none;">
                            <h3>🕒 Recent Practice Log</h3>
                            <div class="activity-list" id="recent-activity-list" style="display: flex; flex-direction: column; gap: 10px;">
                                <!-- Loaded dynamically -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- TAB 2: RANKINGS & SKILL ANALYTICS VIEW -->
            <div id="view-leaderboards" style="display: none;">
                <div class="sidebar-panel" style="margin-bottom: 30px;">
                    <h3>📈 Your Dispatch Skill Heatmap</h3>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px;">
                        Real-time parameters extracted from your voice calls. Aim to level up your scores across
                        negotiation, composure, and dispatcher accuracy.
                    </p>
                    <div class="heatmap-grid" id="analytics-heatmap-container">
                        <!-- Loaded dynamically -->
                    </div>
                </div>

                <div class="sidebar-panel">
                    <h3>🏆 Global Rankings (Top 10 Dispatchers)</h3>
                    <div class="leaderboard-list" id="global-rankings-board-full" style="gap: 15px;">
                        <!-- Leverages standard leaderboard functions -->
                    </div>
                </div>
            </div>

        </div> <!-- End challenges-academy-hub -->

        <!-- ═══════════════ TAB 3: STANDALONE PRACTICE CALL VIEW (Original layout) ═══════════════ -->
        <div id="standard-practice-wrapper" style="display: none;">
            <div class="container"
                style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; padding: 10px;">

                <div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; margin-bottom: 20px;">
                    💡 <strong>Practice Mode:</strong> Direct freeform interactive phone simulator. Connect call to
                    practice general dispatcher communications.
                </div>

                <!-- Simulated Smartphone Active Call Screen -->
                <div class="smartphone-frame" id="ai-avatar-wrapper">
                    <div class="smartphone-screen">
                        <!-- Simulated Notch & Header Status Bar -->
                        <div class="phone-header">
                            <div class="phone-notch"></div>
                            <div class="phone-bar">
                                <span class="phone-time">9:41</span>
                                <div
                                    style="display: flex; gap: 4px; font-weight: 700; color: var(--success); font-size: 0.65rem; letter-spacing: 0.05em; align-items: center;">
                                    <span class="status-dot"></span> B2B LIVE
                                </div>
                                <div class="phone-icons" style="display: flex; gap: 6px; align-items: center;">
                                    <span>📶</span>
                                    <span>🔋</span>
                                    <button id="voice-settings-toggle" type="button" style="background: none; border: none; color: rgba(255, 255, 255, 0.75); cursor: pointer; padding: 2px 0 0 4px; display: flex; align-items: center; justify-content: center; outline: none;" title="Voice Settings">
                                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                            <circle cx="12" cy="12" r="3"></circle>
                                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Call Screen Body -->
                        <div class="phone-call-body">
                            <div class="caller-avatar-circle">
                                <!-- High-fidelity Logistics Broker Vector SVG -->
                                <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"
                                    style="display: block;">
                                    <defs>
                                        <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stop-color="#4f46e5" />
                                            <stop offset="100%" stop-color="#312e81" />
                                        </linearGradient>
                                    </defs>
                                    <circle cx="50" cy="50" r="48" fill="url(#avatarGrad)" />
                                    <!-- Body/Suit -->
                                    <path d="M15 90 C 20 65, 80 65, 85 90 Z" fill="#1e293b" />
                                    <path d="M35 70 L50 82 L65 70 Z" fill="#ffffff" />
                                    <path d="M48 70 L52 70 L50 82 Z" fill="#4f46e5" />
                                    <path d="M35 70 L50 82 L50 90 L15 90 C 20 65, 35 68, 35 70 Z" fill="#0f172a" />
                                    <path d="M65 70 L50 82 L50 90 L85 90 C 80 65, 65 68, 65 70 Z" fill="#0f172a" />
                                    <!-- Head -->
                                    <circle cx="50" cy="45" r="18" fill="#ffedd5" />
                                    <path d="M44 50 Q 50 53, 56 50" stroke="#c2410c" stroke-width="1.5" fill="none"
                                        stroke-linecap="round" />
                                    <!-- Hair -->
                                    <path d="M32 42 Q 50 25, 68 42 Q 50 35, 32 42" fill="#1e1b4b" />
                                    <!-- Eyes -->
                                    <circle cx="43" cy="41" r="2" fill="#1e1b4b" />
                                    <circle cx="57" cy="41" r="2" fill="#1e1b4b" />
                                    <!-- Headset -->
                                    <path d="M30 45 A 20 20 0 0 1 70 45" stroke="#64748b" stroke-width="3" fill="none"
                                        stroke-linecap="round" />
                                    <rect x="29" y="42" width="4" height="10" rx="2" fill="#1e293b" />
                                    <rect x="67" y="42" width="4" height="10" rx="2" fill="#1e293b" />
                                    <path d="M31 48 L44 54" stroke="#64748b" stroke-width="2" fill="none"
                                        stroke-linecap="round" />
                                    <circle cx="44" cy="54" r="2" fill="#ef4444" />
                                </svg>
                            </div>

                            <h1 class="caller-name">B2B Broker</h1>
                            <div class="caller-status">Active Call</div>
                            <div class="call-timer-container">
                                <span id="timer">00:00</span>
                            </div>

                            <!-- Dynamic Wave Pulse when Broker Speaks -->
                            <div class="phone-wave-pulse">
                                <span></span><span></span><span></span><span></span><span></span>
                            </div>
                        </div>

                        <!-- Dial Action Controls Grid (iPhone Phone screen style) -->
                        <div class="phone-action-grid">
                            <!-- Mic Mute Toggle Button -->
                            <div class="action-item">
                                <button id="mic-toggle" class="phone-circle-btn muted-btn" type="button"
                                    title="Mute Microphone">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6"></path>
                                        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                                        <line x1="12" y1="19" x2="12" y2="22"></line>
                                    </svg>
                                </button>
                                <span class="action-label">mute</span>
                            </div>

                            <!-- Pulse Record/Speak Button -->
                            <div class="action-item">
                                <button id="record" class="phone-circle-btn record-btn" type="button"
                                    title="Record Response">
                                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                                        <path d="M19 10v1a7 7 0 0 1-14 0v-1"></path>
                                        <line x1="12" x2="12" y1="19" y2="22"></line>
                                    </svg>
                                </button>
                                <span class="action-label" style="font-weight: 700; color: white;">speak</span>
                            </div>

                            <!-- Stop/Submit Button -->
                            <div class="action-item">
                                <button id="stop" class="phone-circle-btn"
                                    style="background: rgba(255, 255, 255, 0.1); color: white; border-color: rgba(255, 255, 255, 0.2);"
                                    type="button" title="Submit Response">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </button>
                                <span class="action-label">submit</span>
                            </div>
                        </div>

                        <!-- Large Red End Call Button -->
                        <div class="phone-end-call-area">
                            <button id="end-call-btn" class="phone-decline-btn" type="button"
                                title="End Call & Wrap Up">
                                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor"
                                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <path
                                        d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91">
                                    </path>
                                    <line x1="23" y1="1" x2="1" y2="23"></line>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Simulated Smartphone Voice Settings Overlay -->
                    <div id="voice-settings-overlay" class="modal-overlay" style="display: none;">
                        <div class="modal-content" style="background: rgba(17, 24, 39, 0.98); border: 1px solid var(--border-glow); box-shadow: var(--shadow-glow); padding: 16px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
                                <h3 style="color: #ffffff; margin: 0; font-size: 1rem;">🔊 Voice & Speech Settings</h3>
                                <button id="close-voice-settings" type="button" style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1.2rem; outline: none; line-height: 1;">&times;</button>
                            </div>
                            
                            <div class="voice-settings-panel" style="background: transparent; border: none; padding: 0;">
                                <div class="voice-setting-row" style="margin-bottom: 15px;">
                                    <label class="voice-setting-label" style="font-size: 0.85rem; color: #cbd5e1; display: block; margin-bottom: 5px;">Accent & Voice</label>
                                    <select id="voice-accent-selector" class="voice-accent-select" style="display: block !important;"></select>
                                </div>
                                
                                <div class="voice-setting-row" style="margin-bottom: 15px;">
                                    <label class="voice-setting-label" style="font-size: 0.85rem; color: #cbd5e1; display: block; margin-bottom: 5px;">Speech Rate</label>
                                    <div class="voice-slider-container">
                                        <input type="range" id="voice-speed-slider" class="voice-slider" min="0.8" max="1.5" step="0.1" value="1.0" style="display: block !important;">
                                        <span id="voice-speed-value" class="voice-slider-value">1.0x</span>
                                    </div>
                                </div>

                                <button id="test-voice-btn" type="button" class="primary-btn" style="width: 100%; font-size: 0.85rem; padding: 8px 12px; margin-top: 10px; background: rgba(79, 70, 229, 0.25); border: 1px solid rgba(79, 70, 229, 0.45); color: #fff; cursor: pointer;">
                                    Test Selected Voice 🗣️
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Hidden but present setup values to prevent any script.js breaks -->
                    <button id="start" type="button" style="display:none;"></button>
                    <audio id="botVoice" playsinline></audio>
                </div>

                <div id="chat" class="chat" style="display: none !important;"></div>

                <!-- Technology Selection Modal (Inside Practice Frame) -->
                <div id="tech-modal" class="modal-overlay" style="display: none;">
                    <div class="modal-content"
                        style="background: rgba(17, 24, 39, 0.95); border: 1px solid var(--border-glow); box-shadow: var(--shadow-glow);">
                        <div class="modal-header" style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                            <h3 style="color: #ffffff;">Start Your Practice Call</h3>
                            <!-- Hidden scenario selection, forced to Dispatcher -->
                            <input type="hidden" id="selected-tech" value="Dispatcher">

                            <!-- User Info Section -->
                            <div class="user-info-section" style="margin-top: 15px;">
                                <div>
                                    <label for="student-name"
                                        style="font-size: 0.95rem; font-weight: 700; color: #fff;">Full Name</label>
                                    <input type="text" id="student-name"
                                        placeholder="Enter your full name to connect call" required
                                        style="margin-top: 8px; background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px; border-radius: 6px;">
                                </div>

                                <!-- Pre-filled and hidden fields to keep script.js functional and simple -->
                                <div style="display: none;">
                                    <label for="student-session">Practice Session</label>
                                    <select id="student-session" required>
                                        <option value="">Loading sessions...</option>
                                    </select>
                                </div>
                                <div style="display: none;">
                                    <label for="student-email">Email Address</label>
                                    <input type="email" id="student-email" value="practice@b2bpractice.com" required>
                                </div>
                                <div style="display: none;">
                                    <label for="student-mobile">Mobile Number</label>
                                    <input type="tel" id="student-mobile" value="9999999999" required>
                                </div>

                                <!-- Pool Campus Fields -->
                                <div id="pool-campus-extras" style="display: none;">
                                    <input type="text" id="student-college" value="">
                                    <input type="text" id="student-course" value="">
                                    <input type="text" id="student-semester" value="">
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer" style="padding-top: 8px;">
                            <button id="start-session-btn" class="primary-btn"
                                style="width: 100%; border-radius: var(--radius-md); font-size: 1rem; padding: 14px; background: linear-gradient(135deg, var(--neon-indigo), #4f46e5); color: #fff; border: none; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);">Connect
                                Call 📞</button>
                        </div>
                    </div>
                </div>

                <!-- Global Loader Overlay -->
                <div id="global-loader" class="loader-overlay">
                    <div class="spinner"></div>
                    <div class="loader-text" id="loader-message">Processing...</div>
                </div>
            </div>
        </div> <!-- End standard-practice-wrapper -->

        <!-- ═══════════════ TAB 4: DAT SIMULATOR WORKSPACE ═══════════════ -->
        <div id="view-dat-simulator" style="display: none;" class="sim-workspace">
            <button id="sim-mobile-hamburger" class="sim-mobile-hamburger" onclick="window.toggleSimSidebar()">☰</button>
            <div id="sim-sidebar-overlay" class="sim-sidebar-overlay" onclick="window.toggleSimSidebar()"></div>
            <!-- Sidebar Navigation -->
            <div class="sim-sidebar">
                <div class="sim-sidebar-title">Dispatcher Simulator</div>
                <button class="sim-nav-item active" data-view="dashboard">📊 Dashboard</button>
                <button class="sim-nav-item" data-view="loadboard">🚛 Load Board</button>
                <button class="sim-nav-item" data-view="broker-calls">📞 AI Broker Calls</button>
                <button class="sim-nav-item" data-view="emails">📧 AI Email Negotiation</button>
                <button class="sim-nav-item" data-view="carriers">🚛 AI Carrier Management</button>
                <button class="sim-nav-item" data-view="scenarios">⚡ Training Scenarios</button>
                <button class="sim-nav-item" data-view="analytics">📈 Performance Analytics</button>
                <button class="sim-nav-item" data-view="exam">🎓 Certification Exam</button>
                <button class="sim-nav-item" data-view="assistant">🤖 Dispatcher Assistant</button>
            </div>

            <!-- Viewport displaying inner sub-dashboards -->
            <div class="sim-viewport">
                
                <!-- SUB-VIEW 1: DASHBOARD -->
                <div id="sim-view-dashboard" style="display: block;">
                    <div class="sim-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h1>Logistics Command Dashboard</h1>
                            <p>Manage active owner-operator carriers, accept training scenarios, and review terminal cash flows.</p>
                        </div>
                        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; border: 1px solid var(--sim-border); width: 300px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="color: #00b4d8; font-weight: bold; font-size: 0.9rem;">Level: <span id="sim-hud-level-title" style="color: white;">Rookie Dispatcher</span></span>
                                <span style="color: #94a3b8; font-size: 0.8rem;" id="sim-hud-level-loads">0 / 3 Loads</span>
                            </div>
                            <div style="width: 100%; height: 8px; background: rgba(0,0,0,0.5); border-radius: 4px; overflow: hidden;">
                                <div id="sim-hud-level-bar" style="height: 100%; width: 0%; background: var(--sim-glowing-green); box-shadow: 0 0 8px var(--sim-glowing-green); transition: width 0.5s ease;"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- HUD grid -->
                    <div class="sim-hud-grid" style="margin-top: 20px;">
                        <div class="sim-hud-card">
                            <span class="sim-hud-label">SaaS Balance</span>
                            <span class="sim-hud-value" id="sim-hud-bal">$10,000.00</span>
                        </div>
                        <div class="sim-hud-card revenue">
                            <span class="sim-hud-label">Outbound Revenue</span>
                            <span class="sim-hud-value" id="sim-hud-rev">$0</span>
                        </div>
                        <div class="sim-hud-card success">
                            <span class="sim-hud-label">Booked Loads</span>
                            <span class="sim-hud-value" id="sim-hud-booked">0</span>
                        </div>
                        <div class="sim-hud-card">
                            <span class="sim-hud-label">AI voice Calls</span>
                            <span class="sim-hud-value" id="sim-hud-calls">0</span>
                        </div>
                    </div>

                    <!-- Carrier roster and training guidelines -->
                    <div style="margin-top: 30px; display: grid; grid-template-columns: 1fr; gap: 20px;">
                        <div>
                            <h3 style="color:#00b4d8; font-weight:800; margin-bottom:15px;">🚛 Managed Fleet Roster</h3>
                            <div id="sim-carriers-container" class="sim-hud-grid">
                                <!-- Loaded dynamically via simulator.js -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SUB-VIEW 2: LOAD BOARD -->
                <div id="sim-view-loadboard" style="display: none;" class="dat-dashboard-theme">
                    <div class="sim-header" style="border-bottom: 1px solid rgba(0,0,0,0.06);">
                        <div>
                            <h1 style="background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;">DAT-Style Load Board Simulator</h1>
                            <p style="color: #64748b;">Real-time US freight lanes empty matching command desk. inspired by professional DAT Load Board workflow.</p>
                        </div>
                    </div>

                    <!-- High Fidelity DAT Search Filters Bar -->
                    <div class="dat-search-container" style="margin-top: 20px;">
                        <div class="dat-search-row">
                            <!-- Origin -->
                            <div class="dat-input-group dat-width-lg">
                                <label class="dat-label">Origin</label>
                                <input type="text" id="sim-filter-origin" value="Burlington Cty, NJ" placeholder="Burlington Cty, NJ">
                            </div>
                            <!-- DH-O -->
                            <div class="dat-input-group dat-width-xs" style="margin-left: 5px;">
                                <label class="dat-label">DH-O</label>
                                <input type="number" id="sim-filter-dho" value="70" placeholder="70" style="text-align: center;">
                            </div>
                            <!-- Swap -->
                            <div class="dat-swap-btn" onclick="swapSearchCities()" style="margin: 0 10px; font-size: 1.25rem; color: #1e40af; cursor: pointer; transition: all 0.2s;" title="Swap Cities">
                                ⇄
                            </div>
                            <!-- Destination -->
                            <div class="dat-input-group dat-width-lg">
                                <label class="dat-label">Destination</label>
                                <input type="text" id="sim-filter-destination" value="Dallas, TX" placeholder="Dallas, TX">
                            </div>
                            <!-- DH-D -->
                            <div class="dat-input-group dat-width-xs" style="margin-left: 5px;">
                                <label class="dat-label">DH-D</label>
                                <input type="number" id="sim-filter-dhd" value="50" placeholder="50" style="text-align: center;">
                            </div>
                        </div>

                        <div class="dat-search-row" style="margin-top: 15px;">
                            <!-- Equipment Type -->
                            <div class="dat-input-group dat-width-md">
                                <label class="dat-label">Equipment Type*</label>
                                <select id="sim-filter-equipment">
                                    <option value="ALL">All Equipment</option>
                                    <option value="Dry Van" selected>Vans (Standard)</option>
                                    <option value="Reefer">Reefer</option>
                                    <option value="Flatbed">Flatbed</option>
                                    <option value="Power Only">Power Only</option>
                                    <option value="Hotshot">Hotshot</option>
                                    <option value="Box Truck">Box Truck</option>
                                </select>
                            </div>
                            <!-- Load Type -->
                            <div class="dat-input-group dat-width-sm" style="margin-left: 8px;">
                                <label class="dat-label">Load Type</label>
                                <select id="sim-filter-loadtype">
                                    <option value="Full" selected>Full</option>
                                    <option value="Partial">Partial</option>
                                    <option value="Both">Both</option>
                                </select>
                            </div>
                            <!-- Length -->
                            <div class="dat-input-group dat-width-xs" style="margin-left: 8px;">
                                <label class="dat-label">Length ft</label>
                                <input type="number" id="sim-filter-length" value="53" placeholder="53">
                            </div>
                            <!-- Weight -->
                            <div class="dat-input-group dat-width-sm" style="margin-left: 8px;">
                                <label class="dat-label">Weight lbs</label>
                                <input type="number" id="sim-filter-weight" value="42000" placeholder="42000">
                            </div>
                            <!-- Date Range -->
                            <div class="dat-input-group dat-width-md" style="margin-left: 8px;">
                                <label class="dat-label">Date Range*</label>
                                <input type="text" id="sim-filter-daterange" value="6/1/2026 - 6/1/2026" placeholder="Date range">
                            </div>
                            <!-- Search Button -->
                            <button class="dat-search-btn" id="sim-load-search-btn" style="margin-left: 15px; padding: 12px 30px; border-radius: 20px; font-weight: 800; font-size: 0.9rem; letter-spacing: 0.05em; background: #1d4ed8; color: white; border: none; cursor: pointer; transition: all 0.2s;">🔍 SEARCH</button>
                        </div>

                        <!-- Secondary sub-filters row -->
                        <div class="dat-subfilters-row" style="margin-top: 15px; display: flex; gap: 15px; font-size: 0.75rem; color: #475569; font-weight: 700; border-top: 1px solid rgba(0,0,0,0.06); padding-top: 12px;">
                            <span class="dat-subfilter-tag" style="cursor:pointer; padding: 4px 8px; border-radius: 4px; background:#f1f5f9;">LOAD REQUIREMENTS ▾</span>
                            <span class="dat-subfilter-tag" style="cursor:pointer; padding: 4px 8px; border-radius: 4px; background:#f1f5f9;">SEARCH BACK - 24 HRS ▾</span>
                            <span class="dat-subfilter-tag" style="cursor:pointer; padding: 4px 8px; border-radius: 4px; background:#f1f5f9;">COMPANY ▾</span>
                            <span class="dat-subfilter-tag" style="cursor:pointer; padding: 4px 8px; border-radius: 4px; background:#f1f5f9;">PRIVATE LOADS ▾</span>
                            <span class="dat-subfilter-tag" style="cursor:pointer; padding: 4px 8px; border-radius: 4px; background:#f1f5f9;">BOOK/BID ▾</span>
                        </div>
                    </div>

                    <!-- DAT Results Stats Row -->
                    <div class="dat-stats-row" style="margin-top: 25px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                        <div class="dat-results-count">
                            <span id="dat-results-num" style="font-weight: 900; font-size: 1.2rem; color: #0f172a;">13 Results</span>
                            <span style="font-size: 0.8rem; color: #64748b; margin-left: 8px; font-weight: 600;">+41 Similar Results</span>
                        </div>
                        <div style="display: flex; gap: 15px; align-items: center;">
                            <span style="font-size: 0.8rem; color: #475569; font-weight: 700;">Sort by</span>
                            <select id="sim-sort-select" style="padding: 4px 10px; border: 1.5px solid #cbd5e1; border-radius: 6px; font-size: 0.8rem; outline: none; background: white; color: #0f172a; font-weight: 700; cursor: pointer;">
                                <option value="dho-shortest" selected>Deadhead-O - Shortest</option>
                                <option value="rate-highest">Rate - Highest</option>
                                <option value="trip-longest">Trip - Longest</option>
                            </select>
                            <span style="font-weight: 900; color: #1d4ed8; cursor: pointer; font-size: 1rem; padding: 4px 8px; background: #eff6ff; border-radius: 4px;">$</span>
                        </div>
                    </div>

                    <!-- High Fidelity DAT Load Results Grid Table -->
                    <div class="dat-table-container" style="margin-top: 15px; background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                        <div class="dat-table-header" style="display: grid; grid-template-columns: 45px 65px 120px 85px 100px 75px 85px 230px 100px 75px; background: #f8fafc; padding: 12px 20px; border-bottom: 2px solid #e2e8f0; font-size: 0.75rem; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; align-items: center;">
                            <div><input type="checkbox" style="transform: scale(1.15); cursor: pointer;"></div>
                            <div>Age</div>
                            <div>Rate ▾</div>
                            <div>Trip ▾</div>
                            <div style="color: #1d4ed8; font-weight: 900;">DH-O ▴</div>
                            <div>Pick Up</div>
                            <div>Equipment ▾</div>
                            <div>Company ▾</div>
                            <div>CS / DTP</div>
                            <div>Action</div>
                        </div>
                        <div id="sim-loads-container" class="dat-rows-wrapper" style="max-height: 600px; overflow-y: auto;">
                            <!-- Injected dynamically via renderLoadsGrid() -->
                        </div>
                    </div>
                </div>

                <!-- SUB-VIEW 3: AI BROKER VOICE CALLS -->
                <div id="sim-view-broker-calls" style="display: none;">
                    <div class="sim-header">
                        <div>
                            <h1>AI Broker voice Call simulator</h1>
                            <p>Real-time audio negotiation workspace. Communicate rate bids and handle compliance checks.</p>
                        </div>
                    </div>

                    <div class="sim-call-workspace" style="margin-top: 20px;">
                        <div class="sim-phone-screen">
                            <div class="sim-avatar-pulse" id="sim-call-avatar">📞</div>
                            <h2 style="color:#fff;" id="sim-call-name">Broker Desk</h2>
                            <div style="font-size:0.9rem; color:var(--sim-glowing-green);" id="sim-call-status">Dialing...</div>
                            
                            <div id="sim-call-transcript" style="background:rgba(0,0,0,0.3); border:1px solid var(--sim-border); border-radius:12px; padding:20px; width:100%; max-width:480px; min-height:100px; max-height:200px; overflow-y:auto; font-size:0.9rem; line-height:1.5; color:var(--sim-text-main);">
                                Select a load from the Load Board and click "Call Broker" to dial a broker.
                            </div>

                            <div style="display:flex; gap:10px; width:100%; max-width:480px;">
                                <input type="number" id="sim-call-offer-input" placeholder="Enter counter offer ($)" style="flex:1; background:#0f172a; border:1px solid var(--sim-border); color:#fff; border-radius:6px; padding:12px; outline:none;">
                                <button onclick="submitNegotiateTurn()" id="sim-call-submit-btn" style="background:var(--sim-accent-blue); border:none; color:#fff; font-weight:700; border-radius:6px; padding:12px 24px; cursor:pointer;">Counter Rate 💵</button>
                            </div>

                            <div class="sim-call-controls">
                                <button class="sim-call-btn decline" onclick="terminateActiveCall()" id="sim-call-decline-btn">Decline / Hang Up 📞</button>
                                <button class="sim-call-btn mute" id="sim-call-voice-btn" onclick="toggleCallVoiceRecording()">🎙️ Speak Offer</button>
                            </div>
                        </div>

                        <!-- Panel tips -->
                        <div class="sim-hud-card" style="padding: 20px; height: fit-content; gap: 15px;">
                            <h4 style="color:var(--sim-accent-blue); font-weight:800; margin:0;">💡 Negotiation Directives</h4>
                            <ul style="font-size:0.8rem; color:var(--sim-text-muted); padding-left:15px; margin:0; line-height:1.6;">
                                <li>Always provide your Motor Carrier (MC) authority number if asked.</li>
                                <li>If a broker gives a counter-offer, check if it satisfies your driver's target profit margin.</li>
                                <li>Rude or cheap brokers will try to rush or lowball you. Keep a professional tone.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- SUB-VIEW 4: AI EMAIL NEGOTIATION -->
                <div id="sim-view-emails" style="display: none;">
                    <div class="sim-header">
                        <div>
                            <h1>AI Email Negotiation Desk</h1>
                            <p>Gmail-like portal. Exchange contract setups, verify insurance COIs, and score logistics grammar.</p>
                        </div>
                    </div>

                    <div class="sim-email-workspace" style="margin-top: 25px;">
                        <div class="sim-email-sidebar">
                            <div class="sim-email-nav active">📥 Inbox</div>
                            <div class="sim-email-nav" onclick="querySimEmails()">🔄 Refresh Sync</div>
                        </div>
                        <div class="sim-email-feed" id="sim-emails-list">
                            <!-- Injected dynamically -->
                        </div>
                    </div>
                </div>

                <!-- SUB-VIEW 5: CARRIERS -->
                <div id="sim-view-carriers" style="display: none;">
                    <div class="sim-header">
                        <div>
                            <h1>AI Carrier Fleet Management</h1>
                            <p>Track owner-operator drivers. Monitor empty coordinates, equipment schedules, and active assignments.</p>
                        </div>
                    </div>
                    <div id="sim-view-fleet-roster" style="margin-top: 20px;">
                        <!-- Leverages dashboard carrier cards -->
                    </div>
                </div>

                <!-- SUB-VIEW 6: TRAINING SCENARIOS -->
                <div id="sim-view-scenarios" style="display: none;">
                    <div class="sim-header">
                        <div>
                            <h1>Scenario Training Missions</h1>
                            <p>Select specialized logistics case studies designed by logistics experts to test specific dispatcher skills.</p>
                        </div>
                    </div>
                    <div id="sim-scenarios-grid" class="sim-hud-grid" style="margin-top:25px;">
                        <!-- Injected dynamically -->
                    </div>
                </div>

                <!-- SUB-VIEW 7: PERFORMANCE ANALYTICS -->
                <div id="sim-view-analytics" style="display: none;">
                    <div class="sim-header">
                        <div>
                            <h1>Dispatcher Performance Analytics</h1>
                            <p>Review outbound volumes, commission revenues, quick pay percentages, and live telemetry graphs.</p>
                        </div>
                    </div>
                    
                    <div class="sim-hud-grid" style="margin-top:25px; grid-template-columns: 1fr 340px;">
                        <div class="sim-hud-card" style="padding:30px; display:flex; align-items:center; justify-content:center;">
                            <div style="width:200px; height:200px;" id="sim-analytics-gauge"></div>
                        </div>
                        <div class="sim-hud-card" style="padding:20px; gap:12px;">
                            <h3 style="color:var(--sim-accent-blue); font-weight:800; margin:0 0 10px 0;">KPI Indicators</h3>
                            <div style="font-size:0.85rem; display:flex; justify-content:space-between; border-bottom:1px solid var(--sim-border); padding-bottom:8px;">
                                <span>Negotiation Success Rate</span>
                                <span style="font-weight:800; color:var(--sim-glowing-green);">94%</span>
                            </div>
                            <div style="font-size:0.85rem; display:flex; justify-content:space-between; border-bottom:1px solid var(--sim-border); padding-bottom:8px;">
                                <span>Average Revenue Per Mile (RPM)</span>
                                <span style="font-weight:800; color:#fbbf24;">$2.45</span>
                            </div>
                            <div style="font-size:0.85rem; display:flex; justify-content:space-between; border-bottom:1px solid var(--sim-border); padding-bottom:8px;">
                                <span>Billing QuickPay Invoices</span>
                                <span style="font-weight:800; color:var(--sim-accent-blue);">86%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SUB-VIEW 8: CERTIFICATION EXAM -->
                <div id="sim-view-exam" style="display: none;">
                    <div class="sim-header">
                        <div>
                            <h1>Verifiable Dispatcher Certification Exam</h1>
                            <p>Demonstrate mastery of operating deadheads, detention boundaries, W9s, factoring, and MC safety rules.</p>
                        </div>
                    </div>

                    <div class="sim-hud-card" style="margin-top:25px; padding:30px; gap:20px; max-width:640px;">
                        <h3 style="margin:0; font-weight:800;">Dispatcher Competency Questionnaire</h3>
                        
                        <div style="display:flex; flex-direction:column; gap:10px;">
                            <label style="font-size:0.85rem; font-weight:700; color:var(--sim-accent-blue);">Q1. What is 'Deadhead' in trucking?</label>
                            <input type="text" id="sim-exam-q1" placeholder="Type answer here..." style="background:#0f172a; border:1px solid var(--sim-border); color:#fff; border-radius:6px; padding:12px; outline:none;">
                        </div>

                        <div style="display:flex; flex-direction:column; gap:10px;">
                            <label style="font-size:0.85rem; font-weight:700; color:var(--sim-accent-blue);">Q2. What does 'TONU' stand for, and when is it billed?</label>
                            <input type="text" id="sim-exam-q2" placeholder="Type answer here..." style="background:#0f172a; border:1px solid var(--sim-border); color:#fff; border-radius:6px; padding:12px; outline:none;">
                        </div>

                        <div style="display:flex; flex-direction:column; gap:10px;">
                            <label style="font-size:0.85rem; font-weight:700; color:var(--sim-accent-blue);">Q3. After how many hours of loading dock waiting time does standard 'Detention' pay begin?</label>
                            <input type="text" id="sim-exam-q3" placeholder="Type answer here..." style="background:#0f172a; border:1px solid var(--sim-border); color:#fff; border-radius:6px; padding:12px; outline:none;">
                        </div>

                        <div style="display:flex; flex-direction:column; gap:10px;">
                            <label style="font-size:0.85rem; font-weight:700; color:var(--sim-accent-blue);">Q4. Why do carriers utilize 'Factoring Companies' on completed rate confirmations?</label>
                            <input type="text" id="sim-exam-q4" placeholder="Type answer here..." style="background:#0f172a; border:1px solid var(--sim-border); color:#fff; border-radius:6px; padding:12px; outline:none;">
                        </div>

                        <div style="display:flex; flex-direction:column; gap:10px;">
                            <label style="font-size:0.85rem; font-weight:700; color:var(--sim-accent-blue);">Q5. What represents a carrier's FMCSA interstate 'MC operating authority'?</label>
                            <input type="text" id="sim-exam-q5" placeholder="Type answer here..." style="background:#0f172a; border:1px solid var(--sim-border); color:#fff; border-radius:6px; padding:12px; outline:none;">
                        </div>

                        <button onclick="submitCadetExam()" style="background:var(--sim-glowing-green); border:none; color:#fff; padding:14px; border-radius:6px; font-weight:800; font-size:0.95rem; cursor:pointer; transition:var(--sim-transition); text-align:center;">Submit Examination 🎓</button>
                    </div>
                </div>

                <!-- SUB-VIEW 9: DISPATCHER TUTOR ASSISTANT -->
                <div id="sim-view-assistant" style="display: none;">
                    <div class="sim-header">
                        <div>
                            <h1>AI Dispatcher Command Tutor</h1>
                            <p>Ask our AI Director anything about factoring rates, Tonu clauses, or cold-temperature reefer schedules.</p>
                        </div>
                    </div>

                    <div class="sim-hud-card" style="margin-top:25px; padding:25px; height:500px; display:flex; flex-direction:column; gap:20px;">
                        <div id="sim-tutor-chat" style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:15px; background:rgba(0,0,0,0.2); border:1px solid var(--sim-border); border-radius:12px; padding:20px;">
                            <div style="align-self:flex-start; background:var(--sim-navy-card); border:1px solid var(--sim-border); padding:12px 16px; border-radius:12px 12px 12px 0; font-size:0.85rem; max-width:80%;">
                                <strong>Tutor Director:</strong> Welcome! I am your Logistics Tutor. Ask me any logistics term (like TONU, Layover, Factoring, or FCFS), and I'll explain how it is used on real dispatch desks!
                            </div>
                        </div>

                        <div style="display:flex; gap:10px;">
                            <input type="text" id="sim-tutor-query" placeholder="Ask about TONU, Factoring, Lumper fees..." style="flex:1; background:#0f172a; border:1px solid var(--sim-border); color:#fff; border-radius:6px; padding:12px; outline:none;" onkeydown="if(event.key==='Enter') askSimTutor()">
                            <button onclick="askSimTutor()" style="background:var(--sim-accent-blue); border:none; color:#fff; font-weight:700; border-radius:6px; padding:12px 24px; cursor:pointer;">Ask Tutor 🤖</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <!-- ═══════════════ SIMULATOR MODALS & DRAWER OVERLAYS ═══════════════ -->
        <!-- Load Detail Side Panel Drawer -->
        <div class="sim-drawer-overlay" id="sim-drawer-overlay" onclick="closeLoadDrawer()"></div>
        <div class="sim-drawer" id="sim-drawer">
            <div class="sim-drawer-header">
                <h2 style="margin:0;" id="sim-drawer-ref">LD-XXXXXX</h2>
                <button class="sim-drawer-close" onclick="closeLoadDrawer()">&times;</button>
            </div>
            
            <div class="sim-drawer-section">
                <span class="sim-hud-label">Route Information</span>
                <div style="font-weight:700;" id="sim-drawer-origin">Origin</div>
                <div style="font-weight:700;" id="sim-drawer-dest">Destination</div>
                <div style="font-size:0.8rem; color:var(--sim-text-muted);" id="sim-drawer-miles">Distance</div>
            </div>

            <div class="sim-drawer-section">
                <span class="sim-hud-label">Rate Telemetry</span>
                <div style="font-size:1.5rem; font-weight:800; color:var(--sim-glowing-green);" id="sim-drawer-rate">$0</div>
                <div style="font-size:0.85rem;" id="sim-drawer-rpm">$0/mi</div>
            </div>

            <div class="sim-drawer-section">
                <span class="sim-hud-label">Equipment Details</span>
                <div style="font-weight:700;" id="sim-drawer-equip">Type</div>
                <div style="font-size:0.85rem; color:var(--sim-text-muted);" id="sim-drawer-commodity">Commodity</div>
            </div>

            <div class="sim-drawer-section">
                <span class="sim-hud-label">Broker Profile</span>
                <div style="font-weight:700;" id="sim-drawer-broker">Broker</div>
            </div>

            <div class="sim-drawer-section">
                <span class="sim-hud-label">Operational Notes</span>
                <p style="font-size:0.8rem; color:var(--sim-text-muted); margin:0;" id="sim-drawer-notes">Notes</p>
            </div>

            <div class="sim-drawer-actions">
                <button style="background:var(--sim-accent-blue); color:#fff;" onclick="triggerBrokerCallFromDrawer()">Call Broker 📞</button>
                <button style="background:#475569; color:#fff;" onclick="triggerEmailFromDrawer()">Email Broker 📧</button>
                <button style="background:var(--sim-glowing-green); color:#fff;" onclick="triggerDirectBook()">Book Load 🚛</button>
            </div>
        </div>

        <!-- Simulator Login Gate Modal -->
        <div class="sim-modal-overlay" id="sim-login-modal" style="display:none; z-index: 10000; background: rgba(0,0,0,0.9);">
            <div class="sim-modal" style="max-width: 400px; text-align: center;">
                <h2 style="color: var(--sim-glowing-green); margin-bottom: 10px;">DAT Simulator Access</h2>
                <p style="font-size: 0.9rem; color: var(--sim-text-muted); margin-bottom: 20px;">Please enter your credentials to initiate your unique simulation environment.</p>
                
                <div style="display:flex; flex-direction:column; gap:15px; text-align: left;">
                    <div>
                        <label style="font-size:0.85rem; font-weight:700; color:var(--sim-accent-blue);">Full Name</label>
                        <input type="text" id="sim-login-name" placeholder="E.g., John Doe" style="width: 100%; box-sizing: border-box; background:#0f172a; border:1px solid var(--sim-border); color:#fff; border-radius:6px; padding:12px; margin-top: 5px; outline:none;">
                    </div>
                    <div>
                        <label style="font-size:0.85rem; font-weight:700; color:var(--sim-accent-blue);">Email Address</label>
                        <input type="email" id="sim-login-email" placeholder="E.g., john@dispatcher.com" style="width: 100%; box-sizing: border-box; background:#0f172a; border:1px solid var(--sim-border); color:#fff; border-radius:6px; padding:12px; margin-top: 5px; outline:none;">
                    </div>
                </div>

                <button onclick="submitSimLogin()" style="width: 100%; background:var(--sim-glowing-green); color:#000; border:none; padding:12px; border-radius:6px; cursor:pointer; font-weight:bold; font-size: 1rem; margin-top: 25px; transition: transform 0.2s;">
                    Initialize Session 🚀
                </button>
            </div>
        </div>

        <!-- Compose Email Modal -->
        <div class="sim-modal-overlay" id="sim-compose-modal">
            <div class="sim-modal">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h2>Compose Booking Inquiry</h2>
                    <button class="sim-drawer-close" onclick="closeComposeEmailModal()">&times;</button>
                </div>
                
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <label style="font-size:0.85rem; font-weight:700; color:var(--sim-accent-blue);">To Broker</label>
                    <input type="text" id="sim-compose-broker" readonly style="background:#0f172a; border:1px solid var(--sim-border); color:#fff; border-radius:6px; padding:10px;">
                </div>

                <div style="display:flex; flex-direction:column; gap:8px;">
                    <label style="font-size:0.85rem; font-weight:700; color:var(--sim-accent-blue);">Subject</label>
                    <input type="text" id="sim-compose-subject" readonly style="background:#0f172a; border:1px solid var(--sim-border); color:#fff; border-radius:6px; padding:10px;">
                </div>

                <!-- Auto Email Generation UI -->
                <div style="display:flex; flex-direction:column; gap:8px; background: rgba(37, 99, 235, 0.1); padding: 10px; border-radius: 6px; border: 1px solid var(--sim-accent-blue);">
                    <label style="font-size:0.85rem; font-weight:700; color:var(--sim-accent-blue);">Auto Generate Email (AI Assistant)</label>
                    <div style="display:flex; gap:10px;">
                        <select id="sim-compose-topic" style="flex:1; background:#0f172a; border:1px solid var(--sim-border); color:#fff; border-radius:6px; padding:10px; outline:none;">
                            <option value="Rate negotiation">Rate negotiation</option>
                            <option value="Load inquiry">Load inquiry</option>
                            <option value="Check call">Check call</option>
                            <option value="Detention request">Detention request</option>
                            <option value="TONU request">TONU request</option>
                            <option value="Lumper request">Lumper request</option>
                            <option value="Appointment request">Appointment request</option>
                            <option value="Carrier packet request">Carrier packet request</option>
                        </select>
                        <button onclick="generateDraftEmail()" style="background:var(--sim-accent-blue); color:white; border:none; padding:10px 15px; border-radius:6px; cursor:pointer; font-weight:bold;">Draft Email ✍️</button>
                    </div>
                </div>

                <div style="display:flex; flex-direction:column; gap:8px;">
                    <label style="font-size:0.85rem; font-weight:700; color:var(--sim-accent-blue);">Message Body</label>
                    <textarea id="sim-compose-body" rows="6" style="background:#0f172a; border:1px solid var(--sim-border); color:#fff; border-radius:6px; padding:10px; font-family:inherit; font-size:0.85rem; outline:none; resize:none;"></textarea>
                </div>

                <div style="display:flex; flex-direction:column; gap:8px;">
                    <label style="font-size:0.85rem; font-weight:700; color:var(--sim-accent-blue);">Attach Dispatch Credentials</label>
                    <div style="display:flex; flex-direction:column; gap:6px; font-size:0.85rem;">
                        <label><input type="checkbox" id="sim-attach-w9" checked> W9 Certificate Form</label>
                        <label><input type="checkbox" id="sim-attach-insurance" checked> Certificate of Insurance (COI)</label>
                        <label><input type="checkbox" id="sim-attach-packet" checked> Setup Carrier Packet</label>
                    </div>
                </div>

                <button onclick="sendDispatcherEmail()" style="background:var(--sim-accent-blue); border:none; color:#fff; padding:12px; border-radius:6px; font-weight:800; cursor:pointer; text-align:center;">Send Email 📤</button>
            </div>
        </div>

        <!-- Email Details & Scorecard Modal -->
        <div class="sim-modal-overlay" id="sim-email-detail-modal">
            <div class="sim-modal" style="max-width:600px; max-height:85vh; overflow-y:auto;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h2 id="sim-email-detail-subject">Booking Confirmation Status</h2>
                    <button class="sim-drawer-close" onclick="closeEmailDetailsModal()">&times;</button>
                </div>

                <div id="sim-email-detail-sender" style="font-size:0.8rem; color:var(--sim-accent-blue); font-weight:700;">From: Broker Desk</div>
                
                <div id="sim-email-detail-body" style="background:rgba(0,0,0,0.2); border:1px solid var(--sim-border); border-radius:8px; padding:15px; font-size:0.85rem; line-height:1.5; white-space:pre-wrap; color:var(--sim-text-main);">
                    Message body details.
                </div>

                <!-- Grading scorecard drawer -->
                <div id="sim-email-scorecard" class="sim-drawer-section" style="background:rgba(16,185,129,0.03); border-color:rgba(16,185,129,0.2); gap:12px;">
                    <span class="sim-hud-label" style="color:var(--sim-glowing-green);">🏆 Educational Competency Scorecard</span>
                    
                    <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:10px; text-align:center;">
                        <div style="background:rgba(255,255,255,0.02); padding:8px; border-radius:6px;">
                            <div style="font-size:1.15rem; font-weight:800;" id="sim-score-grammar">0%</div>
                            <div style="font-size:0.6rem; color:var(--sim-text-muted); text-transform:uppercase;">Grammar</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.02); padding:8px; border-radius:6px;">
                            <div style="font-size:1.15rem; font-weight:800;" id="sim-score-prof">0%</div>
                            <div style="font-size:0.6rem; color:var(--sim-text-muted); text-transform:uppercase;">Professionalism</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.02); padding:8px; border-radius:6px;">
                            <div style="font-size:1.15rem; font-weight:800;" id="sim-score-know">0%</div>
                            <div style="font-size:0.6rem; color:var(--sim-text-muted); text-transform:uppercase;">Knowledge</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.02); padding:8px; border-radius:6px;">
                            <div style="font-size:1.15rem; font-weight:800;" id="sim-score-close">0%</div>
                            <div style="font-size:0.6rem; color:var(--sim-text-muted); text-transform:uppercase;">Closing</div>
                        </div>
                    </div>

                    <div style="font-size:0.8rem; line-height:1.4;" id="sim-score-feedback">Educational feedback comments.</div>
                </div>
            </div>
        </div>

        <!-- Certification Exam results Modal -->
        <div class="sim-modal-overlay" id="sim-exam-results-modal">
            <div class="sim-modal" style="max-width:600px; max-height:85vh; overflow-y:auto;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h2>Examination Debriefing</h2>
                    <button class="sim-drawer-close" onclick="closeExamResultsModal()">&times;</button>
                </div>

                <div id="sim-exam-feedback-list" style="max-height:200px; overflow-y:auto; background:rgba(0,0,0,0.1); border-radius:6px; border:1px solid var(--sim-border);">
                    <!-- Injected dynamically -->
                </div>

                <!-- Pass layout display -->
                <div id="sim-exam-success" style="display:none; text-align:center;">
                    <div class="sim-certificate">
                        <div style="font-size:1.4rem; font-weight:800; color:var(--sim-dark-bg); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:10px;">B2B Dispatcher Academy</div>
                        <div style="font-size:0.8rem; color:#475569; font-style:italic; margin-bottom:20px;">This certifies that</div>
                        <div style="font-size:1.8rem; font-weight:800; color:var(--sim-navy-card); margin-bottom:10px;" id="sim-cert-card-student">Student Dispatcher</div>
                        <div style="font-size:0.85rem; color:#475569; margin-bottom:25px;">has successfully completed all dispatcher evaluations, voice negotiations, and compliance certifications.</div>
                        <div style="font-weight:700; color:var(--sim-glowing-green);" id="sim-cert-card-grade">90% Passing Grade</div>
                        
                        <div class="sim-cert-seal">B2B SECURE SEAL</div>
                        
                        <div style="font-size:0.6rem; color:#64748b; margin-top:20px; font-family:monospace;" id="sim-cert-card-hash">SECURE HASH</div>
                    </div>

                    <button onclick="downloadCertificatePDF()" style="background:var(--sim-accent-blue); border:none; color:#fff; padding:12px; border-radius:6px; font-weight:800; width:100%; margin-top:20px; cursor:pointer;">Print Certificate 📥</button>
                </div>

                <div id="sim-exam-failed" style="display:none; text-align:center; color:var(--sim-bright-red); font-weight:700;">
                    ❌ You did not reach the 80% pass threshold. Please review the tutor assistant guidelines and retry the exam!
                </div>
            </div>
        </div>

        <!-- Document Viewer Modal (Load Booking Flow) -->
        <div class="sim-modal-overlay" id="sim-documents-modal">
            <div class="sim-modal" style="width: 800px; max-width: 95vw; height: 80vh; display: flex; flex-direction: column;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--sim-border); padding-bottom: 10px; margin-bottom: 15px;">
                    <h2 style="color:var(--sim-glowing-green);">Load Successfully Booked! 🎉</h2>
                    <button class="sim-drawer-close" onclick="document.getElementById('sim-documents-modal').style.display='none'">&times;</button>
                </div>
                
                <div style="display: flex; gap: 5px; flex-wrap: wrap; border-bottom: 2px solid var(--sim-border); padding-bottom: 10px; margin-bottom: 15px;">
                    <button class="doc-tab-btn active" onclick="switchDocTab('rate_confirmation')" style="flex: 1 1 calc(33% - 10px); background:var(--sim-accent-blue); color:white; border:none; padding:8px; border-radius:4px; font-weight:bold; cursor:pointer; font-size: 0.8rem;">Rate Con</button>
                    <button class="doc-tab-btn" onclick="switchDocTab('carrier_packet')" style="flex: 1 1 calc(33% - 10px); background:#0f172a; color:white; border:1px solid var(--sim-border); padding:8px; border-radius:4px; font-weight:bold; cursor:pointer; font-size: 0.8rem;">Carrier Packet</button>
                    <button class="doc-tab-btn" onclick="switchDocTab('dispatch_sheet')" style="flex: 1 1 calc(33% - 10px); background:#0f172a; color:white; border:1px solid var(--sim-border); padding:8px; border-radius:4px; font-weight:bold; cursor:pointer; font-size: 0.8rem;">Dispatch Sheet</button>
                    <button class="doc-tab-btn" onclick="switchDocTab('pod')" style="flex: 1 1 calc(33% - 10px); background:#0f172a; color:white; border:1px solid var(--sim-border); padding:8px; border-radius:4px; font-weight:bold; cursor:pointer; font-size: 0.8rem;">POD</button>
                    <button class="doc-tab-btn" onclick="switchDocTab('invoice')" style="flex: 1 1 calc(33% - 10px); background:#0f172a; color:white; border:1px solid var(--sim-border); padding:8px; border-radius:4px; font-weight:bold; cursor:pointer; font-size: 0.8rem;">Invoice</button>
                    <button class="doc-tab-btn" onclick="switchDocTab('bol')" style="flex: 1 1 calc(33% - 10px); background:#0f172a; color:white; border:1px solid var(--sim-border); padding:8px; border-radius:4px; font-weight:bold; cursor:pointer; font-size: 0.8rem;">BOL</button>
                    <button class="doc-tab-btn" onclick="switchDocTab('lumper_receipt')" style="flex: 1 1 calc(33% - 10px); background:#0f172a; color:white; border:1px solid var(--sim-border); padding:8px; border-radius:4px; font-weight:bold; cursor:pointer; font-size: 0.8rem;">Lumper Receipt</button>
                    <button class="doc-tab-btn" onclick="switchDocTab('detention_form')" style="flex: 1 1 calc(33% - 10px); background:#0f172a; color:white; border:1px solid var(--sim-border); padding:8px; border-radius:4px; font-weight:bold; cursor:pointer; font-size: 0.8rem;">Detention Form</button>
                    <button class="doc-tab-btn" onclick="switchDocTab('tonu_form')" style="flex: 1 1 calc(33% - 10px); background:#0f172a; color:white; border:1px solid var(--sim-border); padding:8px; border-radius:4px; font-weight:bold; cursor:pointer; font-size: 0.8rem;">TONU Form</button>
                </div>
                
                <div style="flex: 1; background: #e2e8f0; border-radius: 6px; padding: 20px; overflow-y: auto;" id="sim-document-viewer-wrapper">
                    <!-- HTML Document content injected here to simulate PDF viewer -->
                    <div id="sim-document-viewer"></div>
                </div>
                
                <div style="display: flex; justify-content: space-between; margin-top: 15px;">
                    <button onclick="printCurrentDocument()" style="background:#10b981; color:white; border:none; padding:12px 24px; border-radius:6px; font-weight:bold; cursor:pointer;">🖨️ Print / Save as PDF</button>
                    <button onclick="document.getElementById('sim-documents-modal').style.display='none'" style="background:var(--sim-accent-blue); color:white; border:none; padding:12px 24px; border-radius:6px; font-weight:bold; cursor:pointer;">Close Viewer</button>
                </div>
            </div>
        </div>

        <div id="challenges-academy-hub">

    </div> <!-- End academy-wrapper -->

    <!-- Core Scripts -->
`

export default function HomePage() {
  return (
    <>
      <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: bodyHTML }} />
      <Script src="/js/script.js" strategy="afterInteractive" />
      <Script src="/js/challenges.js" strategy="afterInteractive" />
      <Script src="/js/simulator.js" strategy="afterInteractive" />
      <button
        onClick={() => { window.location.href = '/' }}
        style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 99999, padding: '12px 24px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 30, fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', transition: 'transform 0.2s', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Home size={18} /> Back to Dashboard
      </button>
    </>
  )
}
