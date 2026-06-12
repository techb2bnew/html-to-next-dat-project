'use client'
import type { EmailThread, FolderType } from '@/lib/types/gmail';
import styles from '@/app/gmail-simulator/gmail.module.css';

interface Props {
  emails: EmailThread[];
  currentFolder: FolderType;
  onOpenThread: (index: number) => void;
}

export default function EmailList({ emails, currentFolder, onOpenThread }: Props) {
  const filtered: { thread: EmailThread; index: number }[] = [];
  emails.forEach((thread, index) => {
    const hasBroker = thread.messages.some(m => m.role !== 'user');
    const hasUser = thread.messages.some(m => m.role === 'user');
    if (currentFolder === 'inbox' && hasBroker) filtered.push({ thread, index });
    if (currentFolder === 'sent' && hasUser) filtered.push({ thread, index });
  });

  const items = [...filtered].reverse();

  if (items.length === 0) {
    return (
      <div className={styles.emailList}>
        <div style={{ textAlign: 'center', padding: 50, color: '#5f6368' }}>
          Your {currentFolder} is empty.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.emailList}>
      {items.map(({ thread, index }) => {
        const lastMsg = thread.messages[thread.messages.length - 1];
        const isUnread = !thread.read && currentFolder === 'inbox';

        let displaySender = lastMsg.senderName;
        let previewBody = lastMsg.body;

        if (currentFolder === 'sent') {
          const brokerMsg = thread.messages.find(m => m.role !== 'user');
          displaySender = 'To: ' + (brokerMsg?.senderName || thread.messages[0].recipientEmail);
          const sentMsg = thread.messages.slice().reverse().find(m => m.role === 'user') || lastMsg;
          previewBody = sentMsg.body;
        }

        return (
          <div
            key={index}
            className={`${styles.emailRow} ${isUnread ? styles.unread : styles.read}`}
            onClick={() => onOpenThread(index)}
          >
            <div className={styles.emailSender}>{displaySender}</div>
            <div className={styles.emailSubject}>
              <strong>{thread.subject}</strong>
              {' - '}
              <span style={{ color: '#5f6368', fontWeight: 'normal' }}>
                {previewBody.substring(0, 80).replace(/\n/g, ' ')}...
              </span>
            </div>
            <div className={styles.emailTime}>Just now</div>
          </div>
        );
      })}
    </div>
  );
}
