import React, { useEffect, useState } from 'react'

export default function LiveMatchBar() {
  const [matches, setMatches] = useState([])
  const [connected, setConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Try REST API first (simpler, no socket.io issues)
    function fetchData() {
      fetch('http://localhost:5000/api/live', { signal: AbortSignal.timeout(4000) })
        .then(r => r.json())
        .then(data => {
          setMatches(data.matches || [])
          setLastUpdate(data.timestamp)
          setConnected(true)
          setError(false)
        })
        .catch(() => {
          setError(true)
          setConnected(false)
          // Use demo data so bar still shows
          setMatches([
            { home:'Brazil', away:'Argentina', home_score:2, away_score:1, minute:74, status:'IN_PLAY' },
            { home:'France', away:'Spain',     home_score:1, away_score:0, minute:38, status:'IN_PLAY' },
            { home:'England',away:'Germany',   home_score:0, away_score:0, minute:12, status:'IN_PLAY' },
          ])
        })
    }

    // Try socket.io if available
    let socket = null
    try {
      const io = window.io
      if (io) {
        socket = io('http://localhost:5000', { transports:['polling'], reconnectionAttempts:3, timeout:3000 })
        socket.on('connect', () => setConnected(true))
        socket.on('disconnect', () => setConnected(false))
        socket.on('live_update', data => {
          setMatches(data.matches || [])
          setLastUpdate(data.timestamp)
          setConnected(true)
        })
      }
    } catch(e) {}

    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => { clearInterval(interval); socket?.disconnect() }
  }, [])

  if (!matches.length) return null

  return (
    <div style={{ background:'rgba(0,0,0,0.85)', borderBottom:'1px solid rgba(181,255,71,0.12)', padding:'5px 14px', display:'flex', alignItems:'center', gap:12, overflowX:'auto', flexShrink:0, minHeight:36 }}>
      {/* Live dot */}
      <div style={{ display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
        <div style={{ width:6, height:6, borderRadius:'50%', background: connected?'#ff3333':'#555', animation: connected?'blink 1s infinite':'none' }}/>
        <span style={{ fontSize:'0.58rem', color: connected?'#ff6666':'#666', letterSpacing:'0.1em', fontWeight:700 }}>
          {connected ? 'LIVE' : 'DEMO'}
        </span>
      </div>

      {/* Match pills */}
      {matches.slice(0,4).map((m,i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:7, background:'rgba(181,255,71,0.06)', border:'1px solid rgba(181,255,71,0.15)', borderRadius:999, padding:'3px 11px', flexShrink:0 }}>
          <span style={{ fontSize:'0.68rem', color:'#fff', fontWeight:600 }}>{m.home}</span>
          <span style={{ fontSize:'0.78rem', fontWeight:900, color:'#b5ff47', fontFamily:'monospace', padding:'0 5px', background:'rgba(181,255,71,0.12)', borderRadius:4 }}>
            {m.home_score} — {m.away_score}
          </span>
          <span style={{ fontSize:'0.68rem', color:'#fff', fontWeight:600 }}>{m.away}</span>
          {m.status==='IN_PLAY' && m.minute && (
            <span style={{ fontSize:'0.58rem', color:'#ff6666', fontWeight:700 }}>{m.minute}'</span>
          )}
        </div>
      ))}

      <span style={{ fontSize:'0.58rem', color:'#334433', marginLeft:'auto', flexShrink:0, fontFamily:'monospace' }}>
        {error ? 'demo data' : lastUpdate ? `updated ${lastUpdate}` : ''}
      </span>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}`}</style>
    </div>
  )
}