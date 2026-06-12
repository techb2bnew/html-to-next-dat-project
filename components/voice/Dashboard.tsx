'use client'
import type { SimulationState, TimelineEvent, TranscriptMessage } from '@/lib/types/voice';
import TimelinePanel from './TimelinePanel';
import CallPanel from './CallPanel';
import TranscriptPanel from './TranscriptPanel';
import styles from '@/app/voice-simulator/voice.module.css';

interface Props {
  simState: SimulationState | null;
  callStatus: string;
  isSpeaking: boolean;
  isRecording: boolean;
  aiEmotion: string | null;
  aiObjection: string | null;
  timelineEvents: TimelineEvent[];
  transcriptMessages: TranscriptMessage[];
  onToggleMic: () => void;
  onEndCall: () => void;
}

export default function Dashboard(props: Props) {
  return (
    <div className={styles.dashboard}>
      <TimelinePanel events={props.timelineEvents} />
      <CallPanel
        simState={props.simState}
        callStatus={props.callStatus}
        isSpeaking={props.isSpeaking}
        isRecording={props.isRecording}
        aiEmotion={props.aiEmotion}
        aiObjection={props.aiObjection}
        onToggleMic={props.onToggleMic}
        onEndCall={props.onEndCall}
      />
      <TranscriptPanel messages={props.transcriptMessages} />
    </div>
  );
}
