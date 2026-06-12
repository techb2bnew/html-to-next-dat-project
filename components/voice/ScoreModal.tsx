'use client'
import type { ScoreData } from '@/lib/types/voice';
import styles from '@/app/voice-simulator/voice.module.css';

interface Props {
  scores: ScoreData;
}

const METRICS: { key: keyof ScoreData; label: string }[] = [
  { key: 'negotiation_score', label: 'Negotiation' },
  { key: 'communication_score', label: 'Communication' },
  { key: 'objection_handling_score', label: 'Objection Handling' },
  { key: 'closing_score', label: 'Closing' },
  { key: 'professionalism_score', label: 'Professionalism' },
  { key: 'confidence_score', label: 'Confidence' },
  { key: 'industry_knowledge_score', label: 'Industry Knowledge' },
];

export default function ScoreModal({ scores }: Props) {
  return (
    <div className={styles.scoreModal}>
      <div className={styles.scoreModalContent}>
        <h2>Call Evaluation</h2>

        <div className={styles.overallRating}>{scores.overall_rating}/100</div>

        <div className={styles.scoreGrid}>
          {METRICS.map(({ key, label }) => (
            <div key={key} className={styles.scoreItem}>
              <span>{label}</span>
              <span className={styles.scoreVal}>{(scores[key] as number) || 0}</span>
            </div>
          ))}
        </div>

        <div className={styles.listsContainer}>
          <strong>Strengths</strong>
          <ul>{scores.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
          <strong>Weaknesses</strong>
          <ul>{scores.weaknesses.map((s, i) => <li key={i}>{s}</li>)}</ul>
          <strong>Recommendations</strong>
          <ul>{scores.recommendations.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>

        <button
          className={styles.modeBtn}
          style={{ background: 'var(--accent-primary)', color: 'white', width: '100%', border: 'none', marginTop: 20 }}
          onClick={() => window.location.reload()}
        >
          New Simulation
        </button>
        <button
          className={styles.modeBtn}
          style={{ background: 'transparent', color: 'var(--text-secondary)', width: '100%', border: 'none', marginTop: 10 }}
          onClick={() => { window.location.href = '/dat-simulator'; }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
