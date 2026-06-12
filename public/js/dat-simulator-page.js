(function(){if(document.readyState!=='loading'){var _a=document.addEventListener.bind(document);document.addEventListener=function(t,f,o){if(t==='DOMContentLoaded'){return setTimeout(f,0);}return _a(t,f,o);};if(document.readyState==='complete'){Object.defineProperty(window,'onload',{set:function(f){if(f)setTimeout(f,0);},get:function(){return null;},configurable:true});}}})();
// -------------------------
      // API BASE URL (Dynamic)
      // -------------------------
      const DAT_API_BASE = (window.__APP_CONFIG__ && window.__APP_CONFIG__.apiUrl) || "https://b2b-bck.onrender.com";

      // -------------------------
      // STATE MANAGEMENT (MULTI-TAB)
      // -------------------------
      let tabIdCounter = 1;
      let searchTabs = [
        {
          id: 1,
          title: "New Search",
          origin: "",
          dh_o: "150",
          destination: "",
          dh_d: "150",
          equipment: "Vans (Standard)",
          load_type: "Full",
          length: "",
          weight: "",
          date_range: "Today",
          hasSearched: false,
          results: [],
        },
      ];
      let activeTabId = 1;

      function getActiveTab() {
        return searchTabs.find((t) => t.id === activeTabId);
      }

      function saveCurrentInputs() {
        const tab = getActiveTab();
        if (!tab) return;
        tab.origin = document.getElementById("sim-search-origin").value;
        tab.dh_o = document.getElementById("sim-filter-dho").value;
        tab.destination = document.getElementById("sim-search-dest").value;
        tab.dh_d = document.getElementById("sim-filter-dhd").value;
        tab.equipment = document.getElementById("sim-search-equip").value;
        tab.load_type = document.getElementById("sim-filter-loadtype").value;
        tab.length = document.getElementById("sim-filter-length").value;
        tab.weight = document.getElementById("sim-filter-weight").value;
        tab.date_range = document.getElementById("sim-filter-daterange").value;
        persistSearchTabs();
      }

      function persistSearchTabs() {
        const email = localStorage.getItem("studentEmail");
        if (email) {
          localStorage.setItem(`sim_searchTabs_${email}`, JSON.stringify({
            tabIdCounter: tabIdCounter,
            activeTabId: activeTabId,
            searchTabs: searchTabs
          }));
        }
      }

      function restoreSearchTabs() {
        const email = localStorage.getItem("studentEmail");
        if (email) {
          const stored = localStorage.getItem(`sim_searchTabs_${email}`);
          if (stored) {
            try {
              const data = JSON.parse(stored);
              tabIdCounter = data.tabIdCounter || 1;
              activeTabId = data.activeTabId || 1;
              searchTabs = data.searchTabs || searchTabs;
              loadTabInputs(getActiveTab() || searchTabs[0]);
              renderTabsBar();
            } catch(e) {
              console.error("Failed to parse stored search tabs", e);
            }
          }
        }
      }

      function loadTabInputs(tab) {
        document.getElementById("sim-search-origin").value = tab.origin;
        document.getElementById("sim-filter-dho").value = tab.dh_o;
        document.getElementById("sim-search-dest").value = tab.destination;
        document.getElementById("sim-filter-dhd").value = tab.dh_d;
        document.getElementById("sim-filter-length").value = tab.length;
        document.getElementById("sim-filter-weight").value = tab.weight;
        document.getElementById("sim-filter-daterange").value = tab.date_range;

        const equipHidden = document.getElementById("sim-search-equip");
        const equipDisplay = document.getElementById(
          "sim-search-equip-display",
        );
        equipHidden.value = tab.equipment;

        // Map value back to display text for the equipment custom dropdown
        let dispText = "Vans (Standard)";
        if (tab.equipment === "Flatbed") dispText = "Flatbeds";
        else if (tab.equipment === "Reefer") dispText = "Reefers";
        else if (tab.equipment === "Conestoga") dispText = "Conestogas";
        else if (tab.equipment === "Container") dispText = "Containers";
        else if (tab.equipment === "Decks Spec")
          dispText = "Decks (Specialized)";
        else if (tab.equipment === "Decks Std") dispText = "Decks (Standard)";
        equipDisplay.innerText = dispText;

        const eqItems = document.querySelectorAll(
          "#equip-dropdown-container .cd-item:not(.cd-all)",
        );
        eqItems.forEach((i) => {
          if (i.getAttribute("data-val") === tab.equipment)
            i.classList.add("active");
          else i.classList.remove("active");
        });

        // Map load type custom dropdown
        const loadHidden = document.getElementById("sim-filter-loadtype");
        const loadDisplay = document.getElementById(
          "sim-filter-loadtype-display",
        );
        loadHidden.value = tab.load_type;

        let loadDisp = "Full & Partial";
        if (tab.load_type === "FullOnly") loadDisp = "Full";
        else if (tab.load_type === "Partial") loadDisp = "Partial";
        loadDisplay.innerText = loadDisp;

        const loadItems = document.querySelectorAll(
          "#loadtype-dropdown-container .cd-item:not(.cd-all)",
        );
        loadItems.forEach((i) => {
          if (i.getAttribute("data-val") === tab.load_type)
            i.classList.add("active");
          else i.classList.remove("active");
        });

        // Map date range
        const dateInput = document.getElementById("sim-filter-daterange");
        dateInput.value =
          tab.date_range || new Date().toISOString().split("T")[0];
      }

      function renderTabsBar() {
        const bar = document.getElementById("search-tabs-bar");
        let html = "";
        searchTabs.forEach((tab) => {
          const isActive = tab.id === activeTabId ? "active" : "";
          const titleOrig = tab.origin || "New Search";
          const titleDest = tab.destination || "Anywhere";
          html += `
                    <div class="search-tab ${isActive}" onclick="window.switchTab(${tab.id})">
                        <div class="search-tab-content">
                            <span class="search-tab-origin">${titleOrig}</span>
                            <span class="search-tab-dest">${titleDest}</span>
                        </div>
                        <div class="tab-icons">
                            <span>🔔</span>
                            <span onclick="event.stopPropagation(); window.closeTab(${tab.id})">✕</span>
                        </div>
                    </div>
                `;
        });
        html += `<button class="add-tab-btn" onclick="window.addNewTab()">+</button>`;
        bar.innerHTML = html;
      }

      window.switchTab = function (id) {
        saveCurrentInputs();
        activeTabId = id;

        const newTab = getActiveTab();
        loadTabInputs(newTab);
        renderTabsBar();
        persistSearchTabs();

        if (newTab.hasSearched) {
          document.getElementById("dat-search-empty").style.display = "none";
          document.getElementById("dat-search-results").style.display = "flex";
          if (window.renderLoadsGrid) window.renderLoadsGrid(newTab.results);
        } else {
          document.getElementById("dat-search-empty").style.display = "flex";
          document.getElementById("dat-search-results").style.display = "none";
        }
      };

      window.addNewTab = function () {
        saveCurrentInputs();
        tabIdCounter++;
        const newTab = {
          id: tabIdCounter,
          title: "New Search",
          origin: "",
          dh_o: "150",
          destination: "",
          dh_d: "150",
          equipment: "Dry Van",
          load_type: "Full",
          length: "",
          weight: "",
          date_range: "Today",
          hasSearched: false,
          results: [],
        };
        searchTabs.push(newTab);
        window.switchTab(newTab.id);
        persistSearchTabs();
      };

      window.closeTab = function (id) {
        if (searchTabs.length === 1) {
          searchTabs[0] = {
            id: tabIdCounter,
            title: "New Search",
            origin: "",
            dh_o: "150",
            destination: "",
            dh_d: "150",
            equipment: "Dry Van",
            load_type: "Full",
            length: "",
            weight: "",
            date_range: "Today",
            hasSearched: false,
            results: [],
          };
          window.switchTab(tabIdCounter);
          persistSearchTabs();
          return;
        }
        const index = searchTabs.findIndex((t) => t.id === id);
        searchTabs = searchTabs.filter((t) => t.id !== id);
        if (activeTabId === id) {
          const newIndex = Math.min(index, searchTabs.length - 1);
          activeTabId = searchTabs[newIndex].id;
          loadTabInputs(searchTabs[newIndex]);
          window.switchTab(activeTabId);
        } else {
          renderTabsBar();
          persistSearchTabs();
        }
      };

      // -------------------------
      // VIEW ROUTING
      // -------------------------
      async function datLogin() {
        const emailInput = document.getElementById("student-email");
        const nameInput = document.getElementById("student-name");
        const email = emailInput
          ? emailInput.value.trim()
          : "student@dispatcheracademy.com";
        const name = nameInput ? nameInput.value.trim() : "Guest Student";

        if (!email) {
          alert("Please enter your email address.");
          return;
        }

        // Admin redirect — b2b@gmail.com goes straight to admin panel
        if (email.toLowerCase() === "b2b@gmail.com") {
          window.location.href = "/admin";
          return;
        }

        try {
            const res = await fetch(`${DAT_API_BASE}/api/sim/auth/login`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, name})
            });
            const data = await res.json();
            if (data.status === "success") {
                localStorage.setItem("session_id", data.session_id);
                localStorage.setItem("studentEmail", data.email);
                localStorage.setItem("studentName", data.name);
                
                restoreSearchTabs();
                
                document.getElementById("dat-view-login").classList.remove("active");
                document.getElementById("dat-app").classList.add("active");
                
                datNav("dashboard", true);
            } else {
                alert("Login failed: " + data.message);
            }
        } catch (e) {
            console.error("Login error", e);
            alert("Error connecting to server.");
        }
      }

      async function logoutSimulator() {
        const sessionId = localStorage.getItem("session_id");
        if (sessionId) {
            try {
                await fetch(`${DAT_API_BASE}/api/sim/auth/logout`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({session_id: sessionId})
                });
            } catch(e) {}
        }
      
        localStorage.removeItem("session_id");
        localStorage.removeItem("studentEmail");
        localStorage.removeItem("studentName");

        const emailInput = document.getElementById("student-email");
        const nameInput = document.getElementById("student-name");
        if (emailInput) emailInput.value = "";
        if (nameInput) nameInput.value = "";

        document.getElementById("dat-app").classList.remove("active");
        document.getElementById("dat-view-login").classList.add("active");
      }

      function toggleDatSidebar() {
        const sidebar = document.querySelector('.dat-sidebar');
        const overlay = document.getElementById('dat-sidebar-overlay');
        if (sidebar) sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('open');
      }

      function datNav(viewName, forceFresh = false) {
        // Auto-close mobile sidebar if open
        const sidebar = document.querySelector('.dat-sidebar');
        const overlay = document.getElementById('dat-sidebar-overlay');
        if (sidebar && sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
          if (overlay) overlay.classList.remove('open');
        }

        document
          .querySelectorAll(".dat-nav-item")
          .forEach((el) => el.classList.remove("active"));
        document
          .querySelectorAll(".sub-view")
          .forEach((el) => el.classList.remove("active"));

        if (viewName === "dashboard") {
          document.getElementById("nav-dashboard").classList.add("active");
          document.getElementById("dat-view-dashboard").classList.add("active");
          loadRecommendedLoads(forceFresh);
        } else if (viewName === "search") {
          document.getElementById("nav-search").classList.add("active");
          document.getElementById("dat-view-search").classList.add("active");
        } else if (viewName === "trucks") {
          document.getElementById("nav-trucks").classList.add("active");
          document.getElementById("dat-view-trucks").classList.add("active");
          loadTrucks();
          loadPostedTrucks();
        } else if (viewName === "post_truck") {
          document.getElementById("nav-trucks").classList.add("active");
          document.getElementById("dat-view-post-truck").classList.add("active");
        } else if (viewName === "loads") {
          document.getElementById("nav-loads").classList.add("active");
          document.getElementById("dat-view-loads").classList.add("active");
          loadMyLoads();
        } else if (viewName === "network") {
          document.getElementById("nav-network").classList.add("active");
          document.getElementById("dat-view-network").classList.add("active");
        } else if (viewName === "tools") {
          document.getElementById("nav-tools").classList.add("active");
          document.getElementById("dat-view-tools").classList.add("active");
        }
      }

      async function loadTrucks() {
        const container = document.getElementById("trucks-container");
        const email =
          localStorage.getItem("studentEmail") ||
          "student@dispatcheracademy.com";
        const name = localStorage.getItem("studentName") || "Guest Student";

        container.innerHTML =
          '<div style="padding:20px; text-align:center; color:#64748b;">Loading active trucks...</div>';

        try {
          const resp = await fetch(
            `${DAT_API_BASE}/api/sim/dashboard?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`,
          );
          if (resp.ok) {
            const data = await resp.json();
            const carriers = data.student.carriers || [];

            if (carriers.length === 0) {
              container.innerHTML =
                '<div style="padding:20px; text-align:center; color:#64748b;">No active trucks assigned to you.</div>';
              return;
            }

            container.innerHTML = "";
            carriers.forEach((c) => {
              const statusColor =
                c.status === "On Trip" ? "#3b82f6" : "#10b981";
              container.innerHTML += `
                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                            <div style="font-weight: 800; font-size: 1.1rem; color: #1e293b">${c.name}</div>
                            <div style="background: ${statusColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: bold;">
                                ${c.status.toUpperCase()}
                            </div>
                        </div>
                        <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 5px">
                            <strong>Driver:</strong> ${c.driver}
                        </div>
                        <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 5px">
                            <strong>Type:</strong> ${c.truck_type}
                        </div>
                        <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 15px">
                            <strong>Location:</strong> ${c.city}, ${c.state}
                        </div>
                        <div style="display:flex; gap:10px;">
                            <button onclick="openDriverChat('${c.driver}', '${c.phone}')" style="flex:1; background: #0f172a; color: white; border: none; padding: 10px; border-radius: 4px; font-weight: bold; cursor: pointer;">
                                💬 Message
                            </button>
                            <button onclick="datNav('search')" style="flex:1; background: #2563eb; color: white; border: none; padding: 10px; border-radius: 4px; font-weight: bold; cursor: pointer;">
                                🔍 Find Load
                            </button>
                        </div>
                    </div>`;
            });
          } else {
            container.innerHTML =
              '<div style="padding:20px; text-align:center; color:#ef4444;">Failed to load active trucks.</div>';
          }
        } catch (e) {
          container.innerHTML =
            '<div style="padding:20px; text-align:center; color:#ef4444;">Network error loading active trucks.</div>';
        }
      }

      async function loadPostedTrucks() {
        const container = document.getElementById("posted-trucks-container");
        if (!container) return;
        const email = localStorage.getItem("studentEmail") || "student@dispatcheracademy.com";

        try {
          const resp = await fetch(`${DAT_API_BASE}/api/sim/dat/trucks/posted?email=${encodeURIComponent(email)}`);
          if (resp.ok) {
            const data = await resp.json();
            const trucks = data.trucks || [];

            if (trucks.length === 0) {
              container.innerHTML = '<div style="padding:20px; text-align:center; color:#64748b; background: white; border: 1px solid #e2e8f0; border-radius: 8px;">No trucks posted.</div>';
              return;
            }

            container.innerHTML = "";
            trucks.forEach((t) => {
              container.innerHTML += `
                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                            <div style="font-weight: 800; font-size: 1.1rem; color: #1e293b">${t.origin} &rarr; ${t.destination}</div>
                            <div style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: bold;">
                                POSTED
                            </div>
                        </div>
                        <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 5px">
                            <strong>Date:</strong> ${t.date_available}
                        </div>
                        <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 5px">
                            <strong>Type:</strong> ${t.equipment}
                        </div>
                        <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 15px">
                            <strong>Posted At:</strong> ${new Date(t.posted_at).toLocaleString()}
                        </div>
                    </div>`;
            });
          }
        } catch (e) {
          container.innerHTML = '<div style="padding:20px; text-align:center; color:#ef4444;">Network error loading posted trucks.</div>';
        }
      }

      async function postTruckAction(e) {
        const btn = e.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span style="color:white; font-size:0.9rem;">Posting...</span>';
        
        const origin = document.getElementById("post-origin").value;
        const destination = document.getElementById("post-dest").value || "Anywhere";
        const equipment = document.getElementById("post-equip").value;
        const date_available = document.getElementById("post-date").value;
        const email = localStorage.getItem("studentEmail") || "student@dispatcheracademy.com";

        if (!origin) {
            alert("Origin is required to post a truck.");
            btn.innerHTML = originalText;
            return;
        }

        try {
          const resp = await fetch(`${DAT_API_BASE}/api/sim/dat/trucks/post`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ origin, destination, equipment, date_available, email })
          });
          if (resp.ok) {
            alert("Truck posted successfully!");
            document.getElementById("post-origin").value = "";
            document.getElementById("post-dest").value = "";
            datNav("trucks");
          } else {
            alert("Failed to post truck.");
          }
        } catch (err) {
          alert("Network error.");
        }
        btn.innerHTML = originalText;
      }

      async function loadMyLoads() {
        const container = document.getElementById("loads-container");
        const email =
          localStorage.getItem("studentEmail") ||
          "student@dispatcheracademy.com";
        const name = localStorage.getItem("studentName") || "Guest Student";

        container.innerHTML =
          '<div style="padding:20px; text-align:center; color:#64748b;">Loading booked loads...</div>';

        try {
          const resp = await fetch(
            `${DAT_API_BASE}/api/sim/dashboard?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`,
          );
          if (resp.ok) {
            const data = await resp.json();

            // If there are no loads in the backend, we show a mock UI or empty state.
            // The dashboard API currently only returns a count of booked_loads, not an array.
            // We will display a nice visual history of dummy loads to match the aesthetic.

            let loadHistory = data.student.booked_load_history || [];
            let loadCount = data.student.booked_loads || 0;

            if (loadHistory.length === 0) {
              container.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px;">
                      <div style="font-size: 3rem; margin-bottom: 15px;">📦</div>
                      <h3 style="margin: 0 0 10px 0; color: #1e293b; font-weight: 800;">No Loads Booked Yet</h3>
                      <p style="color: #64748b; font-size: 0.95rem; margin-bottom: 20px;">You haven't successfully negotiated and booked any loads yet.</p>
                      <button onclick="datNav('search')" style="background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; cursor: pointer;">
                        Search for Loads
                      </button>
                    </div>`;
              return;
            }

            let rowsHtml = loadHistory
              .map(
                (load) => {
                  const brokerText = (typeof load.broker === 'object' && load.broker !== null)
                    ? (load.broker.company || load.broker.name || "Unknown Broker")
                    : (load.broker || "Unknown Broker");
                  return `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 12px 10px; font-weight: bold; color: #0044cc;">#${load.reference_number || load.load_id || "LD-" + Math.floor(Math.random() * 9000)}</td>
                      <td style="padding: 12px 10px;"><span style="background: #10b981; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.7rem;">${load.status || "DELIVERED"}</span></td>
                      <td style="padding: 12px 10px;">${load.origin?.city || "Unknown"}, ${load.origin?.state || ""}</td>
                      <td style="padding: 12px 10px;">${load.destination?.city || "Unknown"}, ${load.destination?.state || ""}</td>
                      <td style="padding: 12px 10px; font-weight: bold;">$${(load.rate || 0).toLocaleString()}</td>
                      <td style="padding: 12px 10px;">${brokerText}</td>
                    </tr>
                  `;
                }
              )
              .join("");

            container.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
                  <h3 style="margin: 0; color: #1e293b; font-size: 1.1rem;">You have booked ${loadCount} load(s)</h3>
                  <span style="color: #10b981; font-weight: bold; font-size: 0.9rem;">Total Revenue: $${data.student.revenue.toLocaleString()}</span>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
                  <thead>
                    <tr style="border-bottom: 2px solid #e2e8f0; color: #64748b;">
                      <th style="padding: 10px;">ID</th>
                      <th style="padding: 10px;">Status</th>
                      <th style="padding: 10px;">Origin</th>
                      <th style="padding: 10px;">Destination</th>
                      <th style="padding: 10px;">Rate</th>
                      <th style="padding: 10px;">Broker</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rowsHtml}
                  </tbody>
                </table>`;
          } else {
            container.innerHTML =
              '<div style="padding:20px; text-align:center; color:#ef4444;">Failed to load loads.</div>';
          }
        } catch (e) {
          container.innerHTML =
            '<div style="padding:20px; text-align:center; color:#ef4444;">Network error loading loads.</div>';
        }
      }

      // -------------------------
      // DRIVER CHAT MODAL
      // -------------------------
      let currentDriverChatHistory = [];

      function openDriverChat(driverName, phone) {
        const modal = document.getElementById("driver-chat-modal");
        if (!modal) {
          // Create modal dynamically if it doesn't exist
          const modalHtml = `
          <div id="driver-chat-modal" style="position: fixed; bottom: 20px; right: 20px; width: 350px; background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); display: flex; flex-direction: column; overflow: hidden; z-index: 10000; border: 1px solid #e2e8f0;">
            <div style="background: #0f172a; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center;">
              <div style="font-weight: bold;">💬 Chat with <span id="driver-chat-name"></span></div>
              <button onclick="closeDriverChat()" style="background: none; border: none; color: white; cursor: pointer; font-size: 1.2rem;">✕</button>
            </div>
            <div id="driver-chat-history" style="height: 250px; overflow-y: auto; padding: 15px; background: #f8fafc; display: flex; flex-direction: column; gap: 10px;">
            </div>
            <div style="padding: 10px; border-top: 1px solid #e2e8f0; display: flex; gap: 10px; background: white;">
              <input type="text" id="driver-chat-input" placeholder="Type a message..." style="flex: 1; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none;">
              <button onclick="sendDriverChatMessage()" id="driver-chat-btn" style="background: #2563eb; color: white; border: none; padding: 0 15px; border-radius: 6px; font-weight: bold; cursor: pointer;">Send</button>
            </div>
          </div>`;
          document.body.insertAdjacentHTML("beforeend", modalHtml);

          document
            .getElementById("driver-chat-input")
            .addEventListener("keypress", function (e) {
              if (e.key === "Enter") sendDriverChatMessage();
            });
        }

        document.getElementById("driver-chat-modal").style.display = "flex";
        document.getElementById("driver-chat-name").innerText = driverName;
        document
          .getElementById("driver-chat-modal")
          .setAttribute("data-driver", driverName);

        const history = document.getElementById("driver-chat-history");
        history.innerHTML = `
          <div style="align-self: flex-start; background: #e2e8f0; color: #1e293b; padding: 10px 15px; border-radius: 15px; font-size: 0.9rem; max-width: 80%;">
            Hey boss, empty and rolling. Got a reload for me yet?
          </div>
        `;
        currentDriverChatHistory = [
          {
            role: "assistant",
            content: "Hey boss, empty and rolling. Got a reload for me yet?",
          },
        ];

        // Auto scroll to bottom
        history.scrollTop = history.scrollHeight;
      }

      function closeDriverChat() {
        const modal = document.getElementById("driver-chat-modal");
        if (modal) modal.style.display = "none";
      }

      function sendDriverChatMessage() {
        const input = document.getElementById("driver-chat-input");
        const btn = document.getElementById("driver-chat-btn");
        const text = input.value.trim();
        if (!text) return;

        const history = document.getElementById("driver-chat-history");
        history.innerHTML += `
          <div style="align-self: flex-end; background: #2563eb; color: white; padding: 10px 15px; border-radius: 15px; font-size: 0.9rem; max-width: 80%;">
            ${text}
          </div>
        `;
        input.value = "";
        btn.disabled = true;
        btn.innerText = "...";
        history.scrollTop = history.scrollHeight;

        currentDriverChatHistory.push({ role: "user", content: text });
        const driverName = document
          .getElementById("driver-chat-modal")
          .getAttribute("data-driver");

        fetch(`${DAT_API_BASE}/api/sim/driver/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            driver_name: driverName,
            message: text,
            history: currentDriverChatHistory,
          }),
        })
          .then((r) => r.json())
          .then((data) => {
            btn.disabled = false;
            btn.innerText = "Send";
            if (data.reply) {
              history.innerHTML += `
                <div style="align-self: flex-start; background: #e2e8f0; color: #1e293b; padding: 10px 15px; border-radius: 15px; font-size: 0.9rem; max-width: 80%;">
                  ${data.reply}
                </div>
              `;
              currentDriverChatHistory.push({
                role: "assistant",
                content: data.reply,
              });
              history.scrollTop = history.scrollHeight;
            }
          })
          .catch((e) => {
            btn.disabled = false;
            btn.innerText = "Send";
          });
      }

      // -------------------------
      // AI VOICE CALL SIMULATOR
      // -------------------------
      const STATE_MAP = {
        Alabama: "AL",
        Alaska: "AK",
        Arizona: "AZ",
        Arkansas: "AR",
        California: "CA",
        Colorado: "CO",
        Connecticut: "CT",
        Delaware: "DE",
        Florida: "FL",
        Georgia: "GA",
        Hawaii: "HI",
        Idaho: "ID",
        Illinois: "IL",
        Indiana: "IN",
        Iowa: "IA",
        Kansas: "KS",
        Kentucky: "KY",
        Louisiana: "LA",
        Maine: "ME",
        Maryland: "MD",
        Massachusetts: "MA",
        Michigan: "MI",
        Minnesota: "MN",
        Mississippi: "MS",
        Missouri: "MO",
        Montana: "MT",
        Nebraska: "NE",
        Nevada: "NV",
        "New Hampshire": "NH",
        "New Jersey": "NJ",
        "New Mexico": "NM",
        "New York": "NY",
        "North Carolina": "NC",
        "North Dakota": "ND",
        Ohio: "OH",
        Oklahoma: "OK",
        Oregon: "OR",
        Pennsylvania: "PA",
        "Rhode Island": "RI",
        "South Carolina": "SC",
        "South Dakota": "SD",
        Tennessee: "TN",
        Texas: "TX",
        Utah: "UT",
        Vermont: "VT",
        Virginia: "VA",
        Washington: "WA",
        "West Virginia": "WV",
        Wisconsin: "WI",
        Wyoming: "WY",
        "District of Columbia": "DC",
      };

      function setupAutocomplete(inputId, listId) {
        const input = document.getElementById(inputId);
        const list = document.getElementById(listId);
        let timeout = null;

        function renderList(query) {
          list.innerHTML = "";
          if (!query) {
            list.style.display = "none";
            return;
          }

          list.innerHTML =
            '<div style="padding:10px; color:#94a3b8; font-size:0.85rem;">Fetching cities...</div>';
          list.style.display = "block";

          fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`,
          )
            .then((r) => r.json())
            .then((data) => {
              list.innerHTML = "";
              if (!data.results || data.results.length === 0) {
                list.style.display = "none";
                return;
              }

              const validCities = data.results.filter(c => c.name);
              if (validCities.length === 0) {
                list.style.display = "none";
                return;
              }

              const unique = new Set();
              validCities.forEach((c) => {
                let region = "";
                if (c.country_code === "US" && c.admin1) {
                    region = STATE_MAP[c.admin1] || c.admin1;
                } else if (c.country) {
                    region = c.admin1 ? `${c.admin1}, ${c.country}` : c.country;
                } else {
                    region = c.admin1 || "";
                }
                
                const cityStr = region ? `${c.name}, ${region}` : c.name;
                if (unique.has(cityStr)) return;
                unique.add(cityStr);

                const div = document.createElement("div");
                div.className = "autocomplete-item";
                div.textContent = cityStr;
                div.addEventListener("mousedown", (e) => {
                  e.preventDefault();
                  input.value = cityStr;
                  list.style.display = "none";
                  saveCurrentInputs();
                });
                list.appendChild(div);
              });
            })
            .catch(() => {
              list.style.display = "none";
            });
        }

        input.addEventListener("focus", () => {
          if (input.value.trim().length > 1) renderList(input.value.trim());
        });
        input.addEventListener("input", () => {
          clearTimeout(timeout);
          const val = input.value.trim();
          if (val.length < 2) {
            list.style.display = "none";
            return;
          }
          timeout = setTimeout(() => {
            renderList(val);
          }, 300);
        });
        input.addEventListener("blur", () => {
          list.style.display = "none";
        });
      }
      setupAutocomplete("sim-search-origin", "autocomplete-origin");
      setupAutocomplete("sim-search-dest", "autocomplete-dest");
      setupAutocomplete("post-origin", "autocomplete-post-origin");
      setupAutocomplete("post-dest", "autocomplete-post-dest");

      // -------------------------
      // CUSTOM DROPDOWNS
      // -------------------------
      function setupCustomDropdown(containerId, displayId, hiddenId) {
        const container = document.getElementById(containerId);
        const display = document.getElementById(displayId);
        const hidden = document.getElementById(hiddenId);
        if (!container) return;

        const items = container.querySelectorAll(".cd-item:not(.cd-all)");
        items.forEach((item) => {
          item.addEventListener("mousedown", (e) => {
            e.preventDefault();
            items.forEach((i) => i.classList.remove("active"));
            item.classList.add("active");

            const val = item.getAttribute("data-val");
            const text = item.querySelector("span")
              ? item.querySelector("span").innerText
              : item.innerText;

            hidden.value = val;
            display.innerText = text;
            container.blur();
            saveCurrentInputs();
          });
        });
      }
      setupCustomDropdown(
        "equip-dropdown-container",
        "sim-search-equip-display",
        "sim-search-equip",
      );
      setupCustomDropdown(
        "loadtype-dropdown-container",
        "sim-filter-loadtype-display",
        "sim-filter-loadtype",
      );
      setupCustomDropdown("filter-dropdown-req", "filter-req-display", null);
      setupCustomDropdown("filter-dropdown-back", "filter-back-display", null);
      setupCustomDropdown("filter-dropdown-comp", "filter-comp-display", null);
      setupCustomDropdown("filter-dropdown-priv", "filter-priv-display", null);
      setupCustomDropdown("filter-dropdown-book", "filter-book-display", null);

      // -------------------------
      // SEARCH EXECUTION & AUTO SCAN
      // -------------------------
      let isAutoScanning = false;
      let autoScanInterval = null;

      function playBeep() {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        } catch(e) {}
      }

      function toggleAutoScan(btn) {
        isAutoScanning = !isAutoScanning;
        if (isAutoScanning) {
          btn.innerHTML = "⚡ Auto-Scan: ON";
          btn.style.background = "#10b981";
          btn.style.color = "white";
          // Run immediately once, then set interval
          fetchSearchData(true);
          autoScanInterval = setInterval(() => {
            fetchSearchData(true);
          }, 5000);
        } else {
          btn.innerHTML = "⚡ Auto-Scan: OFF";
          btn.style.background = "#e2e8f0";
          btn.style.color = "#475569";
          clearInterval(autoScanInterval);
        }
      }

      function executeSearch(e) {
        saveCurrentInputs();
        const btn = e.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span style="color:white; font-size:0.9rem;">Searching...</span>';
        fetchSearchData(false, () => {
          btn.innerHTML = originalText;
        });
      }

      function fetchSearchData(isAuto = false, callback = null) {
        const tab = getActiveTab();
        fetch(`${DAT_API_BASE}/api/sim/dat/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: tab.origin,
            dh_o: tab.dh_o,
            destination: tab.destination,
            dh_d: tab.dh_d,
            equipment: tab.equipment,
            load_type: tab.load_type,
            length: tab.length,
            weight: tab.weight,
            date_range: tab.date_range,
            limit: isAuto ? Math.floor(Math.random() * 3) + 1 : undefined,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.status === "success") {
              let newLoadIds = [];
              if (isAuto && tab.hasSearched && tab.results && tab.results.length > 0) {
                 const oldIds = new Set(tab.results.map(l => l.load_id || l.reference_number));
                 const newLoads = data.loads.filter(l => !oldIds.has(l.load_id || l.reference_number));
                 newLoadIds = newLoads.map(l => l.load_id || l.reference_number);
                 if (newLoadIds.length > 0) {
                    playBeep();
                    tab.results = [...newLoads, ...tab.results].slice(0, 100);
                 }
              } else {
                 tab.results = data.loads;
              }

              tab.hasSearched = true;
              tab.title = tab.origin ? `${tab.origin} → ${tab.destination || "Any"}` : "Search Results";
              document.getElementById("dat-search-empty").style.display = "none";
              document.getElementById("dat-search-results").style.display = "flex";
              window.renderLoadsGrid(tab.results, newLoadIds);
              renderTabsBar();
            }
            if (callback) callback();
          })
          .catch(() => {
             if (callback) callback();
          });
      }

      // -------------------------
      // DYNAMIC DASHBOARD WIDGET
      // -------------------------
      async function generateDashboardWidget() {
        const listContainer = document.getElementById("sim-nat-loads-list");
        const eqSelect = document.getElementById("nat-loads-equipment");
        if (!listContainer || !eqSelect) return;

        const eqType = eqSelect.value;
        listContainer.innerHTML =
          '<div style="text-align:center; padding:20px; color:#64748b;">Loading AI Data...</div>';

        try {
          const response = await fetch(
            `${DAT_API_BASE}/api/sim/dat/national_loads`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ equipment: eqType }),
            },
          );
          const result = await response.json();

          let html = "";
          if (result.data) {
            result.data.forEach((item) => {
              const total = item.loads_in + item.loads_out;
              const inPct =
                total > 0 ? Math.round((item.loads_in / total) * 100) : 50;

              html += `
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
                                <span style="color:#1e293b; font-weight:500; font-size:0.85rem; width:25px;">${item.state}</span> 
                                <span style="color:#1d4ed8; width:45px; text-align:right; font-size:0.85rem;">${item.loads_in}</span> 
                                
                                <div style="flex:1; height:6px; margin:0 12px; display:flex;">
                                    <div style="width:${inPct}%; height:100%; background:#93c5fd;"></div>
                                    <div style="width:${100 - inPct}%; height:100%; background:#1e3a8a;"></div>
                                </div> 
                                
                                <span style="color:#1d4ed8; width:45px; text-align:left; font-size:0.85rem;">${item.loads_out}</span>
                            </div>
                        `;
            });
            listContainer.innerHTML = html;
          }
        } catch (e) {
          listContainer.innerHTML =
            '<div style="text-align:center; padding:20px; color:red;">Failed to load data</div>';
        }
      }

      // -------------------------
      // ROW EXPANSION & TABLE RENDERING
      // -------------------------
      async function autoLoginDat(name, email) {
        try {
          const res = await fetch(`${DAT_API_BASE}/api/sim/auth/login`, {
              method: "POST",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify({email, name})
          });
          const data = await res.json();
          if (data.status === "success") {
              localStorage.setItem("session_id", data.session_id);
              localStorage.setItem("studentEmail", data.email);
              localStorage.setItem("studentName", data.name);
              
              restoreSearchTabs();
              
              document.getElementById("dat-view-login").classList.remove("active");
              document.getElementById("dat-app").classList.add("active");
              
              datNav("dashboard", true);
          } else {
              document.getElementById("dat-view-login").classList.add("active");
              document.getElementById("dat-app").classList.remove("active");
          }
        } catch(e) {
          console.error("Auto login error", e);
          document.getElementById("dat-view-login").classList.add("active");
          document.getElementById("dat-app").classList.remove("active");
        }
      }

      document.addEventListener("DOMContentLoaded", () => {
        // Auto-login hook if user was previously logged in
        let savedEmail = localStorage.getItem("studentEmail") || localStorage.getItem("academy_email") || localStorage.getItem("sim_academy_email");
        let savedName = localStorage.getItem("studentName") || localStorage.getItem("academy_name") || localStorage.getItem("sim_academy_name");
        let sessionId = localStorage.getItem("session_id");

        if (!savedEmail || !savedName) {
            document.getElementById("dat-view-login").classList.add("active");
            document.getElementById("dat-app").classList.remove("active");
        } else if (!sessionId) {
            autoLoginDat(savedName, savedEmail);
        } else {
          localStorage.setItem("studentEmail", savedEmail);
          localStorage.setItem("studentName", savedName);
          const emailInput = document.getElementById("student-email");
          const nameInput = document.getElementById("student-name");
          if (emailInput) emailInput.value = savedEmail;
          if (nameInput) nameInput.value = savedName || "";

          document.getElementById("dat-view-login").classList.remove("active");
          document.getElementById("dat-app").classList.add("active");

          // Pass true to force fresh AI load generation on auto-login reload
          datNav("dashboard", true);
        }

        // Attach delegated click listener to table body for row expansion
        function attachRowExpansionListener(tbodyId) {
          const tbody = document.getElementById(tbodyId);
          if (!tbody) return;

          tbody.addEventListener("click", function (e) {
            const row = e.target.closest("tr.main-row");
            if (!row) return;

            const isActive = row.classList.contains("active");
            document
              .querySelectorAll("tr.main-row")
              .forEach((r) => r.classList.remove("active"));
            document
              .querySelectorAll("tr.expanded-row-container")
              .forEach((r) => r.remove());

            if (!isActive) {
              row.classList.add("active");
              const data = JSON.parse(
                decodeURIComponent(row.getAttribute("data-load")),
              );

              const expandedHtml = `
                            <tr class="expanded-row-container">
                                <td colspan="14" style="padding:0; border:none;">
                                    <div class="expanded-content">
                                        <div class="expanded-header">
                                            <div style="display:flex; align-items:center; gap:15px;">
                                                ${data.origin} <span style="color:#0044cc; font-size:1rem;">➔</span> ${data.destination} 
                                                <span style="color:#1e293b; font-size:0.9rem;">${data.distance} mi</span>
                                            </div>
                                            <div style="color:#0044cc; border:1px solid #0044cc; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer;">🖨️</div>
                                        </div>
                                        
                                        <div class="expanded-grid">
                                            <!-- Left Column -->
                                            <div class="expanded-col">
                                                <div class="expanded-section">
                                                    <h4>Trip</h4>
                                                    <div class="route-visual">
                                                        <div class="route-line"><div class="dot">■</div><div class="line"></div><div class="dot">■</div></div>
                                                        <div class="route-details">
                                                            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                                                <div class="route-point">${data.origin} (${data.dh1})<div style="font-size:0.75rem; color:#64748b; font-weight:500; margin-top:4px;">${data.pickupDate}</div></div>
                                                                <button style="border:1px solid #94a3b8; background:white; padding:6px 12px; border-radius:20px; font-size:0.7rem; font-weight:700; color:#1e293b; cursor:pointer;">◇ VIEW ROUTE</button>
                                                            </div>
                                                            <div class="route-point">${data.destination} (${data.dh2})</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div class="expanded-section" style="margin-top:10px;">
                                                    <h4>Equipment</h4>
                                                    <div class="info-row"><span class="info-label">Load</span> <span class="info-val">${data.loadType}</span></div>
                                                    <div class="info-row"><span class="info-label">Truck</span> <span class="info-val">${data.equipFull}</span></div>
                                                    <div class="info-row"><span class="info-label">Length</span> <span class="info-val">${data.length} ft</span></div>
                                                    <div class="info-row"><span class="info-label">Weight</span> <span class="info-val">${data.weight}</span></div>
                                                </div>
                                            </div>
                                            
                                            <!-- Middle Column -->
                                            <div class="expanded-col">
                                                <div class="expanded-section">
                                                    <h4>Rate</h4>
                                                    <div class="info-row"><span class="info-label">Total</span> <span class="info-val">${data.rate > 0 ? "$" + data.rate : "-"}</span></div>
                                                    <div class="info-row"><span class="info-label">Trip</span> <span class="info-val">${data.distance} mi</span></div>
                                                </div>
                                            </div>
                                            
                                            <!-- Right Column -->
                                            <div class="expanded-col">
                                                <div class="expanded-section">
                                                    <h4>Company <span style="color:#0044cc; cursor:pointer;">VIEW IN DIRECTORY</span></h4>
                                                    <div style="font-weight:800; font-size:0.9rem; margin-bottom:5px;">${data.broker}</div>
                                                    <div style="color:#0044cc; font-size:0.8rem; margin-bottom:5px;">${data.phone}</div>
                                                    <div style="color:#475569; font-size:0.8rem; margin-bottom:10px;">${data.companyLocation}</div>
                                                    
                                                    <div style="background:#0044cc; color:white; border-radius:6px; padding:10px; display:inline-flex; flex-direction:column; gap:4px; width:fit-content; margin-top:10px;">
                                                        <div style="font-weight:700; font-size:0.85rem;"><span style="background:white; color:#0044cc; border-radius:4px; padding:0 4px;">$</span> Factoring Eligible</div>
                                                    </div>
                                                    
                                                    <div style="display:flex; gap:10px; margin-top:15px;">
                                                        <button onclick="openCallBroker(this)" style="flex:1; background:#10b981; color:white; border:none; padding:8px; border-radius:6px; font-weight:bold; cursor:pointer;">📞 Call Broker</button>
                                                        <button onclick="openEmailBroker(this)" style="flex:1; background:#3b82f6; color:white; border:none; padding:8px; border-radius:6px; font-weight:bold; cursor:pointer;">✉️ Email Broker</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        `;
              row.insertAdjacentHTML("afterend", expandedHtml);
            }
          });
        }

        attachRowExpansionListener("sim-loads-tbody");
        attachRowExpansionListener("recommended-loads-tbody");

        // Add change listener to the dropdown
        const eqSelect = document.getElementById("nat-loads-equipment");
        if (eqSelect) {
          eqSelect.addEventListener("change", generateDashboardWidget);
        }

        generateDashboardWidget();

        // Initialize Multi-Tab bar
        renderTabsBar();
        loadTabInputs(getActiveTab());
      });

      // Override renderLoadsGrid
      window.renderLoadsGrid = function (loads, newLoadIds = []) {
        const tbody = document.getElementById("sim-loads-tbody");
        if (!tbody) return;

        document.getElementById("dat-results-num").textContent =
          `${loads.length} Results`;

        let html = "";
        loads.forEach((load, idx) => {
          const currentId = load.load_id || load.reference_number;
          const isNew = newLoadIds.includes(currentId) ? "new-load-flash" : "";
          const age = load.age || Math.floor(Math.random() * 10) + "m";

          const originStr = load.origin
            ? `${load.origin.city}, ${load.origin.state}`
            : "Unknown";
          const destStr = load.destination
            ? `${load.destination.city}, ${load.destination.state}`
            : "Unknown";
          const dho1 = load.origin && load.origin.dh_o ? load.origin.dh_o : 50;
          const dho2 =
            load.destination && load.destination.dh_d
              ? load.destination.dh_d
              : 80;

          const eqType =
            load.equipment && load.equipment.type
              ? load.equipment.type
              : "Dry Van";
          const eqWeight =
            load.equipment && load.equipment.weight
              ? load.equipment.weight
              : "42,000 lbs";
          const eqLength =
            load.equipment && load.equipment.length
              ? load.equipment.length
              : "53";
          const eqLoadType =
            load.equipment && load.equipment.load_type
              ? load.equipment.load_type
              : "Full";

          const brokerName =
            load.broker && load.broker.company
              ? load.broker.company
              : "Unknown Broker";
          const cs =
            load.broker && load.broker.credit_score
              ? load.broker.credit_score
              : 97;
          const dtp = load.broker && load.broker.dtp ? load.broker.dtp : 23;
          const phone =
            load.broker && load.broker.phone
              ? load.broker.phone
              : "(800) 555-0000";
          const tripMiles = load.trip_miles || load.distance || 716;

          const loadData = encodeURIComponent(
            JSON.stringify({
              load_id: currentId,
              reference_number: currentId,
              origin: originStr,
              destination: destStr,
              distance: tripMiles,
              rate: load.rate || 0,
              dh1: dho1,
              dh2: dho2,
              broker: brokerName,
              phone: phone,
              loadType: eqLoadType,
              equipFull: eqType,
              length: eqLength,
              weight: eqWeight,
              pickupDate: load.pickup_date || "1/15",
              companyLocation:
                load.broker && load.broker.location
                  ? load.broker.location
                  : "Plano, TX",
            }),
          );

          let eqShort = eqType.substring(0, 2).toUpperCase();

          html += `
                    <tr class="main-row ${isNew}" data-load="${loadData}">
                        <td style="vertical-align:top; padding-top:14px;"><input type="checkbox"></td>
                        <td style="font-weight:800; vertical-align:top; padding-top:14px;">${age}</td>
                        <td style="vertical-align:top; padding-top:14px; line-height:1.3;">
                            <div style="font-weight:800;">${load.rate > 0 ? "$" + load.rate.toLocaleString() : "-"} <span style="color:#0044cc; font-size:0.9rem;">✓</span></div>
                            <div style="font-size:0.7rem; color:#64748b;">${load.rate > 0 ? "$" + (load.rate / tripMiles).toFixed(2) + "*/mi" : ""}</div>
                        </td>
                        <td style="vertical-align:top; padding-top:14px; color:#0044cc; font-weight:bold;">ⓘ</td>
                        <td style="vertical-align:top; padding-top:14px; color:#0044cc; font-weight:800;">${tripMiles}</td>
                        <td style="vertical-align:top; padding-top:14px; font-weight:700;">${originStr}</td>
                        <td style="vertical-align:top; padding-top:14px; font-weight:700;">(${dho1}) <span style="color:#0044cc; font-weight:800;">o-➔</span></td>
                        <td style="vertical-align:top; padding-top:14px; font-weight:700;">${destStr}</td>
                        <td style="vertical-align:top; padding-top:14px; font-weight:700;">(${dho2})</td>
                        <td style="vertical-align:top; padding-top:14px; font-weight:700;">${load.pickup_date || "1/15"}</td>
                        <td style="vertical-align:top; padding-top:14px;">
                            <div style="display:flex; gap:10px;">
                                <div style="font-weight:800;">${eqShort}</div>
                                <div style="font-size:0.75rem; font-weight:700; color:#1e293b; line-height:1.2;">
                                    ${eqWeight}<br>${eqLength} ft - ${eqLoadType}
                                </div>
                            </div>
                        </td>
                        <td style="vertical-align:top; padding-top:14px; font-weight:700;">${brokerName}</td>
                        <td style="vertical-align:top; padding-top:14px; color:#0044cc; font-weight:700;">${phone}</td>
                        <td style="vertical-align:top; padding-top:14px;">
                            <div style="font-weight:800; font-size:0.8rem;">${cs} CS</div>
                            <div style="color:#64748b; font-size:0.75rem;">${dtp} DTP</div>
                        </td>
                    </tr>
                `;
        });
        tbody.innerHTML = html;
      };

      // ==========================================
      // AI SIMULATOR LOGIC
      // ==========================================
      let currentLoadData = null;
      let aiCallConversation = [];
      let aiCallPersona = "";
      let aiCallScenario = "";

      // Voice setup
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      let recognition = null;
      let finalTranscript = "";

      if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = function () {
          finalTranscript = "";
        };

        recognition.onresult = function (event) {
          let interim = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + " ";
            } else {
              interim += event.results[i][0].transcript;
            }
          }
        };

        recognition.onend = function () {
          const btn = document.getElementById("ai-call-btn");
          let textToSend = finalTranscript.trim();
          finalTranscript = ""; // clear for next time

          if (textToSend.length > 0) {
            btn.innerHTML = "⏳ Processing...";
            btn.style.background = "#94a3b8";
            btn.disabled = true;

            addCallMessage(textToSend, "user");
            sendCallMessage(textToSend);
          } else {
            if (!btn.disabled) {
              btn.innerHTML = "🎙️ Click to Speak";
              btn.style.background = "#10b981";
            }
          }
        };
      }

      function openCallBroker(btn) {
        const row = btn.closest(
          ".expanded-row-container",
        ).previousElementSibling;
        currentLoadData = JSON.parse(
          decodeURIComponent(row.getAttribute("data-load")),
        );

        // Ensure load has ID fields
        if (!currentLoadData.load_id && currentLoadData.reference_number) {
            currentLoadData.load_id = currentLoadData.reference_number;
        } else if (!currentLoadData.reference_number && currentLoadData.load_id) {
            currentLoadData.reference_number = currentLoadData.load_id;
        } else if (!currentLoadData.load_id && !currentLoadData.reference_number) {
            currentLoadData.load_id = "SIM-" + Math.floor(Math.random() * 90000 + 10000);
            currentLoadData.reference_number = currentLoadData.load_id;
        }

        // Store active broker call in localStorage for automatic loading on index.html
        localStorage.setItem("active_broker_call_load", JSON.stringify(currentLoadData));
        localStorage.setItem("broker_call_source", "standalone_dat");

        // 1. BroadcastChannel (modern cross-tab fallback)
        try {
            const bc = new BroadcastChannel('b2b-dispatcher-channel');
            bc.postMessage({ type: 'START_BROKER_CALL', load: currentLoadData });
            bc.close();
            console.log("Broadcasted START_BROKER_CALL successfully via BroadcastChannel");
        } catch (e) {
            console.error("BroadcastChannel failed, trying opener fallback", e);
        }

        // 2. Window Opener fallback
        if (window.opener && !window.opener.closed) {
            try {
                window.opener.postMessage({ type: 'START_BROKER_CALL', load: currentLoadData }, '*');
                console.log("Sent START_BROKER_CALL to opener successfully");
            } catch (e) {
                console.error("Window opener postMessage failed:", e);
            }
        }

        // Redirect directly to the main platform calling screen page
        window.location.href = "/";
      }

      function toggleVoiceRecognition() {
        if (!recognition) {
          alert(
            "Speech recognition is not supported in this browser. Please use Chrome.",
          );
          return;
        }
        const btn = document.getElementById("ai-call-btn");
        if (btn.disabled) return;

        if (btn.innerHTML.includes("Listening")) {
          recognition.stop();
          btn.innerHTML = "⏳ Processing...";
          btn.style.background = "#94a3b8";
        } else {
          try {
            recognition.start();
            btn.innerHTML = "🔴 Listening... (Click to stop)";
            btn.style.background = "#ef4444";
          } catch (e) {}
        }
      }

      function addCallMessage(text, role) {
        const div = document.getElementById("ai-call-transcript");
        let isBooked = text.includes("[STATUS: BOOKED]");
        let cleanText = text
          .replace("[STATUS: BOOKED]", "")
          .replace("[STATUS: HUNGUP]", "");

        if (cleanText.trim()) {
          div.innerHTML += `<div class="ai-msg ${role}"><strong>${role === "user" ? "You" : currentLoadData.broker}:</strong><br>${cleanText}</div>`;
          div.scrollTop = div.scrollHeight;
          if (role === "user") {
            aiCallConversation.push({ role: "user", content: cleanText });
          } else {
            aiCallConversation.push({ role: "assistant", content: cleanText });
          }
        }

        if (isBooked || text.includes("[STATUS: HUNGUP]")) {
          // Trigger evaluation
          let finalStatus = isBooked ? "Booked" : "Hung Up";

          // Extract the last dollar-amount the student mentioned as their agreed rate
          let agreedRate = 0;
          for (let i = aiCallConversation.length - 1; i >= 0; i--) {
            const msg = aiCallConversation[i];
            if (msg.role === "user") {
              const m = msg.content.match(/\$?([\d,]+(?:\.\d+)?)/);
              if (m) {
                agreedRate = parseFloat(m[1].replace(/,/g, ""));
                break;
              }
            }
          }
          const postedRate =
            currentLoadData && currentLoadData.rate
              ? parseFloat(currentLoadData.rate)
              : 0;

          fetch(`${DAT_API_BASE}/api/sim/calls/evaluate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              broker_name: aiCallPersona,
              load_id: currentLoadData.reference_number || "12345",
              email:
                localStorage.getItem("studentEmail") ||
                localStorage.getItem("sim_academy_email") ||
                "student@dispatcheracademy.com",
              student_name:
                localStorage.getItem("studentName") || "Guest Student",
              status: finalStatus,
              agreed_rate: agreedRate,
              posted_rate: postedRate,
              load_details: currentLoadData || {},
              history: aiCallConversation
                .map((msg) => ({
                  q: msg.role === "assistant" ? msg.content : "",
                  a: msg.role === "user" ? msg.content : "",
                }))
                .filter((msg) => msg.a || msg.q),
            }),
          })
            .then((r) => r.json())
            .then((evalData) => {
              if (evalData.status === "success") {
                console.log("Call evaluated:", evalData.evaluation);
                if (isBooked) {
                  const negotiation = evalData.negotiation || {};
                  const scorePct = negotiation.score_pct || 0;
                  const grade = negotiation.grade || "";
                  const gradeColor = negotiation.grade_color || "#10b981";
                  const bookedModal =
                    document.getElementById("ai-booked-modal");
                  const headline = bookedModal.querySelector("h3");
                  if (headline) {
                    headline.innerHTML = `🎉 Load Booked Successfully!`;
                  }
                  // Inject score badge into modal body
                  let scoreHtml = `
                    <div style="background:#1e293b; border:1px solid #334155; border-radius:10px; padding:14px 18px; margin-bottom:16px; text-align:center;">
                      <div style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;">Negotiation Score</div>
                      <div style="font-size:2rem; font-weight:900; color:${gradeColor};">${scorePct}%</div>
                      <div style="font-size:0.85rem; color:${gradeColor}; font-weight:700; margin-top:4px;">${grade}</div>
                      <div style="font-size:0.8rem; color:#64748b; margin-top:6px;">Posted: $${postedRate.toLocaleString()} &rarr; Agreed: $${agreedRate.toLocaleString()}</div>
                    </div>`;
                  const scoreEl = document.getElementById("booked-score-badge");
                  if (scoreEl) scoreEl.innerHTML = scoreHtml;
                  
                  // Refresh loads and trucks lists in background
                  loadMyLoads();
                  loadTrucks();
                }
              }
            });

          if (isBooked) {
            setTimeout(() => {
              document.getElementById("ai-call-modal").style.display = "none";
              document.getElementById("ai-booked-modal").style.display = "flex";
            }, 2000);
          } else {
            div.innerHTML += `<div style="text-align:center; color:red; font-weight:bold; margin-top:10px;">Call Disconnected</div>`;
          }
        }
      }

      function normalizeSpokenNumbers(text) {
        if (!text) return "";
        let normalized = text.toLowerCase();
        const patterns = [
          { word: /twenty[- ]five hundred/g, num: "2500" },
          { word: /twenty[- ]two hundred/g, num: "2200" },
          { word: /twenty[- ]three hundred/g, num: "2300" },
          { word: /twenty[- ]four hundred/g, num: "2400" },
          { word: /twenty[- ]six hundred/g, num: "2600" },
          { word: /twenty[- ]seven hundred/g, num: "2700" },
          { word: /twenty[- ]eight hundred/g, num: "2800" },
          { word: /twenty[- ]nine hundred/g, num: "2900" },
          { word: /twenty[- ]hundred/g, num: "2000" },
          { word: /fifteen[- ]hundred/g, num: "1500" },
          { word: /sixteen[- ]hundred/g, num: "1600" },
          { word: /seventeen[- ]hundred/g, num: "1700" },
          { word: /eighteen[- ]hundred/g, num: "1800" },
          { word: /nineteen[- ]hundred/g, num: "1900" },
          { word: /two thousand five hundred/g, num: "2500" },
          { word: /two thousand two hundred/g, num: "2200" },
          { word: /two thousand three hundred/g, num: "2300" },
          { word: /two thousand four hundred/g, num: "2400" },
          { word: /two thousand six hundred/g, num: "2600" },
          { word: /two thousand seven hundred/g, num: "2700" },
          { word: /two thousand eight hundred/g, num: "2800" },
          { word: /two thousand nine hundred/g, num: "2900" },
          { word: /two thousand/g, num: "2000" },
          { word: /three thousand/g, num: "3000" },
        ];
        patterns.forEach((p) => {
          normalized = normalized.replace(p.word, p.num);
        });
        return normalized;
      }

      function sendCallMessage(text) {
        // Pre-normalize spoken numbers (e.g. "twenty five hundred" -> "2500")
        let cleanText = normalizeSpokenNumbers(text);
        // Extract numeric offer from user text if present
        let offerMatch = cleanText.match(/\$?(\d+(?:,\d{3})*(?:\.\d+)?)/);
        let student_offer = offerMatch
          ? parseFloat(offerMatch[1].replace(/,/g, ""))
          : 0;

        let turn_count = Math.floor(aiCallConversation.length / 2) + 1;

        fetch(`${DAT_API_BASE}/api/sim/calls/negotiate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            broker_name: aiCallPersona,
            load_id: currentLoadData.reference_number || "12345",
            student_offer: student_offer,
            history: aiCallConversation
              .map((msg) => ({
                q: msg.role === "assistant" ? msg.content : "",
                a: msg.role === "user" ? msg.content : "",
              }))
              .filter((msg) => msg.a),
            turn_count: turn_count,
          }),
        })
          .then((r) => r.json())
          .then((data) => {
            const btn = document.getElementById("ai-call-btn");
            btn.innerHTML = "🎙️ Click to Speak";
            btn.style.background = "#10b981";
            btn.disabled = false;

            if (data.dialogue) {
              addCallMessage(
                data.dialogue +
                  (data.status === "Booked" ? " [STATUS: BOOKED]" : ""),
                "broker",
              );
              speakText(data.dialogue);
            }
          })
          .catch((e) => {
            const btn = document.getElementById("ai-call-btn");
            btn.innerHTML = "🎙️ Click to Speak";
            btn.style.background = "#10b981";
            btn.disabled = false;
          });
      }

      function speakText(text) {
        if (!window.speechSynthesis) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1; // slightly fast for a broker
        window.speechSynthesis.speak(utterance);
      }

      function openEmailBroker(btn) {
        const row = btn.closest(
          ".expanded-row-container",
        ).previousElementSibling;
        currentLoadData = JSON.parse(
          decodeURIComponent(row.getAttribute("data-load")),
        );

        // Generate a mock email for the broker if they don't have one
        if (!currentLoadData.email) {
          const domain =
            currentLoadData.broker.toLowerCase().replace(/[^a-z0-9]/g, "") +
            ".com";
          currentLoadData.email = `dispatch@${domain}`;
        }

        localStorage.setItem(
          "aiEmailLoadData",
          JSON.stringify(currentLoadData),
        );
        window.open("/gmail-simulator", "_blank");
      }

      function generateAndShowDoc(docType) {
        // Find rate from currentLoadData or default to 1500
        let rate =
          currentLoadData && currentLoadData.rate ? currentLoadData.rate : 1500;

        document.getElementById("doc-modal").style.display = "flex";
        document.getElementById("doc-content").innerHTML =
          '<div style="padding:40px;text-align:center;">Generating PDF Document...</div>';

        fetch(`${DAT_API_BASE}/api/sim/documents/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: docType,
            load_details: currentLoadData || {},
            rate: rate,
          }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.status === "success") {
              document.getElementById("doc-content").innerHTML = data.html;
            } else {
              document.getElementById("doc-content").innerHTML =
                "Error generating document.";
            }
          })
          .catch((e) => {
            document.getElementById("doc-content").innerHTML = "Network Error.";
          });
      }

      function closeDoc() {
        document.getElementById("doc-modal").style.display = "none";
      }

      // -------------------------
      // Recommended Loads
      // -------------------------
      async function loadRecommendedLoads(regenerate = false) {
        const email =
          localStorage.getItem("studentEmail") ||
          "student@dispatcheracademy.com";
        const name = localStorage.getItem("studentName") || "Guest Student";

        const tbody = document.getElementById("recommended-loads-tbody");
        const loading = document.getElementById("recommended-loads-loading");
        const tableContainer = document.getElementById(
          "recommended-loads-table-container",
        );

        if (!tbody) return;

        loading.style.display = "block";
        tableContainer.style.display = "none";

        try {
          const url = regenerate
            ? `${DAT_API_BASE}/api/sim/dat/recommended_loads/generate`
            : `${DAT_API_BASE}/api/sim/dat/recommended_loads?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`;

          const method = regenerate ? "POST" : "GET";
          const options = {
            method: method,
            headers: { "Content-Type": "application/json" },
          };
          if (regenerate) {
            options.body = JSON.stringify({ email: email, name: name });
          }

          const resp = await fetch(url, options);
          if (resp.ok) {
            const data = await resp.json();
            const loads = data.loads || [];

            loading.style.display = "none";
            tableContainer.style.display = "block";

            if (loads.length === 0) {
              tbody.innerHTML =
                '<tr><td colspan="11" style="text-align:center; padding:20px; color:#64748b; font-weight:600;">No recommendations available. Assign active trucks first.</td></tr>';
              return;
            }

            let html = "";
            loads.forEach((load) => {
              const originStr = load.origin
                ? `${load.origin.city}, ${load.origin.state}`
                : "Unknown";
              const destStr = load.destination
                ? `${load.destination.city}, ${load.destination.state}`
                : "Unknown";
              const dho =
                load.origin && load.origin.dh_o !== undefined
                  ? load.origin.dh_o
                  : 50;
              const dhd =
                load.destination && load.destination.dh_d !== undefined
                  ? load.destination.dh_d
                  : 50;

              const eqType =
                load.equipment && load.equipment.type
                  ? load.equipment.type
                  : "Dry Van";
              const eqWeight =
                load.equipment && load.equipment.weight
                  ? load.equipment.weight
                  : "42,000 lbs";
              const eqLength =
                load.equipment && load.equipment.length
                  ? load.equipment.length
                  : "53";
              const eqLoadType =
                load.equipment && load.equipment.load_type
                  ? load.equipment.load_type
                  : "Full";

              const brokerName =
                load.broker && load.broker.company
                  ? load.broker.company
                  : "Unknown Broker";
              const cs =
                load.broker && load.broker.credit_score
                  ? load.broker.credit_score
                  : 97;
              const dtp = load.broker && load.broker.dtp ? load.broker.dtp : 23;
              const phone =
                load.broker && load.broker.phone
                  ? load.broker.phone
                  : "(800) 555-0000";
              const tripMiles = load.trip_miles || load.distance || 716;

              const currentId = load.load_id || load.reference_number || "SIM-" + Math.floor(Math.random() * 90000 + 10000);
              const loadData = encodeURIComponent(
                JSON.stringify({
                  load_id: currentId,
                  reference_number: currentId,
                  origin: originStr,
                  destination: destStr,
                  distance: tripMiles,
                  rate: load.rate || 0,
                  dh1: dho,
                  dh2: dhd,
                  broker: brokerName,
                  phone: phone,
                  loadType: eqLoadType,
                  equipFull: eqType,
                  length: eqLength,
                  weight: eqWeight,
                  pickupDate: load.pickup_date || "1/15",
                  companyLocation:
                    load.broker && load.broker.location
                      ? load.broker.location
                      : "Plano, TX",
                }),
              );

              let eqShort = eqType.substring(0, 2).toUpperCase();

              html += `
                <tr class="main-row" data-load="${loadData}">
                  <td style="font-weight:800; padding:14px 10px;">${load.age || "1m"}</td>
                  <td style="padding:14px 10px; line-height:1.3;">
                    <div style="font-weight:800; color: #1e293b;">$${(load.rate || 0).toLocaleString()} <span style="color:#0044cc; font-size:0.9rem;">✓</span></div>
                    <div style="font-size:0.7rem; color:#64748b;">$${(load.rate / tripMiles).toFixed(2)}/mi</div>
                  </td>
                  <td style="font-weight:800; color:#0044cc; padding:14px 10px;">${tripMiles}</td>
                  <td style="font-weight:700; padding:14px 10px;">${originStr}</td>
                  <td style="font-weight:700; padding:14px 10px; color:#0044cc;">(${dho}) <span style="color:#0044cc; font-weight:800;">o-➔</span></td>
                  <td style="font-weight:700; padding:14px 10px;">${destStr}</td>
                  <td style="font-weight:700; padding:14px 10px;">${load.pickup_date || "Today"}</td>
                  <td style="padding:14px 10px;">
                    <div style="display:flex; gap:10px;">
                      <div style="font-weight:800; color:#1e293b;">${eqShort}</div>
                      <div style="font-size:0.75rem; font-weight:700; color:#1e293b; line-height:1.2;">
                        ${eqWeight}<br>${eqLength} ft - ${eqLoadType}
                      </div>
                    </div>
                  </td>
                  <td style="font-weight:700; padding:14px 10px;">${brokerName}</td>
                  <td style="color:#0044cc; font-weight:700; padding:14px 10px;">${phone}</td>
                  <td style="padding:14px 10px; text-align: center;">
                    <button class="recommended-match-btn" onclick="event.stopPropagation(); expandAndFocusRow(this)">Match</button>
                  </td>
                </tr>
              `;
            });

            tbody.innerHTML = html;
          } else {
            tbody.innerHTML =
              '<tr><td colspan="11" style="text-align:center; padding:20px; color:red; font-weight:600;">Failed to load recommended loads.</td></tr>';
            loading.style.display = "none";
            tableContainer.style.display = "block";
          }
        } catch (e) {
          tbody.innerHTML =
            '<tr><td colspan="11" style="text-align:center; padding:20px; color:red; font-weight:600;">Network error loading recommendations.</td></tr>';
          loading.style.display = "none";
          tableContainer.style.display = "block";
        }
      }

      function expandAndFocusRow(btn) {
        const row = btn.closest("tr.main-row");
        if (row) {
          row.click();
        }
      }

      async function regenerateRecommendedLoads() {
        const btn = document.getElementById("re-rec-btn");
        if (!btn) return;
        const originalText = btn.innerHTML;
        btn.innerHTML = "⏳ Matching...";
        btn.disabled = true;

        await loadRecommendedLoads(true);

        btn.innerHTML = originalText;
        btn.disabled = false;
      }