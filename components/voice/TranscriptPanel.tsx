'use client'
import { useEffect, useRef } from 'react';
import type { TranscriptMessage } from '@/lib/types/voice';
import styles from '@/app/voice-simulator/voice.module.css';

interface Props {
  messages: TranscriptMessage[];
}

export default function TranscriptPanel({ messages }: Props) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>Live Transcript</div>
      <div className={styles.transcriptContainer} ref={listRef}>
        {messages.map(msg => {
          if (msg.type === 'system') {
            return (
              <div key={msg.id} className={`${styles.msg} ${styles.msgSystem}`}>
                {msg.text}
              </div>
            );
          }
          const cls = msg.type === 'ai' ? styles.msgAi : styles.msgUser;
          return (
            <div key={msg.id} className={`${styles.msg} ${cls}`}>
              <div className={styles.msgSpeaker}>{msg.speaker}</div>
              {msg.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
