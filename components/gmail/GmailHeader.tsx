'use client'
import styles from '@/app/gmail-simulator/gmail.module.css';

interface Props {
  onToggleSidebar: () => void;
}

export default function GmailHeader({ onToggleSidebar }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.logoArea}>
        <div className={styles.hamburger} onClick={onToggleSidebar}>☰</div>
        <div className={styles.logo}>
          <span className="text-[#ea4335] text-2xl font-bold mr-1">M</span>
          Gmail
        </div>
      </div>
      <div className={styles.searchArea}>
        <span>🔍</span>
        <input type="text" placeholder="Search mail" />
      </div>
      <div className={styles.profileArea}>
        <span>❓</span>
        <span>⚙️</span>
        <div className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center">
          B
        </div>
      </div>
    </header>
  );
}
