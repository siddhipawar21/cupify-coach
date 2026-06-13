import React, { useState, useRef, useCallback } from 'react'
import styles from './QuestionInput.module.css'
import useVoiceInput from '../hooks/useVoiceInput'

const MODES = [
  { id:'ask',  label:'💬 Ask Anything',  placeholder:'Ask anything — "What is offside?" or "How does a 4-3-3 work?"' },
  { id:'var',  label:'🟨 VAR Explainer', placeholder:'Describe a match incident — "The referee cancelled a goal after 3 minutes of VAR review..."' },
  { id:'moment',label:'⚡ Match Moment', placeholder:'Describe what just happened — "Brazil just got a red card in minute 89, what happens next?"' },
]

export default function QuestionInput({ onSubmit, loading }) {
  const [text, setText] = useState('')
  const [mode, setMode] = useState('ask')
  const textareaRef = useRef(null)

  const handleVoiceResult = useCallback(transcript => {
    setText(transcript)
    textareaRef.current?.focus()
  }, [])

  const { listening, supported, start, stop } = useVoiceInput(handleVoiceResult)

  function handleSubmit(e) {
    e?.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || loading) return
    const submitMode = mode === 'moment' ? 'ask' : mode
    const submitText = mode === 'moment'
      ? `LIVE MATCH MOMENT: ${trimmed}. Explain what just happened, what the rule says, and what happens next.`
      : trimmed
    onSubmit({ text: submitText, mode: submitMode })
    setText('')
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  const currentMode = MODES.find(m => m.id === mode)
  const charCount = text.length
  const maxChars = 500

  return (
    <div className={styles.wrap}>
      {/* Mode tabs */}
      <div className={styles.modebar}>
        {MODES.map(m => (
          <button
            key={m.id}
            className={`${styles.modeBtn} ${mode === m.id ? styles.modeBtnActive : ''}`}
            onClick={() => setMode(m.id)}
            type="button"
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className={styles.inputArea}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={text}
          onChange={e => setText(e.target.value.slice(0, maxChars))}
          onKeyDown={handleKey}
          placeholder={currentMode.placeholder}
          rows={3}
          disabled={loading}
        />

        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <span className={styles.hint}>Press Enter to send · Shift+Enter for new line</span>
            <span className={styles.charCount} style={{ color: charCount > maxChars * 0.9 ? '#ffb84d' : '' }}>
              {charCount}/{maxChars}
            </span>
          </div>
          <div className={styles.footerRight}>
            {/* Voice button */}
            {supported && (
              <button
                type="button"
                className={`${styles.voiceBtn} ${listening ? styles.voiceBtnActive : ''}`}
                onClick={listening ? stop : start}
                title={listening ? 'Stop listening' : 'Voice input'}
              >
                {listening ? '⏹ Listening...' : '🎙 Voice'}
              </button>
            )}
            <button
              className={styles.sendBtn}
              onClick={handleSubmit}
              disabled={!text.trim() || loading}
              type="button"
            >
              {loading ? '...' : 'Send →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}