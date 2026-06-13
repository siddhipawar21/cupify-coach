import React from 'react'
import styles from './AnswerCard.module.css'

const levelColors = {
  Beginner:     { bg: '#1a3520', accent: '#4ade80', label: '🟢 Beginner'     },
  Intermediate: { bg: '#2a2a14', accent: '#fbbf24', label: '🟡 Intermediate' },
  Fan:          { bg: '#1a1a2e', accent: '#818cf8', label: '💜 Fan'           },
}

const langLabels = {
  English: '🇬🇧 English',
  Hindi:   '🇮🇳 Hindi',
  Marathi: '🇮🇳 Marathi',
  Spanish: '🇪🇸 Spanish',
}

export default function AnswerCard({ item }) {
  const {
    question,
    answer,
    sources,
    level,
    language,
    mode,
    timestamp
  } = item
  
  const lvl = levelColors[level] || levelColors.Beginner

return (
    <div className={`${styles.card} fade-in`}>

      {/* Question Row */}
      <div className={styles.question}>
        <span className={styles.qIcon}>Q</span>
        <p>{question}</p>
      </div>

      {/* Tag Row */}
      <div className={styles.tags}>
        <span
          className={styles.tag}
          style={{ color: lvl.accent, borderColor: lvl.accent }}
        >
          {lvl.label}
        </span>
        <span className={styles.tag}>
          {langLabels[language] || language}
        </span>
        {mode === 'var' && (
          <span className={`${styles.tag} ${styles.varTag}`}>
            🟨 VAR Explainer
          </span>
        )}
      </div>

      {/* Answer Row */}
      <div className={styles.answer}>
        <div className={styles.aIcon}>⚽</div>
        <div className={styles.answerText}>
          {answer.split('\n').map((line, i) => (
            line.trim()
              ? <p key={i}>{line}</p>
              : <br key={i} />
          ))}
        </div>
      </div>

      {/* Sources Row */}
      {sources && sources.length > 0 && (
        <div className={styles.sources}>
          <span className={styles.sourcesLabel}>Sources:</span>
          {sources.map((s, i) => (
            <span key={i} className={styles.source}>{s}</span>
          ))}
        </div>
      )}

      {/* Timestamp */}
      <div className={styles.timestamp}>{timestamp}</div>

    </div>
  )
}

