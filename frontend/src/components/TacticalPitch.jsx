import React, { useEffect, useRef, useState, useCallback } from 'react'

const FORMATIONS = {
  '433': {
    name: '4-3-3',
    blue: [
      {x:0,z:5,n:'1',r:'GK'},
      {x:-32,z:22,n:'2',r:'RB'},{x:-11,z:20,n:'5',r:'CB'},{x:11,z:20,n:'6',r:'CB'},{x:32,z:22,n:'3',r:'LB'},
      {x:-18,z:52,n:'8',r:'CM'},{x:0,z:48,n:'6',r:'DM'},{x:18,z:52,n:'10',r:'CM'},
      {x:-30,z:80,n:'7',r:'RW'},{x:0,z:84,n:'9',r:'ST'},{x:30,z:80,n:'11',r:'LW'},
    ],
    arrows:[
      {from:[0,5],to:[0,48]},{from:[-11,20],to:[-30,80]},{from:[11,20],to:[30,80]},
      {from:[-30,80],to:[-48,62]},{from:[30,80],to:[48,62]},{from:[0,84],to:[0,95]},
    ],
    info: '4-3-3: Four defenders, three midfielders, three forwards. Wide forwards (RW/LW) stretch the defence, creating space for the central striker (#9) to run into.',
  },
  '442': {
    name: '4-4-2',
    blue: [
      {x:0,z:5,n:'1',r:'GK'},
      {x:-32,z:22,n:'2',r:'RB'},{x:-11,z:20,n:'5',r:'CB'},{x:11,z:20,n:'6',r:'CB'},{x:32,z:22,n:'3',r:'LB'},
      {x:-32,z:52,n:'7',r:'RM'},{x:-11,z:48,n:'8',r:'CM'},{x:11,z:48,n:'10',r:'CM'},{x:32,z:52,n:'11',r:'LM'},
      {x:-12,z:82,n:'9',r:'ST'},{x:12,z:82,n:'10',r:'ST'},
    ],
    arrows:[
      {from:[-32,22],to:[-32,52]},{from:[32,22],to:[32,52]},
      {from:[-11,48],to:[-12,82]},{from:[11,48],to:[12,82]},
    ],
    info: '4-4-2: Classic balanced formation. Two strikers partner up front. Wide midfielders provide width AND track back defensively. Very solid and flexible shape.',
  },
  '352': {
    name: '3-5-2',
    blue: [
      {x:0,z:5,n:'1',r:'GK'},
      {x:-20,z:20,n:'5',r:'CB'},{x:0,z:18,n:'6',r:'CB'},{x:20,z:20,n:'4',r:'CB'},
      {x:-44,z:50,n:'2',r:'RWB'},{x:-16,z:50,n:'8',r:'CM'},{x:0,z:47,n:'6',r:'DM'},{x:16,z:50,n:'10',r:'CM'},{x:44,z:50,n:'3',r:'LWB'},
      {x:-12,z:82,n:'9',r:'ST'},{x:12,z:82,n:'11',r:'ST'},
    ],
    arrows:[
      {from:[-44,50],to:[-55,72]},{from:[44,50],to:[55,72]},
      {from:[-16,50],to:[-12,82]},{from:[16,50],to:[12,82]},
    ],
    info: '3-5-2: Three central defenders give solidity. Wingbacks (RWB/LWB) must cover the entire flank. Very compact centrally. Italy and Atletico Madrid used this to great effect.',
  },
  '4231': {
    name: '4-2-3-1',
    blue: [
      {x:0,z:5,n:'1',r:'GK'},
      {x:-32,z:20,n:'2',r:'RB'},{x:-11,z:18,n:'5',r:'CB'},{x:11,z:18,n:'6',r:'CB'},{x:32,z:20,n:'3',r:'LB'},
      {x:-14,z:42,n:'6',r:'DM'},{x:14,z:42,n:'8',r:'DM'},
      {x:-28,z:65,n:'7',r:'CAM'},{x:0,z:62,n:'10',r:'CAM'},{x:28,z:65,n:'11',r:'CAM'},
      {x:0,z:88,n:'9',r:'ST'},
    ],
    arrows:[
      {from:[-14,42],to:[-28,65]},{from:[14,42],to:[28,65]},
      {from:[0,62],to:[0,88]},{from:[-28,65],to:[-15,82]},{from:[28,65],to:[15,82]},
    ],
    info: '4-2-3-1: Two defensive mids shield the back four. Three attacking mids support a lone striker. Excellent midfield control — favoured by Real Madrid and Brazil.',
  },
}

const OPP = [
  {x:0,z:95},{x:-32,z:78},{x:-11,z:80},{x:11,z:80},{x:32,z:78},
  {x:-18,z:58},{x:0,z:55},{x:18,z:58},
  {x:-28,z:30},{x:0,z:28},{x:28,z:30},
]

const PHASES = {
  attack:  { dz:12,  col:'#b5ff47', lbl:'Attacking',    info:'Attacking phase — team pushes high. Fullbacks overlap wide. Striker (#9) makes runs in behind the defensive line.' },
  defend:  { dz:-14, col:'#ff8888', lbl:'Defending',    info:'Defensive shape — team drops deep. Two compact lines of four. Deny space between lines. Force play to wide areas.' },
  press:   { dz:20,  col:'#ffcc00', lbl:'High Press',   info:'High Press (Gegenpressing) — whole team presses immediately after losing ball. Win it back within 6 seconds in opponent\'s half!' },
  counter: { dz:-8,  col:'#88ccff', lbl:'Counter',      info:'Counter-attack — sit deep, stay compact, then burst forward quickly through fast players when possession is won.' },
}

export default function TacticalPitch({ detectedFormation = null }) {
  const canvasRef = useRef(null)
  const S = useRef({ formation:'433', phase:'attack', showOff:false, showVar:false, showArrows:false, animT:0, running:true })
  const rafRef = useRef(null)

  const [formation, setFormationState] = useState('433')
  const [phase, setPhaseState] = useState('attack')
  const [showOff, setShowOff] = useState(false)
  const [showVar, setShowVar] = useState(false)
  const [showArrows, setShowArrows] = useState(false)
  const [info, setInfo] = useState(FORMATIONS['433'].info)

  const setFormation = f => { S.current.formation=f; setFormationState(f); setInfo(FORMATIONS[f].info) }
  const setPhase = p => { S.current.phase=p; setPhaseState(p); setInfo(PHASES[p].info) }
  const toggleOff = () => { const v=!S.current.showOff; S.current.showOff=v; setShowOff(v); if(v) setInfo('OFFSIDE LINE: Shows where the second-last defender stands. Any attacker ahead of this line when ball is played is offside — Law 11.') }
  const toggleVar = () => { const v=!S.current.showVar; S.current.showVar=v; setShowVar(v); if(v) setInfo('VAR ZONES: Penalty areas where VAR reviews goals, penalties and red cards. Only clear and obvious errors corrected — ref always makes final call.') }
  const toggleArrows = () => { const v=!S.current.showArrows; S.current.showArrows=v; setShowArrows(v); if(v) setInfo('MOVEMENT ARROWS: Key runs and movements for each player in this formation. Shows where players move when the team attacks.') }

  useEffect(() => {
    if (detectedFormation && FORMATIONS[detectedFormation]) setFormation(detectedFormation)
  }, [detectedFormation])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const W = canvas.width, H = canvas.height
    const ctx = canvas.getContext('2d')
    S.current.running = true

    // Pitch layout constants
    const PAD = 32
    const PW = W - PAD*2
    const PH = H - PAD*2 - 20
    const PX = PAD
    const PY = PAD + 14

    function toScreen(fx, fz) {
      return {
        sx: PX + (fx + 60) / 120 * PW,
        sy: PY + fz / 100 * PH,
      }
    }

    function drawPitch() {
      ctx.fillStyle = '#05160a'; ctx.fillRect(PX, PY, PW, PH)
      for (let i = 0; i < 14; i++) {
        if (i % 2 === 0) {
          ctx.fillStyle = 'rgba(7,26,12,0.9)'
          ctx.fillRect(PX, PY + i*PH/14, PW, PH/14)
        }
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2; ctx.setLineDash([])
      ctx.strokeRect(PX, PY, PW, PH)
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(PX, PY+PH/2); ctx.lineTo(PX+PW, PY+PH/2); ctx.stroke()
      ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 1.2; ctx.setLineDash([])
      ctx.beginPath(); ctx.arc(PX+PW/2, PY+PH/2, PW*0.12, 0, Math.PI*2); ctx.stroke()
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.arc(PX+PW/2, PY+PH/2, 3, 0, Math.PI*2); ctx.fill()
      const bxW=PW*0.44, bxH=PH*0.16, bxX=PX+(PW-bxW)/2
      ctx.strokeStyle = 'rgba(255,255,255,0.38)'; ctx.lineWidth = 1.2
      ctx.strokeRect(bxX, PY, bxW, bxH); ctx.strokeRect(bxX, PY+PH-bxH, bxW, bxH)
      const gbW=PW*0.2, gbH=PH*0.07, gbX=PX+(PW-gbW)/2
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 0.8
      ctx.strokeRect(gbX, PY, gbW, gbH); ctx.strokeRect(gbX, PY+PH-gbH, gbW, gbH)
      ;[12, 88].forEach(fz => {
        const p = toScreen(0, fz)
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(p.sx, p.sy, 2.5, 0, Math.PI*2); ctx.fill()
      })
      const gW=PW*0.14, gD=10, gX=PX+(PW-gW)/2
      ctx.fillStyle='rgba(255,255,255,0.08)'; ctx.strokeStyle='rgba(255,255,255,0.82)'; ctx.lineWidth=2; ctx.setLineDash([])
      ctx.fillRect(gX, PY-gD, gW, gD); ctx.strokeRect(gX, PY-gD, gW, gD)
      ctx.fillRect(gX, PY+PH, gW, gD); ctx.strokeRect(gX, PY+PH, gW, gD)
      ctx.fillStyle='rgba(255,100,100,0.4)'; ctx.font='bold 8px Arial'; ctx.textAlign='center'
      ctx.fillText('OPP GOAL', PX+PW/2, PY-gD-4)
      ctx.fillStyle='rgba(181,255,71,0.4)'
      ctx.fillText('YOUR GOAL', PX+PW/2, PY+PH+gD+12)
      ;[[PX,PY,0.5],[PX+PW,PY,1],[PX,PY+PH,0],[PX+PW,PY+PH,1.5]].forEach(([cx,cy,sa])=>{
        ctx.strokeStyle='rgba(255,255,255,0.22)'; ctx.lineWidth=0.8
        ctx.beginPath(); ctx.arc(cx, cy, 10, sa*Math.PI, (sa+0.5)*Math.PI); ctx.stroke()
      })
    }

    function drawVarZones() {
      const bxW=PW*0.44, bxH=PH*0.16, bxX=PX+(PW-bxW)/2
      ctx.fillStyle='rgba(255,55,55,0.1)'; ctx.strokeStyle='rgba(255,55,55,0.5)'; ctx.lineWidth=1.2; ctx.setLineDash([5,4])
      ctx.fillRect(bxX,PY,bxW,bxH); ctx.strokeRect(bxX,PY,bxW,bxH)
      ctx.fillRect(bxX,PY+PH-bxH,bxW,bxH); ctx.strokeRect(bxX,PY+PH-bxH,bxW,bxH)
      ctx.setLineDash([])
      ctx.fillStyle='rgba(255,160,0,0.8)'; ctx.font='bold 9px Arial'; ctx.textAlign='center'
      ctx.fillText('VAR ZONE', PX+PW/2, PY+bxH/2)
      ctx.fillText('VAR ZONE', PX+PW/2, PY+PH-bxH/2)
    }

    function drawArrow(fx0,fz0,fx1,fz1,col) {
      const a=toScreen(fx0,fz0), b=toScreen(fx1,fz1)
      const ang=Math.atan2(b.sy-a.sy, b.sx-a.sx)
      const len=Math.hypot(b.sx-a.sx, b.sy-a.sy)
      if (len < 10) return
      ctx.strokeStyle=col; ctx.lineWidth=2; ctx.setLineDash([4,3])
      ctx.beginPath(); ctx.moveTo(a.sx,a.sy); ctx.lineTo(b.sx,b.sy); ctx.stroke(); ctx.setLineDash([])
      ctx.fillStyle=col; ctx.beginPath()
      ctx.moveTo(b.sx, b.sy)
      ctx.lineTo(b.sx-11*Math.cos(ang-0.42), b.sy-11*Math.sin(ang-0.42))
      ctx.lineTo(b.sx-11*Math.cos(ang+0.42), b.sy-11*Math.sin(ang+0.42))
      ctx.closePath(); ctx.fill()
    }

    function drawPlayer(fx, fz, col, rim, num, role) {
      const p = toScreen(fx, fz)
      const r = 16
      ctx.fillStyle = 'rgba(0,0,0,0.32)'
      ctx.beginPath(); ctx.ellipse(p.sx+2, p.sy+2, r*0.88, r*0.28, 0, 0, Math.PI*2); ctx.fill()
      ctx.fillStyle = col
      ctx.beginPath(); ctx.arc(p.sx, p.sy, r, 0, Math.PI*2); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.beginPath(); ctx.arc(p.sx-r*0.24, p.sy-r*0.24, r*0.46, 0, Math.PI*2); ctx.fill()
      ctx.strokeStyle = rim; ctx.lineWidth = 1.8
      ctx.beginPath(); ctx.arc(p.sx, p.sy, r, 0, Math.PI*2); ctx.stroke()
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(num, p.sx, p.sy + 0.5)
      if (role) {
        ctx.fillStyle = 'rgba(255,255,255,0.62)'; ctx.font = '9px Arial'
        ctx.fillText(role, p.sx, p.sy + r + 9)
      }
    }

    function drawBall(fx, fz) {
      const p = toScreen(fx, fz)
      const r = 10
      ctx.fillStyle='rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(p.sx+2,p.sy+2,r*0.85,r*0.28,0,0,Math.PI*2); ctx.fill()
      ctx.fillStyle='#f2f2ee'; ctx.strokeStyle='rgba(0,0,0,0.35)'; ctx.lineWidth=0.8
      ctx.beginPath(); ctx.arc(p.sx,p.sy,r,0,Math.PI*2); ctx.fill(); ctx.stroke()
      ctx.fillStyle='#1a1a18'
      ;[[0,-r*0.46],[r*0.42,-r*0.13],[r*0.26,r*0.36],[-r*0.26,r*0.36],[-r*0.42,-r*0.13]].forEach(([px,py])=>{
        ctx.beginPath(); ctx.arc(p.sx+px,p.sy+py,r*0.15,0,Math.PI*2); ctx.fill()
      })
    }

    function frame() {
      if (!S.current.running) return
      const gs = S.current
      gs.animT++
      ctx.clearRect(0,0,W,H)

      // Background
      ctx.fillStyle = '#030a05'; ctx.fillRect(0,0,W,H)

      drawPitch()
      if (gs.showVar) drawVarZones()

      // Offside line
      if (gs.showOff) {
        const f = FORMATIONS[gs.formation]
        const dz = PHASES[gs.phase]?.dz || 0
        const zs = f.blue.filter(p=>p.n!=='1').map(p=>Math.min(95,Math.max(5,p.z+dz))).sort((a,b)=>b-a)
        if (zs.length > 1) {
          const sl = zs[1]
          const lp = toScreen(-60, sl)
          ctx.strokeStyle='rgba(255,55,55,0.92)'; ctx.lineWidth=2; ctx.setLineDash([6,4])
          ctx.beginPath(); ctx.moveTo(PX,lp.sy); ctx.lineTo(PX+PW,lp.sy); ctx.stroke(); ctx.setLineDash([])
          ctx.fillStyle='rgba(255,55,55,0.92)'; ctx.font='bold 10px Arial'; ctx.textAlign='center'
          ctx.fillText('OFFSIDE LINE — Law 11', PX+PW/2, lp.sy-8)
        }
      }

      // Movement arrows
      if (gs.showArrows) {
        const f = FORMATIONS[gs.formation]
        const dz = PHASES[gs.phase]?.dz || 0
        const col = (PHASES[gs.phase]?.col || '#b5ff47') + 'cc'
        ;(f.arrows || []).forEach(a => {
          const z0=Math.min(95,Math.max(5,a.from[1]+(a.from[1]===5?0:dz)))
          const z1=Math.min(95,Math.max(5,a.to[1]+(a.to[1]===5?0:dz)))
          drawArrow(a.from[0], z0, a.to[0], z1, col)
        })
      }

      // Opponents
      OPP.forEach((p,i) => {
        const bob = Math.sin(gs.animT*0.04+i*1.1)*1.6
        drawPlayer(p.x, p.z+bob, 'rgba(185,25,25,0.95)', 'rgba(255,120,120,0.72)', String(i+1), '')
      })

      // Ball
      const bz = gs.phase==='attack'?68:gs.phase==='press'?80:gs.phase==='counter'?22:30
      const bx = Math.sin(gs.animT*0.025)*18
      const bfz = Math.min(95, Math.max(5, bz + Math.sin(gs.animT*0.018)*8))
      drawBall(bx, bfz)

      // Blue team
      const f = FORMATIONS[gs.formation]
      const dz = PHASES[gs.phase]?.dz || 0
      f.blue.forEach((p,i) => {
        const bob = Math.sin(gs.animT*0.038+i*0.85)*1.8
        const z = Math.min(95, Math.max(5, p.z+(i===0?0:dz)+bob))
        drawPlayer(p.x, z, 'rgba(18,72,210,0.95)', 'rgba(150,190,255,0.78)', p.n, p.r)
      })

      // Phase + formation label
      ctx.fillStyle = PHASES[gs.phase]?.col || '#b5ff47'
      ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center'
      ctx.fillText(`${FORMATIONS[gs.formation].name}  ·  ${PHASES[gs.phase]?.lbl}`, W/2, 14)

      // Legend
      const ly = H - 12
      ctx.fillStyle='rgba(18,72,210,0.95)'; ctx.beginPath(); ctx.arc(16,ly,7,0,Math.PI*2); ctx.fill()
      ctx.strokeStyle='rgba(150,190,255,0.75)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(16,ly,7,0,Math.PI*2); ctx.stroke()
      ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='10px Arial'; ctx.textAlign='left'; ctx.textBaseline='middle'
      ctx.fillText('Your team', 28, ly)
      ctx.fillStyle='rgba(185,25,25,0.95)'; ctx.beginPath(); ctx.arc(112,ly,7,0,Math.PI*2); ctx.fill()
      ctx.strokeStyle='rgba(255,120,120,0.72)'; ctx.beginPath(); ctx.arc(112,ly,7,0,Math.PI*2); ctx.stroke()
      ctx.fillText('Opponents', 124, ly)

      rafRef.current = requestAnimationFrame(frame)
    }

    frame()
    return () => { S.current.running = false; if(rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  const btn = (active, label, onClick, col='#b5ff47') => (
    <button key={label} onClick={onClick} style={{
      padding:'5px 12px', borderRadius:999, fontSize:'0.68rem', fontWeight:600,
      cursor:'pointer', fontFamily:'Arial,sans-serif', letterSpacing:'0.03em', transition:'all 0.15s',
      border:`1px solid ${active?col+'88':'rgba(255,255,255,0.12)'}`,
      background:active?col+'22':'rgba(255,255,255,0.04)',
      color:active?col:'rgba(255,255,255,0.5)',
    }}>{label}</button>
  )

  return (
    <div style={{background:'#060f08',borderRadius:12,overflow:'hidden',border:'1px solid rgba(181,255,71,0.15)',marginTop:14,marginBottom:4}}>
      <div style={{padding:'9px 14px',borderBottom:'1px solid rgba(255,255,255,0.05)',display:'flex',alignItems:'center',gap:8}}>
        <span style={{fontSize:'0.72rem',fontWeight:700,color:'#b5ff47',letterSpacing:'0.06em'}}>⚽ TACTICAL PITCH — TOP VIEW</span>
        <span style={{fontSize:'0.6rem',color:'rgba(255,255,255,0.22)'}}>Click formation + phase to explore</span>
      </div>
      <canvas ref={canvasRef} width={680} height={520} style={{display:'block',width:'100%'}}/>
      <div style={{padding:'10px 14px',borderTop:'1px solid rgba(255,255,255,0.05)',display:'flex',gap:5,flexWrap:'wrap',alignItems:'center'}}>
        <span style={{fontSize:'0.58rem',color:'rgba(255,255,255,0.22)',letterSpacing:'0.08em',marginRight:2}}>FORMATION</span>
        {Object.entries(FORMATIONS).map(([k,v])=>btn(formation===k,v.name,()=>setFormation(k)))}
        <div style={{width:1,height:18,background:'rgba(255,255,255,0.08)',margin:'0 3px'}}/>
        <span style={{fontSize:'0.58rem',color:'rgba(255,255,255,0.22)',letterSpacing:'0.08em',marginRight:2}}>PHASE</span>
        {Object.entries(PHASES).map(([k,v])=>btn(phase===k,v.lbl,()=>setPhase(k),v.col))}
        <div style={{width:1,height:18,background:'rgba(255,255,255,0.08)',margin:'0 3px'}}/>
        {btn(showOff,'⚑ Offside',toggleOff,'#ff8888')}
        {btn(showVar,'📹 VAR',toggleVar,'#ffcc00')}
        {btn(showArrows,'→ Arrows',toggleArrows,'#b5ff47')}
      </div>
      <div style={{padding:'8px 14px',background:'rgba(0,0,0,0.3)',borderTop:'1px solid rgba(255,255,255,0.04)',fontSize:'0.68rem',color:'#7aaa7a',minHeight:34,lineHeight:1.6}}>
        {info}
      </div>
    </div>
  )
}