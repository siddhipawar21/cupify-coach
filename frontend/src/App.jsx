import React, { useState, useRef, useEffect } from 'react'
import Intro from './components/Intro'
import LiveMatchBar from './components/LiveMatchBar'
import Header from './components/Header'
import QuestionInput from './components/QuestionInput'
import AnswerCard from './components/AnswerCard'
import TopicSuggestions from './components/TopicSuggestions'
import FootballGame from './components/FootballGame'
import { askQuestion, explainIncident } from './api'
import styles from './App.module.css'

export default function App() {
  const [showIntro, setShowIntro] = useState(true)
  const [level, setLevel]         = useState('Beginner')
  const [language, setLanguage]   = useState('English')
  const [history, setHistory]     = useState([])
  const [loading, setLoading]     = useState(false)
  const [showGame, setShowGame]   = useState(false)
  const [error, setError]         = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (history.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [history])

  async function handleSubmit({ text, mode }) {
    setLoading(true)
    setError(null)

    const pending = {
      id:        Date.now(),
      question:  text,
      mode,
      level,
      language,
      answer:    null,
      timestamp: new Date().toLocaleTimeString()
    }

    setHistory(h => [...h, pending])

    try {
      let result
      if (mode === 'var') {
        result = await explainIncident({ incident: text, level, language })
      } else {
        result = await askQuestion({ question: text, level, language })
      }

      setHistory(h =>
        h.map(item =>
          item.id === pending.id
            ? { ...item, ...result }
            : item
        )
      )
    } catch (err) {
      setHistory(h =>
        h.map(item =>
          item.id === pending.id
            ? { ...item, answer: `Error: ${err.message}`, sources: [] }
            : item
        )
      )
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleTopicClick(topic) {
    handleSubmit({ text: topic, mode: 'ask' })
  }

  function clearHistory() {
    setHistory([])
    setError(null)
  }

  const showEmpty = history.length === 0 && !loading

  return (
    <>
      {/* Intro animation */}
      {showIntro && (
        <Intro onComplete={() => setShowIntro(false)} />
      )}

      {/* Football Game overlay */}
      {showGame && (
        <FootballGame onClose={() => setShowGame(false)} />
      )}

      <div
        className={styles.app}
        style={{
          opacity:       showIntro ? 0 : 1,
          transition:    'opacity 0.8s ease',
          pointerEvents: showIntro ? 'none' : 'all'
        }}
      >
        <Header
          level={level}
          language={language}
          onLevelChange={setLevel}
          onLanguageChange={setLanguage}
        />
        <LiveMatchBar />   {/* ← ADD THIS LINE */}
        <main className={styles.main}>

          {/* ── Left: Chat area ── */}
          <div className={styles.chatArea}>

            {/* Hero shown when chat is empty */}
            {showEmpty && (
              <div className={`${styles.hero} fade-in`}>
                <div className={styles.heroIcon}>⚽</div>
                <h2 className={`${styles.heroTitle} heading`}>
                  Ask me anything about soccer
                </h2>
                <p className={styles.heroSub}>
                  Rules · Tactics · VAR decisions · World Cup 2026 · Formations
                  <br />
                  In your language, at your level.
                </p>
                <div className={styles.poweredBy}>
                  <span>Powered by</span>
                  <strong>IBM Granite</strong>
                  <span>+</span>
                  <strong>Docling</strong>
                </div>

                {/* Game CTA button — shown only on hero */}
                <button
                  onClick={() => setShowGame(true)}
                  style={{
                    marginTop:     '18px',
                    display:       'flex',
                    alignItems:    'center',
                    gap:           '8px',
                    padding:       '11px 24px',
                    background:    'rgba(181,255,71,0.1)',
                    border:        '1px solid rgba(181,255,71,0.35)',
                    borderRadius:  '999px',
                    color:         '#b5ff47',
                    fontSize:      '0.82rem',
                    fontWeight:    600,
                    cursor:        'pointer',
                    letterSpacing: '0.03em',
                    transition:    'all 0.18s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(181,255,71,0.2)'
                    e.currentTarget.style.transform  = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(181,255,71,0.1)'
                    e.currentTarget.style.transform  = 'translateY(0)'
                  }}
                >
                  🎮 Play & Learn FIFA Rules
                </button>
              </div>
            )}

            {/* Answer history */}
            <div className={styles.history}>
              {history.map(item => (
                item.answer !== null ? (
                  <AnswerCard key={item.id} item={item} />
                ) : (
                  <div key={item.id} className={`${styles.loading} fade-in`}>
                    <div className={styles.loadingDot} />
                    <div className={styles.loadingDot} />
                    <div className={styles.loadingDot} />
                    <span className={styles.loadingText}>
                     Cupify Coach  is thinking...
                    </span>
                  </div>
                )
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Error banner */}
            {error && (
              <div className={styles.errorBanner}>
                ⚠️ {error} — Is the backend running on port 5000?
              </div>
            )}

            {/* Input */}
            <div className={styles.inputArea}>
              <QuestionInput onSubmit={handleSubmit} loading={loading} />
              {history.length > 0 && (
                <button className={styles.clearBtn} onClick={clearHistory}>
                  Clear session
                </button>
              )}
            </div>
          </div>

          {/* ── Right: Sidebar ── */}
          <aside className={styles.sidebar}>
            <TopicSuggestions onTopicClick={handleTopicClick} />

            {/* Play button in sidebar */}
            <button
              onClick={() => setShowGame(true)}
              style={{
                width:         '100%',
                padding:       '14px',
                background:    'linear-gradient(135deg, rgba(181,255,71,0.12), rgba(181,255,71,0.06))',
                border:        '1px solid rgba(181,255,71,0.3)',
                borderRadius:  '14px',
                color:         '#b5ff47',
                fontSize:      '0.85rem',
                fontWeight:    700,
                cursor:        'pointer',
                display:       'flex',
                alignItems:    'center',
                justifyContent:'center',
                gap:           '10px',
                letterSpacing: '0.03em',
                transition:    'all 0.18s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background  = 'linear-gradient(135deg, rgba(181,255,71,0.22), rgba(181,255,71,0.12))'
                e.currentTarget.style.borderColor = 'rgba(181,255,71,0.6)'
                e.currentTarget.style.transform   = 'translateY(-2px)'
                e.currentTarget.style.boxShadow   = '0 4px 20px rgba(181,255,71,0.15)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background  = 'linear-gradient(135deg, rgba(181,255,71,0.12), rgba(181,255,71,0.06))'
                e.currentTarget.style.borderColor = 'rgba(181,255,71,0.3)'
                e.currentTarget.style.transform   = 'translateY(0)'
                e.currentTarget.style.boxShadow   = 'none'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🎮</span>
              <div style={{ textAlign: 'left' }}>
                <div>Play & Learn</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(181,255,71,0.6)', fontWeight: 400 }}>
                  Interactive FIFA Rules Game
                </div>
              </div>
            </button>

            {/* About panel */}
            <div className={styles.aboutPanel}>
              <h3 className={`${styles.aboutTitle} heading`}>About Cupify Coach</h3>
              <p className={styles.aboutText}>
                Cupify Coach uses <strong>IBM Granite</strong> (via Watsonx.ai)
                and <strong>Docling</strong> to ingest FIFA rulebooks and match
                data, then answers your questions with context-aware AI —
                adapted to your level and language.
              </p>
              <div className={styles.techStack}>
                {['IBM Granite', 'Docling', 'LangChain', 'FAISS', 'Flask', 'React'].map(t => (
                  <span key={t} className={styles.tech}>{t}</span>
                ))}
              </div>
            </div>
          </aside>

        </main>
      </div>
    </>
  )
}