import React from 'react'
import useLiveData from '../hooks/useLiveData'

export default function LiveMatchBar() {
  const { matches, scorers, lastUpdate, connected, refresh } = useLiveData()

  if (!matches.length) return null

  return (
    <div style={{
      background: 'rgba(0,0,0,0.85)',
      borderBottom: '1px solid rgba(181,255,71,0.15)',
      padding: '6px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      overflowX: 'auto',
      flexShrink: 0,
    }}>
      {/* Live indicator */}
      <div style={{ display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: connected ? '#ff3333' : '#555',
          animation: connected ? 'blink 1s infinite' : 'none'
        }}/>
        <span style={{ fontSize:'0.6rem', color: connected?'#ff6666':'#666', letterSpacing:'0.1em', fontWeight:700 }}>
          {connected ? 'LIVE' : 'OFFLINE'}
        </span>
      </div>

      {/* Matches ticker */}
      {matches.map((m, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(181,255,71,0.06)',
          border: '1px solid rgba(181,255,71,0.15)',
          borderRadius: 999, padding: '3px 12px', flexShrink: 0
        }}>
          <span style={{ fontSize:'0.7rem', color:'#fff', fontWeight:600 }}>{m.home}</span>
          <span style={{
            fontSize:'0.8rem', fontWeight:900, color:'#b5ff47',
            fontFamily:'monospace', padding:'0 6px',
            background:'rgba(181,255,71,0.12)', borderRadius:4
          }}>{m.home_score} — {m.away_score}</span>
          <span style={{ fontSize:'0.7rem', color:'#fff', fontWeight:600 }}>{m.away}</span>
          {m.status === 'IN_PLAY' && (
            <span style={{ fontSize:'0.58rem', color:'#ff6666', fontWeight:700 }}>{m.minute}'</span>
          )}
        </div>
      ))}

      {/* Refresh + timestamp */}
      <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
        {lastUpdate && (
          <span style={{ fontSize:'0.58rem', color:'#556655' }}>Updated {lastUpdate}</span>
        )}
        <button onClick={refresh} style={{
          background:'transparent', border:'1px solid rgba(181,255,71,0.2)',
          borderRadius:4, color:'rgba(181,255,71,0.5)', fontSize:'0.6rem',
          padding:'2px 8px', cursor:'pointer'
        }}>⟳</button>
      </div>
    </div>
  )
}