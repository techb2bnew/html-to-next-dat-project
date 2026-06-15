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
        <p className="text-slate-400 mb-[30px]">
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
          className={`${styles.modeBtn} !bg-emerald-500 !text-white !w-full !border-none mt-[10px]`}
          onClick={onStart}
        >
          Start Simulation
        </button>
      </div>
    </div>
  );
}
