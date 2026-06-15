/* ==========================================================================
   B2B Dispatcher Academy - Challenges System Core JS
   Author: Antigravity
   ========================================================================== */
const CHALLENGE_API_BASE = (window.__APP_CONFIG__ && window.__APP_CONFIG__.apiUrl) || "https://b2b-bck.onrender.com";

// Core Application State
let activeChallengeSession = {
    sessionId: null,
    challengeId: null,
    studentName: "Guest",
    studentEmail: "guest@dispatcheracademy.com",
    turnNumber: 0,
    history: [],
    currentMetrics: {
        confidence: 5.0,
        negotiation: 5.0,
        professionalism: 5.0,
        communication: 5.0,
        decision_making: 5.0,
        problem_solving: 5.0,
        dispatcher_accuracy: 5.0
    }
};

// Audio & STT State
let challengesMediaRecorder = null;
let audioChunks = [];
let challengesRecognition = null;
let challengesIsRecording = false;
let speechUtterance = null;
let currentChallengesList = [];

// Profile & Gamification Stats
let studentProfileData = {
    name: "Guest",
    email: "guest@dispatcheracademy.com",
    xp: 0,
    rank: "Rookie Dispatcher",
    streak: 0,
    badges: [],
    completed_challenges: {}
};

// Universal, robust initialization that bypasses the DOMContentLoaded race condition
function initAcademy() {
    console.log("[Academy] Initializing Dispatcher Academy Challenges...");
    
    // Check if user is registered/logged in from localStorage
    loadProfileFromStorage();
    
    // Wire up academy main tabs
    wireUpTabs();
    
    // Refresh student stats and challenges list
    refreshAcademyHub();
    
    // Setup Speech Recognition
    setupSpeechRecognition();

    // Check if there is an active broker call from the simulator redirect
    setTimeout(() => {
        const storedLoad = localStorage.getItem("active_broker_call_load");
        if (storedLoad) {
            try {
                const load = JSON.parse(storedLoad);
                localStorage.removeItem("active_broker_call_load");
                if (typeof startBrokerCall === "function") {
                    const loadId = load.load_id || load.reference_number;
                    console.log("[Academy] Auto-initiating broker call from redirect for load:", loadId);
                    startBrokerCall(loadId, load);
                }
            } catch (e) {
                console.error("Failed to auto-start broker call from redirect:", e);
            }
        }
    }, 300);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAcademy);
} else {
    initAcademy();
}

// Load profile from localStorage
function loadProfileFromStorage() {
    const savedEmail = localStorage.getItem("academy_email") || localStorage.getItem("sim_academy_email") || localStorage.getItem("studentEmail");
    const savedName = localStorage.getItem("academy_name") || localStorage.getItem("sim_academy_name") || localStorage.getItem("studentName");
    
    if (savedEmail && savedName) {
        localStorage.setItem("academy_email", savedEmail);
        localStorage.setItem("academy_name", savedName);
        activeChallengeSession.studentEmail = savedEmail;
        activeChallengeSession.studentName = savedName;
        console.log(`[Academy] Profile found: ${savedName} (${savedEmail})`);
    } else {
        // First-time guest, open Registration/Profile Widget
        console.log("[Academy] No profile found, opening profile setup...");
        setTimeout(() => {
            promptProfileSetup();
        }, 1000);
    }
}

// Open profile register prompt using a premium glassmorphic modal instead of native browser prompt
function promptProfileSetup() {
    // If the modal already exists, remove it
    const existing = document.getElementById("academy-profile-modal-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "academy-profile-modal-overlay";
    overlay.className = "profile-modal-overlay";
    
    overlay.innerHTML = `
        <div class="profile-modal-card">
            <div class="profile-modal-header">
                <span class="profile-modal-badge">cadet enrollment</span>
                <h2>🚀 Dispatcher Academy Setup</h2>
                <p>Register your cadet profile to sync XP, win achievements, and claim your place on the live B2B Leaderboard.</p>
            </div>
            
            <form id="profile-setup-form" onsubmit="window.saveCustomProfile(event)" class="profile-modal-form">
                <div class="profile-form-group">
                    <label for="cadet-name">👤 Cadet Full Name</label>
                    <input type="text" id="cadet-name" required placeholder="Ace Dispatcher" value="Ace Dispatcher">
                </div>
                
                <div class="profile-form-group">
                    <label for="cadet-email">📧 B2B Terminal Email</label>
                    <input type="email" id="cadet-email" required placeholder="student@b2b.com" value="student@b2b.com">
                </div>
                
                <button type="submit" class="btn-profile-submit">⚡ Initialize Academy Interface</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

// Global handler to save the custom cadet profile
window.saveCustomProfile = function(event) {
    event.preventDefault();
    
    const name = document.getElementById("cadet-name").value.trim() || "Ace Dispatcher";
    const email = document.getElementById("cadet-email").value.trim() || "student@b2b.com";
    
    localStorage.setItem("academy_email", email);
    localStorage.setItem("academy_name", name);
    
    activeChallengeSession.studentEmail = email;
    activeChallengeSession.studentName = name;
    
    // Fade out and remove the modal cleanly
    const overlay = document.getElementById("academy-profile-modal-overlay");
    if (overlay) {
        overlay.style.opacity = "0";
        overlay.style.transition = "opacity 0.25s ease";
        setTimeout(() => {
            overlay.remove();
        }, 250);
    }
    
    // Refresh cadet statistics and B2B leaderboard data
    refreshAcademyHub();
};

// Wire up navbar tabs
function wireUpTabs() {
    const tabs = document.querySelectorAll(".academy-tab-btn");
    tabs.forEach(tab => {
        tab.addEventListener("click", (e) => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            
            const view = tab.getAttribute("data-view");
            switchView(view);
        });
    });
}

// Switch between SPA views
function switchView(viewName) {
    console.log(`[Academy] Switching view to: ${viewName}`);
    
    // Hide all main containers
    document.getElementById("view-dashboard").style.display = "none";
    document.getElementById("view-leaderboards").style.display = "none";
    const simView = document.getElementById("view-dat-simulator");
    if (simView) simView.style.display = "none";
    
    // Show requested
    if (viewName === "dashboard") {
        togglePracticeModeView(false);
        document.getElementById("view-dashboard").style.display = "block";
        refreshAcademyHub();
    } else if (viewName === "leaderboard") {
        togglePracticeModeView(false);
        document.getElementById("view-leaderboards").style.display = "block";
        loadLeaderboardAndAnalytics();
    } else if (viewName === "practice-mode") {
        // Redirect or load standard call practice
        window.location.hash = "#standard-practice";
        // Call the parent show/hide logic if integrated in index.html
        togglePracticeModeView(true);
    } else if (viewName === "dat-simulator") {
        const a = document.createElement("a");
        a.href = "/dat-simulator";
        a.target = "_blank";
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => {
            const dashBtn = document.querySelector('.academy-tab-btn[data-view="dashboard"]');
            if (dashBtn) dashBtn.click();
        }, 50);
    } else if (viewName === "admin-portal") {
        const a = document.createElement("a");
        a.href = "/admin";
        a.target = "_blank";
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => {
            const dashBtn = document.querySelector('.academy-tab-btn[data-view="dashboard"]');
            if (dashBtn) dashBtn.click();
        }, 50);
    }
}


// Refresh student profile HUD, dashboard cards, weekly leaderboard, etc.
function refreshAcademyHub() {
    if (!activeChallengeSession.studentEmail) {
        console.log("[Academy] Delaying refresh, studentEmail is empty.");
        return;
    }
    // PRIORITY 1: Critical data — student profile + challenge grid load immediately
    fetchStudentProfile();
    fetchChallenges();
    // PRIORITY 2: Non-critical data deferred so the grid renders first without competing for network
    setTimeout(() => {
        loadDailyChallenge();
        loadLeaderboardAndAnalytics();
    }, 300);
}

// Dynamically load the daily challenge generated via Groq from the backend
async function loadDailyChallenge() {
    try {
        const resp = await fetch(`${CHALLENGE_API_BASE}/api/challenges/daily`);
        if (resp.ok) {
            const daily = await resp.json();
            
            // Query selectors inside the Daily Challenge Banner
            const titleEl = document.querySelector(".daily-challenge-banner h2 span:nth-child(2)");
            const descEl = document.querySelector(".daily-challenge-banner p");
            const btnEl = document.querySelector(".daily-challenge-banner button");
            
            if (titleEl) {
                titleEl.textContent = daily.title;
            }
            if (descEl) {
                descEl.textContent = daily.description;
            }
            if (btnEl) {
                btnEl.setAttribute("onclick", `openBriefingModal('${daily.challenge_id}')`);
            }
        }
    } catch (e) {
        console.error("[Academy] Error loading daily challenge dynamically:", e);
    }
}

async function generateNewDailyChallenge() {
    const btn = document.querySelector(".daily-challenge-banner button:nth-child(2)");
    if (btn) btn.textContent = "Generating... ⏳";
    try {
        const resp = await fetch(`${CHALLENGE_API_BASE}/api/challenges/daily/generate`, { method: "POST" });
        if (resp.ok) {
            await loadDailyChallenge();
            alert("New daily challenge generated successfully via Groq AI!");
        }
    } catch (e) {
        console.error("Failed to generate", e);
    }
    if (btn) btn.textContent = "Regenerate 🔄";
}

// Fetch student profile from API
async function fetchStudentProfile() {
    const email = activeChallengeSession.studentEmail;
    const name = activeChallengeSession.studentName;
    
    try {
        const resp = await fetch(`${CHALLENGE_API_BASE}/api/student/profile?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`);
        if (resp.ok) {
            const data = await resp.json();
            studentProfileData = data.profile;
            updateHudDisplay();
            renderRecentActivity(data.attempts);
        }
    } catch (e) {
        console.error("[Academy] Error loading student profile:", e);
    }
}

// Render student's recent practice history logs in sidebar
function renderRecentActivity(attempts) {
    const container = document.getElementById("recent-activity-panel");
    const list = document.getElementById("recent-activity-list");
    if (!container || !list) return;
    
    if (!attempts || attempts.length === 0) {
        container.style.display = "none";
        return;
    }
    
    container.style.display = "block";
    list.innerHTML = "";
    
    // Slice only the last 3 attempts for the compact sidebar log
    const recent = attempts.slice(0, 3);
    
    recent.forEach(att => {
        const score = att.score || 0;
        const dateStr = att.created_at_str || "Just now";
        const title = att.challenge_title || "Practice Call";
        
        let scoreColor = "var(--neon-red)";
        if (score >= 8.5) scoreColor = "var(--neon-green)";
        else if (score >= 6.5) scoreColor = "var(--neon-amber)";
        
        const item = document.createElement("div");
        item.style.display = "flex";
        item.style.justifyContent = "space-between";
        item.style.alignItems = "center";
        item.style.background = "rgba(0, 0, 0, 0.01)";
        item.style.padding = "10px 14px";
        item.style.borderRadius = "12px";
        item.style.border = "1px solid rgba(0, 0, 0, 0.03)";
        item.style.transition = "var(--transition-smooth)";
        
        item.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-size: 0.8rem; font-weight: 700; color: #0f172a;">${title}</span>
                <span style="font-size: 0.65rem; color: var(--text-muted);">${dateStr}</span>
            </div>
            <div style="font-weight: 800; font-size: 0.85rem; color: ${scoreColor}; background: rgba(0,0,0,0.02); padding: 4px 8px; border-radius: 6px;">
                ${score}/10
            </div>
        `;
        
        // Add subtle hover effect
        item.addEventListener("mouseenter", () => {
            item.style.background = "rgba(99, 102, 241, 0.04)";
            item.style.borderColor = "rgba(99, 102, 241, 0.15)";
        });
        item.addEventListener("mouseleave", () => {
            item.style.background = "rgba(0, 0, 0, 0.01)";
            item.style.borderColor = "rgba(0, 0, 0, 0.03)";
        });
        
        list.appendChild(item);
    });
}

// Update the top navigation HUD
function updateHudDisplay() {
    const xpEl = document.getElementById("hud-xp-val");
    const streakEl = document.getElementById("hud-streak-val");
    const rankEl = document.getElementById("hud-rank-val");
    
    if (xpEl) xpEl.textContent = `${studentProfileData.xp} XP`;
    if (streakEl) streakEl.textContent = `🔥 ${studentProfileData.streak} Days`;
    if (rankEl) rankEl.textContent = studentProfileData.rank;
}

// Fetch all available challenges and render grid
async function fetchChallenges(categoryFilter = "ALL") {
    const email = activeChallengeSession.studentEmail;
    const grid = document.getElementById("challenges-grid-container");
    if (!grid) return;
    
    if (currentChallengesList.length === 0) {
        grid.innerHTML = `<div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
            <div class="spinner"></div> Loading Challenges...
        </div>`;
    }
    
    try {
        const resp = await fetch(`${CHALLENGE_API_BASE}/api/challenges?email=${encodeURIComponent(email)}`);
        if (resp.ok) {
            currentChallengesList = await resp.json();
            renderChallengesList(categoryFilter);
        } else {
            throw new Error(`Server returned status ${resp.status}`);
        }
    } catch (e) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--neon-red);">
            Failed to fetch practice challenges. Please check server connection.
        </div>`;
    }
}

// Render challenges to grid with filter criteria
function renderChallengesList(categoryFilter = "ALL") {
    const grid = document.getElementById("challenges-grid-container");
    if (!grid) return;
    grid.innerHTML = "";
    
    let filtered = currentChallengesList;
    if (categoryFilter !== "ALL") {
        filtered = currentChallengesList.filter(ch => ch.category === categoryFilter);
    }
    
    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
            No challenges found in this logistics category.
        </div>`;
        return;
    }
    
    filtered.forEach(ch => {
        const bestScoreStr = ch.best_score > 0 ? `${(ch.best_score * 10).toFixed(0)}/100` : "No attempts yet";
        const completedBadge = ch.completed ? `<span class="difficulty-badge" style="background: rgba(16, 185, 129, 0.15); color: var(--neon-green);">✓ COMPLETED</span>` : "";
        
        const card = document.createElement("div");
        card.className = `challenge-card ${ch.locked ? 'locked' : ''}`;
        card.innerHTML = `
            <div class="card-header-meta">
                <span class="company-type">${ch.company_type}</span>
                <div style="display: flex; gap: 5px; align-items: center;">
                    ${completedBadge}
                    <span class="difficulty-badge ${ch.difficulty.toLowerCase()}">${ch.difficulty}</span>
                </div>
            </div>
            <h4 class="challenge-title">${ch.title}</h4>
            <p class="challenge-desc">${ch.description}</p>
            <div class="skill-tags">
                ${ch.skill_tags.map(t => `<span class="skill-tag">${t}</span>`).join('')}
            </div>
            <div class="card-footer">
                <div class="challenge-stats">
                    <div class="stat-row">
                        <span class="stat-icon">⏱️</span> <span>Est: <strong>${ch.duration}</strong></span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-icon">🏆</span> <span>Best: <strong>${bestScoreStr}</strong></span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-icon">📞</span> <span>Attempts: <strong>${ch.attempts_count || 0}</strong></span>
                    </div>
                </div>
                <button class="btn-start-challenge" onclick="openBriefingModal('${ch.challenge_id}')">Practice Scenario</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Filter challenges chip actions
function filterCategory(category, activeChip) {
    document.querySelectorAll(".filter-chip").forEach(chip => chip.classList.remove("active"));
    activeChip.classList.add("active");
    renderChallengesList(category);
}

// Open Challenge Briefing Modal
function openBriefingModal(challengeId) {
    const ch = currentChallengesList.find(c => c.challenge_id === challengeId);
    if (!ch) return;
    
    // Create and append the briefing modal overlay
    const overlay = document.createElement("div");
    overlay.className = "briefing-overlay";
    overlay.id = "briefing-modal-overlay";
    overlay.innerHTML = `
        <div class="briefing-card">
            <div class="briefing-header">
                <div>
                    <span class="company-type" style="font-size: 0.8rem;">${ch.category} Briefing</span>
                    <h2 style="margin: 5px 0 0 0; color: #fff;">${ch.title}</h2>
                </div>
                <span class="difficulty-badge ${ch.difficulty.toLowerCase()}" style="font-size: 0.8rem; padding: 4px 10px;">
                    ${ch.difficulty} (${ch.xp_reward} XP)
                </span>
            </div>
            
            <div class="briefing-grid">
                <div class="briefing-panel">
                    <h4>📋 Scenario Objective</h4>
                    <p>${ch.scenario_brief}</p>
                </div>
                <div class="briefing-panel">
                    <h4>👤 AI Character Dossier</h4>
                    <div class="char-profile" style="margin-bottom: 12px;">
                        <div class="char-avatar-box">🗣️</div>
                        <div class="char-details">
                            <span class="char-name">${ch.character.name}</span>
                            <span class="char-role-label">Role: ${ch.character.role}</span>
                        </div>
                    </div>
                    <div class="dossier-row">
                        <span class="dossier-label">Personality</span>
                        <span class="dossier-val" style="font-size: 0.75rem; color: var(--text-muted);">${ch.character.personality}</span>
                    </div>
                </div>
            </div>
            
            <div class="briefing-actions">
                <button class="btn-cancel" onclick="closeBriefingModal()">Back to Academy</button>
                <button class="btn-primary-debrief" onclick="startActiveChallengeCall('${ch.challenge_id}')" style="box-shadow: 0 4px 15px rgba(99, 102, 241, 0.45);">🚀 Connect AI Call Simulation</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

// Close briefing modal
function closeBriefingModal() {
    const modal = document.getElementById("briefing-modal-overlay");
    if (modal) modal.remove();
}

// Start active call simulation with the AI
async function startActiveChallengeCall(challengeId) {
    closeBriefingModal();
    
    // Render the fullscreen simulated Cockpit HUD dynamically!
    renderSimulatedCockpitHUD(challengeId);
    
    const name = activeChallengeSession.studentName;
    const email = activeChallengeSession.studentEmail;
    
    // Call server API `/api/challenges/start`
    try {
        const resp = await fetch(`${CHALLENGE_API_BASE}/api/challenges/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ challenge_id: challengeId, student_name: name, email: email })
        });
        
        if (resp.ok) {
            const data = await resp.json();
            
            activeChallengeSession.sessionId = data.session_id;
            activeChallengeSession.challengeId = challengeId;
            activeChallengeSession.turnNumber = 0;
            activeChallengeSession.history = [];
            
            // Set character names and parameters
            document.getElementById("cockpit-caller-name").textContent = data.character_name;
            document.getElementById("cockpit-role-label").textContent = `Active ${data.character_role}`;
            document.getElementById("cockpit-emotion-state").textContent = "Responding";
            
            // Display Scenario brief in side panel
            document.getElementById("dossier-personality").textContent = data.character_personality;
            document.getElementById("dossier-scenario").textContent = data.scenario;
            
            // Speak the opening line
            handleAICharacterSpeech(data.opening_line);
        } else {
            alert("Failed to initialize AI session. Verify backend configuration.");
            exitCockpitHUD();
        }
    } catch (e) {
        console.error(e);
        alert("Server connection failed during simulation bootstrap.");
        exitCockpitHUD();
    }
}

// Render dynamic simulated Cockpit
function renderSimulatedCockpitHUD(challengeId) {
    const cockpit = document.createElement("div");
    cockpit.className = "cockpit-wrapper";
    cockpit.id = "active-cockpit-hud";
    cockpit.innerHTML = `
        <div class="cockpit-header">
            <div class="cockpit-title-info">
                <h2>AI Dispatch Simulation Cockpit</h2>
                <div class="cockpit-subtitle">Live practice evaluation channel: secure B2B link</div>
            </div>
            <div class="cockpit-hud-meters">
                <div class="hud-pill" id="cockpit-turn-counter">Turn: 0 / 6</div>
                <div class="hud-pill" style="border-color: rgba(244, 63, 94, 0.3); color: var(--neon-red); display: flex; align-items: center; gap: 6px;">
                    <span class="status-dot-blink"></span> RECORDING ENCRYPTED
                </div>
            </div>
        </div>
        
        <div class="cockpit-grid">
            <!-- Left panel: Scenario brief and operational log -->
            <div class="cockpit-side-panel">
                <h3>📌 Dispatch Mission Dossier</h3>
                <div class="dossier-list">
                    <div class="dossier-row">
                        <span class="dossier-label">AI Actor Personality</span>
                        <span class="dossier-val" id="dossier-personality">Retrieving...</span>
                    </div>
                    <div class="dossier-row">
                        <span class="dossier-label">Operational Directives</span>
                        <span class="dossier-val" id="dossier-scenario" style="font-size: 0.75rem; color: #334155; max-height: 250px; overflow-y: auto;">Loading...</span>
                    </div>
                    <div class="dossier-row" style="margin-top: 15px;">
                        <span class="dossier-label">Voice Channel Audio</span>
                        <span class="dossier-val" style="font-size: 0.75rem; color: var(--neon-indigo);">Web Speech API Synthesis active. Enable speaker sound.</span>
                    </div>
                </div>
            </div>
            
            <!-- Central Calling Station -->
            <div class="cockpit-center-station">
                <div class="cockpit-phone-frame">
                    <div style="text-align: center; color: var(--text-muted); font-size: 0.7rem; letter-spacing: 0.1em;">
                        SECURE VOICE LINK
                    </div>
                    
                    <div class="cockpit-avatar-station">
                        <div class="cockpit-avatar-ring pulsing" id="cockpit-avatar-ring">🗣️</div>
                        <div class="cockpit-caller-name" id="cockpit-caller-name">AI Character</div>
                        <div class="cockpit-call-status" id="cockpit-role-label">Connecting Broker...</div>
                        
                        <div class="live-emotion-console">
                            State: <strong id="cockpit-emotion-state">LISTENING</strong>
                        </div>
                        
                        <div class="cockpit-wave-pulse" id="cockpit-sound-wave">
                            <span></span><span></span><span></span><span></span><span></span>
                        </div>
                    </div>
                    
                    <div class="cockpit-transcript-bar" id="cockpit-transcript-subtitle">
                        Connecting line... Please prepare to introduce your truck and MC authority.
                    </div>
                    
                    <div class="cockpit-control-panel">
                        <!-- Speaker Mute Toggle (Left Circle Button) -->
                        <button class="cockpit-mute-btn" id="cockpit-audio-mute" title="Mute speaker">
                            <span class="mute-btn-icon">🔊</span>
                        </button>

                        <!-- Central Speak/Submit Button (Pill Capsule - fills available width) -->
                        <button class="cockpit-speak-btn" id="cockpit-record-btn" title="Tap to Speak">
                            <div class="speak-btn-content">
                                <span class="speak-btn-icon">🎙️</span>
                                <span class="speak-btn-text">Tap to Speak</span>
                            </div>
                        </button>

                        <!-- Decline / End Call Button (Right Circle Button) -->
                        <button class="cockpit-hangup-btn" id="cockpit-decline-btn-call" title="End Call & Score">
                            <span class="hangup-btn-icon">📞</span>
                        </button>
                    </div>
                </div>
                
                <!-- Hidden input field for speech-to-text data sync -->
                <input type="hidden" id="cockpit-keyboard-field" />
            </div>
            
            <!-- Right panel: Real-Time Scoring Dials -->
            <div class="scoring-hud-panel">
                <h3>📊 Live Dispatch Analytics</h3>
                
                <div class="meter-row">
                    <div class="meter-meta">
                        <span class="meter-name">Negotiation Pushes</span>
                        <span class="meter-value" id="meter-val-negotiation">50%</span>
                    </div>
                    <div class="meter-bar-bg"><div class="meter-bar-fill" id="meter-fill-negotiation"></div></div>
                </div>
                
                <div class="meter-row">
                    <div class="meter-meta">
                        <span class="meter-name">Professionalism & Composure</span>
                        <span class="meter-value" id="meter-val-professionalism">50%</span>
                    </div>
                    <div class="meter-bar-bg"><div class="meter-bar-fill" id="meter-fill-professionalism"></div></div>
                </div>
                
                <div class="meter-row">
                    <div class="meter-meta">
                        <span class="meter-name">Dispatcher Knowledge / Accuracy</span>
                        <span class="meter-value" id="meter-val-accuracy">50%</span>
                    </div>
                    <div class="meter-bar-bg"><div class="meter-bar-fill" id="meter-fill-accuracy"></div></div>
                </div>
                
                <div class="meter-row">
                    <div class="meter-meta">
                        <span class="meter-name">Problem Solving / Solutions</span>
                        <span class="meter-value" id="meter-val-problem">50%</span>
                    </div>
                    <div class="meter-bar-bg"><div class="meter-bar-fill" id="meter-fill-problem"></div></div>
                </div>
                
                <div class="suggestions-hud-panel">
                    <div style="font-size: 0.65rem; color: #92400e; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
                        💡 Tactical Assistance Drones
                    </div>
                    <div id="cockpit-suggestions-list">
                        <div class="suggestion-hint-item">Always justify your rates using operating costs (fuel, deadhead, lane demand).</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(cockpit);

    // Attach robust dynamic event listeners to prevent scope/nesting lookup bugs
    const kbBtn = cockpit.querySelector("#cockpit-keyboard-btn");
    const recBtn = cockpit.querySelector("#cockpit-record-btn");
    const muteBtn = cockpit.querySelector("#cockpit-audio-mute");
    const decBtn = cockpit.querySelector("#cockpit-decline-btn-call");
    const kbField = cockpit.querySelector("#cockpit-keyboard-field");
    const sendBtn = cockpit.querySelector("#cockpit-keyboard-send-btn");

    if (kbBtn) kbBtn.addEventListener("click", toggleKeyboardInput);
    if (recBtn) recBtn.addEventListener("click", toggleCockpitMicrophone);
    if (muteBtn) muteBtn.addEventListener("click", toggleTtsSpeaker);
    if (decBtn) decBtn.addEventListener("click", triggerCallHangsUp);
    if (sendBtn) sendBtn.addEventListener("click", submitKeyboardChallengeResponse);
    if (kbField) {
        kbField.addEventListener("keydown", (e) => {
            if (e.key === "Enter") submitKeyboardChallengeResponse();
        });
    }
}

// Exit calling Cockpit HUD
function exitCockpitHUD() {
    stopActiveSpeechAndRecording();
    const cockpit = document.getElementById("active-cockpit-hud");
    if (cockpit) cockpit.remove();
}

// Speech recognition setup
function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        challengesRecognition = new SpeechRecognition();
        challengesRecognition.continuous = false;
        challengesRecognition.interimResults = true;
        challengesRecognition.lang = 'en-US';
        
        challengesRecognition.onstart = () => {
            console.log("[STT] Speech recognition active...");
            document.getElementById("cockpit-transcript-subtitle").innerHTML = "<i>Listening... Speak clearly.</i>";
        };
        
        challengesRecognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            
            const liveText = finalTranscript || interimTranscript;
            document.getElementById("cockpit-transcript-subtitle").innerHTML = `Dispatcher: "<strong>${liveText}</strong>"`;
            
            // Set text in the keyboard field for fallback view
            document.getElementById("cockpit-keyboard-field").value = liveText;
        };
        
        challengesRecognition.onerror = (event) => {
            console.warn("[STT] Speech recognition error:", event.error);
        };
        
        challengesRecognition.onend = () => {
            console.log("[STT] Speech recognition ended.");
            // If we are recording and it stops, we trigger submit!
            if (challengesIsRecording) {
                stopAndSubmitCockpitSpeech();
            }
        };
    } else {
        console.warn("[STT] Speech recognition not supported in this browser.");
    }
}

// Toggle Keyboard fallback input field
function toggleKeyboardInput() {
    const panel = document.getElementById("cockpit-chat-input-panel");
    const btn = document.getElementById("cockpit-keyboard-btn");
    
    if (panel) {
        if (panel.style.display === "none") {
            panel.style.display = "flex";
            if (btn) btn.classList.add("active");
            const field = document.getElementById("cockpit-keyboard-field");
            if (field) field.focus();
        } else {
            panel.style.display = "none";
            if (btn) btn.classList.remove("active");
        }
    }
}

// Microphone controller inside Cockpit
async function toggleCockpitMicrophone() {
    if (challengesIsRecording) {
        stopAndSubmitCockpitSpeech();
    } else {
        // Start recording
        challengesIsRecording = true;
        const recordBtnEl = document.getElementById("cockpit-record-btn");
        if (recordBtnEl) {
            recordBtnEl.classList.add("recording");
            const btnText = recordBtnEl.querySelector(".speak-btn-text");
            const btnIcon = recordBtnEl.querySelector(".speak-btn-icon");
            if (btnText) btnText.textContent = "Stop & Submit";
            if (btnIcon) btnIcon.textContent = "⏹️";
        }
        
        // Clear variables
        audioChunks = [];
        document.getElementById("cockpit-keyboard-field").value = "";
        document.getElementById("cockpit-transcript-subtitle").innerHTML = "<i>Connecting microphone...</i>";
        
        // Start live transcription
        if (challengesRecognition) {
            try {
                challengesRecognition.start();
            } catch (e) {
                console.warn(e);
            }
        }
        
        // Start audio file recording
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            challengesMediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            
            challengesMediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunks.push(event.data);
            };
            
            challengesMediaRecorder.onstop = () => {
                // Ensure stream is stopped to save battery
                stream.getTracks().forEach(track => track.stop());
            };
            
            challengesMediaRecorder.start(250);
        } catch (err) {
            console.error("[Audio] Failed to open microphone stream:", err);
            stopAndSubmitCockpitSpeech();
        }
    }
}

// Stop recording and submit the active response cleanly
function stopAndSubmitCockpitSpeech() {
    if (!challengesIsRecording) return;
    
    challengesIsRecording = false;
    
    const btn = document.getElementById("cockpit-record-btn");
    if (btn) {
        btn.classList.remove("recording");
        const btnText = btn.querySelector(".speak-btn-text");
        const btnIcon = btn.querySelector(".speak-btn-icon");
        if (btnText) btnText.textContent = "Tap to Speak";
        if (btnIcon) btnIcon.textContent = "🎙️";
    }
    
    if (challengesRecognition) {
        try {
            challengesRecognition.stop();
        } catch (e) {
            console.warn(e);
        }
    }
    
    if (challengesMediaRecorder && challengesMediaRecorder.state !== "inactive") {
        try {
            challengesMediaRecorder.stop();
        } catch (e) {
            console.warn(e);
        }
    }
    
    const val = document.getElementById("cockpit-keyboard-field").value || "";
    if (val.trim() === "" && audioChunks.length === 0) {
        console.log("[STT] No speech detected. Aborting submission.");
        document.getElementById("cockpit-transcript-subtitle").innerHTML = "<i>No speech detected. Click Speak and try again!</i>";
        return;
    }
    
    submitActiveChallengeResponse();
}

// Submit keyboard response fallback
function submitKeyboardChallengeResponse() {
    const val = document.getElementById("cockpit-keyboard-field").value;
    if (!val || val.trim() === "") return;
    
    document.getElementById("cockpit-transcript-subtitle").innerHTML = `Dispatcher: "<strong>${val}</strong>"`;
    sendChallengeResponse(val, null);
    
    // Clear keyboard field
    document.getElementById("cockpit-keyboard-field").value = "";
}

// Submit audio response
function submitActiveChallengeResponse() {
    const text = document.getElementById("cockpit-keyboard-field").value;
    document.getElementById("cockpit-keyboard-field").value = ""; // Clear immediately to prevent repeat obections loop
    
    let audioBlob = null;
    if (audioChunks.length > 0) {
        audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    }
    
    sendChallengeResponse(text, audioBlob);
}

// Core Turn Handler: Send answer to API `/api/challenges/answer`
async function sendChallengeResponse(text, audioBlob) {
    if (!activeChallengeSession.sessionId) return;
    
    // Set UI to "Analyzing" status
    document.getElementById("cockpit-emotion-state").textContent = "Analyzing";
    document.getElementById("cockpit-sound-wave").classList.remove("speaking");
    
    const recBtn = document.getElementById("cockpit-record-btn");
    if (recBtn) {
        recBtn.disabled = true;
        recBtn.classList.add("disabled");
        const btnText = recBtn.querySelector(".speak-btn-text");
        const btnIcon = recBtn.querySelector(".speak-btn-icon");
        if (btnText) btnText.textContent = "Analyzing...";
        if (btnIcon) btnIcon.textContent = "🔍";
    }
    
    activeChallengeSession.turnNumber += 1;
    document.getElementById("cockpit-turn-counter").textContent = `Turn: ${activeChallengeSession.turnNumber} / 6`;
    
    const form = new FormData();
    form.append("session_id", activeChallengeSession.sessionId);
    form.append("answer", text);
    if (audioBlob) {
        form.append("media", audioBlob, "audio.webm");
    }
    
    try {
        const resp = await fetch(`${CHALLENGE_API_BASE}/api/challenges/answer`, {
            method: "POST",
            body: form
        });
        
        if (resp.ok) {
            const data = await resp.json();
            
            // If audio STT was processed, update text
            if (data.user_transcribed) {
                document.getElementById("cockpit-transcript-subtitle").innerHTML = `Dispatcher: "<strong>${data.user_transcribed}</strong>"`;
            }
            
            // Update real-time gauges telemetry
            updateLiveTelemetryGauges(data.metrics);
            
            // Save metrics to state
            activeChallengeSession.currentMetrics = data.metrics;
            
            // Update active emotional status
            document.getElementById("cockpit-emotion-state").textContent = data.status || "Responding";
            
            // Update dynamic suggestions
            updateTacticalSuggestions(data.suggestions);
            
            // Push transcript to local history
            activeChallengeSession.history.push({
                q: document.getElementById("cockpit-transcript-subtitle").innerText,
                a: data.user_transcribed || text
            });
            
            // Check completed status
            if (data.concluded) {
                setTimeout(() => {
                    triggerCallFinishedSuccess(data.success);
                }, 2000);
            } else {
                // Speak next dialog
                handleAICharacterSpeech(data.next_question);
            }
        } else {
            document.getElementById("cockpit-transcript-subtitle").innerHTML = "<span style='color: var(--neon-red);'>Connection Interrupted. Try typing or re-recording.</span>";
        }
    } catch (e) {
        console.error(e);
        document.getElementById("cockpit-transcript-subtitle").innerHTML = "<span style='color: var(--neon-red);'>Network Timeout. Check backend service.</span>";
    }
}

// Update the real-time glowing CSS metrics bars
function updateLiveTelemetryGauges(metrics) {
    if (!metrics) return;
    
    const neg = metrics.negotiation || 5;
    const prof = metrics.professionalism || 5;
    const acc = metrics.dispatcher_accuracy || 5;
    const prob = metrics.problem_solving || 5;
    
    updateSingleGauge("negotiation", neg);
    updateSingleGauge("professionalism", prof);
    updateSingleGauge("accuracy", acc);
    updateSingleGauge("problem", prob);
}

function updateSingleGauge(key, rating) {
    const percent = Math.min(100, Math.max(0, rating * 10));
    
    const valEl = document.getElementById(`meter-val-${key}`);
    const fillEl = document.getElementById(`meter-fill-${key}`);
    
    if (valEl) valEl.textContent = `${percent.toFixed(0)}%`;
    if (fillEl) fillEl.style.width = `${percent}%`;
}

// Render tactical tips list
function updateTacticalSuggestions(suggestions) {
    const list = document.getElementById("cockpit-suggestions-list");
    if (!list || !suggestions) return;
    
    list.innerHTML = "";
    suggestions.forEach(s => {
        const item = document.createElement("div");
        item.className = "suggestion-hint-item";
        item.textContent = s;
        list.appendChild(item);
    });
    
    if (suggestions.length === 0) {
        list.innerHTML = `<div class="suggestion-hint-item">Keep talking and resolving objections to get hints.</div>`;
    }
}

// Handle AI Text-to-speech audio vocal playback
function handleAICharacterSpeech(text) {
    // Show subtitle
    document.getElementById("cockpit-transcript-subtitle").innerHTML = `AI: "<strong>${text}</strong>"`;
    
    // Animate visual waves
    document.getElementById("cockpit-sound-wave").classList.add("speaking");
    document.getElementById("cockpit-avatar-ring").classList.add("speaking");
    
    const recBtn = document.getElementById("cockpit-record-btn");
    if (recBtn) {
        recBtn.disabled = true;
        recBtn.classList.add("disabled");
        const btnText = recBtn.querySelector(".speak-btn-text");
        const btnIcon = recBtn.querySelector(".speak-btn-icon");
        if (btnText) btnText.textContent = "Broker is Speaking...";
        if (btnIcon) btnIcon.textContent = "⏳";
    }
    
    // Stop any ongoing voice playback
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    
    const preferredName = localStorage.getItem("preferred_voice_name") || "GoogleTranslateCloud_US";
    
    // Check if cloud voice is selected
    if (preferredName && preferredName.startsWith("GoogleTranslateCloud")) {
        let lang = "en-US";
        if (preferredName.includes("GB")) lang = "en-GB";
        else if (preferredName.includes("CA")) lang = "en-CA";
        else if (preferredName.includes("AU")) lang = "en-AU";
        else if (preferredName.includes("IN")) lang = "en-IN";
        
        // Setup audio element
        const activeAudio = document.getElementById("botVoice") || new Audio();
        
        // Split sentences under 150 characters
        const sentences = text.match(/[^.!?]+[.!?]*|[^.!?]+/g) || [text];
        const chunks = [];
        
        sentences.forEach(s => {
            let clean = s.trim();
            if (!clean) return;
            while (clean.length > 150) {
                let splitIndex = clean.lastIndexOf(' ', 150);
                if (splitIndex === -1) splitIndex = 150;
                chunks.push(clean.substring(0, splitIndex).trim());
                clean = clean.substring(splitIndex).trim();
            }
            if (clean) chunks.push(clean);
        });
        
        if (chunks.length > 0) {
            let currentChunkIndex = 0;
            
            const playNext = () => {
                if (currentChunkIndex >= chunks.length) {
                    console.log("[TTS] Challenge Cloud TTS complete.");
                    document.getElementById("cockpit-sound-wave").classList.remove("speaking");
                    document.getElementById("cockpit-avatar-ring").classList.remove("speaking");
                    document.getElementById("cockpit-emotion-state").textContent = "Listening";
                    
                    const recBtn = document.getElementById("cockpit-record-btn");
                    if (recBtn) {
                        recBtn.disabled = false;
                        recBtn.classList.remove("disabled");
                        const btnText = recBtn.querySelector(".speak-btn-text");
                        const btnIcon = recBtn.querySelector(".speak-btn-icon");
                        if (btnText) btnText.textContent = "Tap to Speak";
                        if (btnIcon) btnIcon.textContent = "🎙️";
                    }
                    return;
                }
                
                const chunk = chunks[currentChunkIndex];
                activeAudio.src = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
                
                activeAudio.onended = () => {
                    currentChunkIndex++;
                    playNext();
                };
                activeAudio.onerror = () => {
                    console.warn("[TTS] Cloud playback errored, falling back.");
                    runLocalFallbackChallengeSpeech(text);
                };
                
                activeAudio.play().catch(e => {
                    console.warn("[TTS] Cloud playback blocked, falling back.");
                    runLocalFallbackChallengeSpeech(text);
                });
            };
            
            playNext();
            return;
        }
    }

    runLocalFallbackChallengeSpeech(text);
}

function runLocalFallbackChallengeSpeech(text) {
    speechUtterance = new SpeechSynthesisUtterance(text);
    
    // Read preferred speech rate from settings, defaulting to slightly faster conversation rate
    const preferredSpeed = parseFloat(localStorage.getItem("preferred_voice_speed") || "1.05");
    speechUtterance.rate = preferredSpeed;
    
    speechUtterance.onend = () => {
        document.getElementById("cockpit-sound-wave").classList.remove("speaking");
        document.getElementById("cockpit-avatar-ring").classList.remove("speaking");
        document.getElementById("cockpit-emotion-state").textContent = "Listening";
        
        const recBtn = document.getElementById("cockpit-record-btn");
        if (recBtn) {
            recBtn.disabled = false;
            recBtn.classList.remove("disabled");
            const btnText = recBtn.querySelector(".speak-btn-text");
            const btnIcon = recBtn.querySelector(".speak-btn-icon");
            if (btnText) btnText.textContent = "Tap to Speak";
            if (btnIcon) btnIcon.textContent = "🎙️";
        }
    };
    
    speechUtterance.onerror = (e) => {
        console.warn("[TTS] Error speaking text:", e);
        document.getElementById("cockpit-sound-wave").classList.remove("speaking");
        document.getElementById("cockpit-avatar-ring").classList.remove("speaking");
        
        const recBtn = document.getElementById("cockpit-record-btn");
        if (recBtn) {
            recBtn.disabled = false;
            recBtn.classList.remove("disabled");
            const btnText = recBtn.querySelector(".speak-btn-text");
            const btnIcon = recBtn.querySelector(".speak-btn-icon");
            if (btnText) btnText.textContent = "Tap to Speak";
            if (btnIcon) btnIcon.textContent = "🎙️";
        }
    };
    
    // Speak in preferred/premium voice or default
    if (window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        let selectedVoice = null;
        
        const preferredName = localStorage.getItem("preferred_voice_name");
        if (preferredName) {
            selectedVoice = voices.find(v => v.name === preferredName);
        }
        
        if (!selectedVoice) {
            // Find premium natural/google/online English voices first
            selectedVoice = voices.find(v => 
                v.lang && v.name && (
                    (v.name.toLowerCase().includes('natural') || 
                     v.name.toLowerCase().includes('google') || 
                     v.name.toLowerCase().includes('online') ||
                     v.name.toLowerCase().includes('siri') ||
                     v.name.toLowerCase().includes('samantha')) &&
                    (v.lang.startsWith('en-US') || v.lang.startsWith('en-CA'))
                )
            ) || voices.find(v => v.lang && v.lang.startsWith('en-US'))
              || voices.find(v => v.lang && v.lang.startsWith('en'));
        }
        
        if (selectedVoice) {
            console.log("[TTS] Selected challenge voice:", selectedVoice.name);
            speechUtterance.voice = selectedVoice;
        }
        
        window.speechSynthesis.speak(speechUtterance);
    }
}

// Disable/enable voice synthesis
let isTtsMuted = false;
function toggleTtsSpeaker() {
    const btn = document.getElementById("cockpit-audio-mute");
    const iconEl = btn ? btn.querySelector(".mute-btn-icon") : null;
    const textEl = btn ? btn.querySelector(".mute-btn-text") : null;
    
    if (isTtsMuted) {
        isTtsMuted = false;
        if (iconEl) iconEl.textContent = "🔊";
        if (textEl) textEl.textContent = "Mute";
        if (btn) btn.classList.remove("active");
    } else {
        isTtsMuted = true;
        if (iconEl) iconEl.textContent = "🔇";
        if (textEl) textEl.textContent = "Unmute";
        if (btn) btn.classList.add("active");
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    }
}

// Stop current recordings/playback safely
function stopActiveSpeechAndRecording() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (challengesRecognition) {
        try {
            challengesRecognition.stop();
        } catch (e) {}
    }
    if (challengesMediaRecorder && challengesMediaRecorder.state !== "inactive") {
        try {
            challengesMediaRecorder.stop();
        } catch (e) {}
    }
    challengesIsRecording = false;
    
    const btn = document.getElementById("cockpit-record-btn");
    if (btn) {
        btn.classList.remove("recording");
        const btnText = btn.querySelector(".speak-btn-text");
        const btnIcon = btn.querySelector(".speak-btn-icon");
        if (btnText) btnText.textContent = "Tap to Speak";
        if (btnIcon) btnIcon.textContent = "🎙️";
    }
}

// Decline Call / Force End scenario
function triggerCallHangsUp() {
    const confirmHang = confirm("Decline this call? This will end the active negotiation and evaluate your performance up to this turn.");
    if (confirmHang) {
        triggerCallFinishedSuccess(false);
    }
}

// Final call debrief: Call `/api/challenges/complete`
async function triggerCallFinishedSuccess(isSuccess) {
    stopActiveSpeechAndRecording();
    
    // Load fullscreen debrief popup loading screen
    document.getElementById("cockpit-transcript-subtitle").innerHTML = "<i>Finalizing logistics assessment... Writing report.</i>";
    
    const sessId = activeChallengeSession.sessionId;
    const metrics = activeChallengeSession.currentMetrics;
    
    try {
        const resp = await fetch(`${CHALLENGE_API_BASE}/api/challenges/complete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessId, metrics: metrics })
        });
        
        if (resp.ok) {
            const data = await resp.json();
            
            // Clean up the Cockpit HUD
            exitCockpitHUD();
            
            // Render the stunning Assessment Debrief Report Modal Portal!
            showPerformanceDebriefPortal(data.debrief, data.rewards);
        } else {
            alert("Failed to write final AI debriefing report.");
            exitCockpitHUD();
        }
    } catch (e) {
        console.error(e);
        alert("Server failed to compile final challenge reports.");
        exitCockpitHUD();
    }
}

// Render holographic Performance Debrief Assessment Modal
function showPerformanceDebriefPortal(debrief, rewards) {
    // Create popup backdrop overlay
    const overlay = document.createElement("div");
    overlay.className = "debrief-overlay";
    overlay.id = "debrief-modal-portal";
    
    // Achievements badges unlocks html
    let badgeUnlockHtml = "";
    if (rewards && rewards.new_badges && rewards.new_badges.length > 0) {
        rewards.new_badges.forEach(b => {
            badgeUnlockHtml += `
                <div class="badge-unlock-banner">
                    <span class="badge-unlock-icon">${b.icon}</span>
                    <div class="badge-unlock-info">
                        <span class="badge-unlock-title">🎉 Achievement Unlocked: ${b.name}</span>
                        <span class="badge-unlock-desc">${b.desc}</span>
                    </div>
                </div>
            `;
        });
    }
    
    overlay.innerHTML = `
        <div class="debrief-card">
            <h2 style="margin: 0 0 5px 0; font-size: 1.5rem; text-align: center; color: #fff;">
                🏁 Debriefing Report & Logistics Score
            </h2>
            <div style="font-size: 0.75rem; text-align: center; color: var(--text-muted); margin-bottom: 20px; letter-spacing: 0.1em; text-transform: uppercase;">
                Dispatcher Assessment Academy Verified
            </div>
            
            <div class="debrief-body">
                ${badgeUnlockHtml}
                
                <div class="debrief-hero">
                    <div class="debrief-score-wheel">
                        <div class="score-number">${debrief.overall_score}</div>
                        <div class="score-label">Global Competency Rating</div>
                    </div>
                    
                    <div class="debrief-rewards-hud">
                        <div class="reward-pill">
                            <span class="reward-val xp-val">+${rewards ? rewards.xp_added : 100} XP</span>
                            <span class="reward-lbl">Added Academy points</span>
                        </div>
                        <div class="reward-pill">
                            <span class="reward-val streak-val">🔥 ${rewards ? rewards.streak : 1}</span>
                            <span class="reward-lbl">Days Active Streak</span>
                        </div>
                    </div>
                </div>
                
                <div class="debrief-section" style="margin-bottom: 20px; border-left: 4px solid var(--neon-indigo);">
                    <h4 style="color: var(--neon-blue); margin: 0 0 8px 0; font-size: 0.85rem;">🧠 Director's Assessment</h4>
                    <p style="margin: 0; font-size: 0.85rem; line-height: 1.5; color: #cbd5e1;">${debrief.overall_summary}</p>
                </div>
                
                <div class="debrief-sections-grid">
                    <div class="debrief-section">
                        <h4 class="mistakes-title">⚠️ Identified Mistakes / Gaps</h4>
                        <ul>
                            ${(debrief.mistakes_made || []).map(m => `<li>${m}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="debrief-section">
                        <h4 class="suggestions-title">💡 Standard Better Responses</h4>
                        <ul>
                            ${(debrief.better_responses || []).map(br => `<li>${br}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="debrief-sections-grid">
                    <div class="debrief-section">
                        <h4 class="practices-title">📦 Operational Best Practices</h4>
                        <ul>
                            ${(debrief.dispatcher_best_practices || []).map(bp => `<li>${bp}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="debrief-section">
                        <h4 class="strengths-title">📈 Negotiation Optimizations</h4>
                        <ul>
                            ${(debrief.negotiation_improvements || []).map(i => `<li>${i}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="debrief-actions">
                <button class="btn-cancel" onclick="replayActiveChallenge()">Replay Scenario</button>
                <button class="btn-primary-debrief" onclick="closeDebriefAndRefreshHub()">Exit Academy Hub</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

// Replay current challenge
function replayActiveChallenge() {
    const modal = document.getElementById("debrief-modal-portal");
    if (modal) modal.remove();
    
    startActiveChallengeCall(activeChallengeSession.challengeId);
}

// Exit Debrief overlay & reload academy screen
function closeDebriefAndRefreshHub() {
    const modal = document.getElementById("debrief-modal-portal");
    if (modal) modal.remove();
    
    refreshAcademyHub();
}

// Leaderboard and Analytics render
async function loadLeaderboardAndAnalytics() {
    const leaderboardList = document.getElementById("weekly-leaderboard-list");
    const fullBoard = document.getElementById("global-rankings-board-full");
    const heatmapGrid = document.getElementById("analytics-heatmap-container");
    const email = activeChallengeSession.studentEmail;
    
    if (leaderboardList && leaderboardList.children.length === 0) {
        leaderboardList.innerHTML = `<div class="loading-state" style="padding: 20px; text-align: center; color: var(--text-muted);">Syncing board...</div>`;
    }
    if (fullBoard && fullBoard.children.length === 0) {
        fullBoard.innerHTML = `<div class="loading-state" style="padding: 20px; text-align: center; color: var(--text-muted);">Syncing board...</div>`;
    }
    if (heatmapGrid && heatmapGrid.children.length === 0) {
        heatmapGrid.innerHTML = `<div class="loading-state" style="padding: 20px; text-align: center; color: var(--text-muted);">Charting heatmap...</div>`;
    }
    
    // 1. Fetch Leaderboards
    try {
        const resp = await fetch(`${CHALLENGE_API_BASE}/api/student/leaderboard`);
        if (resp.ok) {
            const users = await resp.json();
            renderLeaderboard(users);
        }
    } catch (e) {
        console.error(e);
    }
    
    // 2. Fetch Aggregated Skill Analytics
    try {
        const resp = await fetch(`${CHALLENGE_API_BASE}/api/student/analytics?email=${encodeURIComponent(email)}`);
        if (resp.ok) {
            const data = await resp.json();
            renderSkillHeatmap(data.student_heatmap);
            renderWeeklyBadgesGrid();
        }
    } catch (e) {
        console.error(e);
    }
}

// Render Leaderboard items
function renderLeaderboard(users) {
    const list = document.getElementById("weekly-leaderboard-list");
    const fullBoard = document.getElementById("global-rankings-board-full");
    
    const listsToPopulate = [];
    if (list) listsToPopulate.push(list);
    if (fullBoard) listsToPopulate.push(fullBoard);
    
    if (listsToPopulate.length === 0) return;
    
    listsToPopulate.forEach(l => {
        l.innerHTML = "";
        
        if (users.length === 0) {
            l.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-muted);">No entries yet. Start practicing!</div>`;
            return;
        }
        
        users.forEach((u, i) => {
            const rank = i + 1;
            const isTopThree = rank <= 3 ? "top-three" : "";
            const isSelf = u.email === activeChallengeSession.studentEmail ? "current-user" : "";
            const badgeClass = `rank-${rank}`;
            
            const row = document.createElement("div");
            row.className = `leaderboard-item ${isTopThree} ${isSelf}`;
            row.innerHTML = `
                <div class="leaderboard-rank ${badgeClass}">${rank}</div>
                <div class="leaderboard-user">
                    <span class="user-name">${u.name} ${isSelf ? " (You)" : ""}</span>
                    <span class="user-rank-title">${u.rank}</span>
                </div>
                <div class="leaderboard-xp">${u.xp} XP</div>
            `;
            l.appendChild(row);
        });
    });
}

// Render SVG or dial Skill Heatmap
function renderSkillHeatmap(heatmap) {
    const container = document.getElementById("analytics-heatmap-container");
    if (!container || !heatmap) return;
    container.innerHTML = "";
    
    const skills = Object.keys(heatmap);
    skills.forEach(s => {
        const score = heatmap[s] || 0;
        const cell = document.createElement("div");
        cell.className = "heatmap-cell";
        cell.innerHTML = `
            <div class="heatmap-val">${score.toFixed(0)}%</div>
            <div class="heatmap-lbl">${s}</div>
        `;
        container.appendChild(cell);
    });
}

// Render local Student achievements list
function renderWeeklyBadgesGrid() {
    const container = document.getElementById("weekly-badges-grid");
    if (!container) return;
    container.innerHTML = "";
    
    const badgesDef = [
        { id: "first_call", name: "First Contact", desc: "Connected your first dispatcher call simulation.", icon: "📞" },
        { id: "negotiation_expert", name: "Tough Negotiator", desc: "Negotiation metrics of 8.5+ with an aggressive broker.", icon: "💼" },
        { id: "streak_five", name: "Dedicated Dispatcher", desc: "Maintained a 5-day streak of daily practice.", icon: "🔥" },
        { id: "perfect_score", name: "Logistics Virtuoso", desc: "Scored a near perfect 9.5+ rating in a high-pressure scenario.", icon: "🏆" }
    ];
    
    const studentBadges = studentProfileData.badges || [];
    
    badgesDef.forEach(b => {
        const isUnlocked = studentBadges.includes(b.id);
        const cell = document.createElement("div");
        cell.className = `badge-cell ${isUnlocked ? 'unlocked' : 'locked'}`;
        cell.title = `${b.name}: ${b.desc}`;
        cell.innerHTML = `
            <div class="badge-icon-wrap">${b.icon}</div>
            <span>${b.name}</span>
        `;
        container.appendChild(cell);
    });
}

// Unified navigation function for parent container integration
function togglePracticeModeView(showPractice) {
    const standardFrame = document.getElementById("standard-practice-wrapper");
    const challengesHub = document.getElementById("challenges-academy-hub");
    const navHeader = document.querySelector(".academy-nav");
    const backBtn = document.getElementById("back-to-dashboard-btn");
    const simView = document.getElementById("view-dat-simulator");
    
    if (showPractice) {
        if (standardFrame) standardFrame.style.display = "block";
        if (challengesHub) challengesHub.style.display = "none";
        if (navHeader) navHeader.style.display = "none";
        if (backBtn) backBtn.style.display = "none";
        if (simView) simView.style.display = "none";
    } else {
        if (standardFrame) standardFrame.style.display = "none";
        if (challengesHub) challengesHub.style.display = "block";
        if (navHeader) navHeader.style.display = "flex";
        if (backBtn) backBtn.style.display = "block";
        refreshAcademyHub();
    }
}

// Global scope exposures for window to resolve potential template execution issues
window.triggerCallHangsUp = triggerCallHangsUp;
window.toggleKeyboardInput = toggleKeyboardInput;
window.toggleCockpitMicrophone = toggleCockpitMicrophone;
window.toggleTtsSpeaker = toggleTtsSpeaker;
window.submitKeyboardChallengeResponse = submitKeyboardChallengeResponse;
window.openBriefingModal = openBriefingModal;
window.closeBriefingModal = closeBriefingModal;
window.startActiveChallengeCall = startActiveChallengeCall;
window.filterCategory = filterCategory;
window.togglePracticeModeView = togglePracticeModeView;
window.generateNewDailyChallenge = generateNewDailyChallenge;

// Logout fallback for pages that don't load simulator.js
window.logoutSimulator = function() {
    localStorage.removeItem("academy_email");
    localStorage.removeItem("academy_name");
    localStorage.removeItem("sim_academy_email");
    localStorage.removeItem("sim_academy_name");
    localStorage.removeItem("studentEmail");
    localStorage.removeItem("studentName");
    window.location.reload();
};
