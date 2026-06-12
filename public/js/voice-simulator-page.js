(function(){if(document.readyState!=='loading'){var _a=document.addEventListener.bind(document);document.addEventListener=function(t,f,o){if(t==='DOMContentLoaded'){return setTimeout(f,0);}return _a(t,f,o);};if(document.readyState==='complete'){Object.defineProperty(window,'onload',{set:function(f){if(f)setTimeout(f,0);},get:function(){return null;},configurable:true});}}})();
const SIM_API_BASE = (window.__APP_CONFIG__ && window.__APP_CONFIG__.apiUrl) || "https://b2b-bck.onrender.com";

      let selectedMode = "broker";
      let simulationState = {};
      let callHistory = [];
      let recognition;
      let isRecording = false;
      let synth = window.speechSynthesis;
      let aiVoice = null;
      let callActive = false;

      // Direct load bypass
      document.addEventListener("DOMContentLoaded", () => {
        const loadDataStr = localStorage.getItem("active_broker_call_load");
        if (loadDataStr) {
          const loadData = JSON.parse(loadDataStr);
          localStorage.removeItem("active_broker_call_load");
          
          document.getElementById("setup-modal").style.display = "none";
          document.getElementById("main-dashboard").style.display = "grid";
          
          initializeDirectCall(loadData);
        }
      });

      // Wait for voices
      synth.onvoiceschanged = () => {
        const voices = synth.getVoices();
        aiVoice =
          voices.find((v) => v.lang === "en-US" && v.name.includes("Female")) ||
          voices[1];
      };

      function selectMode(mode) {
        selectedMode = mode;
        document
          .querySelectorAll(".mode-btn")
          .forEach((b) => b.classList.remove("active"));
        event.target.classList.add("active");
      }

      function startSimulation() {
        document.getElementById("setup-modal").style.opacity = "0";
        setTimeout(() => {
          document.getElementById("setup-modal").style.display = "none";
          document.getElementById("main-dashboard").style.display = "grid";
          initializeCall();
        }, 400);
      }

      function addEvent(text) {
        const tl = document.getElementById("timeline");
        const now = new Date();
        const timeStr =
          now.getHours().toString().padStart(2, "0") +
          ":" +
          now.getMinutes().toString().padStart(2, "0");
        tl.innerHTML += `
            <div class="timeline-event">
                <span class="timeline-time">${timeStr}</span>
                <span class="timeline-content">${text}</span>
            </div>
        `;
        tl.scrollTop = tl.scrollHeight;
      }

      function addTranscript(speaker, text, type) {
        const tr = document.getElementById("transcript");
        if (type === "system") {
          tr.innerHTML += `<div class="msg msg-system">${text}</div>`;
        } else {
          const cls = type === "ai" ? "msg-ai" : "msg-user";
          tr.innerHTML += `
                <div class="msg ${cls}">
                    <div class="msg-speaker">${speaker}</div>
                    ${text}
                </div>
            `;
        }
        tr.scrollTop = tr.scrollHeight;
      }

      function initializeCall() {
        addEvent("Initializing connection...");
        fetch(SIM_API_BASE + "/api/sim/calls/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ simulation_mode: selectedMode }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.status === "success") {
              simulationState = data;
              document.getElementById("ai-name").innerText = data.ai_persona;
              document.getElementById("ai-role").innerText =
                data.ai_role + " AI";
              document.getElementById("avatar-initial").innerText =
                data.ai_persona.charAt(0);

              const sc = data.scenario;
              document.getElementById("scenario-box").innerHTML = `
                    <div><span>Lane:</span> ${sc.lane.origin} &rarr; ${sc.lane.destination}</div>
                    <div><span>Equipment:</span> ${sc.equipment}</div>
                    <div><span>Commodity:</span> ${sc.commodity} (${sc.weight})</div>
                    <div><span>Market:</span> ${sc.market_condition}</div>
                    <div style="margin-top:10px; color: var(--accent-success);"><span>Base Rate:</span> $${sc.base_rate}</div>
                `;

              addEvent(`Connected to ${data.ai_persona} (${data.ai_role})`);
              addTranscript(
                "System",
                "Call connected. Initiating...",
                "system",
              );
              setupSpeech();
              callActive = true;

              // Trigger first AI message
              setTimeout(() => sendToBackend(""), 1000);
            }
          });
      }

      function initializeDirectCall(load) {
        selectedMode = "broker";
        callActive = true;

        let bName = load.broker && load.broker.name ? load.broker.name : (typeof load.broker === 'string' ? load.broker : "Broker");

        const originStr = typeof load.origin === 'string' ? load.origin : (load.origin.city + ", " + load.origin.state);
        const destStr = typeof load.destination === 'string' ? load.destination : (load.destination.city + ", " + load.destination.state);
        const equipStr = load.equipment && load.equipment.type ? load.equipment.type : "Van";
        const weightStr = load.equipment && load.equipment.weight ? load.equipment.weight.toLocaleString() + " lbs" : "40,000 lbs";

        simulationState = {
            mode: "broker",
            ai_role: "Broker",
            user_role: "Carrier",
            ai_persona: bName,
            scenario: {
                lane: { origin: originStr, destination: destStr },
                equipment: equipStr,
                commodity: load.commodity || "General Merchandise",
                weight: weightStr,
                market_condition: "Standard",
                base_rate: load.rate || 2000
            }
        };

        document.getElementById("ai-name").innerText = simulationState.ai_persona;
        document.getElementById("ai-role").innerText = simulationState.ai_role + " AI";
        document.getElementById("avatar-initial").innerText = simulationState.ai_persona.charAt(0);

        const sc = simulationState.scenario;
        document.getElementById("scenario-box").innerHTML = `
              <div><span>Lane:</span> ${sc.lane.origin} &rarr; ${sc.lane.destination}</div>
              <div><span>Equipment:</span> ${sc.equipment}</div>
              <div><span>Commodity:</span> ${sc.commodity} (${sc.weight})</div>
              <div><span>Market:</span> ${sc.market_condition}</div>
              <div style="margin-top:10px; color: var(--accent-success);"><span>Base Rate:</span> $${sc.base_rate}</div>
          `;

        addEvent(`Connected to ${simulationState.ai_persona} (${simulationState.ai_role})`);
        addTranscript("System", "Call connected. Initiating...", "system");
        setupSpeech();

        fetch(SIM_API_BASE + "/api/sim/calls/initiate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                load_id: load.load_id || "SIM-123",
                broker_name: bName,
                load: load
            })
        })
        .then(r => r.json())
        .then(data => {
            if (data.opening_line) {
                callHistory.push({ role: "assistant", content: data.opening_line });
                addTranscript(simulationState.ai_persona, data.opening_line, "ai");
                speak(data.opening_line);
                addEvent("AI replied");
                document.getElementById("call-status").innerText = "Connected";
            } else {
                setTimeout(() => sendToBackend(""), 1000);
            }
        })
        .catch(err => {
            setTimeout(() => sendToBackend(""), 1000);
        });
      }

      function setupSpeech() {
        window.SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        if (window.SpeechRecognition) {
          recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = "en-US";

          recognition.onresult = function (event) {
            const transcript = event.results[0][0].transcript;
            addTranscript("You", transcript, "user");
            addEvent("User spoke");
            sendToBackend(transcript);
          };

          recognition.onend = function () {
            isRecording = false;
            document
              .getElementById("mic-btn")
              .classList.remove("pulse", "active");
          };
        } else {
          addTranscript(
            "System",
            "Speech recognition not supported. Use Chrome.",
            "system",
          );
        }
      }

      function toggleMic() {
        if (!recognition || !callActive) return;
        if (isRecording) {
          recognition.stop();
        } else {
          recognition.start();
          isRecording = true;
          document.getElementById("mic-btn").classList.add("pulse", "active");
          document.getElementById("call-status").innerText = "Listening...";
        }
      }

      function sendToBackend(userText) {
        if (!callActive) return;

        if (userText) {
          callHistory.push({ role: "user", content: userText });
        }

        document.getElementById("call-status").innerText = "AI is thinking...";

        const payload = {
          mode: simulationState.mode,
          ai_role: simulationState.ai_role,
          user_role: simulationState.user_role,
          ai_persona: simulationState.ai_persona,
          scenario: simulationState.scenario,
          history: callHistory,
        };

        fetch(SIM_API_BASE + "/api/sim/calls/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
          .then((r) => r.json())
          .then((data) => {
            if (!callActive) return;
            document.getElementById("call-status").innerText = "Connected";

            if (data.status === "success") {
              const reply = data.reply;
              callHistory.push({ role: "assistant", content: reply });
              addTranscript(simulationState.ai_persona, reply, "ai");
              speak(reply);

              // Update Badges
              if (data.emotional_state && data.emotional_state !== "Neutral") {
                document.getElementById("ai-emotion").style.display = "block";
                document.getElementById("ai-emotion").innerText =
                  "Emotion: " + data.emotional_state;
              }
              if (
                data.detected_objection &&
                data.detected_objection !== "None"
              ) {
                document.getElementById("ai-objection").style.display = "block";
                document.getElementById("ai-objection").innerText =
                  "Objection: " + data.detected_objection;
                addEvent("AI raised objection: " + data.detected_objection);
              }

              if (data.action === "hangup") {
                addEvent("AI hung up");
                setTimeout(() => endCall(false), 3000);
              } else if (data.action === "book") {
                addEvent("Load Booked!");
                setTimeout(() => endCall(false), 3000);
              } else if (data.action === "hold") {
                addEvent("AI placed call on hold");
              } else {
                addEvent("AI replied");
              }
            } else {
              addTranscript("System", "Error: " + data.message, "system");
            }
          });
      }

      // Tracks the currently playing ElevenLabs Audio object so we can stop it
      let currentAudio = null;

      function onSpeakStart() {
        document.getElementById("call-status").innerText = "Speaking...";
        document.getElementById("avatar-wrap").classList.add("is-speaking");
      }

      function onSpeakEnd() {
        document.getElementById("call-status").innerText = "Connected";
        document.getElementById("avatar-wrap").classList.remove("is-speaking");
        // Auto-open mic after AI finishes speaking
        setTimeout(() => {
          if (callActive && !isRecording) toggleMic();
        }, 500);
      }

      // ── Fallback: browser Web Speech API ──────────────────────────────────────
      function speakBrowserFallback(text) {
        if (synth.speaking) synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        if (aiVoice) utterance.voice = aiVoice;
        utterance.rate = 1.05;
        utterance.onstart = onSpeakStart;
        utterance.onend = onSpeakEnd;
        synth.speak(utterance);
        console.warn("TTS: using Web Speech API fallback");
      }

      // ── Primary: ElevenLabs via backend /api/tts ──────────────────────────────
      function speak(text) {
        if (!text) return;

        // Stop any currently playing audio
        if (currentAudio) {
          currentAudio.pause();
          currentAudio = null;
        }
        if (synth.speaking) synth.cancel();

        // Show "thinking" state while audio is being fetched
        document.getElementById("call-status").innerText = "AI speaking...";

        fetch(SIM_API_BASE + "/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: text }),
        })
          .then((resp) => {
            if (!resp.ok) throw new Error(`TTS HTTP ${resp.status}`);
            const engine = resp.headers.get("X-TTS-Engine") || "elevenlabs";
            console.log(`TTS: using ${engine}`);
            return resp.blob();
          })
          .then((blob) => {
            const url = URL.createObjectURL(blob);
            currentAudio = new Audio(url);
            currentAudio.onplay = onSpeakStart;
            currentAudio.onended = () => {
              URL.revokeObjectURL(url);
              currentAudio = null;
              onSpeakEnd();
            };
            currentAudio.onerror = () => {
              console.warn(
                "TTS: Audio playback error, falling back to browser TTS",
              );
              URL.revokeObjectURL(url);
              currentAudio = null;
              speakBrowserFallback(text);
            };
            currentAudio.play().catch(() => {
              // Autoplay blocked or other error — fall back
              speakBrowserFallback(text);
            });
          })
          .catch((err) => {
            console.warn(
              "TTS: backend request failed, using browser fallback. Error:",
              err,
            );
            speakBrowserFallback(text);
          });
      }

      function endCall(manual = true) {
        callActive = false;
        // Stop ElevenLabs audio if playing
        if (currentAudio) {
          currentAudio.pause();
          currentAudio = null;
        }
        if (synth.speaking) synth.cancel();
        if (isRecording) recognition.stop();

        document.getElementById("call-status").innerText = "Call Ended";
        addEvent(manual ? "User ended call" : "Call disconnected");
        addTranscript(
          "System",
          "Call ended. Generating evaluation...",
          "system",
        );

        // Fetch scores
        fetch(SIM_API_BASE + "/api/sim/calls/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            history: callHistory,
            scenario: simulationState.scenario,
            ai_role: simulationState.ai_role,
            user_role: simulationState.user_role,
            email:
              localStorage.getItem("studentEmail") ||
              "student@dispatcheracademy.com",
            student_name:
              localStorage.getItem("studentName") || "Guest Student",
          }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.status === "success") {
              showScoreModal(data.scores);
            }
          });
      }

      function showScoreModal(scores) {
        document.getElementById("overall-rating").innerText =
          scores.overall_rating + "/100";

        const metrics = [
          { k: "negotiation_score", label: "Negotiation" },
          { k: "communication_score", label: "Communication" },
          { k: "objection_handling_score", label: "Objection Handling" },
          { k: "closing_score", label: "Closing" },
          { k: "professionalism_score", label: "Professionalism" },
          { k: "confidence_score", label: "Confidence" },
          { k: "industry_knowledge_score", label: "Industry Knowledge" },
        ];

        let html = "";
        metrics.forEach((m) => {
          html += `<div class="score-item"><span>${m.label}</span> <span class="score-val">${scores[m.k] || 0}</span></div>`;
        });
        document.getElementById("score-grid").innerHTML = html;

        document.getElementById("score-strengths").innerHTML = scores.strengths
          .map((s) => `<li>${s}</li>`)
          .join("");
        document.getElementById("score-weaknesses").innerHTML =
          scores.weaknesses.map((s) => `<li>${s}</li>`).join("");
        document.getElementById("score-recommendations").innerHTML =
          scores.recommendations.map((s) => `<li>${s}</li>`).join("");

        document.getElementById("score-modal").style.display = "flex";
      }