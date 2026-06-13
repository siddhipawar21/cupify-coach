import React from 'react'
import styles from './TopicSuggestions.module.css'

const STATIC_TOPICS = [
  { id: 1, emoji: '🟨', title: 'What is VAR?',                     category: 'Rules'     },
  { id: 2, emoji: '⚽', title: 'How does offside work?',            category: 'Rules'     },
  { id: 3, emoji: '🔄', title: 'What is a 4-3-3 formation?',        category: 'Tactics'   },
  { id: 4, emoji: '⚡', title: 'What is a high press?',             category: 'Tactics'   },
  { id: 5, emoji: '🌍', title: 'How does the World Cup work?',      category: 'World Cup' },
  { id: 6, emoji: '🏆', title: 'Who is hosting the 2026 World Cup?',category: 'World Cup' },
  { id: 7, emoji: '🔴', title: 'When is a red card given?',         category: 'Rules'     },
  { id: 8, emoji: '💨', title: 'What is momentum in soccer?',       category: 'Tactics'   },
]

const CATEGORY_COLORS = {
  'Rules':     '#ff9f43',
  'Tactics':   '#54a0ff',
  'World Cup': '#5f27cd',
}

export default function TopicSuggestions({ onTopicClick }) {
  return (
    <div className={styles.wrapper}>

      {/* Section heading */}
      <p className={styles.heading}>
        <span className={styles.bolt}>✦</span> Quick Topics
      </p>

      {/* Topic cards grid */}
      <div className={styles.grid}>
        {STATIC_TOPICS.map(topic => (
          <button
            key={topic.id}
            className={styles.card}
            onClick={() => onTopicClick(topic.title)}
            style={{ '--cat-color': CATEGORY_COLORS[topic.category] }}
          >
            <span className={styles.emoji}>{topic.emoji}</span>
            <div>
              <span className={styles.cat}>{topic.category}</span>
              <p className={styles.title}>{topic.title}</p>
            </div>
          </button>
        ))}
      </div>

    </div>
  )
}

