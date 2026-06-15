'use client'
import styles from '@/app/gmail-simulator/gmail.module.css';

interface Props {
  to: string;
  subject: string;
  body: string;
  onToChange: (val: string) => void;
  onSubjectChange: (val: string) => void;
  onBodyChange: (val: string) => void;
  onSend: () => void;
  onClose: () => void;
  onDraftTemplate: () => void;
}

export default function ComposeModal({ to, subject, body, onToChange, onSubjectChange, onBodyChange, onSend, onClose, onDraftTemplate }: Props) {
  return (
    <div className={styles.composeModal}>
      <div className={styles.composeHeader}>
        <span>New Message</span>
        <span className="cursor-pointer" onClick={onClose}>✖</span>
      </div>
      <div className={styles.composeInput}>
        <input type="text" value={to} onChange={e => onToChange(e.target.value)} placeholder="Recipients" />
      </div>
      <div className={styles.composeInput}>
        <input type="text" value={subject} onChange={e => onSubjectChange(e.target.value)} placeholder="Subject" />
      </div>
      <div className={styles.composeBody}>
        <textarea value={body} onChange={e => onBodyChange(e.target.value)} placeholder="Write your email here..." />
      </div>
      <div className={styles.composeFooter}>
        <button className={styles.sendBtn} onClick={onSend}>Send</button>
        <span className="ml-[15px] text-[#5f6368] cursor-pointer" onClick={onDraftTemplate}>
          Auto-Draft Negotiation
        </span>
      </div>
    </div>
  );
}
