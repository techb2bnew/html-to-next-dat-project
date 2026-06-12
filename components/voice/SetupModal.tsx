'use client'
import type { SimMode } from '@/lib/types/voice';
import styles from '@/app/voice-simulator/voice.module.css';

interface Props {
  selectedMode: SimMode;
  onSelectMode: (mode: SimMode) => void;
  onStart: () => void;
}

export default function SetupModal({ selectedMode, onSelectMode, onStart }: Props) {
  return (
    <div className={styles.setupModal}>
      <div className={styles.modalContent}>
        <h2>DAT Simulation Initialization</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 30 }}>
          Select your role in the upcoming freight negotiation.
        </p>

        <div className={styles.modeSelect}>
          <button
            className={`${styles.modeBtn} ${selectedMode === 'broker' ? styles.active : ''}`}
            onClick={() => onSelectMode('broker')}
          >
            I am a Carrier (Broker AI)
          </button>
          <button
            className={`${styles.modeBtn} ${selectedMode === 'carrier' ? styles.active : ''}`}
            onClick={() => onSelectMode('carrier')}
          >
            I am a Broker (Carrier AI)
          </button>
          <button
            className={`${styles.modeBtn} ${selectedMode === 'mixed' ? styles.active : ''}`}
            onClick={() => onSelectMode('mixed')}
          >
            Surprise Me (Mixed Mode)
          </button>
        </div>

        <button
          className={styles.modeBtn}
          style={{ background: 'var(--accent-success)', color: 'white', width: '100%', border: 'none', marginTop: 10 }}
          onClick={onStart}
        >
          Start Simulation
        </button>
      </div>
    </div>
  );
}
