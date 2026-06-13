import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

let socket = null

export default function useLiveData() {
  const [matches, setMatches] = useState([])
  const [scorers, setScorers] = useState([])
  const [lastUpdate, setLastUpdate] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Connect to backend socket
    socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    socket.on('connect', () => {
      console.log('[Socket] Connected to Cupify Coach')
      setConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected')
      setConnected(false)
    })

    socket.on('live_update', (data) => {
      console.log('[Socket] Live update received:', data.timestamp)
      setMatches(data.matches || [])
      setScorers(data.scorers || [])
      setLastUpdate(data.timestamp)
    })

    // Also fetch via REST as fallback
    fetch('http://localhost:5000/api/live')
      .then(r => r.json())
      .then(data => {
        setMatches(data.matches || [])
        setScorers(data.scorers || [])
        setLastUpdate(data.timestamp)
      })
      .catch(() => {})

    return () => {
      if (socket) socket.disconnect()
    }
  }, [])

  const refresh = () => {
    if (socket && connected) socket.emit('request_update')
  }

  return { matches, scorers, lastUpdate, connected, refresh }
}