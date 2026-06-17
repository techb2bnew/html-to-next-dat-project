'use client'
import type { SimulationState, TimelineEvent, TranscriptMessage } from '@/lib/types/voice';
import TimelinePanel from './TimelinePanel';
import CallPanel from './CallPanel';
import TranscriptPanel from './TranscriptPanel';

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
    <div className="grid flex-1 p-5 gap-5 max-w-[1400px] mx-auto w-full grid-cols-[1fr_400px_1fr] h-full min-h-0 max-lg:grid-cols-1 max-lg:p-0 max-lg:gap-0 max-lg:h-screen">
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
