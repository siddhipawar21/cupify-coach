// API service — all backend calls go through here

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

export async function askQuestion({ question, level, language }) {
  const res = await fetch(`${BASE_URL}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, level, language })
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Something went wrong')
  }
  return res.json()
}

export async function explainIncident({ incident, level, language }) {
  const res = await fetch(`${BASE_URL}/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ incident, level, language })
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Something went wrong')
  }
  return res.json()
}

export async function fetchTopics() {
  const res = await fetch(`${BASE_URL}/topics`)
  if (!res.ok) throw new Error('Could not load topics')
  return res.json()
}