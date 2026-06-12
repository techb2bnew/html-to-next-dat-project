// Simple, ultra-robust API Base Detection for Admin
const API_BASE = (window.__APP_CONFIG__ && window.__APP_CONFIG__.apiUrl) || "https://b2b-bck.onrender.com";

console.log(`[System] Admin Panel context: Port=${window.location.port}, Host=${window.location.hostname}`);
console.log(`[System] API Base configured as: "${API_BASE || '(relative to current port)'}"`);

let ADMIN_SECRET_KEY = "";
let _AE = "";
let _AP = "";

try {
    const _A = atob("YjJiQGdtYWlsLmNvbTo4ODQ3NjQxOTE3"); // b2b@gmail.com:8847641917
    const parts = _A.split(":");
    _AE = parts[0];
    _AP = parts[1];
} catch (e) {
    console.error("System: Failed to load admin credentials.", e);
}

let currentSession = null;

/* ─── ADMIN AUTH ────────────────────────────────────── */

// Admin credentials — this page is served from a private backend URL.
// Students only have the /interviewer.html link, not /admin.html.

async function attemptLogin() {
    const email = (document.getElementById("login-email").value || "").trim().toLowerCase();
    const pw    = (document.getElementById("login-password").value || "");
    const err   = document.getElementById("login-error");

    if (!email || !pw) {
        err.textContent = "❌ Please enter both email and password.";
        err.style.display = "block";
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: email, password: pw })
        });
        
        const data = await res.json();
        
        if (data.status === "success") {
            ADMIN_SECRET_KEY = data.token;
            sessionStorage.setItem("admin_auth", "true");
            sessionStorage.setItem("admin_user", data.username);
            sessionStorage.setItem("admin_token", data.token);
            
            document.getElementById("login-overlay").classList.add("hidden");
            const el = document.getElementById("logged-in-user");
            if (el) el.textContent = "👤 " + data.username;
            err.style.display = "none";
            
            // Load panel data now that we're logged in
            fetchSubmissions();
        } else {
            err.textContent = "❌ " + (data.message || "Invalid credentials");
            err.style.display = "block";
            document.getElementById("login-password").value = "";
            document.getElementById("login-password").focus();
        }
    } catch (e) {
        console.error("Login error:", e);
        err.textContent = "❌ Connection error. Is the backend running?";
        err.style.display = "block";
    }
}

function adminLogout() {
    sessionStorage.removeItem("admin_auth");
    sessionStorage.removeItem("admin_user");
    sessionStorage.removeItem("admin_token");
    ADMIN_SECRET_KEY = "";
    document.getElementById("login-overlay").classList.remove("hidden");
    document.getElementById("login-email").value = "";
    document.getElementById("login-password").value = "";
    document.getElementById("login-error").style.display = "none";
}

function checkAdminAuth() {
    if (sessionStorage.getItem("admin_auth") === "true") {
        ADMIN_SECRET_KEY = sessionStorage.getItem("admin_token") || "";
        document.getElementById("login-overlay").classList.add("hidden");
        const user = sessionStorage.getItem("admin_user") || _AE;
        const el = document.getElementById("logged-in-user");
        if (el) el.textContent = "👤 " + user;
        return true;
    }
    document.getElementById("login-overlay").classList.remove("hidden");
    return false;
}

document.addEventListener("DOMContentLoaded", () => {
    if (!checkAdminAuth()) return; // Show login screen and stop loading
    fetchSubmissions();
});


/* ─── SUBMISSIONS LIST ─────────────────────────────── */

async function fetchSubmissions() {
    const container = document.getElementById("submissions-list");
    const filterEl = document.getElementById("filter-status");

    if (filterEl) {
        filterEl.textContent = "Showing all students";
    }

    container.innerHTML = '<div class="loading-state"><div class="spinner"></div><span>Loading sessions…</span></div>';

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for cold boots

        const targetUrl = `${API_BASE}/admin/submissions`;
        const res = await fetch(targetUrl, {
            headers: { "Authorization": `Bearer ${ADMIN_SECRET_KEY}` },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.status === 401) { adminLogout(); return; }

        let data = await res.json();
        
        container.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = `<div class="empty-state">📋 No submissions found.</div>`;
            return;
        }

        // Sort by created_at descending (latest first)
        data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        renderSubmissionsList(data, container);

    } catch (e) {
        console.error(e);
        const url = `${API_BASE}/admin/submissions`;
        const msg = e.name === 'AbortError' 
            ? `⏳ Request timed out (60s). Server at "${url || 'relative'}" is too slow or down.` 
            : `⚠️ Error loading from "${url}": ${e.message}`;
        container.innerHTML = `<div class="error-state">${msg}</div>`;
    }
}

function renderSubmissionsList(items, container) {
    items.forEach(sub => {
        const div = document.createElement("div");
        div.className = "submission-item";

        const date = new Date(sub.created_at).toLocaleString();
        const statusClass = sub.status === "completed" ? "badge-completed" : "badge-progress";
        const statusLabel = sub.status === "completed" ? "Completed" : "In Progress";

        // Calculate AI avg score
        const answers = sub.answers || [];
        const scored = answers.filter(a => a.ai_score !== null && a.ai_score !== undefined);
        const avgAI = scored.length
            ? (scored.reduce((s, a) => s + Number(a.ai_score), 0) / scored.length).toFixed(1)
            : "—";

        div.innerHTML = `
            <div class="sub-info">
                <div class="sub-name">${sub.student_name || "Guest"}</div>
                <div class="sub-meta">
                    USA Logistics Dispatcher Practice Mode
                </div>
            </div>
            <div class="sub-right">
                <div class="ai-score-pill">AI Avg: <strong>${avgAI}/10</strong></div>
                <div class="sub-date">${date}</div>
                <span class="badge ${statusClass}">${statusLabel}</span>
            </div>
        `;
        div.onclick = () => openSubmission(sub.session_id);
        container.appendChild(div);
    });
}

/* ─── OPEN SUBMISSION MODAL ─────────────────────────── */

async function openSubmission(sessionId) {
    const modal = document.getElementById("eval-modal");
    const container = document.getElementById("modal-qa-container");
    const aiSummaryBox = document.getElementById("ai-summary-box");

    container.innerHTML = '<div class="loading-state"><div class="spinner"></div><span>Loading student details…</span></div>';
    if (aiSummaryBox) aiSummaryBox.innerHTML = "";
    modal.classList.add("active");

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

        const res = await fetch(`${API_BASE}/admin/submission/${sessionId}`, {
            headers: { "Authorization": `Bearer ${ADMIN_SECRET_KEY}` },
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        const data = await res.json();
        currentSession = data;

        document.getElementById("modal-student-name").textContent = data.student_name || "Guest";
        document.getElementById("modal-track").textContent = "Practice Mode: " + (data.track || "Dispatcher");
        
        document.getElementById("overall-improvements").value = data.overall_improvements || "";
        document.getElementById("total-score").textContent = data.total_manual_score || 0;

        renderQA(data);

        // Auto-render precomputed AI summary if available (for challenges or pre-assessed practice)
        if (aiSummaryBox && (data.batch_id === "Dispatcher Challenge" || data.overall_summary)) {
            const recColor = {
                "Strong Dispatcher": "#16a34a",
                "Professional": "#2563eb",
                "Dispatcher": "#2563eb",
                "Average": "#d97706",
                "Needs Improvement": "#dc2626"
            }[data.performance_level] || "#64748b";

            const strengths = (data.key_strengths || []).map(s => `<li>${s}</li>`).join("");
            const weakAreas = (data.weak_areas || []).map(w => `<li>${w}</li>`).join("");
            const suggestions = (data.improvement_suggestions || []).map(s => `<li>${s}</li>`).join("");

            aiSummaryBox.innerHTML = `
                <div class="summary-header">
                    <div>
                        <h3 style="margin:0; font-size:18px;">🤖 AI Challenge Assessment Report</h3>
                        <p style="margin:6px 0 0; color:#6b7280; font-size:14px;">${data.overall_summary || ""}</p>
                    </div>
                    <div style="text-align:right">
                        <div class="ai-overall-score">${data.overall_ai_score || "—"}<span style="font-size:14px;">/10</span></div>
                        <div class="rec-badge" style="background:${recColor}22; color:${recColor}; border:1px solid ${recColor}55;">${data.performance_level || "—"}</div>
                    </div>
                </div>
                <div class="summary-grid">
                    <div class="summary-col strengths">
                        <div class="summary-col-title">✅ Key Strengths</div>
                        <ul>${strengths || "<li>Not identified</li>"}</ul>
                    </div>
                    <div class="summary-col weak-areas">
                        <div class="summary-col-title">⚠️ Weak Areas</div>
                        <ul>${weakAreas || "<li>None significant</li>"}</ul>
                    </div>
                    <div class="summary-col improvements">
                        <div class="summary-col-title">💡 Improvement Suggestions</div>
                        <ul>${suggestions || "<li>—</li>"}</ul>
                    </div>
                </div>
            `;
        }

    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="error-state">Failed to load submission details.</div>';
    }
}

/* ─── RENDER Q&A PER ANSWER ─────────────────────────── */

function renderQA(data) {
    const container = document.getElementById("modal-qa-container");
    container.innerHTML = "";

    if (!data.answers || data.answers.length === 0) {
        container.innerHTML = '<div class="empty-state">No answers recorded yet.</div>';
        return;
    }

    let totalManualScore = 0;

    data.answers.forEach((ans, index) => {
        const manualScore = ans.manual_score !== null && ans.manual_score !== undefined ? ans.manual_score : "";
        if (typeof ans.manual_score === "number") totalManualScore += ans.manual_score;

        const audioUrl = ans.media_path
            ? (ans.media_path.startsWith("http") ? ans.media_path : API_BASE + ans.media_path)
            : "";

        const answerDisplay = ans.answer_text === "[Processing audio...]"
            ? `<div class="processing-glow">Transcribing audio… <span class="dot-jump">.</span><span class="dot-jump">.</span><span class="dot-jump">.</span></div>`
            : (ans.answer_text || "<em style='color:#999'>No answer recorded</em>");

        // Score color
        const aiScore = ans.ai_score;
        const scoreColor = aiScore >= 8 ? "#16a34a" : aiScore >= 5 ? "#d97706" : "#dc2626";

        // Weak points & improvements
        const weakPoints = ans.weak_points && ans.weak_points !== "None" && ans.weak_points.trim()
            ? `<div class="insight-block weak">
                    <div class="insight-label">⚠️ Weak Points</div>
                    <div class="insight-text">${ans.weak_points}</div>
               </div>`
            : `<div class="insight-block strong"><div class="insight-label">✅ No major weak points</div></div>`;

        const improvements = ans.improvements && ans.improvements.trim()
            ? `<div class="insight-block improve">
                    <div class="insight-label">💡 How to Improve</div>
                    <div class="insight-text">${ans.improvements}</div>
               </div>`
            : "";

        const div = document.createElement("div");
        div.className = "qa-block";
        div.innerHTML = `
            <div class="qa-header">
                <div class="q-text">Q${index + 1}: ${ans.question}</div>
                <div class="ai-score-badge" style="background:${scoreColor}22; color:${scoreColor}; border:1px solid ${scoreColor}44;">
                    AI Score: <strong>${aiScore !== null && aiScore !== undefined ? aiScore : "N/A"}/10</strong>
                </div>
            </div>

            <div class="a-text">
                <strong class="answer-label">STUDENT RESPONSE:</strong>
                <div class="answer-body">${answerDisplay}</div>
                ${audioUrl ? `<div class="audio-wrap"><audio controls src="${audioUrl}"></audio></div>` : ""}
            </div>

            <div class="ai-analysis">
                <div class="insight-block feedback">
                    <div class="insight-label">🤖 AI Feedback</div>
                    <div class="insight-text">${ans.ai_feedback || "No AI feedback available."}</div>
                </div>
                ${weakPoints}
                ${improvements}
            </div>

            <div class="grading-area">
                <div class="grade-input-group">
                    <label>Manual Score (0–10)</label>
                    <input type="number" id="score-${index}" value="${manualScore}" min="0" max="10" placeholder="—">
                </div>
                <div class="grade-input-group" style="flex:1">
                    <label>Admin Feedback (Optional)</label>
                    <input type="text" id="feedback-${index}" value="${ans.admin_feedback || ""}" placeholder="Add your notes…">
                </div>
                <button class="btn btn-save" onclick="saveGrade('${data.session_id}', ${index})">Save</button>
            </div>
        `;
        container.appendChild(div);
    });

    document.getElementById("total-score").textContent = totalManualScore;

    // Auto-refresh if processing
    const modal = document.getElementById("eval-modal");
    const isProcessing = data.answers.some(a => a.answer_text === "[Processing audio...]");
    if (isProcessing && modal.classList.contains("active")) {
        setTimeout(() => {
            if (modal.classList.contains("active") && currentSession?.session_id === data.session_id) {
                openSubmission(data.session_id);
            }
        }, 5000);
    }
}

/* ─── AI OVERALL SUMMARY ─────────────────────────────── */

async function generateAISummary() {
    if (!currentSession) return;

    const box = document.getElementById("ai-summary-box");
    const btn = document.getElementById("ai-summary-btn");

    btn.textContent = "Generating…";
    btn.disabled = true;
    box.innerHTML = '<div class="loading-state"><div class="spinner"></div><span>AI is analyzing the full practice session…</span></div>';

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s for AI heavy analysis

        const res = await fetch(`${API_BASE}/admin/ai_summary/${currentSession.session_id}`, {
            headers: { "Authorization": `Bearer ${ADMIN_SECRET_KEY}` },
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        const data = await res.json();

        if (data.error) {
            box.innerHTML = `<div class="error-state">⚠️ ${data.error}</div>`;
            return;
        }

        const recColor = {
            "Strong Dispatcher": "#16a34a",
            "Professional": "#2563eb",
            "Dispatcher": "#2563eb",
            "Average": "#d97706",
            "Needs Improvement": "#dc2626"
        }[data.performance_level] || "#64748b";

        const strengths = (data.key_strengths || []).map(s => `<li>${s}</li>`).join("");
        const weakAreas = (data.weak_areas || []).map(w => `<li>${w}</li>`).join("");
        const suggestions = (data.improvement_suggestions || []).map(s => `<li>${s}</li>`).join("");

        box.innerHTML = `
            <div class="summary-header">
                <div>
                    <h3 style="margin:0; font-size:18px;">🤖 AI Overall Assessment</h3>
                    <p style="margin:6px 0 0; color:#6b7280; font-size:14px;">${data.overall_summary || ""}</p>
                </div>
                <div style="text-align:right">
                    <div class="ai-overall-score">${data.overall_ai_score || "—"}<span style="font-size:14px;">/10</span></div>
                    <div class="rec-badge" style="background:${recColor}22; color:${recColor}; border:1px solid ${recColor}55;">${data.performance_level || "—"}</div>
                </div>
            </div>
            <div class="summary-grid">
                <div class="summary-col strengths">
                    <div class="summary-col-title">✅ Key Strengths</div>
                    <ul>${strengths || "<li>Not identified</li>"}</ul>
                </div>
                <div class="summary-col weak-areas">
                    <div class="summary-col-title">⚠️ Weak Areas</div>
                    <ul>${weakAreas || "<li>None significant</li>"}</ul>
                </div>
                <div class="summary-col improvements">
                    <div class="summary-col-title">💡 Improvement Suggestions</div>
                    <ul>${suggestions || "<li>—</li>"}</ul>
                </div>
            </div>
        `;

    } catch (e) {
        console.error(e);
        box.innerHTML = '<div class="error-state">Network error generating summary.</div>';
    } finally {
        btn.textContent = "🔄 Regenerate AI Summary";
        btn.disabled = false;
    }
}

/* ─── SAVE GRADE ─────────────────────────────────────── */

async function saveGrade(sessionId, index) {
    const scoreVal = document.getElementById(`score-${index}`).value;
    const feedbackVal = document.getElementById(`feedback-${index}`).value;

    if (scoreVal === "") { alert("Please enter a score."); return; }

    const btn = document.querySelector(`button[onclick="saveGrade('${sessionId}', ${index})"]`);
    const originalText = btn.textContent;
    btn.textContent = "Saving…";
    btn.disabled = true;

    try {
        const res = await fetch(`${API_BASE}/admin/grade`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ADMIN_SECRET_KEY}`
            },
            body: JSON.stringify({
                session_id: sessionId,
                answer_index: index,
                score: parseInt(scoreVal),
                feedback: feedbackVal
            })
        });

        const result = await res.json();

        if (result.status === "success") {
            btn.textContent = "Saved ✓";
            btn.classList.add("btn-success");
            document.getElementById("total-score").textContent = result.total_score;
            setTimeout(() => {
                btn.textContent = "Save";
                btn.classList.remove("btn-success");
                btn.disabled = false;
            }, 2000);
        } else {
            alert("Error: " + result.error);
            btn.textContent = originalText;
            btn.disabled = false;
        }

    } catch (e) {
        console.error(e);
        alert("Network error saving grade.");
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

/* ─── CLOSE MODAL ────────────────────────────────────── */

async function closeModal() {
    document.getElementById("eval-modal").classList.remove("active");
    fetchSubmissions(); // refresh list with updated scores
}

/* ─── SEND RESULTS ───────────────────────────────────── */

async function sendFinalResults() {
    if (!currentSession) return;

    const sessionId = currentSession.session_id;
    const score = document.getElementById("total-score").textContent;
    const improvements = document.getElementById("overall-improvements").value;

    if (!improvements.trim()) {
        if (!confirm("No improvements entered. Send anyway?")) return;
    }

    const btn = document.getElementById("send-results-btn");
    const originalText = btn.textContent;
    btn.textContent = "Sending…";
    btn.disabled = true;

    try {
        const res = await fetch(`${API_BASE}/admin/send_results`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ADMIN_SECRET_KEY}`
            },
            body: JSON.stringify({
                session_id: sessionId,
                score: parseFloat(score),
                improvements: improvements
            })
        });

        const result = await res.json();

        if (result.status === "success") {
            alert("Results sent successfully to student!");
            btn.textContent = "Sent ✓";
            btn.style.background = "#059669";
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 3000);
        } else {
            alert("Error sending results: " + (result.error || "Unknown error"));
            btn.textContent = originalText;
            btn.disabled = false;
        }
    } catch (e) {
        console.error(e);
        alert("Network error sending results.");
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

/* ─── MODAL ACTIONS ─────────────────────────────────── */

function viewFullReport() {
    if (!currentSession || !currentSession.session_id) {
        alert("No session selected.");
        return;
    }
    const url = `${API_BASE}/admin/session/report/${currentSession.session_id}?token=${ADMIN_SECRET_KEY}`;
    window.open(url, "_blank");
}

async function deleteCurrentSubmission() {
    if (!currentSession) return;
    const sessionId = currentSession.session_id;

    if (!confirm(`Are you sure you want to PERMANENTLY delete the session for ${currentSession.student_name || "this student"}? This action cannot be undone.`)) {
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/admin/delete/${sessionId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${ADMIN_SECRET_KEY}` }
        });
        const result = await res.json();

        if (result.status === "success") {
            closeModal();
            fetchSubmissions();
        } else {
            alert(result.error || "Failed to delete submission");
        }
    } catch (e) {
        console.error(e);
        alert("Network error deleting submission");
    }
}

async function clearAllSessions() {
    if (!confirm("⚠️ WARNING: Are you sure you want to PERMANENTLY delete ALL practice sessions and submissions at once? This action is IRREVERSIBLE and cannot be undone.")) {
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE}/admin/clear_all`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${ADMIN_SECRET_KEY}` }
        });
        const result = await res.json();
        
        if (result.status === "success") {
            alert("🗑️ All sessions have been successfully cleared!");
            fetchSubmissions();
        } else {
            alert(result.error || "Failed to clear all sessions.");
        }
    } catch (e) {
        console.error(e);
        alert("Network error clearing all sessions.");
    }
}

/* ─── CHALLENGES & ANALYTICS EXTENSIONS ───────────────── */

function switchAdminTab(tab) {
    document.querySelectorAll(".btn-tab").forEach(b => b.classList.remove("active"));
    document.getElementById("admin-view-submissions").style.display = "none";
    document.getElementById("admin-view-challenges").style.display = "none";
    document.getElementById("admin-view-analytics").style.display = "none";
    document.getElementById("admin-view-dat").style.display = "none";
    document.getElementById("admin-view-sim-live").style.display = "none";

    if (tab === "submissions") {
        document.getElementById("btn-tab-subs").classList.add("active");
        document.getElementById("admin-view-submissions").style.display = "block";
        fetchSubmissions();
    } else if (tab === "challenges") {
        document.getElementById("btn-tab-challenges").classList.add("active");
        document.getElementById("admin-view-challenges").style.display = "block";
        fetchAdminChallenges();
    } else if (tab === "analytics") {
        document.getElementById("btn-tab-analytics").classList.add("active");
        document.getElementById("admin-view-analytics").style.display = "block";
        loadAdminAnalytics();
    } else if (tab === "dat") {
        document.getElementById("btn-tab-dat").classList.add("active");
        document.getElementById("admin-view-dat").style.display = "block";
        fetchDatSettings();
    } else if (tab === "sim-live") {
        document.getElementById("btn-tab-sim-live").classList.add("active");
        document.getElementById("admin-view-sim-live").style.display = "block";
        fetchSimLiveActivity();
    }
}

async function fetchDatSettings() {
    try {
        const resp = await fetch(`${API_BASE}/api/sim/admin/config`);
        if (resp.ok) {
            const data = await resp.json();
            if (data.status === "success" && data.config) {
                const conf = data.config;
                // Try to set select values, mapping the text correctly or assuming values match options
                const diffSelect = document.getElementById("dat-setting-difficulty");
                if (conf.broker_difficulty) {
                    Array.from(diffSelect.options).forEach(opt => {
                        if (opt.text.includes(conf.broker_difficulty.split(" ")[0])) opt.selected = true;
                    });
                }
                
                const crisisSelect = document.getElementById("dat-setting-crisis");
                if (conf.crisis_frequency) {
                    Array.from(crisisSelect.options).forEach(opt => {
                        if (opt.text.includes(conf.crisis_frequency.split(" ")[0])) opt.selected = true;
                    });
                }
                
                const marketSelect = document.getElementById("dat-setting-market");
                if (conf.market_condition) {
                    Array.from(marketSelect.options).forEach(opt => {
                        if (opt.text.includes(conf.market_condition.split(" ")[0])) opt.selected = true;
                    });
                }
            }
        }
    } catch(e) {
        console.error("Failed to load DAT settings", e);
    }
}

async function saveDatSettings() {
    const btn = document.querySelector('button[onclick="saveDatSettings()"]');
    const originalText = btn.textContent;
    btn.textContent = "Saving...";
    btn.disabled = true;

    const broker_difficulty = document.getElementById("dat-setting-difficulty").options[document.getElementById("dat-setting-difficulty").selectedIndex].text;
    const crisis_frequency = document.getElementById("dat-setting-crisis").options[document.getElementById("dat-setting-crisis").selectedIndex].text;
    const market_condition = document.getElementById("dat-setting-market").options[document.getElementById("dat-setting-market").selectedIndex].text;

    try {
        const resp = await fetch(`${API_BASE}/api/sim/admin/config`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                broker_difficulty,
                crisis_frequency,
                market_condition
            })
        });
        
        if (resp.ok) {
            btn.textContent = "Saved ✓";
            btn.style.background = "#10b981";
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = "#6366f1";
                btn.disabled = false;
            }, 2000);
        } else {
            alert("Failed to save settings");
            btn.textContent = originalText;
            btn.disabled = false;
        }
    } catch (e) {
        console.error("Error saving DAT settings:", e);
        alert("Network error saving settings");
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

async function fetchAdminChallenges() {
    const list = document.getElementById("admin-challenges-list");
    if (!list) return;
    list.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">Loading scenarios...</td></tr>`;

    try {
        const resp = await fetch(`${API_BASE}/api/challenges`);
        if (resp.ok) {
            const challenges = await resp.json();
            list.innerHTML = "";
            challenges.forEach(ch => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td style="font-weight:700; color: #fff;">${ch.title}</td>
                    <td><span class="badge badge-completed" style="background: rgba(99,102,241,0.2); color:#a5b4fc; border:1px solid rgba(99,102,241,0.3); font-size: 10px; font-weight:700;">${ch.category}</span></td>
                    <td><strong style="color: #cbd5e1;">${ch.difficulty}</strong></td>
                    <td style="color: #94a3b8;">${ch.character.name} (${ch.character.role})</td>
                    <td style="color: #94a3b8;">⏱️ ${ch.duration} | 🏆 ${ch.xp_reward} XP</td>
                    <td>
                        <button class="btn btn-danger" onclick="deleteChallengeAdmin('${ch.challenge_id}')" style="padding:4px 8px; font-size:11px; background:#ef4444; border:none; color:#fff; border-radius:4px; cursor:pointer;">🗑️ Delete</button>
                    </td>
                `;
                list.appendChild(tr);
            });
            if (challenges.length === 0) {
                list.innerHTML = `<tr><td colspan="6" style="text-align:center; color: #94a3b8;">No custom scenarios loaded.</td></tr>`;
            }
        }
    } catch (e) {
        list.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#f87171;">Error syncing scenarios.</td></tr>`;
    }
}

async function createCustomChallengeAdmin() {
    const title = document.getElementById("new-ch-title").value;
    const category = document.getElementById("new-ch-category").value;
    const difficulty = document.getElementById("new-ch-difficulty").value;
    const company = document.getElementById("new-ch-company").value;
    const xp = parseInt(document.getElementById("new-ch-xp").value || 100);
    const duration = document.getElementById("new-ch-duration").value;
    const tags = document.getElementById("new-ch-tags").value.split(",").map(t => t.trim());
    const charName = document.getElementById("new-ch-char-name").value;
    const charRole = document.getElementById("new-ch-char-role").value;
    const charPersonality = document.getElementById("new-ch-char-personality").value;
    const scenario = document.getElementById("new-ch-scenario").value;

    if (!title || !scenario || !charName) {
        alert("Please fill in Scenario Title, Actor Name, and Scenario Briefing.");
        return;
    }

    const payload = {
        title,
        description: `Custom dispatcher simulation scenario with ${charName}.`,
        difficulty,
        duration,
        xp_reward: xp,
        category,
        company_type: company,
        skill_tags: tags,
        scenario_brief: scenario,
        character: {
            name: charName,
            role: charRole,
            personality: charPersonality,
            difficulty_level: difficulty === "Rookie" ? "Easy" : difficulty === "Expert" ? "Hard" : "Medium"
        }
    };

    try {
        const resp = await fetch(`${API_BASE}/api/challenges/custom`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ADMIN_SECRET_KEY}`
            },
            body: JSON.stringify(payload)
        });
        
        const data = await resp.json();
        if (data.status === "success") {
            alert("Custom scenario saved successfully!");
            // Reset form
            document.getElementById("new-ch-title").value = "";
            document.getElementById("new-ch-scenario").value = "";
            document.getElementById("new-ch-char-name").value = "";
            document.getElementById("new-ch-char-personality").value = "";
            
            fetchAdminChallenges();
        } else {
            alert("Error: " + data.error);
        }
    } catch (e) {
        alert("Network error saving scenario.");
    }
}

async function deleteChallengeAdmin(challengeId) {
    if (!confirm("Are you sure you want to permanently delete this challenge scenario?")) return;

    try {
        const resp = await fetch(`${API_BASE}/api/challenges/delete/${challengeId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${ADMIN_SECRET_KEY}` }
        });
        
        const data = await resp.json();
        if (data.status === "success") {
            fetchAdminChallenges();
        } else {
            alert("Error: " + data.error);
        }
    } catch (e) {
        alert("Network error deleting challenge.");
    }
}

async function loadAdminAnalytics() {
    const totalEl = document.getElementById("analytics-total-attempts");
    const avgEl = document.getElementById("analytics-avg-score");
    const hardestList = document.getElementById("analytics-hardest-scenarios");
    const skillList = document.getElementById("analytics-skill-heatmap");

    try {
        const resp = await fetch(`${API_BASE}/api/admin/analytics`);
        if (resp.ok) {
            const data = await resp.json();
            
            totalEl.textContent = data.total_attempts || 0;
            avgEl.textContent = data.avg_score ? `${(data.avg_score * 10).toFixed(0)}%` : "—";
            
            // Hardest scenarios
            hardestList.innerHTML = "";
            if (data.hardest_scenarios && data.hardest_scenarios.length > 0) {
                data.hardest_scenarios.forEach(item => {
                    const li = document.createElement("li");
                    li.style.marginBottom = "8px";
                    li.style.fontSize = "13px";
                    li.style.color = "#cbd5e1";
                    li.innerHTML = `<strong>${item.title}</strong>: Avg Score: <span style="color:#ef4444; font-weight:700;">${(item.avg_score * 10).toFixed(0)}%</span> (Attempts: ${item.attempts})`;
                    hardestList.appendChild(li);
                });
            } else {
                hardestList.innerHTML = "<li>No failed scenario telemetry recorded yet.</li>";
            }
            
            // Skill heatmap
            skillList.innerHTML = "";
            if (data.skill_heatmap) {
                const skills = Object.keys(data.skill_heatmap);
                skills.forEach(s => {
                    const val = data.skill_heatmap[s] || 0;
                    const li = document.createElement("li");
                    li.style.marginBottom = "10px";
                    li.innerHTML = `
                        <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; color: #cbd5e1;">
                            <span>${s}</span> <strong>${val}%</strong>
                        </div>
                        <div style="width:100%; height:6px; background:#1e293b; border-radius:3px; overflow:hidden;">
                            <div style="width:${val}%; height:100%; background:linear-gradient(90deg, #6366f1, #38bdf8); border-radius:3px;"></div>
                        </div>
                    `;
                    skillList.appendChild(li);
                });
            } else {
                skillList.innerHTML = "<li>No skill charts telemetry recorded yet.</li>";
            }
        }
    } catch (e) {
        console.error(e);
    }
}

let simActivityPoller = null;

async function fetchSimLiveActivity() {
    const listFeed = document.getElementById("admin-live-feed");
    const listStudents = document.getElementById("admin-live-students");
    
    if (!listFeed || !listStudents) return;

    try {
        const res2 = await fetch(`${API_BASE}/api/sim/admin/activity`);
        
        if (res2.ok) {
            const data = await res2.json();
            
            // Populate Feed
            listFeed.innerHTML = "";
            if (data.activities && data.activities.length > 0) {
                data.activities.forEach(act => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td style="color:#cbd5e1; font-size:12px;">${act.time_str}</td>
                        <td style="color:#fff; font-weight:600;">${act.name || act.email}</td>
                        <td style="color:#38bdf8;">${act.action}</td>
                        <td style="color:#94a3b8; font-size:12px;">${act.detail}</td>
                    `;
                    listFeed.appendChild(tr);
                });
            } else {
                listFeed.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#94a3b8;">No recent activity logged.</td></tr>`;
            }
            
            // Populate Students
            listStudents.innerHTML = "";
            if (data.students && data.students.length > 0) {
                data.students.forEach(st => {
                    const tr = document.createElement("tr");
                    const level = st.level_info ? st.level_info.title : "Dispatcher";
                    tr.innerHTML = `
                        <td style="color:#fff;">
                            <div style="font-weight:700;">${st.name}</div>
                            <div style="font-size:11px; color:#64748b;">${st.email}</div>
                        </td>
                        <td><span style="background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight:700;">${level}</span></td>
                        <td style="color:#cbd5e1; font-weight:700;">${st.booked_loads || 0}</td>
                        <td>
                            <button class="btn btn-primary" onclick="openStudentSimulatorProfile('${st.email}')" style="padding: 4px 8px; font-size: 11px; cursor: pointer; background: #6366f1;">View Performance</button>
                        </td>
                    `;
                    listStudents.appendChild(tr);
                });
            } else {
                listStudents.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#94a3b8;">No active students.</td></tr>`;
            }
        }
    } catch(e) {
        console.error("Failed fetching live activity", e);
    }
    
    // Auto-poll every 5 seconds if tab is active
    if (document.getElementById("admin-view-sim-live").style.display === "block") {
        clearTimeout(simActivityPoller);
        simActivityPoller = setTimeout(fetchSimLiveActivity, 5000);
    }
}

let currentSimStudentData = null;
let currentSimStudentEmail = null;

async function openStudentSimulatorProfile(email) {
    currentSimStudentEmail = email;
    const modal = document.getElementById("student-sim-modal");
    modal.classList.add("active");
    
    // Clear and show loading in all tabs initially
    document.getElementById("student-modal-title").textContent = "Loading Student...";
    document.getElementById("student-modal-email").textContent = email;
    document.getElementById("student-overview-stats").innerHTML = `<div style="text-align: center; width: 100%; padding: 40px; color:#64748b;">Loading Overview...</div>`;
    document.getElementById("student-overview-level").textContent = "Loading Level...";
    document.getElementById("student-timeline-feed").innerHTML = `<div style="text-align: center; width: 100%; padding: 40px; color:#64748b;">Loading Timeline...</div>`;
    document.getElementById("student-loads-table-body").innerHTML = `<tr><td colspan="5" style="text-align: center; color: #64748b;">Loading loads...</td></tr>`;
    document.getElementById("student-roleplays-list").innerHTML = `<div style="text-align: center; color: #64748b; padding: 20px;">Loading roleplays...</div>`;
    document.getElementById("student-emails-list").innerHTML = `<div style="text-align: center; color: #64748b; padding: 20px;">Loading email exchanges...</div>`;
    document.getElementById("ai-review-result-container").innerHTML = `<div style="text-align: center; color: #64748b; padding: 40px;"><p>Loading review status...</p></div>`;
    
    // Reset tab to overview
    switchStudentModalTab("overview");

    try {
        const resp = await fetch(`${API_BASE}/api/sim/admin/student/${email}`);
        if (resp.ok) {
            const data = await resp.json();
            if (data.status === "success") {
                currentSimStudentData = data;
                
                const student = data.student || {};
                document.getElementById("student-modal-title").textContent = student.name || "Student Performance Profile";
                document.getElementById("student-modal-email").textContent = student.email || email;
                
                // Populate Overview Stats
                const statsHtml = `
                    <div class="student-stat-card">
                        <h4>Ending Balance</h4>
                        <div class="value">$${(student.balance !== undefined ? student.balance : 10000).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    </div>
                    <div class="student-stat-card">
                        <h4>Revenue Generated</h4>
                        <div class="value">$${(student.revenue !== undefined ? student.revenue : 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    </div>
                    <div class="student-stat-card">
                        <h4>Loads Booked</h4>
                        <div class="value">${student.booked_loads || 0}</div>
                    </div>
                    <div class="student-stat-card">
                        <h4>Calls Initiated</h4>
                        <div class="value">${student.calls_made || 0}</div>
                    </div>
                    <div class="student-stat-card">
                        <h4>Emails Sent</h4>
                        <div class="value">${student.emails_sent || 0}</div>
                    </div>
                `;
                document.getElementById("student-overview-stats").innerHTML = statsHtml;
                
                const levelTitle = student.level_info ? student.level_info.title : "Dispatcher Academy Cadet";
                const levelXp = student.xp || 0;
                document.getElementById("student-overview-level").innerHTML = `Current Level: <strong>${levelTitle}</strong> | Experience Points: <strong>${levelXp} XP</strong>`;
                
                // Populate Timeline
                let timelineHtml = "";
                const activities = data.activities || [];
                if (activities.length > 0) {
                    activities.forEach(act => {
                        timelineHtml += `
                            <div class="student-timeline-item">
                                <div class="student-timeline-time">${act.date_str || ""} ${act.time_str || ""}</div>
                                <div class="student-timeline-action">${act.action || ""}</div>
                                <div class="student-timeline-detail">${act.detail || ""}</div>
                            </div>
                        `;
                    });
                } else {
                    timelineHtml = `<div style="text-align: center; padding: 40px; color: #64748b;">No timeline activity recorded yet.</div>`;
                }
                document.getElementById("student-timeline-feed").innerHTML = timelineHtml;
                
                // Populate Booked Loads
                let loadsHtml = "";
                const bookedLoads = student.booked_load_history || [];
                if (bookedLoads.length > 0) {
                    bookedLoads.forEach(load => {
                        const org = load.origin || {};
                        const dest = load.destination || {};
                        loadsHtml += `
                            <tr>
                                <td style="color: #fff; font-weight: 700;">${org.city || ""}, ${org.state || ""}</td>
                                <td style="color: #fff; font-weight: 700;">${dest.city || ""}, ${dest.state || ""}</td>
                                <td style="color: #10b981; font-weight: 800;">$${load.rate || 0}</td>
                                <td style="color: #cbd5e1;">${load.equipment ? load.equipment.type : "N/A"}</td>
                                <td style="color: #94a3b8;">${load.broker ? load.broker.company : "N/A"}</td>
                            </tr>
                        `;
                    });
                } else {
                    loadsHtml = `<tr><td colspan="5" style="text-align: center; color: #64748b; padding: 20px;">No loads booked yet.</td></tr>`;
                }
                document.getElementById("student-loads-table-body").innerHTML = loadsHtml;
                
                // Populate Roleplays
                let roleplaysHtml = "";
                const calls = data.calls || [];
                if (calls.length > 0) {
                    calls.forEach((call, index) => {
                        const evalData = call.evaluation || {};
                        const neg = evalData.negotiation_score !== undefined ? evalData.negotiation_score : "—";
                        const obj = evalData.objection_score !== undefined ? evalData.objection_score : "—";
                        const prof = evalData.professionalism_score !== undefined ? evalData.professionalism_score : "—";
                        
                        roleplaysHtml += `
                            <div class="competency-item" style="margin-bottom: 12px; border-left: 4px solid #4f46e5;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                    <div>
                                        <div style="font-weight: 700; color: #fff; font-size: 13px;">${call.challenge_title || "Call Negotiation"}</div>
                                        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${call.date_str || ""} | Status: <strong style="color:${call.status === "booked" ? "#10b981" : "#ef4444"}">${call.status || ""}</strong></div>
                                    </div>
                                    <button class="btn btn-mini" onclick="viewSimCallTranscript(${index})" style="background: rgba(99,102,241,0.15); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.3); padding: 4px 8px; font-size: 11px; cursor: pointer; border-radius: 4px;">View Transcript</button>
                                </div>
                                <div style="display: flex; gap: 12px; margin-top: 8px; font-size: 11px; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px;">
                                    <div>Negotiation: <strong style="color: #38bdf8;">${neg}</strong></div>
                                    <div>Objections: <strong style="color: #38bdf8;">${obj}</strong></div>
                                    <div>Professionalism: <strong style="color: #38bdf8;">${prof}</strong></div>
                                </div>
                            </div>
                        `;
                    });
                } else {
                    roleplaysHtml = `<div style="text-align: center; color: #64748b; padding: 20px;">No phone roleplays completed yet.</div>`;
                }
                document.getElementById("student-roleplays-list").innerHTML = roleplaysHtml;
                
                // Populate Emails
                let emailsHtml = "";
                const emails = data.emails || [];
                if (emails.length > 0) {
                    emails.forEach((mail, index) => {
                        const evalData = mail.evaluation || {};
                        const scores = evalData.scores || {};
                        const neg = scores.negotiation !== undefined ? scores.negotiation : "—";
                        const prof = scores.professionalism !== undefined ? scores.professionalism : "—";
                        const dispatch = scores.dispatching_skills !== undefined ? scores.dispatching_skills : "—";
                        
                        emailsHtml += `
                            <div class="competency-item" style="margin-bottom: 12px; border-left: 4px solid #10b981;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                    <div>
                                        <div style="font-weight: 700; color: #fff; font-size: 13px; max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${mail.subject || "No Subject"}</div>
                                        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${mail.date_str || ""} | To: ${mail.broker_email || ""}</div>
                                    </div>
                                    <button class="btn btn-mini" onclick="viewSimEmailThread(${index})" style="background: rgba(16,185,129,0.15); color: #a7f3d0; border: 1px solid rgba(16,185,129,0.3); padding: 4px 8px; font-size: 11px; cursor: pointer; border-radius: 4px;">View Thread</button>
                                </div>
                                <div style="display: flex; gap: 12px; margin-top: 8px; font-size: 11px; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px;">
                                    <div>Negotiation: <strong style="color: #38bdf8;">${neg}</strong></div>
                                    <div>Professionalism: <strong style="color: #38bdf8;">${prof}</strong></div>
                                    <div>Skills: <strong style="color: #38bdf8;">${dispatch}</strong></div>
                                </div>
                            </div>
                        `;
                    });
                } else {
                    emailsHtml = `<div style="text-align: center; color: #64748b; padding: 20px;">No email exchanges completed yet.</div>`;
                }
                document.getElementById("student-emails-list").innerHTML = emailsHtml;
                
                // Populate AI review if it exists in DB
                if (student.ai_review) {
                    renderStudentAiReviewHtml(student.ai_review);
                } else {
                    document.getElementById("ai-review-result-container").innerHTML = `
                        <div style="text-align: center; color: #64748b; padding: 40px;">
                            <p>No holistic audit has been generated for this student yet.</p>
                            <button class="btn btn-ai" onclick="triggerStudentAiReview()" style="margin-top: 15px;">✨ Run Holistic Audit</button>
                        </div>
                    `;
                }
            } else {
                alert("Failed to load student details: " + (data.message || "Unknown error"));
                closeStudentSimModal();
            }
        } else {
            alert("Error connecting to student profile endpoint");
            closeStudentSimModal();
        }
    } catch(e) {
        console.error("Failed opening student simulator profile", e);
        closeStudentSimModal();
    }
}

function closeStudentSimModal() {
    document.getElementById("student-sim-modal").classList.remove("active");
}

function switchStudentModalTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll(".student-tab-content").forEach(el => {
        el.style.display = "none";
    });
    
    // Deactivate all tab buttons
    document.querySelectorAll(".modal-tab-btn").forEach(btn => {
        btn.classList.remove("active");
    });
    
    // Show current tab content
    const targetContent = document.getElementById(`student-tab-content-${tabName}`);
    if (targetContent) targetContent.style.display = "block";
    
    // Activate current tab button
    const targetBtn = document.getElementById(`modal-student-tab-${tabName}`);
    if (targetBtn) targetBtn.classList.add("active");
}

function viewSimCallTranscript(index) {
    if (!currentSimStudentData || !currentSimStudentData.calls || !currentSimStudentData.calls[index]) return;
    const call = currentSimStudentData.calls[index];
    
    document.getElementById("transcript-submodal-title").textContent = `Transcript: ${call.challenge_title || "Call Negotiations"}`;
    
    let html = "";
    const history = call.history || [];
    history.forEach(turn => {
        html += `
            <div style="margin-bottom: 12px; background: rgba(0,0,0,0.2); padding: 8px 12px; border-radius: 6px;">
                <div style="color: #a5b4fc; font-weight: 700; margin-bottom: 2px;">Broker:</div>
                <div style="color: #fff;">${turn.q || ""}</div>
            </div>
            <div style="margin-bottom: 16px; background: rgba(99,102,241,0.1); padding: 8px 12px; border-radius: 6px; border-left: 2px solid #6366f1;">
                <div style="color: #38bdf8; font-weight: 700; margin-bottom: 2px;">Trainee Dispatcher:</div>
                <div style="color: #fff;">${turn.a || ""}</div>
            </div>
        `;
    });
    
    if (history.length === 0) {
        html = `<div style="text-align: center; color: #64748b;">No dialogue logged for this call.</div>`;
    }
    
    document.getElementById("transcript-submodal-body").innerHTML = html;
    document.getElementById("transcript-submodal").classList.add("active");
}

function closeTranscriptSubmodal() {
    document.getElementById("transcript-submodal").classList.remove("active");
}

function viewSimEmailThread(index) {
    if (!currentSimStudentData || !currentSimStudentData.emails || !currentSimStudentData.emails[index]) return;
    const mail = currentSimStudentData.emails[index];
    
    document.getElementById("email-submodal-title").textContent = `Subject: ${mail.subject || "Email Exchange"}`;
    
    let html = `
        <div style="margin-bottom: 16px; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 6px; border: 1px solid #334155;">
            <div style="display: flex; justify-content: space-between; font-size:11px; color:#64748b; margin-bottom:8px;">
                <span>From: Trainee</span>
                <span>To: ${mail.broker_email || ""}</span>
            </div>
            <div style="color: #fff; white-space: pre-wrap; font-family: monospace; font-size: 12px;">${mail.body || ""}</div>
            ${mail.attachment ? `<div style="margin-top: 10px; font-size: 11px; color: #38bdf8;">📎 Attachment: <strong>${mail.attachment}</strong></div>` : ""}
        </div>
        <div style="background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.2); padding: 12px; border-radius: 6px; margin-top: 15px;">
            <div style="font-weight:700; color:#10b981; margin-bottom: 6px; font-size:12px; text-transform:uppercase;">Broker Evaluation &amp; Feedback</div>
            <p style="color:#cbd5e1; font-style:italic; font-size: 12px; line-height: 1.5;">"${mail.evaluation ? mail.evaluation.feedback : ""}"</p>
        </div>
    `;
    
    document.getElementById("email-submodal-body").innerHTML = html;
    document.getElementById("email-submodal").classList.add("active");
}

function closeEmailSubmodal() {
    document.getElementById("email-submodal").classList.remove("active");
}

async function triggerStudentAiReview() {
    if (!currentSimStudentEmail) return;
    
    const container = document.getElementById("ai-review-result-container");
    const btn = document.getElementById("btn-trigger-ai-review");
    
    btn.disabled = true;
    btn.textContent = "Auditing Logs...";
    
    container.innerHTML = `
        <div style="text-align: center; color: #94a3b8; padding: 40px;">
            <div class="spinner" style="margin: 0 auto 15px auto;"></div>
            <p style="font-weight: 600;">Senior Dispatch Director is auditing student performance logs...</p>
            <span style="font-size: 11px; color: #64748b;">Evaluating W9/COI attachments, rate counters, objection handling, and terminology...</span>
        </div>
    `;
    
    try {
        const resp = await fetch(`${API_BASE}/api/sim/admin/student/${currentSimStudentEmail}/review`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });
        
        if (resp.ok) {
            const data = await resp.json();
            if (data.status === "success" && data.review) {
                renderStudentAiReviewHtml(data.review);
                // Also update local cache so tab switching doesn't wipe it
                if (currentSimStudentData && currentSimStudentData.student) {
                    currentSimStudentData.student.ai_review = data.review;
                }
            } else {
                container.innerHTML = `
                    <div style="text-align: center; color: #ef4444; padding: 20px;">
                        <p>Failed to generate review: ${data.message || "Unknown error"}</p>
                        <button class="btn btn-ai" onclick="triggerStudentAiReview()" style="margin-top: 15px;">Retry Audit</button>
                    </div>
                `;
            }
        } else {
            container.innerHTML = `
                <div style="text-align: center; color: #ef4444; padding: 20px;">
                    <p>HTTP Error generating AI holistic review</p>
                    <button class="btn btn-ai" onclick="triggerStudentAiReview()" style="margin-top: 15px;">Retry Audit</button>
                </div>
            `;
        }
    } catch(e) {
        console.error("Error generating student AI review", e);
        container.innerHTML = `
            <div style="text-align: center; color: #ef4444; padding: 20px;">
                <p>Network error generating AI holistic review</p>
                <button class="btn btn-ai" onclick="triggerStudentAiReview()" style="margin-top: 15px;">Retry Audit</button>
            </div>
        `;
    } finally {
        btn.disabled = false;
        btn.textContent = "🔄 Regenerate Audit";
    }
}

function renderStudentAiReviewHtml(review) {
    const container = document.getElementById("ai-review-result-container");
    if (!review) return;
    
    const scoreColor = review.overall_score >= 8.0 ? "#10b981" : review.overall_score >= 6.0 ? "#3b82f6" : "#ef4444";
    
    // Strengths, weaknesses, suggestions lists
    const strengths = (review.key_strengths || []).map(s => `<li>${s}</li>`).join("");
    const weaknesses = (review.weak_areas || []).map(w => `<li>${w}</li>`).join("");
    const suggestions = (review.improvement_suggestions || []).map(s => `<li>${s}</li>`).join("");
    
    // Competencies
    const comps = review.competencies || {};
    const compKeys = [
        { key: "rate_negotiation", label: "Rate Negotiation Strategy" },
        { key: "objection_handling", label: "Composure & Objection Handling" },
        { key: "compliance_doc", label: "Compliance & Documentation" },
        { key: "professionalism", label: "Professionalism & Communication Tone" },
        { key: "fleet_management", label: "Fleet & Driver Management" }
    ];
    
    let compsHtml = "";
    compKeys.forEach(item => {
        const c = comps[item.key] || { score: 0, feedback: "No feedback available." };
        compsHtml += `
            <div class="competency-item">
                <div class="competency-header">
                    <span class="competency-title">${item.label}</span>
                    <span class="competency-score" style="color: ${c.score >= 80 ? "#10b981" : c.score >= 60 ? "#3b82f6" : "#ef4444"};">${c.score}/100</span>
                </div>
                <div class="competency-bar-bg">
                    <div class="competency-bar-fill" style="width: ${c.score}%; background: linear-gradient(90deg, ${c.score >= 80 ? "#10b981" : c.score >= 60 ? "#3b82f6" : "#ef4444"}, #38bdf8);"></div>
                </div>
                <div class="competency-feedback">${c.feedback}</div>
            </div>
        `;
    });
    
    container.innerHTML = `
        <div class="ai-overall-card">
            <div>
                <h4 style="margin:0 0 6px 0; color:#94a3b8; font-size:11px; text-transform:uppercase;">Overall Audit Grade</h4>
                <div style="font-size: 32px; font-weight:800; color: ${scoreColor};">${review.overall_score || "—"} <span style="font-size:16px; color:#64748b; font-weight:500;">/10.0</span></div>
                <p style="margin:6px 0 0 0; font-size: 13px; color:#cbd5e1; font-weight:600;">Performance Level: <span style="color:${review.performance_level === "Elite Dispatcher" ? "#10b981" : "#3b82f6"};">${review.performance_level || "—"}</span></p>
            </div>
            <div style="max-width: 60%; text-align: right;">
                <p style="margin:0; font-size:12px; color:#94a3b8; line-height:1.5; font-style:italic;">"${review.written_summary || ""}"</p>
            </div>
        </div>
        
        <div class="ai-review-layout">
            <div>
                <h4 style="color:#fff; margin-bottom:12px; font-size:14px; border-bottom:1px solid #334155; padding-bottom:6px;">📈 Core Competency Breakdown</h4>
                ${compsHtml}
            </div>
            <div style="display:flex; flex-direction:column; gap:16px;">
                <div class="card-admin-sec" style="margin:0; padding:16px;">
                    <h4 style="color:#10b981; margin:0 0 10px 0; font-size:13px; font-weight:700;">✅ Key Strengths</h4>
                    <ul class="ai-bullet-list">${strengths || "<li>None identified</li>"}</ul>
                </div>
                <div class="card-admin-sec" style="margin:0; padding:16px;">
                    <h4 style="color:#ef4444; margin:0 0 10px 0; font-size:13px; font-weight:700;">⚠️ Areas for Improvement</h4>
                    <ul class="ai-bullet-list">${weaknesses || "<li>No major weaknesses noted</li>"}</ul>
                </div>
                <div class="card-admin-sec" style="margin:0; padding:16px;">
                    <h4 style="color:#f59e0b; margin:0 0 10px 0; font-size:13px; font-weight:700;">💡 Director Action Items</h4>
                    <ul class="ai-bullet-list">${suggestions || "<li>No action items</li>"}</ul>
                </div>
            </div>
        </div>
    `;
}


