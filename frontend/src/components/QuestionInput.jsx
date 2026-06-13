import React, { useState } from 'react'
import styles from './QuestionInput.module.css'

export default function QuestionInput({ onSubmit, loading }) {
  const [input, setInput] = useState('')
  const [mode, setMode]   = useState('ask')

const placeholders = {
    ask: 'Ask anything — "What is offside?" or "How does a 4-3-3 work?"',
    var: 'Describe the incident — "The referee gave a penalty but VAR overturned it"'
  }

function handleSubmit(e) {
    e.preventDefault()
    if (!input.trim() || loading) return
    onSubmit({ text: input.trim(), mode })
    setInput('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

return (
    <div className={styles.wrapper}>

      {/* Mode Toggle Bar */}
      <div className={styles.modeBar}>
        <button
          className={`${styles.modeBtn} ${mode === 'ask' ? styles.modeActive : ''}`}
          onClick={() => setMode('ask')}
        >
          💬 Ask Anything
        </button>
        <button
          className={`${styles.modeBtn} ${mode === 'var' ? styles.modeActive : ''}`}
          onClick={() => setMode('var')}
        >
          🟨 VAR Explainer
        </button>
      </div>

      {/* Input Form */}
      <form className={styles.form} onSubmit={handleSubmit}>
        <textarea
          className={styles.textarea}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholders[mode]}
          rows={3}
          disabled={loading}
          maxLength={500}
        />
        <div className={styles.footer}>
          <span className={styles.hint}>
            Press Enter to send · Shift+Enter for new line
          </span>
          <button
            type="submit"
            className={styles.sendBtn}
            disabled={!input.trim() || loading}
          >
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              <>Send <span className={styles.arrow}>→</span></>
            )}
          </button>
        </div>
      </form>

    </div>
  )
}

