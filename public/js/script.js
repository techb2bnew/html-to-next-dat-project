// Simple, ultra-robust API Base Detection
const API_BASE_URL = (window.__APP_CONFIG__ && window.__APP_CONFIG__.apiUrl) || "https://b2b-bck.onrender.com";

console.log(`[System] Practice context: Port=${window.location.port}, Host=${window.location.hostname}`);
console.log(`[System] API Base configured as: "${API_BASE_URL || '(relative to current port)'}"`);


let sessionId = null;
let userInteracted = false;
const chatEl = document.getElementById("chat");
const startBtn = document.getElementById("start");
const userCam = document.getElementById("userCam");
const recordBtn = document.getElementById("record");
const stopBtn = document.getElementById("stop");
const timerEl = document.getElementById("timer");
const botVoice = document.getElementById("botVoice");
const aiAvatarWrapper = document.getElementById("ai-avatar-wrapper");
const botVideo = document.getElementById("botVideo");
const globalLoader = document.getElementById("global-loader");
const loaderMessage = document.getElementById("loader-message");

function showLoader(msg = "Processing...") {
    if (msg === "Dispatcher is thinking...") {
        return; // Do absolutely nothing! No full screen overlay, no text change!
    }
    if (globalLoader) {
        if (loaderMessage) loaderMessage.textContent = msg;
        globalLoader.style.display = "flex";
    }
}

function hideLoader() {
    if (globalLoader) globalLoader.style.display = "none";
}


if (botVoice) {
    botVoice.onplay = () => {
        if (aiAvatarWrapper) aiAvatarWrapper.classList.add("speaking");
        if (botVideo) {
            botVideo.play().catch(() => {
                console.warn("System: botVideo.play() failed on start");
            });
        }
    };
    botVoice.onpause = () => {
        if (aiAvatarWrapper) aiAvatarWrapper.classList.remove("speaking");
        if (botVideo) botVideo.pause();
    };
    botVoice.onended = () => {
        if (aiAvatarWrapper) aiAvatarWrapper.classList.remove("speaking");
        if (botVideo) {
            botVideo.pause();
            botVideo.currentTime = 0; // Return to front-facing idle position
        }
    };
}

let isRecording = false;
let isUploading = false;

// session state
let isSessionEnded = false;

// Get session ID from URL if present
function getSessionIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('session_id');
}

function addMsg(text, type, isHtml = false) {
    if (!text) return;
    const div = document.createElement("div");
    div.className = "msg " + type;
    if (isHtml) {
        div.innerHTML = text;
    } else {
        div.textContent = text;
    }
    chatEl.appendChild(div);
    chatEl.scrollTop = chatEl.scrollHeight;
}

function setDisabled(el, disabled) {
    if (el) el.disabled = !!disabled;
}

// Bot assets function removed as bot view was simplified

let mediaStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let timerInterval = null;
let recordingStart = 0;

let recognition = null;
let transcriptBuffer = "";
let liveTranscriptDiv = null;

function initRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { return null; }
    recognition = new SR();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
        try {
            let interim = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const r = event.results[i];
                if (r.isFinal && r[0] && r[0].transcript) {
                    const t = r[0].transcript.trim();
                    if (t) transcriptBuffer += (transcriptBuffer ? " " : "") + t;
                } else if (r[0] && r[0].transcript) {
                    interim += r[0].transcript;
                }
            }
            // Update live display
            if (liveTranscriptDiv) {
                const finalText = transcriptBuffer ? transcriptBuffer : "";
                const interimText = interim ? " <span style='color:#888'>" + interim + "</span>" : "";
                liveTranscriptDiv.innerHTML = "<strong>Your answer:</strong> " + finalText + interimText;
            }
        } catch (_) { }
    };
    recognition.onerror = () => { };
    recognition.onend = () => { };
    return recognition;
}
function startRecognition() {
    if (!recognition) initRecognition();
    
    if (!recognition) {
        console.warn("System: Speech recognition not supported.");
        return;
    }

    transcriptBuffer = "";

    // Create live transcript display
    if (!liveTranscriptDiv) {
        liveTranscriptDiv = document.createElement("div");
        liveTranscriptDiv.style.cssText = "background:#f0f9ff;border:1px solid #bae6fd;padding:10px;margin:10px 0;border-radius:6px;min-height:40px;font-size:14px;";
        chatEl.appendChild(liveTranscriptDiv);
    }
    liveTranscriptDiv.innerHTML = "<strong>Listening...</strong> <span style='color:#888'>Speak your answer</span>";

    try { recognition && recognition.start(); } catch (_) { }
}
function stopRecognition() {
    try { recognition && recognition.stop(); } catch (_) { }

    // Remove live display after recording
    if (liveTranscriptDiv && liveTranscriptDiv.parentNode) {
        let divToRemove = liveTranscriptDiv;
        liveTranscriptDiv = null;
        setTimeout(() => {
            if (divToRemove && divToRemove.parentNode) {
                divToRemove.remove();
            }
        }, 500);
    }
}


async function initCamera() {
    try {
        const constraints = { 
            audio: true 
        };
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (userCam) {
            userCam.srcObject = mediaStream;
        }
        console.log("System: Microphone initialized successfully.");
    } catch (err) {
        console.error("System: Microphone error:", err);
        addMsg("System: Microphone unavailable. Please ensure permissions are granted and you are using HTTPS.", "system");
    }
}

// Proctoring functionality completely removed

function formatTime(ms) {
    const total = Math.floor(ms / 1000);
    const m = String(Math.floor(total / 60)).padStart(2, "0");
    const s = String(total % 60).padStart(2, "0");
    return m + ":" + s;
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    recordingStart = Date.now();
    timerEl.textContent = "00:00";
    timerEl.classList.add("on");
    timerInterval = setInterval(() => {
        timerEl.textContent = formatTime(Date.now() - recordingStart);
    }, 500);
}

function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    timerEl.classList.remove("on");
    timerEl.textContent = "00:00";
}

function createRecorder() {
    if (!mediaStream) return null;

    // Create audio-only stream for recording to save bandwidth/space
    const audioStream = new MediaStream(mediaStream.getAudioTracks());

    // LOWER BITRATE to 32kbps for faster upload
    const options = { mimeType: "audio/webm;codecs=opus", audioBitsPerSecond: 32000 };
    let rec;

    try {
        rec = new MediaRecorder(audioStream, options);
    } catch (e) {
        try {
            // Fallback options
            rec = new MediaRecorder(audioStream);
        } catch (err) {
            return null;
        }
    }
    return rec;
}

async function startRecording() {
    if (!window.isBrokerPracticeMode && !sessionId) {
        addMsg("System: Please start the practice session first.", "system");
        return;
    }
    if (isUploading) {
        addMsg("System: Please wait, uploading previous answer.", "system");
        return;
    }
    if (isRecording) {
        return;
    }
    if (!mediaStream) await initCamera();
    mediaRecorder = createRecorder();
    if (!mediaRecorder) {
        addMsg("System: Recording not supported in this browser.", "system");
        return;
    }
    recordedChunks = [];
    isRecording = true;
    recordBtn.classList.add("recording");
    mediaRecorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) recordedChunks.push(e.data); };
    mediaRecorder.onstop = () => { isRecording = false; recordBtn.classList.remove("recording"); finalizeUpload(); };
    mediaRecorder.onerror = () => { addMsg("System: Recorder error.", "system"); isRecording = false; recordBtn.classList.remove("recording"); };
    setDisabled(recordBtn, true);
    setDisabled(stopBtn, true);
    startTimer();
    setTimeout(() => { setDisabled(stopBtn, false); }, 1000);
    addMsg("System: Recording started. Speak your answer.", "system");
    startRecognition();
    try { mediaRecorder.start(1000); } catch (_) { mediaRecorder.start(); }
}

function stopRecording() {
    try { stopRecognition(); } catch (_) { }
    setDisabled(stopBtn, true);
    stopTimer();
    recordBtn.classList.remove("recording");

    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
    } else {
        finalizeUpload();
    }
}

async function finalizeUpload() {
    // Grace period for recognition to finish last words
    if (recognition) {
        try { stopRecognition(); } catch(e){}
    }
    await new Promise(r => setTimeout(r, 500));

    if (isUploading || recordedChunks.length === 0) {
        if (isUploading) return;
        // If no audio chunks, still try to send text transcript if available
        if (!transcriptBuffer.trim()) {
            isRecording = false;
            setDisabled(recordBtn, false);
            return;
        }
    }

    isUploading = true;
    isRecording = false;
    stopTimer();

    const blob = new Blob(recordedChunks, { type: "audio/webm" });
    recordedChunks = [];

    const answerText = (transcriptBuffer || "").trim() || "[video_answer]";

    const form = new FormData();
    form.append("session_id", sessionId);
    form.append("answer", answerText);

    // Always send the media file if it exists so admin can review audio
    if (blob.size > 0) {
        console.log(`System: Sending media blob (${(blob.size / 1024).toFixed(1)} KB).`);
        form.append("media", blob, "answer.webm");
    }


    // Show what user said
    if (answerText && answerText !== "[video_answer]") {
        addMsg("You: " + answerText, "me");
    } else {
        addMsg("You: [Processing audio...]", "me");
    }
    
    console.log("System: Sending answer request...");
    showLoader("Dispatcher is thinking...");
    if (aiAvatarWrapper) aiAvatarWrapper.classList.add("thinking");

    if (window.isBrokerPracticeMode && window.activeBrokerLoad) {
        try {
            simActiveCall.history.push({q: "", a: answerText});
            simActiveCall.turnCount++;

            const bName = typeof window.activeBrokerLoad.broker === 'string' 
                ? window.activeBrokerLoad.broker 
                : (window.activeBrokerLoad.broker?.name || "Broker");
            const actualLoadId = window.activeBrokerLoad.load_id || window.activeBrokerLoad.reference_number || "SIM-12345";

            const payload = {
                load_id: actualLoadId,
                broker_name: bName,
                student_offer: 0,
                history: simActiveCall.history,
                turn_count: simActiveCall.turnCount,
                load: window.activeBrokerLoad,
                user_reply: answerText
            };

            const response = await fetch(`${SIM_API_BASE}/api/sim/calls/negotiate`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            hideLoader();
            if (aiAvatarWrapper) aiAvatarWrapper.classList.remove("thinking");
            
            if (data.dialogue) {
                simActiveCall.history[simActiveCall.history.length-1].q = data.dialogue;
                addMsg("Broker: " + data.dialogue, "bot");
                speak(data.dialogue, null);
                setDisabled(recordBtn, false);
            }

            if (data.status === "Booked" || data.status === "Hung Up") {
                addMsg("System: Negotiation " + data.status, "system");
                setDisabled(recordBtn, true);
                if (data.status === "Booked") {
                     const finalRate = data.counter_offer || data.agreed_rate || window.activeBrokerLoad.rate || 0;
                     addMsg(`<button onclick="bookLoadDirectly('${window.activeBrokerLoad.load_id || window.activeBrokerLoad.reference_number}')" class="btn-book" style="margin-top:10px; padding:12px; border-radius:8px; background:#10b981; color:white; font-weight:800; cursor:pointer; border:none; width:100%;">Book Load at $${finalRate}</button>`, "system", true);
                } else if (data.status === "Hung Up") {
                     setTimeout(() => {
                         window.isBrokerPracticeMode = false;
                         window.activeBrokerLoad = null;
                         const callSource = localStorage.getItem("broker_call_source");
                         localStorage.removeItem("broker_call_source");
                         if (typeof togglePracticeModeView === 'function') togglePracticeModeView(false);
                         if (callSource === "standalone_dat") {
                             window.location.href = '/dat-simulator';
                         } else {
                             const datTab = document.querySelector('.academy-tab-btn[data-view="dat-simulator"]');
                             if (datTab) datTab.click();
                         }
                     }, 3000); // 3 seconds grace period before auto-hanging up
                }
            }
        } catch(e) {
            console.error("System: Error uploading broker answer:", e);
            addMsg("System: Server error during negotiation. Please check your internet and try again.", "system");
            setDisabled(recordBtn, false);
        } finally {
            isUploading = false;
            hideLoader();
            if (aiAvatarWrapper) aiAvatarWrapper.classList.remove("thinking");
        }
        return;
    }

    try {
        // No retries, just one attempt with a reasonable timeout implied by browser
        const response = await fetch(API_BASE_URL + "/answer", { method: "POST", body: form });


        if (response.status === 400) {
            addMsg("System: session_id missing. Start again.", "system");
            setDisabled(recordBtn, false);
            isUploading = false;
            if (aiAvatarWrapper) aiAvatarWrapper.classList.remove("thinking");
            return;
        }

        const data = await response.json();
        console.log("System: /answer response received:", data);

        const score = typeof data.score !== "undefined" ? data.score : null;
        const feedback = data.feedback || "";
        const nextQ = data.next_question || null;

        if (nextQ) {
            addMsg("Broker: " + nextQ, "bot");
            speak(nextQ, data.tts_url);
            setDisabled(recordBtn, false);
        } else {
            addMsg("System: Practice session complete.", "system");
            setDisabled(recordBtn, true);
            isSessionEnded = true;
            if (data.report) {
                showFinalReport(data.report);
            }
        }

    } catch (e) {
        console.error("System: Error uploading answer:", e);
        addMsg("System: Server error. Please check your internet and try again.", "system");
        setDisabled(recordBtn, false);
    } finally {
        isUploading = false;
        hideLoader();
        if (aiAvatarWrapper) aiAvatarWrapper.classList.remove("thinking");
    }


}


function setupModalListeners() {
    const selectedTechInput = document.getElementById('selected-tech');
    let selectedTech = selectedTechInput ? selectedTechInput.value : "Dispatcher";

    const modalStartBtn = document.getElementById('start-session-btn');
    if (modalStartBtn) {
        modalStartBtn.onclick = () => {
            const nameEl = document.getElementById('student-name');
            const emailEl = document.getElementById('student-email');
            const mobileEl = document.getElementById('student-mobile');

            const name = nameEl?.value.trim();
            const email = emailEl?.value.trim();
            const mobile = mobileEl?.value.trim();

            console.log("System: Validation Check - Name:", name, "Email:", email, "Mobile:", mobile);

            // Check if mobile field is actually visible to the user
            const isMobileVisible = mobileEl && (mobileEl.offsetWidth > 0 || mobileEl.offsetHeight > 0 || mobileEl.offsetParent !== null);

            if (!name || !email || (isMobileVisible && !mobile)) {
                console.warn("System: Validation failed. Name, Email, or Visible Mobile missing.");
                alert("Please fill in all required details to start the session.");
                return;
            }

            const college = document.getElementById('student-college')?.value.trim() || "";
            const course = document.getElementById('student-course')?.value.trim() || "";
            const semester = document.getElementById('student-semester')?.value.trim() || "";
            
            let batchId = document.getElementById('student-session')?.value;
            if (!batchId) {
                alert("Please select a Practice Session Mode.");
                return;
            }

            // If 'Hiring' mode selected, we pass empty batchId so it's a standalone session
            if (batchId === "Practice") batchId = "";

            startSession(selectedTech, name, email, mobile, batchId, college, course, semester);
        };
    }
}

async function loadActiveSessions() {
    const sessionSelect = document.getElementById('student-session');
    if (!sessionSelect) return;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for higher reliability (cold boots)

        const res = await fetch(API_BASE_URL + "/active_batches", { signal: controller.signal });
        clearTimeout(timeoutId);
        
        const batches = await res.json();
        window.batchModes = {}; // Global to track modes
        window.batchColleges = {}; // Global to track pre-filled colleges
        
        sessionSelect.innerHTML = '<option value="">-- Choose Mode --</option>';
        
        // Add Standalone Practice Mode
        const hiringOpt = document.createElement('option');
        hiringOpt.value = "Practice";
        hiringOpt.textContent = "ðŸŽ¯ Standalone Practice (AI Guided)";
        sessionSelect.appendChild(hiringOpt);
        
        // Ensure batches is an array
        const batchList = Array.isArray(batches) ? batches : [];

        if (batchList.length > 0) {
            batchList.forEach(b => {
                const opt = document.createElement('option');
                opt.value = b.batch_id;
                
                const modeLabel = b.mode === 'pool_campus' ? "ðŸŒ Pool: " : 
                                  b.mode === 'college' ? "ðŸŽ“ College: " : "ðŸ¢ Session: ";
                
                opt.textContent = modeLabel + b.name;
                sessionSelect.appendChild(opt);
                window.batchModes[b.batch_id] = b.mode || "standard";
                window.batchColleges[b.batch_id] = b.college_name || "";
            });
        }
        
        // Listener for mode-specific fields
        sessionSelect.onchange = () => {
            const poolExtras = document.getElementById('pool-campus-extras');
            const collegeWrap = document.getElementById('student-college-wrap');
            const collegeInput = document.getElementById('student-college');
            
            const bId = sessionSelect.value;
            const mode = window.batchModes[bId];
            
            // Handle Pool Campus Extras
            if (poolExtras) {
                poolExtras.style.display = (mode === 'pool_campus' || mode === 'college') ? 'block' : 'none';
            }

            // Handle College Input visibility/value
            if (mode === 'college') {
                if (collegeWrap) collegeWrap.style.display = 'none'; // Hide if pre-filled
                if (collegeInput) collegeInput.value = window.batchColleges[bId];
            } else if (mode === 'pool_campus') {
                if (collegeWrap) collegeWrap.style.display = 'block';
                if (collegeInput) collegeInput.value = '';
            } else {
                if (collegeWrap) collegeWrap.style.display = 'none';
                if (collegeInput) collegeInput.value = '';
            }
        };
        
        // Auto-select "Practice" (Standalone Practice Mode) for a direct name-only start experience
        sessionSelect.value = "Practice";
        if (typeof sessionSelect.onchange === "function") {
            sessionSelect.onchange();
        }
    } catch (e) {
        console.error("Error loading sessions:", e);
        const msg = e.name === 'AbortError' ? 'â³ Slow connection' : 'Error loading modes';
        sessionSelect.innerHTML = `<option value="">${msg}</option>`;
    }
}

function _initScriptOnReady() {
    setDisabled(recordBtn, true);
    setDisabled(stopBtn, true);

    // Add user interaction listeners to handle autoplay policies
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    // Check if session ID is in URL (from registration)
    const urlSessionId = getSessionIdFromURL();
    if (urlSessionId) {
        sessionId = urlSessionId;
        window.sessionId = sessionId; // Update global reference
        // Auto-start practice
        setTimeout(() => {
            if (startBtn) {
                startBtn.click();
            } else {
                // Fallback: directly call the start function
                startSession();
            }
        }, 500);
    }

    initCamera();
    loadActiveSessions();
    if (typeof initCallingScreenControls === "function") {
        initCallingScreenControls();
    }
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", _initScriptOnReady);
} else {
    _initScriptOnReady();
}
// Function to start the session (used both by button click and direct call)
async function startSession(trackName, name, email, mobile, batchId, college, course, semester) {
    // Start practice session

    setDisabled(startBtn, true);
    setDisabled(recordBtn, true);

    // We will hide the modal ONLY after a successful /start response
    const modal = document.getElementById('tech-modal');

    try {
        console.log("System: Sending /start request to:", API_BASE_URL + "/start");
        const savedName = localStorage.getItem("academy_name") || "Guest";
        const savedEmail = localStorage.getItem("academy_email") || "guest@dispatcheracademy.com";

        const requestBody = sessionId ? { session_id: sessionId } : {
            track: trackName || "Dispatcher",
            student_name: name || savedName,
            email: email || savedEmail,
            mobile_number: mobile || "0000000000",
            batch_id: batchId || "",
            college: college || "",
            course: course || "",
            semester: semester || ""
        };
        console.log("System: Request body:", requestBody);

        const res = await fetch(API_BASE_URL + "/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        showLoader("Starting practice...");

        if (!res.ok) {

            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || errData.error || ("Server returned " + res.status));
        }

        const data = await res.json();
        console.log("System: /start response received:", data);

        if (modal) modal.style.display = 'none';

        sessionId = data.session_id || null;
        window.sessionId = sessionId; // Update global reference

        if (!sessionId) {
            addMsg("System: Failed to start session (no session_id).", "system");
            setDisabled(startBtn, false);
            return;
        }

        const q = data.question || "";
        if (q) {
            addMsg("Broker: " + q, "bot");
            // Use specialized speak function for better reliability
            speak(q, data.tts_url);
            setDisabled(recordBtn, false);
        } else {
            addMsg("System: No question received from server.", "system");
            setDisabled(recordBtn, false);
        }

    } catch (e) {
        console.error("System: Error starting practice:", e);
        addMsg("System: Error starting session. " + e.message + ". Please try again.", "system");
        setDisabled(startBtn, false);
        // Keep modal open so user can retry
        if (modal) modal.style.display = 'flex';
    } finally {
        hideLoader();
    }


}
startBtn.onclick = async () => {
    startSession();
};
recordBtn.onclick = () => {
    startRecording();
};

stopBtn.onclick = () => {
    stopRecording();
    setDisabled(recordBtn, true);
};



function showFinalReport(report) {
    const reportOverlay = document.createElement('div');
    reportOverlay.id = 'final-report';
    reportOverlay.className = 'report-overlay';

    const message = report.message || "Practice Completed. Thank you!";

    reportOverlay.innerHTML = `
        <div class="report-card">
            <h1>Practice Session Completed</h1>
            <div class="icon-check">âœ…</div>
            <p>${message}</p>
            <div style="background: rgba(15, 23, 42, 0.3); padding: 20px; border-radius: 12px; margin-bottom: 32px; border: 1px solid rgba(255,255,255,0.05); text-align: left;">
                <p style="color: #94a3b8; font-size: 0.9rem; margin: 0;">
                    Your responses have been recorded and sent for review. You will receive an email with your results and feedback soon.
                </p>
            </div>
            ${window.isBrokerPracticeMode ? `
                <button onclick="document.getElementById('final-report').remove(); window.isBrokerPracticeMode = false; window.activeBrokerLoad = null; document.querySelector('.academy-tab-btn[data-view=\\'dashboard\\']').click(); window.open('/dat-simulator', '_blank');" class="primary-btn" style="margin: 0 auto; width: fit-content; background: #3b82f6;">
                    Return to Load Board
                </button>
            ` : `
                <button onclick="document.getElementById('final-report').remove(); document.querySelector('.academy-tab-btn[data-view=\\'dashboard\\']').click();" class="primary-btn" style="margin: 0 auto; width: fit-content;">
                    Return to Home
                </button>
            `}
        </div>
    `;

    document.body.appendChild(reportOverlay);
}

function playWarningSound() {
    // Sound disabled per user request
    return;
}

function playCancellationSound() {
    // Sound disabled per user request
    return;
}

// Function to handle user interaction for audio autoplay
function handleUserInteraction() {
    if (!userInteracted) {
        userInteracted = true;
        console.log("System: Detecting user interaction, priming audio...");

        // 1. Resume audio context if it exists (for some browsers)
        try {
            if (window.AudioContext || window.webkitAudioContext) {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                if (ctx.state === 'suspended') ctx.resume();
            }
        } catch (e) { console.warn("AudioContext resume failed", e); }

        // 2. "Unlock" the botVoice audio element
        if (botVoice) {
            botVoice.muted = false;
            // Play a very short silent sound to unlock
            botVoice.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA== ";
            botVoice.play().catch(() => { });
        }

        // 3. Priming SpeechSynthesis (important for some mobile browsers)
        if ('speechSynthesis' in window) {
            if (!window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
                const silentUtterance = new SpeechSynthesisUtterance(" ");
                silentUtterance.volume = 0;
                window.speechSynthesis.speak(silentUtterance);
            }
        }

        // Remove event listeners after first interaction
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);

        console.log("System: Audio systems unlocked.");
    }
}

/**
 * Universal speak function that uses server TTS with browser SpeechSynthesis fallback
 */
function speak(text, ttsUrl) {
    if (!text) return;
    console.log("System: speak() called for text:", text.substring(0, 30) + "...");

    let serverAudioPlayed = false;

    // Try server-side TTS first if URL provided
    if (ttsUrl && botVoice) {
        // Construct full URL
        const fullUrl = ttsUrl.startsWith('http') ? ttsUrl : (API_BASE_URL + ttsUrl);
        console.log("System: Attempting server TTS playback:", fullUrl);

        // Setup one-time event listeners for this specific playback
        const handlePlayError = (err) => {
            if (!serverAudioPlayed) {
                console.warn("System: Server TTS failed (error event), falling back to browser synthesis.", err);
                browserSpeak(text);
            }
        };

        botVoice.onplay = () => {
            serverAudioPlayed = true;
            console.log("System: Server TTS audio started playing.");
            if (aiAvatarWrapper) aiAvatarWrapper.classList.add("speaking");
        };

        botVoice.onended = () => {
            console.log("System: Server TTS audio reached end.");
            if (aiAvatarWrapper) aiAvatarWrapper.classList.remove("speaking");
        };

        botVoice.onerror = (e) => {
            console.log("System: botVoice element error detected.");
            handlePlayError(e);
        };

        botVoice.src = fullUrl;
        botVoice.muted = false;

        botVoice.play().catch(err => {
            console.warn("System: botVoice.play() rejected promise:", err);
            handlePlayError(err);
        });
    } else {
        console.log("System: No server TTS URL provided or element missing. Using browser synthesis directly.");
        browserSpeak(text);
    }
}

/**
 * Browser-native Speech Synthesis fallback
 */
/**
 * Voice settings variables and new controls
 */
let speechSpeed = parseFloat(localStorage.getItem("preferred_voice_speed") || "1.0");
let selectedVoiceName = localStorage.getItem("preferred_voice_name") || "";

function initCallingScreenControls() {
    console.log("System: Initializing Calling Screen Controls...");

    // 1. Mic Mute Toggle
    const micToggle = document.getElementById("mic-toggle");
    let isMuted = false;
    if (micToggle) {
        micToggle.onclick = () => {
            isMuted = !isMuted;
            if (isMuted) {
                micToggle.classList.add("active");
                micToggle.title = "Unmute Microphone";
                micToggle.innerHTML = `
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6"></path>
                        <path d="M17 16.95A7 7 0 0 1 5 12v-1m14 0v1a7 7 0 0 1-.11 1.23"></path>
                        <line x1="12" y1="19" x2="12" y2="22"></line>
                    </svg>
                `;
                if (mediaStream) {
                    mediaStream.getAudioTracks().forEach(track => track.enabled = false);
                }
                addMsg("System: Microphone muted.", "system");
            } else {
                micToggle.classList.remove("active");
                micToggle.title = "Mute Microphone";
                micToggle.innerHTML = `
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                        <path d="M19 10v1a7 7 0 0 1-14 0v-1"></path>
                        <line x1="12" x2="12" y1="19" y2="22"></line>
                    </svg>
                `;
                if (mediaStream) {
                    mediaStream.getAudioTracks().forEach(track => track.enabled = true);
                }
                addMsg("System: Microphone active.", "system");
            }
        };
    }

    // 2. Voice Accent Selection Populate with Premium Sorting
    const voiceSelector = document.getElementById("voice-accent-selector");
    const speedSlider = document.getElementById("voice-speed-slider");
    const speedValue = document.getElementById("voice-speed-value");

    function loadAccents() {
        if (!voiceSelector) return;
        if (!('speechSynthesis' in window)) {
            voiceSelector.innerHTML = '<option value="">Speech synthesis not supported</option>';
            return;
        }

        const voices = window.speechSynthesis.getVoices() || [];
        // Only load English voices
        const englishVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith("en"));

        if (englishVoices.length === 0) {
            voiceSelector.innerHTML = '<option value="">No English accents found</option>';
            return;
        }

        // Sort: Premium (natural, online, google, siri, neural) first, US first, others after
        englishVoices.sort((a, b) => {
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();
            
            const aIsPremium = aName.includes("natural") || aName.includes("online") || aName.includes("google") || aName.includes("neural") || aName.includes("samantha") || aName.includes("siri");
            const bIsPremium = bName.includes("natural") || bName.includes("online") || bName.includes("google") || bName.includes("neural") || bName.includes("samantha") || bName.includes("siri");
            
            if (aIsPremium && !bIsPremium) return -1;
            if (!aIsPremium && bIsPremium) return 1;
            
            const aLang = a.lang.toLowerCase();
            const bLang = b.lang.toLowerCase();
            const aIsUS = aLang.startsWith("en-us");
            const bIsUS = bLang.startsWith("en-us");
            if (aIsUS && !bIsUS) return -1;
            if (!aIsUS && bIsUS) return 1;
            
            return a.name.localeCompare(b.name);
        });

        voiceSelector.innerHTML = '';
        
        // 1. Add Premium Google Cloud Voices at the very top of the list
        const cloudVoices = [
            { id: "GoogleTranslateCloud_US", name: "âœ¨ Premium Cloud - US Accent", lang: "en-US", prefix: "ðŸ‡ºðŸ‡¸" },
            { id: "GoogleTranslateCloud_GB", name: "âœ¨ Premium Cloud - UK Accent", lang: "en-GB", prefix: "ðŸ‡¬ðŸ‡§" },
            { id: "GoogleTranslateCloud_CA", name: "âœ¨ Premium Cloud - Canadian Accent", lang: "en-CA", prefix: "ðŸ‡¨ðŸ‡¦" },
            { id: "GoogleTranslateCloud_AU", name: "âœ¨ Premium Cloud - Aussie Accent", lang: "en-AU", prefix: "ðŸ‡¦ðŸ‡º" },
            { id: "GoogleTranslateCloud_IN", name: "âœ¨ Premium Cloud - Indian Accent", lang: "en-IN", prefix: "ðŸ‡®ðŸ‡³" }
        ];

        cloudVoices.forEach(cv => {
            const opt = document.createElement("option");
            opt.value = cv.id;
            opt.textContent = `${cv.prefix} ${cv.name}`;
            if (cv.id === selectedVoiceName) opt.selected = true;
            voiceSelector.appendChild(opt);
        });

        // 2. Add local system/browser speech synthesis voices
        englishVoices.forEach(v => {
            const opt = document.createElement("option");
            opt.value = v.name;
            
            const nameLower = v.name.toLowerCase();
            const isPremium = nameLower.includes("natural") || nameLower.includes("online") || nameLower.includes("google") || nameLower.includes("neural") || nameLower.includes("samantha") || nameLower.includes("siri");
            
            let prefix = "ðŸŒ";
            if (v.lang.toLowerCase().startsWith("en-us")) prefix = "ðŸ‡ºðŸ‡¸";
            else if (v.lang.toLowerCase().startsWith("en-gb")) prefix = "ðŸ‡¬ðŸ‡§";
            else if (v.lang.toLowerCase().startsWith("en-ca")) prefix = "ðŸ‡¨ðŸ‡¦";
            else if (v.lang.toLowerCase().startsWith("en-au")) prefix = "ðŸ‡¦ðŸ‡º";
            else if (v.lang.toLowerCase().startsWith("en-in")) prefix = "ðŸ‡®ðŸ‡³";
            
            let quality = isPremium ? "âœ¨ Premium Local" : "Standard (Robotic)";
            
            // Clean up voice name to look premium
            let cleanName = v.name
                .replace("Microsoft", "")
                .replace("Google", "")
                .replace("Desktop", "")
                .replace("Natural", "")
                .replace("Online", "")
                .replace("Voice", "")
                .replace("-", "")
                .replace(/\s+/g, " ")
                .trim();
                
            opt.textContent = `${prefix} ${quality} - ${cleanName}`;
            if (v.name === selectedVoiceName) opt.selected = true;
            voiceSelector.appendChild(opt);
        });

        // Set default to first premium cloud voice if not selected
        if (!selectedVoiceName && cloudVoices.length > 0) {
            selectedVoiceName = cloudVoices[0].id;
            localStorage.setItem("preferred_voice_name", selectedVoiceName);
            voiceSelector.value = selectedVoiceName;
        }

        voiceSelector.onchange = () => {
            selectedVoiceName = voiceSelector.value;
            localStorage.setItem("preferred_voice_name", selectedVoiceName);
            console.log("System: Preferred voice accent updated to:", selectedVoiceName);
        };
    }

    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = loadAccents;
        loadAccents();
    }

    // 3. Speed slider handler
    if (speedSlider && speedValue) {
        speedSlider.value = speechSpeed;
        speedValue.textContent = speechSpeed.toFixed(1) + "x";
        speedSlider.oninput = () => {
            speechSpeed = parseFloat(speedSlider.value);
            speedValue.textContent = speechSpeed.toFixed(1) + "x";
            localStorage.setItem("preferred_voice_speed", speechSpeed.toString());
        };
    }

    // 5. Settings overlay toggle listeners
    const settingsToggle = document.getElementById("voice-settings-toggle");
    const settingsOverlay = document.getElementById("voice-settings-overlay");
    const closeSettings = document.getElementById("close-voice-settings");
    const testVoiceBtn = document.getElementById("test-voice-btn");

    if (settingsToggle && settingsOverlay) {
        settingsToggle.onclick = (e) => {
            e.stopPropagation();
            settingsOverlay.style.display = settingsOverlay.style.display === "none" ? "flex" : "none";
        };
    }

    if (closeSettings && settingsOverlay) {
        closeSettings.onclick = (e) => {
            e.stopPropagation();
            settingsOverlay.style.display = "none";
        };
    }

    if (testVoiceBtn) {
        testVoiceBtn.onclick = (e) => {
            e.stopPropagation();
            browserSpeak("This is a voice check for the B2B dispatcher simulator. How does this sound?");
        };
    }

    // 4. End Call Button
    const endCallBtn = document.getElementById("end-call-btn");
    if (endCallBtn) {
        endCallBtn.onclick = async () => {
            if (window.isBrokerPracticeMode) {
                if (confirm("Are you sure you want to hang up and end this negotiation call?")) {
                    addMsg("System: Call hung up.", "system");
                    setDisabled(recordBtn, true);
                    setDisabled(stopBtn, true);
                    window.isBrokerPracticeMode = false;
                    window.activeBrokerLoad = null;
                    
                    const callSource = localStorage.getItem("broker_call_source");
                    localStorage.removeItem("broker_call_source");
                    
                    if (typeof togglePracticeModeView === 'function') {
                        togglePracticeModeView(false);
                    }
                    
                    if (callSource === "standalone_dat") {
                        window.location.href = '/dat-simulator';
                    } else {
                        // Switch back to embedded DAT Simulator view
                        const datTab = document.querySelector('.academy-tab-btn[data-view="dat-simulator"]');
                        if (datTab) {
                            datTab.click();
                        }
                    }
                }
                return;
            }
            if (!sessionId) {
                addMsg("System: No active call to end.", "system");
                return;
            }
            if (confirm("Are you sure you want to hang up, end this call simulation, and generate your performance report?")) {
                console.log("System: Hanging up call manually...");
                showLoader("Concluding call session...");
                try {
                    // Create FormData to match /answer expectations
                    const form = new FormData();
                    form.append("session_id", sessionId);
                    form.append("answer", "[Dispatcher ended the call]");

                    const response = await fetch(API_BASE_URL + "/answer", { 
                        method: "POST", 
                        body: form 
                    });
                    const data = await response.json();
                    hideLoader();
                    
                    addMsg("System: Call hung up.", "system");
                    if (data.report) {
                        showFinalReport(data.report);
                    } else {
                        window.location.reload();
                    }
                } catch (e) {
                    console.error("System: Error ending call:", e);
                    hideLoader();
                    window.location.reload();
                }
            }
        };
    }
}

/**
 * Browser-native Speech Synthesis fallback with US & Canada Accent and speed control
 */
function playGoogleCloudTTS(text, lang = "en-US", fallbackCallback) {
    const activeAudio = document.getElementById("botVoice") || new Audio();
    
    // Split sentences cleanly under 150 characters
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
    
    if (chunks.length === 0) {
        if (fallbackCallback) fallbackCallback();
        return;
    }
    
    let currentChunkIndex = 0;
    
    const playNext = () => {
        if (currentChunkIndex >= chunks.length) {
            console.log("System: Google Cloud TTS playback complete.");
            if (aiAvatarWrapper) aiAvatarWrapper.classList.remove("speaking");
            return;
        }
        
        const chunk = chunks[currentChunkIndex];
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
        
        activeAudio.src = url;
        activeAudio.onended = () => {
            currentChunkIndex++;
            playNext();
        };
        activeAudio.onerror = (e) => {
            console.warn("System: Google Cloud TTS chunk error, falling back to local speech.");
            if (fallbackCallback) fallbackCallback();
        };
        
        activeAudio.play().catch(err => {
            console.warn("System: Playback blocked or failed, falling back.", err);
            if (fallbackCallback) fallbackCallback();
        });
    };
    
    if (aiAvatarWrapper) aiAvatarWrapper.classList.add("speaking");
    playNext();
}

function browserSpeak(text) {
    console.log("System: browserSpeak() execution started.");

    // Check if cloud voice is selected
    if (selectedVoiceName && selectedVoiceName.startsWith("GoogleTranslateCloud")) {
        let lang = "en-US";
        if (selectedVoiceName.includes("GB")) lang = "en-GB";
        else if (selectedVoiceName.includes("AU")) lang = "en-AU";
        else if (selectedVoiceName.includes("CA")) lang = "en-CA";
        else if (selectedVoiceName.includes("IN")) lang = "en-IN";
        
        playGoogleCloudTTS(text, lang, () => {
            runLocalFallbackSpeech(text);
        });
        return;
    }

    runLocalFallbackSpeech(text);
}

function runLocalFallbackSpeech(text) {
    if (!('speechSynthesis' in window)) {
        console.error("System: Speech Synthesis NOT SUPPORTED in this browser.");
        return;
    }

    const runSpeech = () => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        const voices = window.speechSynthesis.getVoices();
        let preferredVoice = null;
        
        if (selectedVoiceName) {
            preferredVoice = voices.find(v => v.name === selectedVoiceName);
        }
        
        if (!preferredVoice) {
            // Curated premium fallback order for US & Canadian voices
            preferredVoice = voices.find(v => 
                v.lang && v.name && (
                    (v.name.toLowerCase().includes('natural') || 
                     v.name.toLowerCase().includes('online') || 
                     v.name.toLowerCase().includes('google') || 
                     v.name.toLowerCase().includes('neural') || 
                     v.name.toLowerCase().includes('siri') || 
                     v.name.toLowerCase().includes('samantha')) && 
                    (v.lang.startsWith('en-US') || v.lang.startsWith('en-CA'))
                )
            ) || voices.find(v => v.lang && v.lang.startsWith('en-US')) 
              || voices.find(v => v.lang && v.lang.startsWith('en-CA')) 
              || voices.find(v => v.lang && v.lang.startsWith('en'));
        }

        if (preferredVoice) {
            console.log("System: Using voice:", preferredVoice.name);
            utterance.voice = preferredVoice;
        }

        utterance.rate = speechSpeed;
        utterance.pitch = 1.0;
        utterance.volume = 1.0; // Ensure maximum volume

        utterance.onstart = () => {
            console.log("System: browserSpeak successfully started speaking.");
            if (aiAvatarWrapper) aiAvatarWrapper.classList.add("speaking");
        };
        utterance.onend = () => {
            console.log("System: browserSpeak finished speaking.");
            if (aiAvatarWrapper) aiAvatarWrapper.classList.remove("speaking");
        };
        utterance.onerror = (e) => {
            console.error("System: browserSpeak encountered an error:", e);
            if (aiAvatarWrapper) aiAvatarWrapper.classList.remove("speaking");
        };

        window.speechSynthesis.speak(utterance);
    };

    // Browsers often load voices asynchronously
    if (window.speechSynthesis.getVoices().length === 0) {
        console.log("System: Voice list empty, waiting for 'onvoiceschanged' event.");
        let fallbackTimeout;
        window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.onvoiceschanged = null; // Clean up
            clearTimeout(fallbackTimeout);
            runSpeech();
        };
        // Fallback timeout in case event never fires
        fallbackTimeout = setTimeout(() => {
            window.speechSynthesis.onvoiceschanged = null;
            if (window.speechSynthesis.getVoices().length > 0) runSpeech();
        }, 500);
    } else {
        runSpeech();
    }
}



