(function(){if(document.readyState!=='loading'){var _a=document.addEventListener.bind(document);document.addEventListener=function(t,f,o){if(t==='DOMContentLoaded'){return setTimeout(f,0);}return _a(t,f,o);};if(document.readyState==='complete'){Object.defineProperty(window,'onload',{set:function(f){if(f)setTimeout(f,0);},get:function(){return null;},configurable:true});}}})();
const SIM_API_BASE = (window.__APP_CONFIG__ && window.__APP_CONFIG__.apiUrl) || "https://b2b-bck.onrender.com";

    let currentLoadData = null;
    let emails = []; // Store email threads
    let currentThreadIndex = -1;
    let currentFolder = 'inbox';
    
    function persistEmails() {
        const studentEmail = localStorage.getItem('studentEmail') || localStorage.getItem('sim_academy_email') || 'student@dispatcheracademy.com';
        localStorage.setItem(`sim_gmail_threads_${studentEmail}`, JSON.stringify(emails));
    }

    function restoreEmails() {
        const studentEmail = localStorage.getItem('studentEmail') || localStorage.getItem('sim_academy_email') || 'student@dispatcheracademy.com';
        const stored = localStorage.getItem(`sim_gmail_threads_${studentEmail}`);
        if (stored) {
            try {
                emails = JSON.parse(stored);
            } catch(e) {
                console.error("Failed to parse stored emails", e);
            }
        }
    }

    function toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar) sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active');
    }

    window.onload = function() {
        const dataStr = localStorage.getItem('aiEmailLoadData');
        if (dataStr) {
            currentLoadData = JSON.parse(dataStr);
        } else {
            console.log("No load data found. Running in standalone mode.");
        }
        restoreEmails();
        renderInbox();
        setTimeout(openCompose, 300); // Auto-open compose window
    };
    
    function showFolder(folder) {
        currentFolder = folder;
        document.getElementById('inbox-list').style.display = 'block';
        document.getElementById('thread-view').style.display = 'none';
        
        // Update active class
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        if (folder === 'inbox') document.getElementById('nav-inbox').classList.add('active');
        if (folder === 'sent') document.getElementById('nav-sent').classList.add('active');
        
        // Auto-close mobile sidebar if open
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
        }

        renderInbox();
    }
    
    function renderInbox() {
        const list = document.getElementById('inbox-list');
        list.innerHTML = '';
        
        // Count unread inbox items
        let unreadCount = emails.filter(t => t.messages.some(m => m.role !== 'user') && !t.read).length;
        document.getElementById('inbox-count').innerText = unreadCount;
        
        // Filter threads
        let filteredEmails = [];
        emails.forEach((thread, index) => {
            const hasBroker = thread.messages.some(m => m.role !== 'user');
            const hasUser = thread.messages.some(m => m.role === 'user');
            
            if (currentFolder === 'inbox' && hasBroker) {
                filteredEmails.push({ thread, index });
            } else if (currentFolder === 'sent' && hasUser) {
                filteredEmails.push({ thread, index });
            }
        });
        
        if (filteredEmails.length === 0) {
            list.innerHTML = `<div style="text-align:center; padding:50px; color:#5f6368;">Your ${currentFolder} is empty.</div>`;
            return;
        }
        
        // Reverse emails to show newest at top
        const reversed = [...filteredEmails].reverse();
        
        reversed.forEach((item) => {
            const thread = item.thread;
            const index = item.index;
            const lastMsg = thread.messages[thread.messages.length - 1];
            const isUnread = !thread.read && currentFolder === 'inbox';
            
            let previewMsg = lastMsg;
            let displaySender = lastMsg.senderName;
            
            if (currentFolder === 'sent') {
                const brokerName = thread.messages.find(m => m.role !== 'user')?.senderName || thread.messages[0].recipientEmail;
                displaySender = 'To: ' + brokerName;
                previewMsg = thread.messages.slice().reverse().find(m => m.role === 'user') || lastMsg;
            }
            
            list.innerHTML += `
                <div class="email-row ${isUnread ? 'unread' : 'read'}" onclick="openThread(${index})">
                    <div class="email-sender">${displaySender}</div>
                    <div class="email-subject">
                        <strong>${thread.subject}</strong> - <span style="color:#5f6368; font-weight:normal;">${previewMsg.body.substring(0, 80).replace(/\n/g, ' ')}...</span>
                    </div>
                    <div class="email-time">Just now</div>
                </div>
            `;
        });
    }
    
    function openThread(index) {
        currentThreadIndex = index;
        emails[index].read = true;
        document.getElementById('inbox-list').style.display = 'none';
        
        const threadView = document.getElementById('thread-view');
        threadView.style.display = 'block';
        
        const thread = emails[index];
        document.getElementById('thread-subject-title').innerText = thread.subject;
        
        const messagesDiv = document.getElementById('thread-messages');
        messagesDiv.innerHTML = '';
        
        let isTrainerThread = false;
        
        thread.messages.forEach(msg => {
            const isMe = msg.role === 'user';
            const isTrainer = msg.role === 'trainer';
            if (isTrainer) isTrainerThread = true;
            
            let avatarClass = isTrainer ? 'trainer' : (isMe ? '' : 'broker');
            let initial = isTrainer ? 'T' : (isMe ? 'B' : msg.senderName.charAt(0));
            
            messagesDiv.innerHTML += `
                <div class="thread-message">
                    <div class="message-header">
                        <div class="avatar ${avatarClass}">${initial}</div>
                        <div>
                            <div style="font-weight:bold;">${msg.senderName} <span style="font-weight:normal; font-size:12px; color:#5f6368;">&lt;${msg.senderEmail}&gt;</span></div>
                            <div style="font-size:12px; color:#5f6368;">to ${isMe ? msg.recipientEmail : 'me'}</div>
                        </div>
                    </div>
                    <div class="message-body">${msg.body}</div>
                </div>
            `;
        });
        
        // Show reply box only if it's not a trainer feedback thread
        if (!isTrainerThread) {
            document.getElementById('reply-box').style.display = 'flex';
        } else {
            document.getElementById('reply-box').style.display = 'none';
        }
        
        // Scroll to bottom
        setTimeout(() => {
            threadView.scrollTop = threadView.scrollHeight;
        }, 50);
    }
    
    function openCompose() {
        document.getElementById('compose-modal').style.display = 'flex';
        if (currentLoadData) {
            document.getElementById('compose-to').value = currentLoadData.email || 'broker@logistics.com';
            document.getElementById('compose-subject').value = '';
        }
    }
    
    function closeCompose() {
        document.getElementById('compose-modal').style.display = 'none';
    }
    
    function draftTemplate(type) {
        if (!currentLoadData) return;
        const txt = document.getElementById('compose-body');
        txt.value = `Hi ${currentLoadData.broker},\n\nI am reaching out regarding the load from ${currentLoadData.origin} to ${currentLoadData.destination}.\nCan you do $${parseInt(currentLoadData.rate || 2000) + 300} on this?\n\nThanks,\nB2B Dispatch`;
    }
    
    function sendEmail() {
        const to = document.getElementById('compose-to').value;
        const subject = document.getElementById('compose-subject').value;
        const body = document.getElementById('compose-body').value;
        
        if (!body.trim()) return;
        
        const btn = document.getElementById('send-btn');
        btn.innerText = "Sending...";
        
        // Create new thread or append
        const studentEmail = localStorage.getItem('studentEmail') || localStorage.getItem('sim_academy_email') || 'student@dispatcheracademy.com';
        const studentName = localStorage.getItem('studentName') || localStorage.getItem('sim_academy_name') || 'Student Cadet';

        const myMsg = {
            role: 'user',
            senderName: studentName,
            senderEmail: studentEmail,
            recipientEmail: to,
            body: body
        };
        
        // Push to a new thread for simplicity
        const threadIndex = emails.length;
        emails.push({
            subject: subject,
            read: true,
            messages: [myMsg]
        });
        persistEmails();
        
        closeCompose();
        document.getElementById('compose-body').value = '';
        btn.innerText = "Send";
        showFolder('sent');
        
        triggerAiEvaluation(body, threadIndex, to, subject);
    }
    
    function sendReply() {
        if (currentThreadIndex === -1) return;
        
        const body = document.getElementById('reply-body').value;
        if (!body.trim()) return;
        
        const btn = document.getElementById('reply-send-btn');
        btn.innerText = "Sending...";
        
        const thread = emails[currentThreadIndex];
        const to = thread.messages[0].recipientEmail; // The original recipient (broker)
        
        const studentEmail = localStorage.getItem('studentEmail') || localStorage.getItem('sim_academy_email') || 'student@dispatcheracademy.com';
        const studentName = localStorage.getItem('studentName') || localStorage.getItem('sim_academy_name') || 'Student Cadet';

        const myMsg = {
            role: 'user',
            senderName: studentName,
            senderEmail: studentEmail,
            recipientEmail: to,
            body: body
        };
        
        thread.messages.push(myMsg);
        persistEmails();
        document.getElementById('reply-body').value = '';
        btn.innerText = "Send";
        
        // Re-render the thread to show our new message immediately
        openThread(currentThreadIndex);
        
        // Scroll to bottom
        const threadView = document.getElementById('thread-view');
        threadView.scrollTop = threadView.scrollHeight;
        
        triggerAiEvaluation(body, currentThreadIndex, to, thread.subject);
    }
    
    function triggerAiEvaluation(body, threadIndex, to, subject) {
        document.title = "Sending... - Gmail";
        document.getElementById('reply-status').innerText = "Broker is typing...";
        
        const studentEmail = localStorage.getItem('studentEmail') || localStorage.getItem('sim_academy_email') || 'student@dispatcheracademy.com';
        const studentName = localStorage.getItem('studentName') || localStorage.getItem('sim_academy_name') || 'Student Cadet';

        // Simulate sending to AI Evaluator
        fetch(SIM_API_BASE + '/api/sim/ai/email/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email_body: body, 
                load_details: currentLoadData,
                history: emails[threadIndex].messages,
                student_email: studentEmail,
                student_name: studentName
            })
        }).then(async r => {
            const text = await r.text();
            try {
                return JSON.parse(text);
            } catch(e) {
                console.error("Failed to parse JSON. Raw response:", text);
                throw e;
            }
        }).then(data => {
            document.getElementById('reply-status').innerText = "";
            document.title = "Inbox - b2b_student@simulator.com";
            if (data.status === 'success') {
                setTimeout(() => {
                    let brokerReplyBody = data.evaluation.broker_reply;
                    if (data.evaluation.booked) {
                        brokerReplyBody += `<br><br><hr><br><strong>SYSTEM MSG: Load Booked!</strong><br>`;
                        brokerReplyBody += `<button onclick="generateAndShowDoc('${data.evaluation.agreed_rate || 2500}')" style="background:#0052cc;color:white;border:none;padding:8px 15px;border-radius:4px;cursor:pointer;margin-top:10px;">View Rate Confirmation PDF</button>`;
                    }
                    
                    // 1. Broker Reply
                    emails[threadIndex].messages.push({
                        role: 'broker',
                        senderName: currentLoadData.broker,
                        senderEmail: to,
                        recipientEmail: 'b2b_student@simulator.com',
                        body: brokerReplyBody
                    });
                    
                    emails[threadIndex].read = false; // Mark broker thread unread
                    persistEmails();
                    
                    // Alert user of new mail
                    document.title = "(1) New Email - Gmail";
                    
                    // If we are currently viewing this exact thread, re-render it so the reply pops in
                    if (document.getElementById('thread-view').style.display === 'block' && currentThreadIndex === threadIndex) {
                        openThread(threadIndex);
                    } else if (document.getElementById('inbox-list').style.display === 'block') {
                        renderInbox();
                    }
                }, 5000); // Wait 5 seconds for "realistic" reply delay
            } else {
                alert("AI Error: " + data.message);
            }
        }).catch(err => {
            document.getElementById('reply-status').innerText = "Network Error";
            console.error(err);
        });
    }

    function generateAndShowDoc(rate) {
        document.getElementById('doc-modal').style.display = 'flex';
        document.getElementById('doc-content').innerHTML = '<div style="padding:40px;text-align:center;">Generating PDF Document...</div>';
        
        fetch(SIM_API_BASE + '/api/sim/documents/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                type: 'rate_con', 
                load_details: currentLoadData,
                rate: rate
            })
        }).then(r => r.json()).then(data => {
            if(data.status === 'success') {
                document.getElementById('doc-content').innerHTML = data.html;
            } else {
                document.getElementById('doc-content').innerHTML = 'Error generating document.';
            }
        });
    }
    
    function closeDoc() {
        document.getElementById('doc-modal').style.display = 'none';
    }