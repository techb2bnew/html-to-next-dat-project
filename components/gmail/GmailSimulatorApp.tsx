'use client'
import { useState, useEffect, useCallback } from 'react';
import type { EmailThread, EmailMessage, LoadData, FolderType } from '@/lib/types/gmail';
import { evaluateEmail, generateDocument } from '@/lib/api/gmail';
import GmailHeader from './GmailHeader';
import GmailSidebar from './GmailSidebar';
import EmailList from './EmailList';
import ThreadView from './ThreadView';
import ComposeModal from './ComposeModal';
import DocumentModal from './DocumentModal';
import styles from '@/app/gmail-simulator/gmail.module.css';

function getStudentEmail() {
  return localStorage.getItem('studentEmail') || localStorage.getItem('sim_academy_email') || 'student@dispatcheracademy.com';
}
function getStudentName() {
  return localStorage.getItem('studentName') || localStorage.getItem('sim_academy_name') || 'Student Cadet';
}

export default function GmailSimulatorApp() {
  const [loadData, setLoadData] = useState<LoadData | null>(null);
  const [emails, setEmails] = useState<EmailThread[]>([]);
  const [threadIndex, setThreadIndex] = useState(-1);
  const [folder, setFolder] = useState<FolderType>('inbox');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [docOpen, setDocOpen] = useState(false);
  const [docContent, setDocContent] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [replyStatus, setReplyStatus] = useState('');

  // Lock body scroll for this full-screen page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Init: load data from localStorage, auto-open compose after 300ms
  useEffect(() => {
    const raw = localStorage.getItem('aiEmailLoadData');
    if (raw) {
      try { setLoadData(JSON.parse(raw)); } catch {}
    }
    const stored = localStorage.getItem(`sim_gmail_threads_${getStudentEmail()}`);
    if (stored) {
      try { setEmails(JSON.parse(stored)); } catch {}
    }
    const t = setTimeout(() => setComposeOpen(true), 300);
    return () => clearTimeout(t);
  }, []);

  // Auto-fill compose To when compose opens
  useEffect(() => {
    if (composeOpen && loadData?.email) {
      setComposeTo(loadData.email);
    }
  }, [composeOpen, loadData]);

  // Persist emails whenever they change
  useEffect(() => {
    if (!emails.length) return;
    localStorage.setItem(`sim_gmail_threads_${getStudentEmail()}`, JSON.stringify(emails));
  }, [emails]);

  const showFolder = (f: FolderType) => {
    setFolder(f);
    setThreadIndex(-1);
    setSidebarOpen(false);
  };

  const openThread = (i: number) => {
    setThreadIndex(i);
    setEmails(prev => prev.map((t, idx) => idx === i ? { ...t, read: true } : t));
    setReplyBody('');
    setReplyStatus('');
  };

  const handleDraftTemplate = () => {
    if (!loadData) return;
    setComposeBody(
      `Hi ${loadData.broker},\n\nI am reaching out regarding the load from ${loadData.origin} to ${loadData.destination}.\nCan you do $${parseInt(String(loadData.rate || 2000)) + 300} on this?\n\nThanks,\nB2B Dispatch`
    );
  };

  const triggerAiEvaluation = useCallback(async (
    body: string,
    idx: number,
    to: string,
    subject: string
  ) => {
    document.title = 'Sending... - Gmail';
    setReplyStatus('Broker is typing...');
    try {
      const data = await evaluateEmail({
        emailBody: body,
        loadDetails: loadData,
        history: emails[idx]?.messages || [],
        studentEmail: getStudentEmail(),
        studentName: getStudentName(),
      });

      setReplyStatus('');
      document.title = 'Inbox - b2b_student@simulator.com';

      if (data.status === 'success') {
        setTimeout(() => {
          const brokerMsg: EmailMessage = {
            role: 'broker',
            senderName: loadData?.broker || 'Broker',
            senderEmail: to,
            recipientEmail: 'b2b_student@simulator.com',
            body: data.evaluation.broker_reply,
          };
          setEmails(prev => prev.map((t, i) =>
            i !== idx ? t : {
              ...t,
              read: false,
              messages: [...t.messages, brokerMsg],
              booked: data.evaluation.booked || t.booked,
              agreedRate: data.evaluation.agreed_rate ?? t.agreedRate,
            }
          ));
          document.title = '(1) New Email - Gmail';
        }, 5000);
      } else {
        alert('AI Error: ' + data.message);
      }
    } catch (err) {
      setReplyStatus('Network Error');
      console.error(err);
    }
  }, [loadData, emails]);

  const sendEmail = async () => {
    if (!composeBody.trim()) return;
    const myMsg: EmailMessage = {
      role: 'user',
      senderName: getStudentName(),
      senderEmail: getStudentEmail(),
      recipientEmail: composeTo,
      body: composeBody,
    };
    const newIdx = emails.length;
    setEmails(prev => [...prev, { subject: composeSubject, read: true, messages: [myMsg] }]);
    setComposeOpen(false);
    setComposeBody('');
    showFolder('sent');
    await triggerAiEvaluation(composeBody, newIdx, composeTo, composeSubject);
  };

  const sendReply = async () => {
    if (threadIndex === -1 || !replyBody.trim()) return;
    const thread = emails[threadIndex];
    const to = thread.messages[0]?.recipientEmail;
    const myMsg: EmailMessage = {
      role: 'user',
      senderName: getStudentName(),
      senderEmail: getStudentEmail(),
      recipientEmail: to,
      body: replyBody,
    };
    setEmails(prev => prev.map((t, i) =>
      i === threadIndex ? { ...t, messages: [...t.messages, myMsg] } : t
    ));
    const body = replyBody;
    setReplyBody('');
    await triggerAiEvaluation(body, threadIndex, to, thread.subject);
  };

  const handleGenerateDoc = async (rate: number) => {
    setDocOpen(true);
    setDocContent('<div style="padding:40px;text-align:center;">Generating PDF Document...</div>');
    try {
      const data = await generateDocument({ type: 'rate_con', loadDetails: loadData, rate });
      setDocContent(data.status === 'success' ? data.html : 'Error generating document.');
    } catch {
      setDocContent('Error generating document.');
    }
  };

  const unreadCount = emails.filter(t => t.messages.some(m => m.role !== 'user') && !t.read).length;

  return (
    <div className={styles.gmailRoot}>
      <GmailHeader onToggleSidebar={() => setSidebarOpen(p => !p)} />

      <div className={styles.mainContainer}>
        <div
          className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.overlayActive : ''}`}
          onClick={() => setSidebarOpen(false)}
        />
        <GmailSidebar
          open={sidebarOpen}
          currentFolder={folder}
          unreadCount={unreadCount}
          onShowFolder={showFolder}
          onOpenCompose={() => setComposeOpen(true)}
        />

        <div className={styles.contentArea}>
          <div className={styles.toolbar}>
            <span className="cursor-pointer" onClick={() => showFolder(folder)}>⟳ Refresh</span>
            <span className="ml-auto">1-50 of 152</span>
          </div>

          {threadIndex === -1 ? (
            <EmailList emails={emails} currentFolder={folder} onOpenThread={openThread} />
          ) : (
            <ThreadView
              thread={emails[threadIndex]}
              replyBody={replyBody}
              replyStatus={replyStatus}
              onReplyChange={setReplyBody}
              onSendReply={sendReply}
              onBack={() => setThreadIndex(-1)}
              onGenerateDoc={handleGenerateDoc}
            />
          )}
        </div>
      </div>

      {composeOpen && (
        <ComposeModal
          to={composeTo}
          subject={composeSubject}
          body={composeBody}
          onToChange={setComposeTo}
          onSubjectChange={setComposeSubject}
          onBodyChange={setComposeBody}
          onSend={sendEmail}
          onClose={() => setComposeOpen(false)}
          onDraftTemplate={handleDraftTemplate}
        />
      )}

      {docOpen && (
        <DocumentModal content={docContent} onClose={() => setDocOpen(false)} />
      )}
    </div>
  );
}
