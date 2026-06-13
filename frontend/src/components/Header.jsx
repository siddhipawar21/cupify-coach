import React from 'react'
import styles from './Header.module.css'

export default function Header({ level, language, onLevelChange, onLanguageChange }) {

  const levels    = ['Beginner', 'Intermediate', 'Fan']
  const languages = ['English', 'Hindi', 'Marathi', 'Spanish']

  const langFlags = {
    English: '🇬🇧',
    Hindi:   '🇮🇳',
    Marathi: '🇮🇳',
    Spanish: '🇪🇸'
  }

 return (
    <header className={styles.header}>

      {/* Brand / Logo */}
      <div className={styles.brand}>
        <span className={styles.ball}>⚽</span>
        <div>
          <h1 className={`${styles.title} display`}>Cupify Coach</h1>
          <p className={styles.tagline}>AI World Cup Companion · FIFA 2026</p>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>

        {/* Knowledge Level Selector */}
        <div className={styles.controlGroup}>
          <span className={styles.label}>I know</span>
          <div className={styles.pills}>
            {levels.map(l => (
              <button
                key={l}
                className={`${styles.pill} ${level === l ? styles.active : ''}`}
                onClick={() => onLevelChange(l)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Language Selector */}
        <div className={styles.controlGroup}>
          <span className={styles.label}>Language</span>
          <div className={styles.pills}>
            {languages.map(lang => (
              <button
                key={lang}
                className={`${styles.pill} ${language === lang ? styles.active : ''}`}
                onClick={() => onLanguageChange(lang)}
                title={lang}
              >
                {langFlags[lang]} {lang}
              </button>
            ))}
          </div>
        </div>

      </div>
    </header>
  )
}

