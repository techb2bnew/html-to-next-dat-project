'use client'
import type { SimulationState } from '@/lib/types/voice';
import styles from '@/app/voice-simulator/voice.module.css';

interface Props {
  simState: SimulationState | null;
  callStatus: string;
  isSpeaking: boolean;
  isRecording: boolean;
  aiEmotion: string | null;
  aiObjection: string | null;
  onToggleMic: () => void;
  onEndCall: () => void;
}

export default function CallPanel({
  simState,
  callStatus,
  isSpeaking,
  isRecording,
  aiEmotion,
  aiObjection,
  onToggleMic,
  onEndCall,
}: Props) {
  const initial = simState?.ai_persona?.charAt(0) ?? 'AI';
  const sc = simState?.scenario;

  return (
    <div className={`${styles.panel} ${styles.centerPanel}`}>
      <div className={styles.callInfo}>
        <div className={`${styles.avatarWrap} ${isSpeaking ? styles.isSpeaking : ''}`}>
          <div className={styles.avatarRipple} />
          <div className={styles.avatar}>{initial}</div>
        </div>

        <div className={styles.aiName}>{simState?.ai_persona ?? 'Connecting...'}</div>
        <div className={styles.aiRole}>{simState ? `${simState.ai_role} AI` : '--'}</div>

        <div className={styles.statusBadges}>
          <div className={styles.badge}>{callStatus}</div>
          {aiEmotion && (
            <div className={`${styles.badge} ${styles.badgeEmotion}`}>
              Emotion: {aiEmotion}
            </div>
          )}
          {aiObjection && (
            <div className={`${styles.badge} ${styles.badgeObjection}`}>
              Objection: {aiObjection}
            </div>
          )}
        </div>

        {sc && (
          <div className={styles.scenarioBox}>
            <div><span>Lane:</span> {sc.lane.origin} → {sc.lane.destination}</div>
            <div><span>Equipment:</span> {sc.equipment}</div>
            <div><span>Commodity:</span> {sc.commodity} ({sc.weight})</div>
            <div><span>Market:</span> {sc.market_condition}</div>
            <div className={styles.scenarioRate}><span>Base Rate:</span> ${sc.base_rate}</div>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <button
          className={`${styles.btn} ${styles.btnMic} ${isRecording ? styles.active : ''}`}
          onClick={onToggleMic}
          title="Toggle Microphone"
        >
          🎤
        </button>
        <button
          className={`${styles.btn} ${styles.btnEnd}`}
          onClick={onEndCall}
          title="End Call"
        >
          📞
        </button>
      </div>
    </div>
  );
}
