import React, { useEffect, useState } from 'react'

export default function Intro({ onComplete }) {
  const [done, setDone] = useState(false)

  useEffect(() => {
    function handleMessage(e) {
      if (e.data === 'introComplete') {
        setDone(true)
        onComplete()
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDone(true)
      onComplete()
    }, 7000)
    return () => clearTimeout(timer)
  }, [])

  if (done) return null

  return (
    <div style={{
      position: 'fixed', inset: 0,
      width: '100vw', height: '100vh',
      zIndex: 9999, background: '#071a0a'
    }}>
      <iframe
        src="/intro.html"
        style={{
          width: '100%', height: '100%',
          border: 'none', display: 'block'
        }}
        title="Cupify Coach Intro"
      />
    </div>
  )
}