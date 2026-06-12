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
          <span style={{ color: '#ea4335', fontSize: 24, fontWeight: 'bold', marginRight: 4 }}>M</span>
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
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1a73e8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          B
        </div>
      </div>
    </header>
  );
}
