'use client'
import { useEffect, useRef } from 'react';
import type { TimelineEvent } from '@/lib/types/voice';
import styles from '@/app/voice-simulator/voice.module.css';

interface Props {
  events: TimelineEvent[];
}

export default function TimelinePanel({ events }: Props) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>Conversation Timeline</div>
      <div className={styles.timeline} ref={listRef}>
        {events.map(ev => (
          <div key={ev.id} className={styles.timelineEvent}>
            <span className={styles.timelineTime}>{ev.time}</span>
            <span className={styles.timelineContent}>{ev.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
