(function(){if(document.readyState!=='loading'){var _a=document.addEventListener.bind(document);document.addEventListener=function(t,f,o){if(t==='DOMContentLoaded'){return setTimeout(f,0);}return _a(t,f,o);};if(document.readyState==='complete'){Object.defineProperty(window,'onload',{set:function(f){if(f)setTimeout(f,0);},get:function(){return null;},configurable:true});}}})();
// ─── DAT NEGOTIATION RESULTS ───────────────────────────────────────────────
    let _allDatResults = [];

    function fetchDatNegotiationResults() {
        const btn = document.querySelector('button[onclick="fetchDatNegotiationResults()"]');
        const origText = btn ? btn.innerHTML : '🔄 Refresh';
        if (btn) {
            btn.innerHTML = '⏳ Loading...';
            btn.style.opacity = '0.7';
            btn.disabled = true;
        }

        const ADMIN_API = (window.__APP_CONFIG__ && window.__APP_CONFIG__.apiUrl) || "https://b2b-bck.onrender.com";
        fetch(`${ADMIN_API}/api/sim/admin/dat/results`)
            .then(r => r.json())
            .then(data => {
                if (data.status === 'success') {
                    _allDatResults = data.results || [];
                    renderDatLeaderboard(data.leaderboard || []);
                    renderDatResults(_allDatResults);
                    document.getElementById('dat-results-count').textContent = `${_allDatResults.length} total`;
                }
            })
            .catch((e) => { console.error("Error fetching DAT results:", e); })
            .finally(() => {
                if (btn) {
                    // Small delay to make the loading state visible even if API is very fast
                    setTimeout(() => {
                        btn.innerHTML = origText;
                        btn.style.opacity = '1';
                        btn.disabled = false;
                    }, 300);
                }
            });
    }

    function renderDatLeaderboard(leaderboard) {
        const tbody = document.getElementById('dat-leaderboard-body');
        if (!leaderboard.length) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#475569;">No negotiations recorded yet.</td></tr>';
            return;
        }
        tbody.innerHTML = leaderboard.map((s, idx) => {
            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx+1}`;
            const scoreColor = s.avg_score >= 115 ? '#10b981' : s.avg_score >= 100 ? '#3b82f6' : s.avg_score >= 90 ? '#f59e0b' : '#ef4444';
            return `<tr>
                <td style="font-weight:800; font-size:1rem;">${medal}</td>
                <td>
                    <div style="font-weight:700; color:#0f172a;">${s.student_name || s._id}</div>
                    <div style="font-size:11px; color:#475569;">${s._id}</div>
                </td>
                <td><span style="font-weight:900; font-size:1.1rem; color:${scoreColor};">${s.avg_score}%</span></td>
                <td style="color:#475569;">${s.total_calls}</td>
                <td><span style="color:#10b981; font-weight:700;">${s.booked_count}</span></td>
                <td style="font-weight:700;">$${(s.max_rate||0).toLocaleString()}</td>
                <td style="color:#38bdf8; font-weight:700;">$${(s.total_revenue||0).toLocaleString()}</td>
            </tr>`;
        }).join('');
    }

    function renderDatResults(results) {
        const tbody = document.getElementById('dat-results-body');
        if (!results.length) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:#475569;">No results yet.</td></tr>';
            return;
        }
        tbody.innerHTML = results.map(r => {
            const scoreColor = r.score_pct >= 115 ? '#10b981' : r.score_pct >= 100 ? '#3b82f6' : r.score_pct >= 90 ? '#f59e0b' : '#ef4444';
            const statusBadge = r.status === 'Booked'
                ? '<span style="background:#10b981; color:#0f172a; padding:2px 7px; border-radius:10px; font-size:11px; font-weight:700;">✅ BOOKED</span>'
                : '<span style="background:#475569; color:#0f172a; padding:2px 7px; border-radius:10px; font-size:11px; font-weight:700;">❌ HUNG UP</span>';
            const typeBadge = r.type === 'Email'
                ? '<span style="background:#e0e7ff; color:#4f46e5; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:800; border:1px solid #c7d2fe; display:inline-block; margin-right:6px;">✉️ EMAIL</span>'
                : '<span style="background:#fce8e6; color:#d93025; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:800; border:1px solid #f8bbd0; display:inline-block; margin-right:6px;">📞 CALL</span>';

            return `<tr>
                <td style="font-size:11px; color:#475569;">${r.timestamp_str || ''}</td>
                <td>${typeBadge}</td>
                <td>
                    <div>
                        <div style="font-weight:700; color:#0f172a; font-size:12px;">${r.student_name || r.student_email}</div>
                        <div style="font-size:10px; color:#475569;">${r.student_email}</div>
                    </div>
                </td>
                <td style="color:#475569; font-size:12px;">${r.broker_name}</td>
                <td style="font-size:12px;">${r.origin} → ${r.destination}</td>
                <td style="font-size:12px;">$${(r.posted_rate||0).toLocaleString()}</td>
                <td style="font-weight:700; font-size:12px;">$${(r.agreed_rate||0).toLocaleString()}</td>
                <td>
                    <span style="font-weight:900; color:${scoreColor}; font-size:1rem;">${r.score_pct}%</span>
                    <div style="font-size:10px; color:${scoreColor}; margin-top:2px;">${r.grade}</div>
                </td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn" style="background:#f1f5f9; border:1px solid #cbd5e1; color:#0f172a; padding:4px 8px; border-radius:4px; font-size:11px;" onclick="viewDatEvaluation(this)" data-eval="${encodeURIComponent(JSON.stringify(r.ai_evaluation || {}))}">🤖 View Review</button>
                </td>
            </tr>`;
        }).join('');
    }

    function filterDatResults() {
        const q = document.getElementById('dat-results-filter').value.toLowerCase();
        const filtered = q ? _allDatResults.filter(r =>
            (r.student_email || '').toLowerCase().includes(q) ||
            (r.student_name || '').toLowerCase().includes(q)
        ) : _allDatResults;
        renderDatResults(filtered);
        document.getElementById('dat-results-count').textContent = `${filtered.length} shown`;
    }

    window.viewDatEvaluation = function(btn) {
        try {
            const aiEval = JSON.parse(decodeURIComponent(btn.getAttribute('data-eval')));
            
            // Handle both Phone Call schema (feedback_summary, strengths, weaknesses) 
            // and Email schema (feedback, scores)
            let summaryText = aiEval.feedback_summary || aiEval.feedback;
            if (!summaryText) {
                summaryText = "The AI evaluation for this specific negotiation was not recorded or is still processing. Please complete a new call to see real-time AI feedback.";
            }
            
            let strengths = aiEval.strengths || [];
            let weaknesses = aiEval.weaknesses || [];
            
            // Auto-generate strengths/weaknesses from Email score schema if arrays are empty
            if (aiEval.scores && strengths.length === 0 && weaknesses.length === 0) {
                const s = aiEval.scores;
                if (s.professionalism >= 8) strengths.push(`High Professionalism (${s.professionalism}/10)`);
                else if (s.professionalism) weaknesses.push(`Needs more professionalism (${s.professionalism}/10)`);
                
                if (s.negotiation >= 7) strengths.push(`Good Negotiation Tactics (${s.negotiation}/10)`);
                else if (s.negotiation) weaknesses.push(`Improve negotiation skills (${s.negotiation}/10)`);
                
                if (s.grammar >= 8) strengths.push(`Strong Grammar & Communication (${s.grammar}/10)`);
                else if (s.grammar) weaknesses.push(`Grammar needs improvement (${s.grammar}/10)`);
                
                if (s.dispatching_skills >= 7) strengths.push(`Solid Dispatching Knowledge (${s.dispatching_skills}/10)`);
                else if (s.dispatching_skills) weaknesses.push(`Review core dispatching skills (${s.dispatching_skills}/10)`);
            }
            
            let strengthsHtml = (strengths.length > 0) 
                ? strengths.map(s => `<li style="margin-bottom:12px; background: linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.02) 100%); padding: 12px 16px; border-radius: 8px; border-left: 4px solid #10b981; color: #0f172a; font-weight: 500; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); letter-spacing: 0.3px;"><span style="font-size: 1.2em; background: rgba(16,185,129,0.15); border-radius: 50%; padding: 4px;">✨</span> <span>${s}</span></li>`).join('')
                : `<div style="background: rgba(0,0,0,0.02); border: 1px dashed #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; color: #64748b; font-style: italic; font-size: 13px;">No specific strengths recorded for this interaction.</div>`;
                
            let weaknessesHtml = (weaknesses.length > 0)
                ? weaknesses.map(w => `<li style="margin-bottom:12px; background: linear-gradient(90deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.02) 100%); padding: 12px 16px; border-radius: 8px; border-left: 4px solid #ef4444; color: #0f172a; font-weight: 500; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); letter-spacing: 0.3px;"><span style="font-size: 1.2em; background: rgba(239,68,68,0.15); border-radius: 50%; padding: 4px;">🎯</span> <span>${w}</span></li>`).join('')
                : `<div style="background: rgba(0,0,0,0.02); border: 1px dashed #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; color: #64748b; font-style: italic; font-size: 13px;">No specific weaknesses recorded for this interaction.</div>`;
            
            document.getElementById('dat-eval-submodal-body').innerHTML = `
                <div style="background: linear-gradient(145deg, #ffffff, #f8fafc); padding: 28px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                    
                    <div style="margin-bottom: 30px; text-align: center; background: #f1f5f9; padding: 20px; border-radius: 12px; border: 1px solid #cbd5e1;">
                        <div style="display: inline-flex; align-items: center; gap: 8px; background: #e0f2fe; border: 1px solid #bae6fd; padding: 6px 16px; border-radius: 20px; color: #0284c7; font-weight: 700; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px;">
                            <span>🧠</span> AI Holistic Summary
                        </div>
                        <p style="margin: 0; font-size: 16px; color: #334155; line-height: 1.7; font-weight: 400; font-style: italic;">
                            "${summaryText}"
                        </p>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 10px;">
                        
                        <!-- Strengths Section -->
                        <div style="background: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.2); box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid rgba(16, 185, 129, 0.2);">
                                <div style="background: linear-gradient(135deg, #10b981, #059669); width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);">💪</div>
                                <strong style="color: #059669; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; font-weight: 800;">Key Strengths</strong>
                            </div>
                            <ul style="padding-left: 0; list-style-type: none; margin: 0; font-size: 14px;">
                                ${strengthsHtml}
                            </ul>
                        </div>

                        <!-- Weaknesses Section -->
                        <div style="background: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.2); box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid rgba(239, 68, 68, 0.2);">
                                <div style="background: linear-gradient(135deg, #ef4444, #dc2626); width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.2);">📈</div>
                                <strong style="color: #dc2626; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; font-weight: 800;">Areas for Growth</strong>
                            </div>
                            <ul style="padding-left: 0; list-style-type: none; margin: 0; font-size: 14px;">
                                ${weaknessesHtml}
                            </ul>
                        </div>
                        
                    </div>
                </div>
            `;
            document.getElementById('dat-eval-submodal').style.display = 'flex';
        } catch (e) {
            console.error("Failed to parse evaluation", e);
        }
    };

    window.closeDatEvaluation = function() {
        document.getElementById('dat-eval-submodal').style.display = 'none';
    };

    // Auto-load results when DAT tab is clicked
    const _origSwitchAdminTab = window.switchAdminTab;
    window.switchAdminTab = function(tab) {
        if (_origSwitchAdminTab) _origSwitchAdminTab(tab);
        if (tab === 'dat') fetchDatNegotiationResults();
    };