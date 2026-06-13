import { useState, useEffect, useRef } from 'react'

export default function useTypewriter(text, speed = 18) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const indexRef = useRef(0)
  const rafRef = useRef(null)
  const lastTimeRef = useRef(0)

  useEffect(() => {
    if (!text) return
    indexRef.current = 0
    setDisplayed('')
    setDone(false)
    lastTimeRef.current = 0

    function tick(timestamp) {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      const elapsed = timestamp - lastTimeRef.current

      if (elapsed >= speed) {
        lastTimeRef.current = timestamp
        // Add multiple chars at once for longer texts to keep it snappy
        const charsPerTick = text.length > 300 ? 3 : 1
        indexRef.current = Math.min(indexRef.current + charsPerTick, text.length)
        setDisplayed(text.slice(0, indexRef.current))
        if (indexRef.current >= text.length) {
          setDone(true)
          return
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [text, speed])

  return { displayed, done }
}