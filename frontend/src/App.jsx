import React, { useState, useRef, useEffect } from 'react'
import Intro from './components/Intro'
import Header from './components/Header'
import QuestionInput from './components/QuestionInput'
import AnswerCard from './components/AnswerCard'
import TopicSuggestions from './components/TopicSuggestions'
import FootballGame from './components/FootballGame'
import { askQuestion, explainIncident } from './api'
import styles from './App.module.css'

// Lazy imports to prevent black screen if component has error
let TacticalPitch = null
let LiveMatchBar = null
try {
  TacticalPitch = React.lazy(() => import('./components/TacticalPitch'))
} catch(e) { console.warn('TacticalPitch not available') }
try {
  LiveMatchBar = React.lazy(() => import('./components/LiveMatchBar'))
} catch(e) { console.warn('LiveMatchBar not available') }

function detectFormation(text) {
  if (!text) return null
  if (text.includes('4-3-3') || text.includes('433')) return '433'
  if (text.includes('4-4-2') || text.includes('442')) return '442'
  if (text.includes('3-5-2') || text.includes('352')) return '352'
  if (text.includes('4-2-3-1') || text.includes('4231')) return '4231'
  return null
}

function isTactical(text) {
  if (!text) return false
  const kw = ['formation','4-3-3','4-4-2','3-5-2','4-2-3-1','pressing','tactic','high press','gegenpressing','wingback']
  return kw.some(k => text.toLowerCase().includes(k))
}

export default function App() {
  const [showIntro, setShowIntro] = useState(
    localStorage.getItem('cupify_skip_intro') !== '1'
  )
  const [level, setLevel] = useState('Beginner')
  const [language, setLanguage] = useState('English')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [showGame, setShowGame] = useState(false)
  const [error, setError] = useState(null)
  const [showPitch, setShowPitch] = useState(false)
  const [pitchFormation, setPitchFormation] = useState('433')
  const bottomRef = useRef(null)

  useEffect(() => {
    if (history.length > 0) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  async function handleSubmit({ text, mode }) {
    setLoading(true); setError(null)
    const pending = {
      id: Date.now(), question: text, mode, level, language,
      answer: null, timestamp: new Date().toLocaleTimeString()
    }
    setHistory(h => [...h, pending])
    try {
      let result
      if (mode === 'var') result = await explainIncident({ incident: text, level, language })
      else result = await askQuestion({ question: text, level, language })
      setHistory(h => h.map(item => item.id === pending.id ? { ...item, ...result } : item))
      if (result?.answer && isTactical(result.answer)) {
        const f = detectFormation(result.answer)
        if (f) setPitchFormation(f)
        setShowPitch(true)
      }
    } catch (err) {
      setHistory(h => h.map(item =>
        item.id === pending.id ? { ...item, answer: `Error: ${err.message}`, sources: [] } : item
      ))
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleTopicClick(topic) { handleSubmit({ text: topic, mode: 'ask' }) }
  function clearHistory() { setHistory([]); setError(null); setShowPitch(false) }

  const showEmpty = history.length === 0 && !loading

  return (
    <>
      {showIntro && <Intro onComplete={() => setShowIntro(false)} />}
      {showGame && <FootballGame onClose={() => setShowGame(false)} />}

      <div
        className={styles.app}
        style={{ opacity: showIntro ? 0 : 1, transition: 'opacity 0.8s ease', pointerEvents: showIntro ? 'none' : 'all' }}
      >
        <Header
          level={level} language={language}
          onLevelChange={setLevel} onLanguageChange={setLanguage}
        />

        {/* Live match bar — safe render */}
        {LiveMatchBar && (
          <React.Suspense fallback={null}>
            <LiveMatchBar />
          </React.Suspense>
        )}

        <main className={styles.main}>
          <div className={styles.chatArea}>

            {showEmpty && (
              <div className={`${styles.hero} fade-in`}>
                <div className={styles.heroIcon}>⚽</div>
                <h2 className={`${styles.heroTitle} heading`}>Ask me anything about soccer</h2>
                <p className={styles.heroSub}>
                  Rules · Tactics · VAR decisions · World Cup 2026 · Formations
                  <br />In your language, at your level.
                </p>
                <div className={styles.poweredBy}>
                  <span>Powered by</span>
                  <strong>IBM Granite</strong>
                  <span>+</span>
                  <strong>Docling</strong>
                </div>
                <button
                  onClick={() => setShowGame(true)}
                  style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: 'rgba(181,255,71,0.1)', border: '1px solid rgba(181,255,71,0.35)', borderRadius: 999, color: '#b5ff47', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  🎮 Play & Learn FIFA Rules
                </button>
              </div>
            )}

            {/* 3D Pitch — safe render */}
            {showPitch && TacticalPitch && (
              <React.Suspense fallback={<div style={{ padding: 20, color: '#b5ff47', fontSize: '0.8rem' }}>Loading 3D pitch...</div>}>
                <div style={{ position: 'relative', marginBottom: 16 }} className="fade-in">
                  <TacticalPitch detectedFormation={pitchFormation} />
                  <button
                    onClick={() => setShowPitch(false)}
                    style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: 'rgba(255,255,255,0.5)', padding: '3px 10px', cursor: 'pointer', fontSize: '0.62rem', zIndex: 10 }}
                  >✕</button>
                </div>
              </React.Suspense>
            )}

            <div className={styles.history}>
              {history.map(item => (
                item.answer !== null ? (
                  <AnswerCard key={item.id} item={item} />
                ) : (
                  <div key={item.id} className={`${styles.loading} fade-in`}>
                    <div className={styles.loadingDot} />
                    <div className={styles.loadingDot} />
                    <div className={styles.loadingDot} />
                    <span className={styles.loadingText}>Cupify Coach is thinking...</span>
                  </div>
                )
              ))}
              <div ref={bottomRef} />
            </div>

            {error && (
              <div className={styles.errorBanner}>
                ⚠️ {error} — Is the backend running on port 5000?
              </div>
            )}

            <div className={styles.inputArea}>
              <QuestionInput onSubmit={handleSubmit} loading={loading} />
              {history.length > 0 && (
                <button className={styles.clearBtn} onClick={clearHistory}>Clear session</button>
              )}
            </div>
          </div>

          <aside className={styles.sidebar}>
            <TopicSuggestions onTopicClick={handleTopicClick} />

            {/* 3D Pitch toggle button */}
            <button
              onClick={() => setShowPitch(v => !v)}
              style={{ width: '100%', padding: '12px', background: 'rgba(100,180,255,0.08)', border: '1px solid rgba(100,180,255,0.25)', borderRadius: 12, color: '#7bc8ff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}
            >
              <span>📐</span>
              <div style={{ textAlign: 'left' }}>
                <div>3D Tactical Pitch</div>
                <div style={{ fontSize: '0.62rem', color: 'rgba(100,180,255,0.5)', fontWeight: 400 }}>Visualise formations live</div>
              </div>
            </button>

            {/* Game button */}
            <button
              onClick={() => setShowGame(true)}
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,rgba(181,255,71,0.12),rgba(181,255,71,0.06))', border: '1px solid rgba(181,255,71,0.3)', borderRadius: 14, color: '#b5ff47', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, letterSpacing: '0.03em', marginBottom: 10 }}
            >
              <span style={{ fontSize: '1.2rem' }}>🎮</span>
              <div style={{ textAlign: 'left' }}>
                <div>Play & Learn</div>
                <div style={{ fontSize: '0.62rem', color: 'rgba(181,255,71,0.5)', fontWeight: 400 }}>Interactive FIFA Rules Game</div>
              </div>
            </button>

            <div className={styles.aboutPanel}>
              <h3 className={`${styles.aboutTitle} heading`}>About Cupify Coach</h3>
              <p className={styles.aboutText}>
                Cupify Coach uses <strong>IBM Granite</strong> (via Watsonx.ai) and <strong>Docling</strong> to ingest FIFA rulebooks and match data, then answers your questions with context-aware AI — adapted to your level and language.
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