import { useState, useRef, useCallback } from 'react'

export default function useVoiceInput(onResult) {
  const [listening, setListening] = useState(false)
  const [supported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  const recRef = useRef(null)

  const start = useCallback(() => {
    if (!supported) return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SR()
    rec.lang = 'en-US'
    rec.continuous = false
    rec.interimResults = false
    rec.onstart = () => setListening(true)
    rec.onend = () => setListening(false)
    rec.onresult = e => {
      const transcript = e.results[0][0].transcript
      onResult(transcript)
    }
    rec.onerror = () => setListening(false)
    recRef.current = rec
    rec.start()
  }, [supported, onResult])

  const stop = useCallback(() => {
    if (recRef.current) recRef.current.stop()
    setListening(false)
  }, [])

  return { listening, supported, start, stop }
}