'use client'
import type { FolderType } from '@/lib/types/gmail';
import styles from '@/app/gmail-simulator/gmail.module.css';

interface Props {
  open: boolean;
  currentFolder: FolderType;
  unreadCount: number;
  onShowFolder: (folder: FolderType) => void;
  onOpenCompose: () => void;
}

export default function GmailSidebar({ open, currentFolder, unreadCount, onShowFolder, onOpenCompose }: Props) {
  return (
    <div className={`${styles.sidebar} ${open ? styles.open : ''}`}>
      <button className={styles.composeBtn} onClick={onOpenCompose}>
        <span className="text-xl">✎</span> Compose
      </button>

      <div
        className={`${styles.navItem} ${currentFolder === 'inbox' ? styles.active : ''}`}
        onClick={() => onShowFolder('inbox')}
      >
        <span className="mr-[15px]">📥</span>
        Inbox
        <span className="ml-auto font-bold">{unreadCount > 0 ? unreadCount : ''}</span>
      </div>

      <div className={styles.navItem}>
        <span className="mr-[15px]">⭐</span> Starred
      </div>
      <div className={styles.navItem}>
        <span className="mr-[15px]">🕒</span> Snoozed
      </div>

      <div
        className={`${styles.navItem} ${currentFolder === 'sent' ? styles.active : ''}`}
        onClick={() => onShowFolder('sent')}
      >
        <span className="mr-[15px]">🚀</span> Sent
      </div>
    </div>
  );
}
