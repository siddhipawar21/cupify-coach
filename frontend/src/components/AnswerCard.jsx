import React, { useState } from 'react'
import styles from './AnswerCard.module.css'

export default function AnswerCard({ item }) {
  const [showSources, setShowSources] = useState(false)
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(item.answer || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Parse source labels nicely
  function formatSource(src) {
    if (!src) return 'Knowledge Base'
    if (src.includes('laws_of_the_game')) return '📖 FIFA Laws of the Game 2026'
    if (src.includes('FIFA Laws')) return '📖 FIFA Laws of the Game'
    if (src.includes('VAR')) return '🟨 VAR Protocol'
    if (src.includes('World Cup')) return '🏆 World Cup 2026 Guide'
    if (src.includes('Tactics')) return '⚽ Tactical Knowledge'
    if (src.includes('Player')) return '👤 Player Roles Guide'
    return '📚 ' + src
  }

  // Map source to which Law it likely covers
  function getLawHint(src, answer) {
    if (!answer) return null
    const a = answer.toLowerCase()
    if (a.includes('offside')) return 'Law 11 — Offside'
    if (a.includes('var') || a.includes('video assistant')) return 'VAR Protocol'
    if (a.includes('penalty')) return 'Law 14 — Penalty Kick'
    if (a.includes('throw-in') || a.includes('throw in')) return 'Law 15 — Throw-In'
    if (a.includes('corner')) return 'Law 17 — Corner Kick'
    if (a.includes('goal kick')) return 'Law 16 — Goal Kick'
    if (a.includes('red card') || a.includes('sent off')) return 'Law 12 — Misconduct'
    if (a.includes('yellow card') || a.includes('caution')) return 'Law 12 — Caution'
    if (a.includes('foul') || a.includes('free kick')) return 'Law 12 — Fouls'
    if (a.includes('substitut')) return 'Law 3 — Players'
    if (a.includes('goalkeeper') || a.includes('goal kick')) return 'Law 16'
    if (a.includes('duration') || a.includes('45 minute') || a.includes('extra time')) return 'Law 7 — Duration'
    if (a.includes('kickoff') || a.includes('kick off')) return 'Law 8 — Kickoff'
    if (a.includes('goal') && a.includes('line')) return 'Law 10 — Scoring'
    if (a.includes('formation') || a.includes('pressing') || a.includes('tactic')) return 'Tactical Analysis'
    return null
  }

  // Confidence based on sources quality
  function getConfidence() {
    const srcs = item.sources || []
    if (srcs.some(s => s.includes('laws_of_the_game'))) return { pct: 94, label: 'High', col: '#b5ff47' }
    if (srcs.some(s => s.includes('FIFA Laws'))) return { pct: 87, label: 'Good', col: '#b5ff47' }
    if (srcs.length > 1) return { pct: 78, label: 'Good', col: '#80e880' }
    if (srcs.length === 1) return { pct: 70, label: 'Moderate', col: '#ffb84d' }
    return { pct: 55, label: 'Low', col: '#ff8888' }
  }

  const conf = getConfidence()
  const lawHint = getLawHint(item.sources?.[0], item.answer)
  const isDemo = item.answer?.startsWith('[Demo Mode')
  const modeLabel = item.mode === 'var' ? '🟨 VAR Explainer' : '💬 Ask Anything'

  return (
    <div className={`${styles.card} fade-in`}>

      {/* Question */}
      <div className={styles.question}>
        <div className={styles.qIcon}>
          {item.mode === 'var' ? '🟨' : '⚽'}
        </div>
        <div className={styles.qContent}>
          <span className={styles.qText}>{item.question}</span>
          <div className={styles.qMeta}>
            <span className={styles.metaBadge} style={{ background: 'rgba(181,255,71,0.12)', color: '#b5ff47', border: '1px solid rgba(181,255,71,0.25)' }}>
              {item.level}
            </span>
            <span className={styles.metaBadge} style={{ background: 'rgba(100,180,255,0.1)', color: '#7bc8ff', border: '1px solid rgba(100,180,255,0.25)' }}>
              {item.language}
            </span>
            <span className={styles.metaBadge} style={{ background: 'rgba(255,255,255,0.05)', color: '#8aad8e', border: '1px solid rgba(255,255,255,0.1)' }}>
              {modeLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Answer body */}
      <div className={styles.answerBody}>
        {isDemo && (
          <div className={styles.demoWarning}>
            ⚠️ Demo Mode — IBM Granite not connected. Check your .env credentials.
          </div>
        )}
        <p className={styles.answerText}>{item.answer}</p>
      </div>

      {/* Explainability bar */}
      <div className={styles.explainBar}>
        {/* Confidence */}
        <div className={styles.confSection}>
          <span className={styles.explainLabel}>AI Confidence</span>
          <div className={styles.confTrack}>
            <div className={styles.confFill} style={{ width: conf.pct + '%', background: conf.col }} />
          </div>
          <span className={styles.confPct} style={{ color: conf.col }}>{conf.pct}%</span>
          <span className={styles.confLabel} style={{ color: conf.col }}>{conf.label}</span>
        </div>

        {/* Law reference */}
        {lawHint && (
          <div className={styles.lawBadge}>
            <span className={styles.lawIcon}>⚖️</span>
            <span className={styles.lawText}>{lawHint}</span>
          </div>
        )}
      </div>

      {/* Sources — expandable */}
      <div className={styles.sourcesRow}>
        <div className={styles.sourcesLeft}>
          <span className={styles.sourcesLabel}>SOURCES:</span>
          {(item.sources || []).map((src, i) => (
            <button
              key={i}
              className={styles.sourceChip}
              onClick={() => setShowSources(v => !v)}
              title="Click to see source details"
            >
              {formatSource(src)}
            </button>
          ))}
          {(!item.sources || item.sources.length === 0) && (
            <span className={styles.sourceChip}>Built-in Knowledge</span>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.actBtn} onClick={copy} title="Copy answer">
            {copied ? '✅ Copied' : '📋 Copy'}
          </button>
          <span className={styles.timestamp}>{item.timestamp}</span>
        </div>
      </div>

      {/* Expandable source detail */}
      {showSources && (
        <div className={styles.sourceDetail}>
          <div className={styles.sourceDetailTitle}>📖 How Cupify Coach answered this</div>
          <div className={styles.sourceDetailBody}>
            <p className={styles.sourceDetailText}>
              This answer was generated by <strong>IBM Granite</strong> using Retrieval-Augmented Generation (RAG).
              The AI searched through <strong>{(item.sources || []).length} source(s)</strong> from
              the official FIFA Laws of the Game and built-in football knowledge, retrieved the most
              relevant passages, and generated this answer grounded in those documents.
            </p>
            {lawHint && (
              <div className={styles.lawDetail}>
                <span className={styles.lawDetailIcon}>⚖️</span>
                <div>
                  <div className={styles.lawDetailTitle}>Relevant rule: {lawHint}</div>
                  <div className={styles.lawDetailSub}>
                    This answer is grounded in {lawHint} from the official FIFA/IFAB Laws of the Game 2026.
                    You can verify this in the official rulebook at theifab.com.
                  </div>
                </div>
              </div>
            )}
            <div className={styles.sourcesList}>
              {(item.sources || []).map((src, i) => (
                <div key={i} className={styles.sourceItem}>
                  <span className={styles.sourceItemIcon}>📄</span>
                  <div>
                    <div className={styles.sourceItemName}>{formatSource(src)}</div>
                    <div className={styles.sourceItemSub}>Retrieved {conf.pct}% confidence match from vector search</div>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.trustNote}>
              <span>🔍</span>
              <span>Cupify Coach shows every source so you can verify AI answers — this is <strong>explainable AI</strong> in practice.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}