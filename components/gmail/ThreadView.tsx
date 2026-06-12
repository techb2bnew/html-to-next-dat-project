'use client'
import type { EmailThread } from '@/lib/types/gmail';
import styles from '@/app/gmail-simulator/gmail.module.css';

interface Props {
  thread: EmailThread;
  replyBody: string;
  replyStatus: string;
  onReplyChange: (val: string) => void;
  onSendReply: () => void;
  onBack: () => void;
  onGenerateDoc: (rate: number) => void;
}

export default function ThreadView({ thread, replyBody, replyStatus, onReplyChange, onSendReply, onBack, onGenerateDoc }: Props) {
  const isTrainerThread = thread.messages.some(m => m.role === 'trainer');

  return (
    <div className={styles.threadView}>
      <div style={{ cursor: 'pointer', marginBottom: 15, color: '#5f6368' }} onClick={onBack}>
        ← Back
      </div>

      <div className={styles.threadSubject}>{thread.subject}</div>

      {thread.messages.map((msg, i) => {
        const isMe = msg.role === 'user';
        const isTrainer = msg.role === 'trainer';
        const avatarExtra = isTrainer ? styles.trainer : !isMe ? styles.broker : '';
        const initial = isTrainer ? 'T' : isMe ? 'B' : msg.senderName.charAt(0);

        return (
          <div key={i} className={styles.threadMessage}>
            <div className={styles.messageHeader}>
              <div className={`${styles.avatar} ${avatarExtra}`}>{initial}</div>
              <div>
                <div style={{ fontWeight: 'bold' }}>
                  {msg.senderName}{' '}
                  <span style={{ fontWeight: 'normal', fontSize: 12, color: '#5f6368' }}>
                    &lt;{msg.senderEmail}&gt;
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#5f6368' }}>
                  to {isMe ? msg.recipientEmail : 'me'}
                </div>
              </div>
            </div>
            {/* broker replies may contain HTML */}
            <div className={styles.messageBody} dangerouslySetInnerHTML={{ __html: msg.body }} />
          </div>
        );
      })}

      {thread.booked && (
        <div style={{ marginLeft: 55, marginTop: 15 }}>
          <button
            onClick={() => onGenerateDoc(thread.agreedRate ?? 2500)}
            style={{ background: '#0052cc', color: 'white', border: 'none', padding: '8px 15px', borderRadius: 4, cursor: 'pointer' }}
          >
            View Rate Confirmation PDF
          </button>
        </div>
      )}

      {!isTrainerThread && (
        <div className={styles.replyBox} style={{ display: 'flex', alignItems: 'flex-start', gap: 15, paddingLeft: 15 }}>
          <div className={styles.avatar} style={{ background: '#1a73e8' }}>M</div>
          <div style={{ flex: 1, border: '1px solid #dadce0', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3)', display: 'flex', flexDirection: 'column', background: 'white' }}>
            <textarea
              value={replyBody}
              onChange={e => onReplyChange(e.target.value)}
              placeholder="Reply..."
              style={{ width: '100%', minHeight: 120, padding: 15, border: 'none', outline: 'none', resize: 'vertical', fontFamily: 'inherit', fontSize: 14, color: '#202124', boxSizing: 'border-box' }}
            />
            <div style={{ padding: '10px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                <button className={styles.sendBtn} onClick={onSendReply}>Send</button>
                <span style={{ color: '#5f6368', fontSize: 16, cursor: 'pointer', fontWeight: 'bold', fontFamily: 'serif' }} title="Formatting">A</span>
                <span style={{ color: '#5f6368', fontSize: 16, cursor: 'pointer' }} title="Attach files">📎</span>
                <span style={{ color: '#5f6368', fontSize: 16, cursor: 'pointer' }} title="Insert link">🔗</span>
                <span style={{ color: '#5f6368', fontSize: 16, cursor: 'pointer' }} title="Emoji">😀</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                <span style={{ color: '#5f6368', fontSize: 12 }}>{replyStatus}</span>
                <span style={{ color: '#5f6368', fontSize: 18, cursor: 'pointer', fontWeight: 'bold' }}>⋮</span>
                <span style={{ color: '#5f6368', fontSize: 18, cursor: 'pointer' }}>🗑️</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
