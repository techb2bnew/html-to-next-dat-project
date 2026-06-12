/* ==========================================================================
   B2B Dispatcher Training Simulator - Frontend Core controller
   Author: Antigravity
   ========================================================================== */

let simStudent = {
    email: "guest@dispatcheracademy.com",
    name: "Dispatcher Cadet",
    balance: 10000.0,
    revenue: 0.0,
    booked_loads: 0,
    calls_made: 0,
    emails_sent: 0,
    carriers: []
};

let simScenarios = [];
let simActiveLoad = null;
let simActiveCall = {
    brokerName: "Brad",
    loadId: null,
    history: [],
    turnCount: 0,
    isMuted: false,
    recognition: null,
    isRecording: false
};

let simActiveEmailThread = null;
let simLoadedLoads = [];

// Determine API Base URL from injected config
const SIM_API_BASE = (window.__APP_CONFIG__ && window.__APP_CONFIG__.apiUrl) || "https://b2b-bck.onrender.com";

let simInitialized = false;

// Global simulator initialization — called LAZILY only when user accesses simulator features
// NOT on page load, to prevent the DAT login modal from appearing on the Academy Hub
function initSimulator() {
    if (simInitialized) return; // Already initialized, skip
    console.log("[Simulator] Bootstrapping Dispatcher Workspace...");
    
    // Use credentials from the main site login (academy_email / academy_name)
    let savedEmail = localStorage.getItem("sim_academy_email") || localStorage.getItem("academy_email") || localStorage.getItem("studentEmail");
    let savedName = localStorage.getItem("sim_academy_name") || localStorage.getItem("academy_name") || localStorage.getItem("studentName");
    let sessionId = localStorage.getItem("session_id");
    
    if (!savedEmail || !savedName) {
        // Only show login modal if user explicitly opened the DAT simulator section
        document.getElementById("sim-login-modal").style.display = "flex";
    } else if (!sessionId) {
        // Auto authenticate on backend using existing credentials — no login modal shown
        autoLoginSim(savedName, savedEmail);
    } else {
        localStorage.setItem("sim_academy_email", savedEmail);
        localStorage.setItem("sim_academy_name", savedName);
        document.getElementById("sim-login-modal").style.display = "none";
        simStudent.email = savedEmail;
        simStudent.name = savedName;
        simInitialized = true;
        refreshSimDashboard();
        
        // Hook up sidebar clicks
        wireUpSimSidebar();
        
        // Wire up load filters
        const searchBtn = document.getElementById("sim-load-search-btn");
        if (searchBtn) {
            searchBtn.addEventListener("click", querySimLoads);
        }
    }
}

async function autoLoginSim(name, email) {
    try {
        const res = await fetch(`${SIM_API_BASE}/api/sim/auth/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, name})
        });
        const data = await res.json();
        
        if (data.status === "success") {
            localStorage.setItem("session_id", data.session_id);
            localStorage.setItem("sim_academy_name", data.name);
            localStorage.setItem("sim_academy_email", data.email);
            
            simStudent.name = data.name;
            simStudent.email = data.email;
            simInitialized = true;
            
            document.getElementById("sim-login-modal").style.display = "none";
            refreshSimDashboard();
            
            // Hook up sidebar clicks
            wireUpSimSidebar();
            
            // Wire up load filters
            const searchBtn = document.getElementById("sim-load-search-btn");
            if (searchBtn) {
                searchBtn.addEventListener("click", querySimLoads);
            }
        } else {
            console.error("Auto-login failed:", data.message);
            // Only show modal if user is actively trying to use simulator
            // (not randomly in background) - show only if a sim element is visible
            const simSection = document.getElementById("view-dat-simulator");
            if (simSection && simSection.style.display !== "none") {
                document.getElementById("sim-login-modal").style.display = "flex";
            }
        }
    } catch (e) {
        console.error("Auto-login Error:", e);
        // Silent fail — don't show modal randomly
        console.warn("[Simulator] Auto-login silently failed. Modal will show when user opens simulator.");
    }
}

// DO NOT auto-run initSimulator on page load.
// It is called lazily when the user interacts with simulator features
// (makeSimCall, querySimLoads, triggerBrokerCallFromDrawer, etc.)
// This prevents the DAT Simulator login modal from randomly appearing on the Academy Hub.

async function submitSimLogin() {
    const nameEl = document.getElementById("sim-login-name");
    const emailEl = document.getElementById("sim-login-email");
    
    if (!nameEl.value.trim() || !emailEl.value.trim()) {
        alert("Please enter both your name and email to continue.");
        return;
    }

    const email = emailEl.value.trim().toLowerCase();
    const name = nameEl.value.trim();

    try {
        const res = await fetch(`${SIM_API_BASE}/api/sim/auth/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, name})
        });
        const data = await res.json();
        
        if (data.status === "success") {
            localStorage.setItem("session_id", data.session_id);
            localStorage.setItem("sim_academy_name", data.name);
            localStorage.setItem("sim_academy_email", data.email);
            
            simStudent.name = data.name;
            simStudent.email = data.email;
            simInitialized = true;
            
            document.getElementById("sim-login-modal").style.display = "none";
            refreshSimDashboard();
            
            // Wire up sidebar and load filters after successful login
            wireUpSimSidebar();
            const searchBtn = document.getElementById("sim-load-search-btn");
            if (searchBtn) {
                searchBtn.addEventListener("click", querySimLoads);
            }
        } else {
            alert("Login failed: " + data.message);
        }
    } catch (e) {
        console.error("Login Error:", e);
        alert("Error connecting to server.");
    }
}

async function logoutSimulator() {
    const sessionId = localStorage.getItem("session_id");
    if (sessionId) {
        try {
            await fetch(`${SIM_API_BASE}/api/sim/auth/logout`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({session_id: sessionId})
            });
        } catch(e) {}
    }

    localStorage.removeItem("session_id");
    localStorage.removeItem("sim_academy_name");
    localStorage.removeItem("sim_academy_email");
    
    simStudent.name = "Dispatcher Cadet";
    simStudent.email = "guest@dispatcheracademy.com";
    simInitialized = false; // Reset so initSimulator() runs fresh on next use
    
    document.getElementById("sim-login-name").value = "";
    document.getElementById("sim-login-email").value = "";
    
    // Modal is hidden — it will show again when user tries to use simulator
    document.getElementById("sim-login-modal").style.display = "none";
}

async function refreshSimDashboard() {
    try {
        const resp = await fetch(`${SIM_API_BASE}/api/sim/dashboard?email=${encodeURIComponent(simStudent.email)}&name=${encodeURIComponent(simStudent.name)}`);
        if (resp.ok) {
            const data = await resp.json();
            simStudent = data.student;
            simScenarios = data.scenarios;
            
            updateSimHUD();
            renderSimCarriers();
            renderSimScenarios();
        }
    } catch (e) {
        console.error("[Simulator] Error fetching dashboard:", e);
    }
}

function updateSimHUD() {
    const balEl = document.getElementById("sim-hud-bal");
    const revEl = document.getElementById("sim-hud-rev");
    const bookedEl = document.getElementById("sim-hud-booked");
    const callsEl = document.getElementById("sim-hud-calls");
    
    if (balEl) balEl.textContent = `$${simStudent.balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    if (revEl) revEl.textContent = `$${simStudent.revenue.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
    if (bookedEl) bookedEl.textContent = simStudent.booked_loads;
    if (callsEl) callsEl.textContent = simStudent.calls_made;
    
    // Update Level UI
    if (simStudent.level_info) {
        const titleEl = document.getElementById("sim-hud-level-title");
        const loadsEl = document.getElementById("sim-hud-level-loads");
        const barEl = document.getElementById("sim-hud-level-bar");
        
        if (titleEl) titleEl.textContent = simStudent.level_info.title;
        if (loadsEl) loadsEl.textContent = `${simStudent.booked_loads} / ${simStudent.level_info.next_level_req} Loads`;
        if (barEl) barEl.style.width = `${simStudent.level_info.progress_pct}%`;
    }
}

window.toggleSimSidebar = function() {
    const sidebar = document.querySelector('.sim-sidebar');
    const overlay = document.getElementById('sim-sidebar-overlay');
    if (sidebar) sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('open');
};

function wireUpSimSidebar() {
    const navs = document.querySelectorAll(".sim-nav-item");
    navs.forEach(nav => {
        nav.addEventListener("click", () => {
            navs.forEach(n => n.classList.remove("active"));
            nav.classList.add("active");
            
            const view = nav.getAttribute("data-view");
            switchSimView(view);
        });
    });
}

function switchSimView(viewName) {
    console.log(`[Simulator] Navigating view to: ${viewName}`);
    
    // Close mobile sidebar on selection
    const sidebar = document.querySelector('.sim-sidebar');
    const overlay = document.getElementById('sim-sidebar-overlay');
    if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
    }

    // Hide all panels
    const panels = ["dashboard", "loadboard", "broker-calls", "emails", "carriers", "scenarios", "analytics", "exam", "assistant"];
    panels.forEach(p => {
        const el = document.getElementById(`sim-view-${p}`);
        if (el) el.style.display = "none";
    });
    
    // Show active panel
    const activeEl = document.getElementById(`sim-view-${viewName}`);
    if (activeEl) {
        activeEl.style.display = "block";
    }
    
    // Run sub-view initialization routes
    if (viewName === "loadboard") {
        querySimLoads();
    } else if (viewName === "emails") {
        querySimEmails();
    } else if (viewName === "analytics") {
        renderAnalyticsGraphs();
    }
}

// ═══════════════ DAT LOAD BOARD SIMULATOR ═══════════════

async function querySimLoads() {
    // Lazy init — only initialize simulator when user actually uses it
    if (!simInitialized) {
        initSimulator();
        return; // initSimulator will call wireUpSimSidebar which hooks this up again
    }
    const origin = document.getElementById("sim-filter-origin").value.trim();
    const destination = document.getElementById("sim-filter-destination").value.trim();
    const equipment = document.getElementById("sim-filter-equipment").value;
    const weight = document.getElementById("sim-filter-weight").value.trim();
    
    const container = document.getElementById("sim-loads-container");
    if (!container) return;
    
    container.innerHTML = `<div style="text-align:center; padding:40px; color:var(--sim-text-muted);">🔍 Querying active loads...</div>`;
    
    try {
        const payload = {
            origin: origin,
            destination: destination,
            equipment: equipment,
            weight: weight
        };
        
        const resp = await fetch(`${SIM_API_BASE}/api/sim/dat/search`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload)
        });
        
        if (resp.ok) {
            const data = await resp.json();
            simLoadedLoads = data.loads; // Store globally for action triggers
            renderLoadsGrid(data.loads);
        } else {
            throw new Error("Failed to load");
        }
    } catch (e) {
        container.innerHTML = `<div style="color:var(--sim-bright-red); padding:20px; text-align:center;">Failed to query load board.</div>`;
    }
}

function renderLoadsGrid(loads) {
    const container = document.getElementById("sim-loads-container");
    if (!container) return;
    container.innerHTML = "";
    
    // Update stats count in results
    const resultsCountEl = document.getElementById("dat-results-num");
    if (resultsCountEl) {
        resultsCountEl.textContent = `${loads.length} Results`;
    }
    
    if (loads.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:40px; color:#64748b; font-weight:600;">No active loads matching search criteria.</div>`;
        return;
    }
    
    loads.forEach(ld => {
        const wrapper = document.createElement("div");
        wrapper.className = "dat-load-row-container";
        
        let badgeClass = "van";
        if (ld.equipment.type === "Reefer") badgeClass = "reefer";
        else if (ld.equipment.type === "Flatbed") badgeClass = "flat";
        
        // Construct standard DAT-style 10-column row grid
        const row = document.createElement("div");
        row.className = "dat-load-row-grid";
        
        row.innerHTML = `
            <div><input type="checkbox" style="transform: scale(1.15); cursor: pointer;" onclick="event.stopPropagation();"></div>
            <div style="font-weight: 700; color: #475569;">${ld.age || '5m'}</div>
            <div class="dat-row-rate">
                <span>$${ld.rate.toLocaleString()}</span>
                <span class="dat-row-rpm">$${ld.rpm.toFixed(2)}/mi</span>
            </div>
            <div class="dat-row-trip">${ld.miles}</div>
            <div class="dat-row-dho">
                <span style="font-weight: 800; color: #0f172a;">${ld.origin.city}, ${ld.origin.state}</span>
                <span class="dat-row-dhd">DH-O: ${ld.origin.dh_o || 0} mi</span>
            </div>
            <div style="font-weight: 700; color: #1e293b;">${ld.pickup_date || '6/1'}</div>
            <div>
                <span class="sim-load-badge ${badgeClass}" style="display:inline-block; font-size:0.68rem; font-weight:800; text-transform:uppercase;">${ld.equipment.type}</span>
                <span style="font-size:0.75rem; color:#64748b; display:block; margin-top:2px;">${ld.equipment.length}ft - ${ld.equipment.weight.toLocaleString()} lbs</span>
            </div>
            <div class="dat-row-company">
                <span style="color:#1d4ed8; font-weight:800;">${ld.broker.company}</span>
                <span class="dat-row-phone">${ld.broker.phone || '(800) 555-0199'}</span>
            </div>
            <div class="dat-row-cs">
                <span>${ld.broker.credit_score || 95} CS</span>
                <span class="dat-row-dtp">${ld.broker.dtp || 20} DTP</span>
            </div>
            <div style="font-weight: 800; color: #94a3b8; font-size: 1.15rem; text-align: center;">-</div>
        `;
        
        // Construct the 3-Column Embedded Details Pane
        const pane = document.createElement("div");
        pane.className = "dat-expand-details-pane";
        pane.style.display = "none";
        
        pane.innerHTML = `
            <!-- COLUMN 1: TRIP TIMELINE & SPECS -->
            <div class="dat-details-col">
                <div class="dat-details-title" style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                    <span>Trip</span>
                    <button class="dat-btn-view-route" onclick="window.open('https://www.google.com/maps/dir/${encodeURIComponent(ld.origin.city + ', ' + ld.origin.state)}/${encodeURIComponent(ld.destination.city + ', ' + ld.destination.state)}', '_blank')" style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:15px; padding:6px 14px; font-size:0.72rem; font-weight:800; color:#1e3a8a; cursor:pointer; display:flex; align-items:center; gap:4px; outline:none;">⚲ VIEW ROUTE</button>
                </div>
                
                <div class="dat-timeline">
                    <div class="dat-timeline-node origin">
                        <span style="font-weight: 800;">${ld.origin.city}, ${ld.origin.state} (${ld.origin.dh_o || 0})</span>
                        <div style="font-size:0.72rem; color:#64748b; font-weight:600; margin-top:2px;">${ld.pickup_date || 'Jun 1'}</div>
                    </div>
                    <div class="dat-timeline-node dest" style="margin-bottom:0;">
                        <span style="font-weight: 800;">${ld.destination.city}, ${ld.destination.state} (${ld.destination.dh_d || 0})</span>
                    </div>
                </div>
                
                <div class="dat-details-spec-grid" style="margin-top:5px;">
                    <div class="dat-spec-item">
                        <span class="dat-spec-label">Equipment</span>
                        <span class="dat-spec-value">${ld.equipment.type}</span>
                    </div>
                    <div class="dat-spec-item">
                        <span class="dat-spec-label">Load Type</span>
                        <span class="dat-spec-value">Full</span>
                    </div>
                    <div class="dat-spec-item">
                        <span class="dat-spec-label">Length</span>
                        <span class="dat-spec-value">${ld.equipment.length} ft</span>
                    </div>
                    <div class="dat-spec-item">
                        <span class="dat-spec-label">Weight</span>
                        <span class="dat-spec-value">${ld.equipment.weight.toLocaleString()} lbs</span>
                    </div>
                    <div class="dat-spec-item">
                        <span class="dat-spec-label">Commodity</span>
                        <span class="dat-spec-value">${ld.commodity || '-'}</span>
                    </div>
                    <div class="dat-spec-item">
                        <span class="dat-spec-label">Reference ID</span>
                        <span class="dat-spec-value">${ld.reference_number || ld.load_id}</span>
                    </div>
                </div>
                
                <div style="font-size:0.8rem; margin-top:8px; display:flex; flex-direction:column; gap:2px;">
                    <span style="font-weight:800; color:#475569; text-transform:uppercase; font-size:0.68rem; letter-spacing:0.05em;">Contact Information</span>
                    <span style="font-weight:800; color:#1d4ed8; font-size:0.9rem;">${ld.broker.phone || '(800) 555-0199'}</span>
                </div>
                
                <div style="font-size:0.8rem; margin-top:8px; display:flex; flex-direction:column; gap:2px;">
                    <span style="font-weight:800; color:#475569; text-transform:uppercase; font-size:0.68rem; letter-spacing:0.05em;">Comments</span>
                    <p style="margin:2px 0 0 0; color:#475569; font-style:italic; line-height:1.4; font-size:0.78rem;">${ld.notes || 'No comments left by broker.'}</p>
                </div>
            </div>
            
            <!-- COLUMN 2: RATE & MARKET DATA -->
            <div class="dat-details-col">
                <div class="dat-details-title">Rate</div>
                <table style="width:100%; border-collapse:collapse; font-size:0.85rem; margin-top:5px;">
                    <tr style="border-bottom:1.5px solid #f1f5f9;">
                        <td style="padding:10px 0; color:#64748b; font-weight:700;">Total</td>
                        <td style="padding:10px 0; text-align:right; font-weight:900; font-size:1.1rem; color:#0f172a;">$${ld.rate.toLocaleString()}</td>
                    </tr>
                    <tr style="border-bottom:1.5px solid #f1f5f9;">
                        <td style="padding:10px 0; color:#64748b; font-weight:700;">Trip</td>
                        <td style="padding:10px 0; text-align:right; font-weight:800; color:#0f172a;">${ld.miles} mi</td>
                    </tr>
                    <tr style="border-bottom:1.5px solid #f1f5f9;">
                        <td style="padding:10px 0; color:#64748b; font-weight:700;">Rate / mile</td>
                        <td style="padding:10px 0; text-align:right; font-weight:800; color:#0f172a;">$${ld.rpm.toFixed(2)} <span style="color:#94a3b8; font-weight:500; cursor:pointer;" title="Standard rate per mile calculated on total distance.">ⓘ</span></td>
                    </tr>
                </table>
                
                <div class="dat-rates-card" style="margin-top:15px; border:1px solid #cbd5e1; border-radius:8px; padding:15px; background:#f8fafc;">
                    <span style="font-weight:800; color:#475569; text-transform:uppercase; font-size:0.65rem; display:block; letter-spacing:0.05em; margin-bottom:8px;">MARKET RATES Powered by DAT IQ <span style="float:right; color:#1d4ed8; cursor:pointer; font-weight:800; text-decoration:underline;">RATEVIEW</span></span>
                    <div style="display:flex; align-items:center; gap:12px; margin-top:8px;">
                        <div style="font-size:1.65rem; line-height:1;">📦</div>
                        <div style="font-size:0.75rem; color:#64748b; line-height:1.3;">
                            Rates are not available for this subscription.
                            <a href="#" onclick="alert('This premium feature requires a broker carrier agreement. Complete negotiation with the broker directly.'); return false;" style="color:#1d4ed8; text-decoration:underline; font-weight:800; display:block; margin-top:4px;">GET RATES</a>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- COLUMN 3: BROKER PROFILE & ACTIONS -->
            <div class="dat-details-col" style="justify-content: space-between;">
                <div>
                    <div class="dat-details-title">Company</div>
                    <div style="font-weight:900; color:#0f172a; font-size:1rem;">${ld.broker.company}</div>
                    <div style="font-size:0.8rem; color:#475569; margin-top:4px; font-weight:700;">${ld.broker.phone || '(800) 555-0199'}</div>
                    <div style="font-size:0.8rem; color:#64748b; font-weight:600; margin-top:2px;">MC#${ld.broker.mc_number || '862463'}</div>
                    <div style="font-size:0.8rem; color:#64748b; margin-top:2px;">${ld.broker.location || 'Chicago, IL'}</div>
                    
                    <div class="dat-factoring-badge" style="margin-top:15px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:12px; color:#1e40af; font-weight:700; display:flex; flex-direction:column; gap:4px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="font-size:1.15rem; line-height:1;">💰</span>
                            <span style="text-transform:uppercase; font-size:0.72rem; letter-spacing:0.05em; font-weight:800;">Factoring Eligible</span>
                        </div>
                        <span style="font-size:0.65rem; color:#64748b; font-weight:500;">Enabled by DAT Outgo</span>
                    </div>
                    
                    <div style="margin-top:15px; display:flex; align-items:center; gap:6px;">
                        <span style="color:#fbbf24; font-size:1rem;">★★★★☆</span>
                        <span style="font-size:0.75rem; color:#64748b; font-weight:600;">(1,020 reviews)</span>
                    </div>
                </div>
                
                <div>
                    <div class="dat-actions-bar" style="display:flex; gap:10px; margin-top:15px;">
                        <button class="btn-call" onclick="startBrokerCall('${ld.load_id}')" style="flex:1; padding:12px; border-radius:8px; background:#1d4ed8; color:white; font-weight:800; font-size:0.8rem; cursor:pointer; border:none; transition:all 0.2s;">Call Broker 📞</button>
                        <button class="btn-email" onclick="startBrokerEmail('${ld.load_id}')" style="flex:1; padding:12px; border-radius:8px; background:#475569; color:white; font-weight:800; font-size:0.8rem; cursor:pointer; border:none; transition:all 0.2s;">Email Broker 📧</button>
                        <button class="btn-book" onclick="bookLoadDirectly('${ld.load_id}')" style="flex:1; padding:12px; border-radius:8px; background:#10b981; color:white; font-weight:800; font-size:0.8rem; cursor:pointer; border:none; transition:all 0.2s;">Book Load 🚛</button>
                    </div>
                    
                    <div style="margin-top:10px; display:flex; gap:10px;">
                        <select onchange="handleMarkAs(this, '${ld.load_id}')" style="width:100%; padding:10px 14px; border-radius:8px; border:1.5px solid #cbd5e1; font-weight:800; font-size:0.8rem; outline:none; background:white; color:#334155; cursor:pointer; font-family:inherit;">
                            <option value="">MARK AS...</option>
                            <option value="high-priority">★ High Priority</option>
                            <option value="saved">💾 Save Load</option>
                            <option value="ignore">☒ Hide Row</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
        
        // Grid Row click toggles expanded pane
        row.addEventListener("click", () => {
            const isCurrentlyExpanded = wrapper.classList.contains("expanded");
            
            // Collapse all other rows for perfect clean focus
            container.querySelectorAll(".dat-load-row-container").forEach(c => {
                c.classList.remove("expanded");
                const detailPane = c.querySelector(".dat-expand-details-pane");
                if (detailPane) detailPane.style.display = "none";
            });
            
            if (!isCurrentlyExpanded) {
                wrapper.classList.add("expanded");
                pane.style.display = "grid";
            }
        });
        
        wrapper.appendChild(row);
        wrapper.appendChild(pane);
        container.appendChild(wrapper);
    });
}

// ═══════════════ HIGH FIDELITY INLINE ACTION HANDLERS ═══════════════

function startBrokerCall(loadId, externalLoad = null) {
    const load = externalLoad || simLoadedLoads.find(l => l.load_id === loadId);
    if (!load) return;
    
    // Normalize string-based origin/dest from DAT Simulator into objects expected by the backend
    if (typeof load.origin === 'string') {
        const parts = load.origin.split(',').map(s => s.trim());
        load.origin = { city: parts[0] || load.origin, state: parts[1] || '' };
    }
    if (typeof load.destination === 'string') {
        const parts = load.destination.split(',').map(s => s.trim());
        load.destination = { city: parts[0] || load.destination, state: parts[1] || '' };
    }

    simActiveLoad = load;
    
    // Store source to know how to redirect back on hang up
    localStorage.setItem("broker_call_source", "embedded_dat");
    
    // 1. Switch to Practice Mode UI globally
    const practiceTab = document.querySelector('.academy-tab-btn[data-view="practice-mode"]');
    if (practiceTab) {
        practiceTab.click();
    } else if (typeof togglePracticeModeView === 'function') {
        togglePracticeModeView(true);
    } else {
        switchSimView("broker-calls");
    }
    
    // 2. Set up global state for script.js to intercept
    window.isBrokerPracticeMode = true;
    window.activeBrokerLoad = load;
    
    // 3. Reset UI for Broker Call
    const modal = document.getElementById('tech-modal');
    if (modal) modal.style.display = 'none';
    
    const chatEl = document.getElementById("chat");
    if (chatEl) {
        chatEl.innerHTML = "";
        chatEl.style.display = "block";
    }
    
    const bName = typeof load.broker === 'string' ? load.broker : (load.broker?.name || "Broker");
    const bComp = typeof load.broker === 'string' ? load.broker : (load.broker?.company || "Logistics");
    const actualLoadId = load.load_id || load.reference_number || "SIM-12345";

    const callerName = document.querySelector(".caller-name");
    if (callerName) callerName.textContent = bName + " (" + bComp + ")";
    
    const callerStatus = document.querySelector(".caller-status");
    if (callerStatus) callerStatus.textContent = "Connecting... 📞";

    // 4. Initialize Call State
    simActiveCall.loadId = actualLoadId;
    simActiveCall.brokerName = bName;
    simActiveCall.turnCount = 1;
    simActiveCall.history = [];
    
    // 5. Connect Call to Simulator Backend
    fetch(`${SIM_API_BASE}/api/sim/calls/initiate`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            load_id: actualLoadId,
            broker_name: bName,
            load: load
        })
    })
    .then(res => res.json())
    .then(data => {
        if (callerStatus) callerStatus.textContent = "Active Call";
        simActiveCall.history.push({q: data.opening_line, a: ""});
        
        if (typeof addMsg === 'function') addMsg("Broker: " + data.opening_line, "bot");
        if (typeof speak === 'function') speak(data.opening_line, null);
        
        const recordBtn = document.getElementById("record");
        if (recordBtn) recordBtn.disabled = false;
        
        if (typeof startTimer === 'function') startTimer();
    })
    .catch(err => {
        console.error("Failed to initiate broker call", err);
        if (callerStatus) callerStatus.textContent = "Connection Failed";
    });
}

function startBrokerEmail(loadId) {
    const load = simLoadedLoads.find(l => l.load_id === loadId);
    if (!load) return;
    simActiveLoad = load;
    switchSimView("emails");
    openComposeEmailModal(load);
}

async function bookLoadDirectly(loadId) {
    const load = simLoadedLoads.find(l => l.load_id === loadId);
    if (!load) return;
    simActiveLoad = load;
    
    // Choose available carrier matching load
    const carrier = simStudent.carriers.find(c => c.truck_type === load.equipment.type && c.status === "Available");
    if (!carrier) {
        alert(`❌ Alert: You do not have an Available ${load.equipment.type} carrier in your roster! Assign a different carrier or release one from another trip.`);
        return;
    }
    const carrierId = carrier.carrier_id;
    
    try {
        const resp = await fetch(`${SIM_API_BASE}/api/sim/loads/book`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                email: simStudent.email,
                load_id: load.load_id,
                carrier_id: carrierId,
                rate: load.rate
            })
        });
        
        if (resp.ok) {
            const data = await resp.json();
            alert(`🎉 Success! Load booked! Commission earned: $${data.commission.toFixed(2)}`);
            refreshSimDashboard();
            querySimLoads();
        } else {
            const errorMsg = await resp.text();
            alert(`Failed to book load: ${errorMsg}`);
        }
    } catch (e) {
        alert("Failed to book load.");
    }
}

function handleMarkAs(select, loadId) {
    const action = select.value;
    if (!action) return;
    
    const wrapper = select.closest(".dat-load-row-container");
    if (!wrapper) return;
    
    if (action === "high-priority") {
        wrapper.style.borderLeft = "6px solid #f59e0b";
        alert("★ Load marked as HIGH PRIORITY.");
    } else if (action === "saved") {
        alert("💾 Load successfully saved to your Cadet Workspace!");
    } else if (action === "ignore") {
        wrapper.style.transition = "all 0.5s ease-out";
        wrapper.style.opacity = "0.2";
        wrapper.style.transform = "translateX(-20px)";
        setTimeout(() => {
            wrapper.style.display = "none";
        }, 500);
    }
    
    // Reset selection index
    select.selectedIndex = 0;
}

function swapSearchCities() {
    const originInput = document.getElementById("sim-filter-origin");
    const destInput = document.getElementById("sim-filter-destination");
    if (!originInput || !destInput) return;
    
    const temp = originInput.value;
    originInput.value = destInput.value;
    destInput.value = temp;
    
    // Also swap DH fields
    const dhoInput = document.getElementById("sim-filter-dho");
    const dhdInput = document.getElementById("sim-filter-dhd");
    if (dhoInput && dhdInput) {
        const tempDh = dhoInput.value;
        dhoInput.value = dhdInput.value;
        dhdInput.value = tempDh;
    }
    
    console.log("[Simulator] Swapped search filters.");
}

function openLoadDrawer(load) {
    simActiveLoad = load;
    
    document.getElementById("sim-drawer-ref").textContent = load.load_id;
    document.getElementById("sim-drawer-origin").textContent = `${load.origin.city}, ${load.origin.state} (DH-O: ${load.origin.dh_o} mi)`;
    document.getElementById("sim-drawer-dest").textContent = `${load.destination.city}, ${load.destination.state} (DH-D: ${load.destination.dh_d} mi)`;
    document.getElementById("sim-drawer-miles").textContent = `${load.miles} mi`;
    document.getElementById("sim-drawer-rate").textContent = `$${load.rate.toLocaleString()}`;
    document.getElementById("sim-drawer-rpm").textContent = `$${load.rpm.toFixed(2)}/mi`;
    document.getElementById("sim-drawer-commodity").textContent = load.commodity;
    document.getElementById("sim-drawer-equip").textContent = `${load.equipment.type} - ${load.equipment.length}ft / ${load.equipment.weight.toLocaleString()} lbs`;
    document.getElementById("sim-drawer-broker").textContent = `${load.broker.name} | ${load.broker.company} (Credit: ${load.broker.credit_score} CS | DTP: ${load.broker.dtp} Days)`;
    document.getElementById("sim-drawer-notes").textContent = load.notes;
    
    document.getElementById("sim-drawer-overlay").style.display = "block";
    document.getElementById("sim-drawer").classList.add("active");
}

function closeLoadDrawer() {
    document.getElementById("sim-drawer-overlay").style.display = "none";
    document.getElementById("sim-drawer").classList.remove("active");
}

// Action button triggers from drawer
function triggerBrokerCallFromDrawer() {
    if (!simInitialized) { initSimulator(); return; }
    closeLoadDrawer();
    switchSimView("broker-calls");
    startCallSimulation(simActiveLoad);
}

function triggerEmailFromDrawer() {
    closeLoadDrawer();
    switchSimView("emails");
    openComposeEmailModal(simActiveLoad);
}

async function triggerDirectBook() {
    if (!simActiveLoad) return;
    
    // Choose available carrier matching load
    const carrier = simStudent.carriers.find(c => c.truck_type === simActiveLoad.equipment.type && c.status === "Available");
    const carrierId = carrier ? carrier.carrier_id : null;
    
    try {
        const resp = await fetch(`${SIM_API_BASE}/api/sim/loads/book`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                email: simStudent.email,
                load_id: simActiveLoad.load_id,
                carrier_id: carrierId,
                rate: simActiveLoad.rate
            })
        });
        
        if (resp.ok) {
            const data = await resp.json();
            alert(`🎉 Success! Load booked! Commission earned: $${data.commission.toFixed(2)}`);
            closeLoadDrawer();
            refreshSimDashboard();
            querySimLoads();
            
            // Display booking documents
            if (data.documents) {
                window.currentBookingDocuments = data.documents;
                document.getElementById('sim-documents-modal').style.display = 'flex';
                switchDocTab('rate_confirmation');
            }
        }
    } catch (e) {
        alert("Failed to book load.");
    }
}

// ═══════════════ AI BROKER VOICE ROLEPLAY ═══════════════

async function startCallSimulation(load) {
    simActiveCall.loadId = load.load_id;
    simActiveCall.brokerName = load.broker.name;
    simActiveCall.turnCount = 1;
    simActiveCall.history = [];
    
    document.getElementById("sim-call-name").textContent = `${load.broker.name} (${load.broker.company})`;
    document.getElementById("sim-call-status").textContent = "Connecting... 📞";
    document.getElementById("sim-call-transcript").innerHTML = "<i>Dialing broker line...</i>";
    
    try {
        const resp = await fetch(`${SIM_API_BASE}/api/sim/calls/initiate`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                load_id: load.load_id,
                broker_name: load.broker.name,
                load: load
            })
        });
        
        if (resp.ok) {
            const data = await resp.json();
            document.getElementById("sim-call-status").textContent = "Connected 🟢";
            document.getElementById("sim-call-avatar").classList.add("talking");
            
            // Render text line
            document.getElementById("sim-call-transcript").innerHTML = `Broker: "<strong>${data.opening_line}</strong>"`;
            simActiveCall.history.push({q: data.opening_line, a: ""});
            
            // Speak opening line via synthesis
            speakSpeechLine(data.opening_line);
        }
    } catch (e) {
        document.getElementById("sim-call-status").textContent = "Connection Failed 🛑";
    }
}

function speakSpeechLine(text) {
    if (simActiveCall.isMuted) return;
    
    // Stop any active speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    
    utterance.onend = () => {
        document.getElementById("sim-call-avatar").classList.remove("talking");
    };
    
    document.getElementById("sim-call-avatar").classList.add("talking");
    window.speechSynthesis.speak(utterance);
}

// Speech recognition controller
function toggleCallVoiceRecording() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Browser Speech Recognition not supported. Please type in the counter-offer box.");
        return;
    }
    
    if (simActiveCall.isRecording) {
        simActiveCall.recognition.stop();
        simActiveCall.isRecording = false;
        document.getElementById("sim-call-voice-btn").textContent = "🎙️ Speak Offer";
    } else {
        simActiveCall.recognition = new SpeechRecognition();
        simActiveCall.recognition.continuous = false;
        simActiveCall.recognition.lang = 'en-US';
        
        simActiveCall.recognition.onstart = () => {
            simActiveCall.isRecording = true;
            document.getElementById("sim-call-voice-btn").textContent = "⏹️ Stop";
            document.getElementById("sim-call-transcript").innerHTML = "<i>Listening... Speak offer rate clearly.</i>";
        };
        
        simActiveCall.recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            document.getElementById("sim-call-transcript").innerHTML = `You: "<strong>${text}</strong>"`;
            
            // Attempt to extract numeric rate from text
            const rateMatch = text.match(/\d[\d,\.]*/);
            if (rateMatch) {
                const parsedRate = parseInt(rateMatch[0].replace(/,/g, ""));
                document.getElementById("sim-call-offer-input").value = parsedRate;
            }
        };
        
        simActiveCall.recognition.onend = () => {
            simActiveCall.isRecording = false;
            document.getElementById("sim-call-voice-btn").textContent = "🎙️ Speak Offer";
        };
        
        simActiveCall.recognition.start();
    }
}

async function submitNegotiateTurn() {
    const offerInput = document.getElementById("sim-call-offer-input");
    const offer = parseInt(offerInput.value);
    if (isNaN(offer) || offer <= 0) {
        alert("Please specify a valid numeric offer rate.");
        return;
    }
    
    // Register student action in active turn
    if (simActiveCall.history.length > 0) {
        simActiveCall.history[simActiveCall.history.length - 1].a = `I need $${offer} to cover operations in this lane.`;
    }
    
    document.getElementById("sim-call-status").textContent = "Negotiating... ⏳";
    offerInput.value = "";
    
    try {
        const resp = await fetch(`${SIM_API_BASE}/api/sim/calls/negotiate`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                broker_name: simActiveCall.brokerName,
                load_id: simActiveCall.loadId,
                load: simActiveLoad,
                student_offer: offer,
                history: simActiveCall.history,
                turn_count: simActiveCall.turnCount
            })
        });
        
        if (resp.ok) {
            const data = await resp.json();
            simActiveCall.turnCount++;
            
            if (data.status === "Hung Up" || data.status === "Booked") {
                document.getElementById("sim-call-status").textContent = data.status === "Booked" ? "Booked 🟢" : "Disconnected 🔴";
                document.getElementById("sim-call-transcript").innerHTML = `Broker: "<strong>${data.dialogue}</strong>"`;
                speakSpeechLine(data.dialogue);
                
                if (data.status === "Booked") {
                    // Update stats
                    alert("🎉 Commission Earned! Load Booked via Voice Desk.");
                    triggerDirectBook(); // Note: this will re-call the /loads/book endpoint, which handles money and documents
                } else {
                    alert("❌ Call failed. The broker hung up on you.");
                }
                return;
            }
            
            document.getElementById("sim-call-status").textContent = "Connected 🟢";
            document.getElementById("sim-call-transcript").innerHTML = `Broker: "<strong>${data.dialogue}</strong>"`;
            
            // Save step
            simActiveCall.history.push({q: data.dialogue, a: ""});
            speakSpeechLine(data.dialogue);
        }
    } catch (e) {
        document.getElementById("sim-call-status").textContent = "Error";
    }
}

function terminateActiveCall() {
    window.speechSynthesis.cancel();
    alert("Call hung up.");
    switchSimView("loadboard");
}

// ═══════════════ AI EMAIL NEGOTIATION DESK ═══════════════

async function querySimEmails() {
    const list = document.getElementById("sim-emails-list");
    if (!list) return;
    
    list.innerHTML = `<div style="text-align:center; padding:30px; color:var(--sim-text-muted);">Syncing secure inbox...</div>`;
    
    try {
        const resp = await fetch(`${SIM_API_BASE}/api/sim/emails?email=${encodeURIComponent(simStudent.email)}`);
        if (resp.ok) {
            const emails = await resp.json();
            renderEmailsGrid(emails);
        }
    } catch (e) {
        list.innerHTML = `<div style="color:var(--sim-bright-red); text-align:center;">Failed to load inbox.</div>`;
    }
}

function renderEmailsGrid(emails) {
    const list = document.getElementById("sim-emails-list");
    if (!list) return;
    list.innerHTML = "";
    
    if (emails.length === 0) {
        list.innerHTML = `<div style="text-align:center; padding:40px; color:var(--sim-text-muted);">Email inbox is empty. Select a load on the load board and click "Email Broker" to begin.</div>`;
        return;
    }
    
    emails.forEach(msg => {
        const row = document.createElement("div");
        row.className = `sim-email-row ${!msg.read ? 'unread' : ''}`;
        
        const date = new Date(msg.timestamp);
        const timeStr = date.toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'});
        
        row.innerHTML = `
            <div class="sim-email-sender">${msg.sender}</div>
            <div style="font-weight: 600;">${msg.subject}</div>
            <div style="color: var(--sim-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right:15px;">
                ${msg.body}
            </div>
            <div style="text-align:right;">${timeStr}</div>
        `;
        
        row.addEventListener("click", () => openEmailDetails(msg));
        list.appendChild(row);
    });
}

function openComposeEmailModal(load) {
    document.getElementById("sim-compose-broker").value = load.broker.name;
    document.getElementById("sim-compose-subject").value = `Carrier Booking Inquiry: REF${load.reference_number}`;
    document.getElementById("sim-compose-body").value = `Hi ${load.broker.name},\n\nWe have a ${load.equipment.type} empty in ${load.origin.city}, ${load.origin.state} ready to roll. What's the absolute best rate you can do on your lane REF${load.reference_number}?\n\nBest,\nDispatcher`;
    
    // Clear credentials checks
    document.getElementById("sim-attach-w9").checked = false;
    document.getElementById("sim-attach-insurance").checked = false;
    document.getElementById("sim-attach-packet").checked = false;
    
    document.getElementById("sim-compose-modal").style.display = "flex";
}

function closeComposeEmailModal() {
    document.getElementById("sim-compose-modal").style.display = "none";
}

async function sendDispatcherEmail() {
    const brokerName = document.getElementById("sim-compose-broker").value;
    const body = document.getElementById("sim-compose-body").value;
    
    const attachments = [];
    if (document.getElementById("sim-attach-w9").checked) attachments.push("W9_Form.pdf");
    if (document.getElementById("sim-attach-insurance").checked) attachments.push("Certificate_Of_Insurance.pdf");
    if (document.getElementById("sim-attach-packet").checked) attachments.push("Broker_Carrier_Packet.pdf");
    
    closeComposeEmailModal();
    alert("Email message sent successfully! Awaiting broker setup check...");
    
    try {
        const resp = await fetch(`${SIM_API_BASE}/api/sim/emails/reply`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                email: simStudent.email,
                broker_name: brokerName,
                body: body,
                attachments: attachments,
                history: [],
                load: simActiveLoad
            })
        });
        
        if (resp.ok) {
            refreshSimDashboard();
            querySimEmails();
        }
    } catch (e) {
        alert("Failed to send email.");
    }
}

function openEmailDetails(msg) {
    document.getElementById("sim-email-detail-sender").textContent = `From: ${msg.sender}`;
    document.getElementById("sim-email-detail-subject").textContent = msg.subject;
    document.getElementById("sim-email-detail-body").textContent = msg.body;
    
    // Display Grading scorecard if present (meaning it is a response from the AI broker)
    const card = document.getElementById("sim-email-scorecard");
    if (msg.scores) {
        card.style.display = "block";
        document.getElementById("sim-score-grammar").textContent = `${msg.scores.grammar}%`;
        document.getElementById("sim-score-prof").textContent = `${msg.scores.professionalism}%`;
        document.getElementById("sim-score-know").textContent = `${msg.scores.knowledge}%`;
        document.getElementById("sim-score-close").textContent = `${msg.scores.closing}%`;
        document.getElementById("sim-score-feedback").textContent = msg.feedback;
    } else {
        card.style.display = "none";
    }
    
    document.getElementById("sim-email-detail-modal").style.display = "flex";
}

function closeEmailDetailsModal() {
    document.getElementById("sim-email-detail-modal").style.display = "none";
}

// ═══════════════ CARRIER & SCENARIO ENGINE ═══════════════

function renderSimCarriers() {
    const container = document.getElementById("sim-carriers-container");
    if (!container) return;
    container.innerHTML = "";
    
    simStudent.carriers.forEach(c => {
        const div = document.createElement("div");
        div.className = "sim-hud-card";
        div.style.padding = "20px";
        
        let statusColor = "var(--sim-glowing-green)";
        if (c.status === "On Trip") statusColor = "var(--sim-accent-blue)";
        
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="sim-hud-label">${c.name}</span>
                <span style="color:${statusColor}; font-size:0.75rem; font-weight:800;">● ${c.status}</span>
            </div>
            <div style="font-size:1.15rem; font-weight:800; margin:8px 0;">${c.driver} (${c.truck_type})</div>
            <div style="font-size:0.8rem; color:var(--sim-text-muted);">📍 Empty: ${c.city}, ${c.state}</div>
            <div style="display:flex; gap:10px; margin-top:12px;">
                <button onclick="searchLoadsForCarrier('${c.truck_type}', '${c.city}')" style="flex:1; padding:8px; font-size:0.75rem; border-radius:4px; background:var(--sim-accent-blue); color:#fff; border:none; cursor:pointer;">Search Loads 🔍</button>
                ${c.status === "On Trip" ? `<button onclick="restoreCarrierAvailability('${c.carrier_id}')" style="padding:8px; font-size:0.75rem; border-radius:4px; background:rgba(255,255,255,0.08); color:#fff; border:none; cursor:pointer;">Complete Trip ✓</button>` : ''}
            </div>
        `;
        container.appendChild(div);
    });
}

function searchLoadsForCarrier(type, city) {
    switchSimView("loadboard");
    document.getElementById("sim-filter-origin").value = city;
    document.getElementById("sim-filter-equipment").value = type;
    querySimLoads();
}

async function restoreCarrierAvailability(id) {
    try {
        const resp = await fetch(`${SIM_API_BASE}/api/sim/carriers/status`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                email: simStudent.email,
                carrier_id: id,
                status: "Available"
            })
        });
        if (resp.ok) {
            refreshSimDashboard();
        }
    } catch (e) {
        console.error(e);
    }
}

function renderSimScenarios() {
    const grid = document.getElementById("sim-scenarios-grid");
    if (!grid) return;
    grid.innerHTML = "";
    
    simScenarios.forEach(sc => {
        const card = document.createElement("div");
        card.className = "sim-hud-card";
        card.style.padding = "20px";
        
        let diffColor = "var(--sim-glowing-green)";
        if (sc.difficulty === "Advanced") diffColor = "#f59e0b";
        else if (sc.difficulty === "Expert") diffColor = "var(--sim-bright-red)";
        
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span style="color:${diffColor}; font-size:0.7rem; font-weight:800; text-transform:uppercase;">${sc.difficulty}</span>
                <span class="sim-hud-label">${sc.category}</span>
            </div>
            <div style="font-size:1.15rem; font-weight:800; margin-bottom:6px;">${sc.title}</div>
            <p style="font-size:0.8rem; color:var(--sim-text-muted); margin:0 0 15px 0; line-height:1.4;">${sc.description}</p>
            <button onclick="startTrainingScenario('${sc.scenario_id}')" style="width:100%; padding:10px; font-weight:700; border-radius:6px; background:rgba(0,180,216,0.15); color:var(--sim-accent-blue); border:1px solid rgba(0,180,216,0.3); cursor:pointer;">Initialize Mission ⚡</button>
        `;
        grid.appendChild(card);
    });
}

function startTrainingScenario(id) {
    const sc = simScenarios.find(s => s.scenario_id === id);
    if (!sc) return;
    
    alert(`🚀 Initializing scenario directive: ${sc.title}\n\nObjective: ${sc.instructions}`);
    switchSimView("loadboard");
}

// ═══════════════ AI DISPATCHER TUTOR ASSISTANT ═══════════════

async function askSimTutor() {
    const queryInput = document.getElementById("sim-tutor-query");
    const query = queryInput.value.trim();
    if (!query) return;
    
    const container = document.getElementById("sim-tutor-chat");
    if (!container) return;
    
    // Add user question
    const userMsg = document.createElement("div");
    userMsg.style.alignSelf = "flex-end";
    userMsg.style.background = "var(--sim-accent-blue)";
    userMsg.style.padding = "12px 16px";
    userMsg.style.borderRadius = "12px 12px 0 12px";
    userMsg.style.fontSize = "0.85rem";
    userMsg.style.maxWidth = "80%";
    userMsg.innerHTML = `<strong>You:</strong> ${query}`;
    container.appendChild(userMsg);
    
    queryInput.value = "";
    
    const botMsg = document.createElement("div");
    botMsg.style.alignSelf = "flex-start";
    botMsg.style.background = "var(--sim-navy-card)";
    botMsg.style.border = "1px solid var(--sim-border)";
    botMsg.style.padding = "12px 16px";
    botMsg.style.borderRadius = "12px 12px 12px 0";
    botMsg.style.fontSize = "0.85rem";
    botMsg.style.maxWidth = "80%";
    botMsg.innerHTML = "<i>Director is typing... ⏳</i>";
    container.appendChild(botMsg);
    
    container.scrollTop = container.scrollHeight;
    
    try {
        const resp = await fetch(`${SIM_API_BASE}/api/sim/assistant/ask`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({query: query})
        });
        if (resp.ok) {
            const data = await resp.json();
            botMsg.innerHTML = `<strong>Tutor Director:</strong><br><br>${data.response.replace(/\n/g, "<br>")}`;
            container.scrollTop = container.scrollHeight;
        }
    } catch (e) {
        botMsg.innerHTML = "Tutor Connection timeout.";
    }
}

// ═══════════════ PERFORMANCE ANALYTICS GRAPHICS ═══════════════

function renderAnalyticsGraphs() {
    const el = document.getElementById("sim-analytics-gauge");
    if (!el) return;
    
    // Renders custom SVG gauges tracking student progression
    el.innerHTML = `
        <svg viewBox="0 0 100 100" width="100%" height="100%">
            <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" stroke-width="8" fill="none" />
            <circle cx="50" cy="50" r="40" stroke="var(--sim-accent-blue)" stroke-width="8" fill="none"
                stroke-dasharray="251" stroke-dashoffset="${251 - (251 * (simStudent.booked_loads / 15))}"
                stroke-linecap="round" transform="rotate(-90 50 50)" />
            <text x="50" y="55" font-size="12" font-weight="800" text-anchor="middle" fill="#fff">${simStudent.booked_loads}/15 Loads</text>
        </svg>
    `;
}

// ═══════════════ CERTIFICATION EXAM CONTROLLER ═══════════════

async function submitCadetExam() {
    const answers = {
        q1: document.getElementById("sim-exam-q1").value,
        q2: document.getElementById("sim-exam-q2").value,
        q3: document.getElementById("sim-exam-q3").value,
        q4: document.getElementById("sim-exam-q4").value,
        q5: document.getElementById("sim-exam-q5").value
    };
    
    try {
        const resp = await fetch(`${SIM_API_BASE}/api/sim/exam/submit`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                email: simStudent.email,
                answers: answers
            })
        });
        
        if (resp.ok) {
            const data = await resp.json();
            
            // Clear inputs
            document.getElementById("sim-exam-q1").value = "";
            document.getElementById("sim-exam-q2").value = "";
            document.getElementById("sim-exam-q3").value = "";
            document.getElementById("sim-exam-q4").value = "";
            document.getElementById("sim-exam-q5").value = "";
            
            const details = document.getElementById("sim-exam-feedback-list");
            details.innerHTML = data.feedback.map(f => `<div style="padding:6px; border-bottom:1px solid rgba(255,255,255,0.05); font-size:0.85rem;">${f}</div>`).join("");
            
            if (data.passed) {
                document.getElementById("sim-cert-card-student").textContent = data.certificate.student_name;
                document.getElementById("sim-cert-card-grade").textContent = `${data.certificate.grade}% Passing Grade`;
                document.getElementById("sim-cert-card-hash").textContent = `VERIFIED: ${data.certificate.verifiable_hash.toUpperCase()}`;
                
                document.getElementById("sim-exam-success").style.display = "block";
                document.getElementById("sim-exam-failed").style.display = "none";
            } else {
                document.getElementById("sim-exam-success").style.display = "none";
                document.getElementById("sim-exam-failed").style.display = "block";
            }
            
            document.getElementById("sim-exam-results-modal").style.display = "flex";
        }
    } catch (e) {
        alert("Failed to submit exam.");
    }
}

function closeExamResultsModal() {
    document.getElementById("sim-exam-results-modal").style.display = "none";
    refreshSimDashboard();
}

function downloadCertificatePDF() {
    window.print();
}

// ═══════════════ AUTO EMAIL GENERATION ═══════════════

async function generateDraftEmail() {
    const topic = document.getElementById("sim-compose-topic").value;
    const loadId = simActiveLoad ? simActiveLoad.load_id : "UNKNOWN";
    const brokerName = document.getElementById("sim-compose-broker").value || "Broker";
    
    document.getElementById("sim-compose-body").value = "Drafting email with AI Assistant... please wait.";
    
    try {
        const resp = await fetch(`${SIM_API_BASE}/api/sim/emails/draft`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                topic: topic,
                load_id: loadId,
                broker_name: brokerName
            })
        });
        
        if (resp.ok) {
            const data = await resp.json();
            document.getElementById("sim-compose-body").value = data.body;
        } else {
            document.getElementById("sim-compose-body").value = "Error generating email. Please try again.";
        }
    } catch (e) {
        document.getElementById("sim-compose-body").value = "Network error while generating email.";
    }
}

// ═══════════════ BOOKING DOCUMENT FLOW ═══════════════

window.currentBookingDocuments = null;

function switchDocTab(docKey) {
    // Update active tab styling
    const tabs = document.querySelectorAll("#sim-documents-modal .doc-tab-btn");
    tabs.forEach(t => {
        t.classList.remove('active');
        t.style.background = '#0f172a';
        t.style.border = '1px solid var(--sim-border)';
    });
    
    // Quick and dirty way to find the clicked tab by looking at text or mapping
    const tabMap = {
        'rate_confirmation': 0,
        'carrier_packet': 1,
        'dispatch_sheet': 2,
        'pod': 3,
        'invoice': 4,
        'bol': 5,
        'lumper_receipt': 6,
        'detention_form': 7,
        'tonu_form': 8
    };
    const clickedTab = tabs[tabMap[docKey]];
    if (clickedTab) {
        clickedTab.classList.add('active');
        clickedTab.style.background = 'var(--sim-accent-blue)';
        clickedTab.style.border = 'none';
    }
    
    // Inject HTML content
    const viewer = document.getElementById('sim-document-viewer');
    if (window.currentBookingDocuments && window.currentBookingDocuments[docKey]) {
        viewer.innerHTML = window.currentBookingDocuments[docKey];
    } else {
        viewer.innerHTML = "<div style='padding: 20px; text-align: center;'>Document content not available.</div>";
    }
}

function printCurrentDocument() {
    const viewer = document.getElementById('sim-document-viewer');
    if (!viewer || !viewer.innerHTML) {
        alert("No document to print.");
        return;
    }

    // Open a temporary window, inject the document HTML, and call print()
    const printWin = window.open('', '_blank');
    printWin.document.write(`
        <html>
        <head>
            <title>Print Document - B2B Dispatcher Simulator</title>
            <style>
                body { margin: 0; padding: 20px; background: #fff; }
                @media print {
                    @page { margin: 0.5cm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            ${viewer.innerHTML}
            <script>
                window.onload = function() { window.print(); window.close(); }
            </script>
        </body>
        </html>
    `);
    printWin.document.close();
}

const handleBrokerCallMessage = (event) => {
    if (event.data && event.data.type === "START_BROKER_CALL") {
        const load = event.data.load;
        if (load && typeof startBrokerCall === "function") {
            const loadId = load.load_id || load.reference_number;
            console.log("Received START_BROKER_CALL for load:", loadId);
            startBrokerCall(loadId, load);
            
            // Attempt to bring the main window to the front
            try {
                window.focus();
            } catch (e) {}
        }
    }
};

window.addEventListener("message", handleBrokerCallMessage);

try {
    const bc = new BroadcastChannel('b2b-dispatcher-channel');
    bc.onmessage = handleBrokerCallMessage;
} catch (e) {
    console.warn("BroadcastChannel not supported or failed to initialize:", e);
}
