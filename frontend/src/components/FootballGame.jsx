import React, { useEffect, useRef, useState } from 'react'

export default function FootballGame({ onClose }) {
  const canvasRef = useRef(null)
  const S = useRef({})
  const raf = useRef(null)
  const pausedRef = useRef(true)   // ← PAUSED until user clicks Kick Off
  const [scores, setScores] = useState({ y: 0, c: 0 })
  const [time, setTime] = useState('00:00')
  const [poss, setPoss] = useState({ y: 50, c: 50 })
  const [half, setHalf] = useState(1)
  const [stamina, setStamina] = useState(100)
  const [events, setEvents] = useState([])
  const [goalFlash, setGoalFlash] = useState(null)
  const [rulePopup, setRulePopup] = useState(null)
  const [infoData, setInfoData] = useState({ icon:'⚽', text:'Click KICK OFF below to start! Use Arrow Keys or WASD to move. Press SPACE to shoot.', law:'FIFA Laws of the Game' })
  const [showHow, setShowHow] = useState(true)
  const [countdown, setCountdown] = useState(null)

  const addEv = txt => setEvents(p => [{ id: Date.now()+Math.random(), txt }, ...p.slice(0,7)])
  const setInfo = (icon,text,law) => setInfoData({icon,text,law})
  const showRule = (icon,title,body,law,col='#b5ff47') => {
    setRulePopup({icon,title,body,law,col})
    setTimeout(()=>setRulePopup(null), 5000)
  }

  // Unpause and start game with 3-2-1 countdown
  function kickOff() {
    setShowHow(false)
    pausedRef.current = true  // keep paused during countdown
    setCountdown(3)
    setTimeout(() => setCountdown(2), 1000)
    setTimeout(() => setCountdown(1), 2000)
    setTimeout(() => {
      setCountdown(null)
      pausedRef.current = false   // only NOW does game start
      setInfo('⚽', 'GO! Move BLUE #10 into the ball. Dribble RIGHT and SPACE to SHOOT!', 'Law 8 — Kickoff')
    }, 3000)
  }

  useEffect(()=>{
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = window.innerWidth
    const H = window.innerHeight
    canvas.width = W
    canvas.height = H

    const HUD = 50, INFO = 52
    const PY = HUD
    const PH = H - HUD - INFO
    const PL = W*0.05, PR = W*0.95
    const PT = PY + PH*0.05
    const PB = PY + PH*0.95
    const PCX = W*0.5
    const PCY = PY + PH*0.5
    const GH = PH*0.26
    const GW = W*0.026
    const GY1 = PCY - GH/2
    const GY2 = PCY + GH/2

    canvas.setAttribute('tabindex','0')
    canvas.focus()

    const G = S.current
    G.keys = {}
    G.sprint = false
    G.yPoss = 50; G.cPoss = 50
    G.stamina = 100
    G.secs = 0; G.half = 1
    G.goalLock = false
    G.parts = []
    G.cheerParts = []
    G.trail = []
    G.lastOut = ''
    G.offsideTimer = 0
    G.halfDone = false
    G.running = true
    G.sc = { y:0, c:0 }
    G.whistleFlash = 0

    let pl = { x:PCX-80, y:PCY, vx:0, vy:0, r:13, has:false, yc:0, rc:false, num:'10', col:'#1a55ee', col2:'#0d3dbb', tired:false, kickCD:0 }
    let cpu = { x:PCX+80, y:PCY, vx:0, vy:0, r:13, has:false, num:'9', col:'#dd1111', col2:'#aa0000', speed:1.8, shootCD:0 }
    let ref_ = { x:PCX, y:PCY-PH*0.22, vx:0, vy:0, card:null, cardTimer:0, whistle:false, whistleTimer:0 }

    let team = [
      {x:W*0.22,y:PCY-PH*0.22,r:11,num:'7', col:'#1a55ee',vx:0,vy:0,speed:1.4,role:'winger'},
      {x:W*0.22,y:PCY+PH*0.22,r:11,num:'11',col:'#1a55ee',vx:0,vy:0,speed:1.4,role:'winger'},
      {x:W*0.13,y:PCY-PH*0.12,r:11,num:'4', col:'#1a55ee',vx:0,vy:0,speed:1.2,role:'defender'},
      {x:W*0.13,y:PCY+PH*0.12,r:11,num:'5', col:'#1a55ee',vx:0,vy:0,speed:1.2,role:'defender'},
      {x:W*0.07,y:PCY,         r:11,num:'1', col:'#ff8800',vx:0,vy:0,speed:0.8,role:'gk'},
    ]
    let opp = [
      {x:W*0.78,y:PCY-PH*0.22,r:11,num:'6',col:'#dd1111',vx:0,vy:0,speed:1.4,role:'defender',yc:0,rc:false},
      {x:W*0.78,y:PCY+PH*0.22,r:11,num:'8',col:'#dd1111',vx:0,vy:0,speed:1.4,role:'defender',yc:0,rc:false},
      {x:W*0.92,y:PCY,         r:11,num:'1',col:'#ff6600',vx:0,vy:0,speed:0.6,role:'gk',      yc:0,rc:false},
    ]
    let ball = { x:PCX, y:PCY, vx:0, vy:0, r:9, own:null, spin:0 }

    function burst(x,y,col,n=18){
      for(let i=0;i<n;i++){
        const a=Math.random()*Math.PI*2, sp=2+Math.random()*8
        G.parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-2,r:1.5+Math.random()*4,col,life:1,decay:0.022+Math.random()*0.015})
      }
    }
    function cheerBurst(x,y){
      const cols=['#b5ff47','#ffcc00','#ff4488','#44aaff','#ff8800','#ffffff','#ff44ff']
      for(let i=0;i<35;i++){
        const a=Math.random()*Math.PI*2, sp=3+Math.random()*12
        G.cheerParts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-6,r:2+Math.random()*5,col:cols[Math.floor(Math.random()*cols.length)],life:1,decay:0.01+Math.random()*0.008,type:Math.random()<0.5?'circle':'rect',w:4+Math.random()*10,h:3+Math.random()*6,rot:Math.random()*Math.PI*2,rv:(Math.random()-0.5)*0.3})
      }
    }
    function whistleBlast(){ G.whistleFlash=1; ref_.whistle=true; ref_.whistleTimer=70 }

    function drawBg(){
      const sg=ctx.createLinearGradient(0,0,0,PY)
      sg.addColorStop(0,'#000308'); sg.addColorStop(1,'#021210')
      ctx.fillStyle=sg; ctx.fillRect(0,0,W,PY)
      for(let i=0;i<60;i++){
        const sx=((i*137+17)%100)/100*W, sy=((i*89+7)%100)/100*PY*0.85
        const sa=0.1+Math.sin(G.secs*0.8+i)*0.1
        ctx.fillStyle=`rgba(255,255,255,${sa})`
        ctx.beginPath(); ctx.arc(sx,sy,0.8,0,Math.PI*2); ctx.fill()
      }
      ctx.fillStyle='rgba(15,25,15,0.95)'; ctx.fillRect(0,PY-35,W,38)
      const crowdCols=['#cc2222','#ffffff','#2255cc','#ffcc00','#22aa22','#ff6600','#cc22cc','#44bbff']
      for(let row=0;row<5;row++){
        const y=PY-33+row*8, n=Math.floor(W/11)
        for(let c=0;c<n;c++){
          const bob=Math.sin(c*1.4+G.secs*(row%2===0?3.5:2.8)+row)*2.8
          ctx.globalAlpha=0.72
          ctx.fillStyle=crowdCols[(c*3+row*7+Math.floor(G.secs*0.5))%crowdCols.length]
          ctx.beginPath(); ctx.arc(c*11+5+(row%2)*5,y+bob,4.2,0,Math.PI*2); ctx.fill()
        }
      }
      ctx.globalAlpha=1
      const sf=ctx.createLinearGradient(0,PY-35,0,PY+12)
      sf.addColorStop(0,'rgba(0,0,0,0)'); sf.addColorStop(1,'rgba(0,0,0,0.55)')
      ctx.fillStyle=sf; ctx.fillRect(0,PY-35,W,47)
      ;[0.05,0.3,0.7,0.95].forEach((fx,i)=>{
        const p=0.5+0.5*Math.sin(G.secs*0.4+i)
        const g=ctx.createLinearGradient(fx*W,0,fx*W,PY)
        g.addColorStop(0,`rgba(255,252,220,${p*0.32})`); g.addColorStop(1,'rgba(0,0,0,0)')
        ctx.fillStyle=g
        ctx.beginPath(); ctx.moveTo(fx*W,0); ctx.lineTo(fx*W-115,PY); ctx.lineTo(fx*W+115,PY); ctx.closePath(); ctx.fill()
        ctx.fillStyle=`rgba(255,252,210,${p*0.95})`
        ctx.beginPath(); ctx.arc(fx*W,5,5.5,0,Math.PI*2); ctx.fill()
      })
      for(let i=0;i<22;i++){
        ctx.fillStyle=i%2===0?'rgba(8,82,16,0.95)':'rgba(5,60,10,0.95)'
        ctx.fillRect(PL+i*(PR-PL)/22,PT,(PR-PL)/22,PB-PT)
      }
      const vg=ctx.createRadialGradient(PCX,PCY,0,PCX,PCY,W*0.65)
      vg.addColorStop(0.3,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,0.72)')
      ctx.fillStyle=vg; ctx.fillRect(0,PY,W,PH)
    }

    function drawLines(){
      function ln(x0,y0,x1,y1,a=0.32,lw=1.5){ ctx.strokeStyle=`rgba(255,255,255,${a})`; ctx.lineWidth=lw; ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke() }
      ln(PL,PT,PR,PT); ln(PL,PB,PR,PB); ln(PL,PT,PL,PB); ln(PR,PT,PR,PB)
      ln(PCX,PT,PCX,PB,0.2,1.2)
      ctx.strokeStyle='rgba(255,255,255,0.18)'; ctx.lineWidth=1.2; ctx.setLineDash([3,4])
      ctx.beginPath(); ctx.ellipse(PCX,PCY,(PR-PL)*0.11,PH*0.1,0,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([])
      ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.arc(PCX,PCY,3,0,Math.PI*2); ctx.fill()
      const bw=(PR-PL)*0.17,bh=PH*0.46,bby=PCY-bh/2
      ln(PL,bby,PL+bw,bby,0.25); ln(PL+bw,bby,PL+bw,bby+bh,0.25); ln(PL,bby+bh,PL+bw,bby+bh,0.25)
      ln(PR,bby,PR-bw,bby,0.25); ln(PR-bw,bby,PR-bw,bby+bh,0.25); ln(PR,bby+bh,PR-bw,bby+bh,0.25)
      ctx.fillStyle='rgba(255,255,255,0.05)'; ctx.fillRect(PL-GW,GY1,GW,GH); ctx.fillRect(PR,GY1,GW,GH)
      ctx.strokeStyle='rgba(255,255,255,0.88)'; ctx.lineWidth=2.5; ctx.setLineDash([])
      ctx.strokeRect(PL-GW,GY1,GW,GH); ctx.strokeRect(PR,GY1,GW,GH)
      ctx.fillStyle='rgba(181,255,71,0.35)'; ctx.font='bold 8px Arial'; ctx.textAlign='center'
      ctx.fillText('YOUR GOAL',PL-GW/2,GY1-7); ctx.fillText('CPU GOAL',PR+GW/2,GY1-7)
    }

    function drawRef(){
      ctx.save(); ctx.translate(ref_.x,ref_.y)
      ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.save(); ctx.scale(1,0.2)
      ctx.beginPath(); ctx.ellipse(0,16,10,5,0,0,Math.PI*2); ctx.fill(); ctx.restore()
      ctx.fillStyle='#111111'; ctx.beginPath(); ctx.arc(0,0,10,0,Math.PI*2); ctx.fill()
      ctx.fillStyle='#fff'; ctx.font='bold 7px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle'
      ctx.fillText('REF',0,0.5)
      if(ref_.whistle){ ref_.whistleTimer--; if(ref_.whistleTimer<=0) ref_.whistle=false; const a=ref_.whistleTimer/70; ctx.font='16px Arial'; ctx.fillStyle=`rgba(255,220,0,${a})`; ctx.fillText('📣',-20,-22); ctx.font='bold 10px Arial'; ctx.fillStyle=`rgba(255,220,0,${a})`; ctx.fillText('FWEET!',0,-32) }
      if(ref_.card){ ref_.cardTimer--; if(ref_.cardTimer<=0) ref_.card=null; else{ ctx.fillStyle=ref_.card==='red'?'#ff2222':'#ffcc00'; ctx.fillRect(12,-32,14,20) } }
      ctx.restore()
    }

    function drawPlayer(p,isMain=false){
      ctx.save(); ctx.translate(p.x,p.y)
      if(p.rc) ctx.globalAlpha=0.35
      ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.save(); ctx.scale(1,0.2)
      ctx.beginPath(); ctx.ellipse(0,p.r+4,p.r,p.r*0.5,0,0,Math.PI*2); ctx.fill(); ctx.restore()
      if(isMain){
        ctx.strokeStyle='rgba(181,255,71,0.88)'; ctx.lineWidth=2.5; ctx.beginPath(); ctx.arc(0,0,p.r+5,0,Math.PI*2); ctx.stroke()
      }
      const bg=ctx.createRadialGradient(-p.r*0.3,-p.r*0.3,1,0,0,p.r)
      bg.addColorStop(0,p.col2||p.col); bg.addColorStop(1,p.col)
      ctx.fillStyle=bg; ctx.beginPath(); ctx.arc(0,0,p.r,0,Math.PI*2); ctx.fill()
      ctx.fillStyle='#fff'; ctx.font=`bold ${Math.round(p.r*0.88)}px Arial`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(p.num,0,0.5)
      if(p.has){ ctx.fillStyle='#b5ff47'; ctx.beginPath(); ctx.arc(0,p.r+10,4,0,Math.PI*2); ctx.fill() }
      if(p.rc||p.yc>=2){ ctx.fillStyle='#ff2222'; ctx.fillRect(p.r,-p.r-15,9,12) }
      else if(p.yc===1){ ctx.fillStyle='#ffcc00'; ctx.fillRect(p.r,-p.r-15,9,12) }
      ctx.restore()
    }

    function drawBall(){
      const dp=Math.hypot(ball.x-pl.x,ball.y-pl.y)
      if(dp<60&&!pl.has&&!cpu.has){
        ctx.save(); ctx.globalAlpha=0.3-(dp/60)*0.3; ctx.fillStyle='#b5ff47'
        ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r+14,0,Math.PI*2); ctx.fill(); ctx.restore()
      }
      for(let i=1;i<G.trail.length;i++){
        const a=(i/G.trail.length)*0.3
        ctx.save(); ctx.globalAlpha=a; ctx.fillStyle='rgba(255,255,255,0.3)'
        ctx.beginPath(); ctx.arc(G.trail[i].x,G.trail[i].y,ball.r*(i/G.trail.length)*0.65,0,Math.PI*2); ctx.fill(); ctx.restore()
      }
      ctx.save(); ctx.translate(ball.x,ball.y); ctx.rotate(ball.spin)
      const bg=ctx.createRadialGradient(-ball.r*0.32,-ball.r*0.32,0.5,0,0,ball.r)
      bg.addColorStop(0,'#f5f5f3'); bg.addColorStop(0.45,'#e0e0dc'); bg.addColorStop(1,'#888880')
      ctx.fillStyle=bg; ctx.beginPath(); ctx.arc(0,0,ball.r,0,Math.PI*2); ctx.fill()
      ctx.fillStyle='#181818'
      ;[[0,-ball.r*0.5],[ball.r*0.47,-ball.r*0.15],[ball.r*0.29,ball.r*0.4],[-ball.r*0.29,ball.r*0.4],[-ball.r*0.47,-ball.r*0.15]].forEach(([px,py])=>{
        ctx.beginPath(); ctx.arc(px,py,ball.r*0.18,0,Math.PI*2); ctx.fill()
      })
      ctx.restore()
    }

    function drawParts(){
      G.parts=G.parts.filter(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=0.12; p.vx*=0.96; p.life-=p.decay; if(p.life<=0) return false; ctx.save(); ctx.globalAlpha=p.life; ctx.fillStyle=p.col; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); ctx.restore(); return true })
      G.cheerParts=G.cheerParts.filter(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=0.2; p.vx*=0.97; p.life-=p.decay; p.rot+=p.rv; if(p.life<=0) return false; ctx.save(); ctx.globalAlpha=p.life*0.85; ctx.fillStyle=p.col; ctx.translate(p.x,p.y); ctx.rotate(p.rot); if(p.type==='rect') ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); else{ ctx.beginPath(); ctx.arc(0,0,p.r,0,Math.PI*2); ctx.fill() } ctx.restore(); return true })
    }

    function drawMinimap(){
      const mx=10,my=PY+6,mw=78,mh=50
      ctx.fillStyle='rgba(0,0,0,0.82)'; ctx.fillRect(mx,my,mw,mh)
      ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1; ctx.strokeRect(mx,my,mw,mh)
      const tx=v=>(v-PL)/(PR-PL)*mw+mx, ty=v=>(v-PT)/(PB-PT)*mh+my
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(tx(ball.x),ty(ball.y),2.5,0,Math.PI*2); ctx.fill()
      ctx.fillStyle='#4488ff'; ctx.beginPath(); ctx.arc(tx(pl.x),ty(pl.y),3.5,0,Math.PI*2); ctx.fill()
      ctx.fillStyle='#ff4444'; ctx.beginPath(); ctx.arc(tx(cpu.x),ty(cpu.y),3.5,0,Math.PI*2); ctx.fill()
      team.forEach(t=>{ ctx.fillStyle='rgba(80,140,255,0.6)'; ctx.beginPath(); ctx.arc(tx(t.x),ty(t.y),2,0,Math.PI*2); ctx.fill() })
      opp.forEach(o=>{ ctx.fillStyle='rgba(255,80,80,0.6)'; ctx.beginPath(); ctx.arc(tx(o.x),ty(o.y),2,0,Math.PI*2); ctx.fill() })
    }

    function drawStamina(){
      const bx=W-110,by=PY+8,bw=92,bh=7
      ctx.fillStyle='rgba(0,0,0,0.65)'; ctx.fillRect(bx,by,bw,bh)
      const col=G.stamina>60?'#b5ff47':G.stamina>30?'#ffcc00':'#ff4444'
      ctx.fillStyle=col; ctx.fillRect(bx,by,bw*G.stamina/100,bh)
      ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='7px Arial'; ctx.textAlign='left'; ctx.fillText('STAMINA',bx,by-2)
    }

    function drawWhistleFlash(){ if(G.whistleFlash>0){ G.whistleFlash=Math.max(0,G.whistleFlash-0.06); ctx.fillStyle=`rgba(255,255,180,${G.whistleFlash*0.18})`; ctx.fillRect(0,0,W,H) } }

    // ── PAUSED view — nice frozen frame with "WAITING" text ──
    function drawPausedOverlay(){
      // Pulsing "get ready" text
      const pulse=0.5+0.5*Math.sin(Date.now()*0.004)
      ctx.save(); ctx.globalAlpha=pulse*0.55
      ctx.fillStyle='#b5ff47'; ctx.font='bold 16px Arial'; ctx.textAlign='center'
      ctx.fillText('⚽ Click KICK OFF to start!', W/2, PCY)
      ctx.restore()
    }

    function updatePlayer(){
      pl.kickCD=Math.max(0,pl.kickCD-1)
      const spd=G.sprint&&G.stamina>5?(pl.tired?4.2:6.0):(pl.tired?2.0:3.2)
      let dx=0,dy=0
      if(G.keys['ArrowUp']   ||G.keys['w']||G.keys['W']) dy=-1
      if(G.keys['ArrowDown'] ||G.keys['s']||G.keys['S']) dy=1
      if(G.keys['ArrowLeft'] ||G.keys['a']||G.keys['A']) dx=-1
      if(G.keys['ArrowRight']||G.keys['d']||G.keys['D']) dx=1
      if(dx||dy){
        const m=Math.sqrt(dx*dx+dy*dy); pl.vx=dx/m*spd; pl.vy=dy/m*spd
        if(G.sprint&&G.stamina>5){ G.stamina=Math.max(0,G.stamina-0.4); pl.tired=G.stamina<20 }
        else G.stamina=Math.min(100,G.stamina+0.15)
      } else { pl.vx*=0.72; pl.vy*=0.72; G.stamina=Math.min(100,G.stamina+0.22); pl.tired=G.stamina<25 }
      pl.x=Math.max(PL-GW,Math.min(PR+GW,pl.x+pl.vx))
      pl.y=Math.max(PT,Math.min(PB,pl.y+pl.vy))
      if(pl.has){ ball.x=pl.x+(pl.vx||0.5)*2.2; ball.y=pl.y+(pl.vy||0)*2.2; ball.spin+=0.22 }
      if(dx||dy){ G.yPoss=Math.min(72,G.yPoss+0.015); G.cPoss=100-G.yPoss }
      const rdx=(ball.x-ref_.x)*0.018, rdy=(ball.y-PH*0.28-ref_.y)*0.018
      ref_.x=Math.max(PL+20,Math.min(PR-20,ref_.x+rdx))
      ref_.y=Math.max(PT+20,Math.min(PB-20,ref_.y+rdy))
      team.forEach((t,i)=>{
        if(t.role==='gk'){ t.x+=(PL+GW*1.5-t.x)*0.04; t.y+=(PCY+(ball.y-PCY)*0.4-t.y)*0.04; return }
        const ttx=pl.has?pl.x-W*0.1+(i%2===0?-W*0.04:W*0.04):ball.x-W*0.06
        const tty=ball.y+(i<2?-PH*0.18:PH*0.18)
        const tdx=ttx-t.x,tdy=tty-t.y,td=Math.hypot(tdx,tdy)
        if(td>5){t.vx=tdx/td*t.speed;t.vy=tdy/td*t.speed;t.x+=t.vx;t.y+=t.vy}
        t.x=Math.max(PL,Math.min(PR,t.x)); t.y=Math.max(PT,Math.min(PB,t.y))
      })
    }

    function updateCPU(){
      cpu.shootCD=Math.max(0,cpu.shootCD-1)
      let tx=ball.x,ty=ball.y
      if(cpu.has){
        tx=PL+GW/2; ty=PCY+Math.sin(G.secs*0.5)*GH*0.3
        const dg=Math.hypot(cpu.x-PL,cpu.y-PCY)
        if(dg<(PR-PL)*0.36&&cpu.shootCD===0){
          const ang=Math.atan2(PCY-ball.y,PL-ball.x)+(Math.random()-0.5)*0.45
          ball.vx=Math.cos(ang)*(7+Math.random()*3); ball.vy=Math.sin(ang)*(7+Math.random()*3)
          cpu.has=false; ball.own=null; ball.spin=10; cpu.shootCD=200
          burst(ball.x,ball.y,'#ff6666',12)
          showRule('💥','CPU Shoots!','The CPU aimed for the corner of your goal! To save: position yourself BETWEEN the ball and goal. Block the angle — reduce their target area!','Law 10 — Goalkeeping','#ff8888')
          setInfo('💥','CPU shoots! Get between ball and goal. Block the angle!','Law 10 — Goalkeeping')
          addEv('💥 CPU shot on goal')
        }
      }
      const dx=tx-cpu.x,dy=ty-cpu.y,d=Math.hypot(dx,dy)
      const cpuSpd=cpu.has?1.9:1.7
      if(d>4){ cpu.vx=dx/d*cpuSpd; cpu.vy=dy/d*cpuSpd } else { cpu.vx*=0.7; cpu.vy*=0.7 }
      cpu.x=Math.max(PL,Math.min(PR,cpu.x+cpu.vx))
      cpu.y=Math.max(PT,Math.min(PB,cpu.y+cpu.vy))
      if(cpu.has){ ball.x=cpu.x+cpu.vx*2.2; ball.y=cpu.y+cpu.vy*2.2; ball.spin-=0.15 }
      opp.forEach((o,i)=>{
        if(o.rc) return
        if(o.role==='gk'){ o.x+=(PR-GW*1.8-o.x)*0.045; o.y+=(PCY+(ball.y-PCY)*0.42-o.y)*0.045; return }
        const odx=ball.x-o.x,ody=ball.y-o.y,od=Math.hypot(odx,ody)
        if(od>5){ o.vx=odx/od*o.speed; o.vy=ody/od*o.speed; o.x+=o.vx; o.y+=o.vy }
        o.x=Math.max(PL,Math.min(PR,o.x)); o.y=Math.max(PT,Math.min(PB,o.y))
        const db=Math.hypot(ball.x-o.x,ball.y-o.y)
        if(db<20&&pl.has&&!G.goalLock){
          const foul=Math.random()<0.25
          pl.has=false; ball.own=null; ball.vx=(Math.random()-0.5)*5; ball.vy=(Math.random()-0.5)*4
          burst(ball.x,ball.y,'#ffaa00',12); whistleBlast()
          if(foul){
            o.yc++; ref_.card=o.yc>=2?'red':'yellow'; ref_.cardTimer=100
            const inBox=pl.x>PR-(PR-PL)*0.17&&pl.y>GY1-PH*0.1&&pl.y<GY2+PH*0.1
            if(inBox){
              showRule('🟡','PENALTY KICK!','Fouled INSIDE the penalty area — automatic penalty! Taken from the spot, 12 yards out. Only you and the keeper. Keeper MUST stay on line. Aim CORNERS!','Law 14 — Penalty Kick','#ffcc00')
              setInfo('🟡','PENALTY! Aim for the corners — keeper must stay on the line!','Law 14 — Penalty Kick')
              addEv('🟡 Penalty awarded!'); ball.vx=2; ball.vy=0
            } else {
              showRule('🟨','FOUL! Free Kick','Illegal challenge — direct FREE KICK awarded. You can shoot straight at goal!','Law 12 — Fouls & Misconduct','#ffcc00')
              setInfo('🟨','FOUL! Direct free kick — shoot straight at goal!','Law 12 — Free Kick')
              addEv('🟨 Foul — free kick'); ball.vx=2; ball.vy=(Math.random()-0.5)*1.5
            }
            if(o.yc>=2){
              o.rc=true; ref_.card='red'; ref_.cardTimer=130
              showRule('🟥',`RED CARD! #${o.num} Off!`,'Two yellows = red. CPU plays with 10 men — exploit the space!','Law 12 — Dismissal','#ff4444')
              setInfo('🟥',`#${o.num} sent off! CPU down to 10 — use the space!`,'Law 12 — Red Card')
              addEv(`🟥 #${o.num} RED CARD!`)
            } else if(o.yc===1){
              showRule('🟨',`Yellow Card #${o.num}`,'One more yellow = red. Referee watching this player closely!','Law 12 — Caution','#ffcc00')
              addEv(`🟨 #${o.num} booked`)
            }
          } else {
            showRule('⚡','Clean Tackle!','Ball played first — no foul! Legal challenge. Play continues.','Law 12 — Fair Challenge','#88ccff')
            setInfo('⚡','Clean tackle! Ball played first = legal. Play on!','Law 12 — Fair Play')
          }
        }
      })
      const dbc=Math.hypot(ball.x-cpu.x,ball.y-cpu.y), ballSpeed=Math.hypot(ball.vx,ball.vy)
      if(dbc<22&&!pl.has&&!cpu.has&&ball.own!=='y'&&ballSpeed<3.5){
        cpu.has=true; ball.own='c'
        showRule('🔴','CPU Wins Ball','Counter-press NOW — sprint into them within 6 seconds!','Law 9 — Possession','#ff8888')
        setInfo('🔴','CPU has ball! Sprint and press SPACE to counter-press!','Law 9 — Possession')
        addEv('🔴 CPU wins ball')
      }
    }

    function updateBall(){
      if(pl.has||cpu.has) return
      ball.x+=ball.vx; ball.y+=ball.vy; ball.vx*=0.975; ball.vy*=0.975; ball.spin+=ball.vx*0.04
      G.trail.push({x:ball.x,y:ball.y}); if(G.trail.length>16) G.trail.shift()
      if(ball.y-ball.r<PT){ ball.y=PT+ball.r; ball.vy*=-0.72; if(G.lastOut!=='top'){ G.lastOut='top'; whistleBlast(); showRule('🎯','Throw-In!','Ball over the touchline (side)! Both feet on ground, both hands equally over head. Cannot score directly!','Law 15 — Throw-In','#88ccff'); setInfo('🎯','THROW-IN: Both feet on ground, both hands over head. Cannot score directly!','Law 15 — Throw-In'); burst(ball.x,ball.y,'rgba(255,255,255,0.4)',6); addEv('🎯 Throw-in — top line') } }
      if(ball.y+ball.r>PB){ ball.y=PB-ball.r; ball.vy*=-0.72; if(G.lastOut!=='bot'){ G.lastOut='bot'; whistleBlast(); showRule('🎯','Throw-In!','Ball over the bottom touchline — throw-in!','Law 15 — Throw-In','#88ccff'); setInfo('🎯','THROW-IN bottom line!','Law 15 — Throw-In'); burst(ball.x,ball.y,'rgba(255,255,255,0.4)',6); addEv('🎯 Throw-in — bottom') } }
      if(ball.x-ball.r<PL-GW+2){ if(ball.y>GY1+2&&ball.y<GY2-2){ cpuScores(); return } ball.x=PL+6; ball.vx=Math.abs(ball.vx)*0.6; if(G.lastOut!=='leftout'){ G.lastOut='leftout'; whistleBlast(); showRule('🚩','Corner or Goal Kick?','Defender last touched → CORNER (attacking team kicks from corner arc). Attacker last touched → GOAL KICK (defender restarts from 6-yard box).','Law 16/17 — Set Pieces','#b5ff47'); setInfo('🚩','Goal line! Corner (defender) or Goal kick (attacker)?','Law 16/17'); burst(PL,ball.y,'#b5ff47',10); addEv('🚩 Corner / Goal kick') } }
      if(ball.x+ball.r>PR+GW-2){ if(ball.y>GY1+2&&ball.y<GY2-2){ youScore(); return } ball.x=PR-6; ball.vx=-Math.abs(ball.vx)*0.6; if(G.lastOut!=='rightout'){ G.lastOut='rightout'; whistleBlast(); showRule('🥅','Goal Kick to CPU!','You put it over their goal line — CPU goal kick from 6-yard box!','Law 16 — Goal Kick','#88ccff'); setInfo('🥅','GOAL KICK: CPU restarts from 6-yard box.','Law 16'); burst(PR,ball.y,'rgba(100,180,255,0.5)',10); addEv('🥅 Goal kick to CPU') } }
      const dp=Math.hypot(ball.x-pl.x,ball.y-pl.y)
      if(dp<pl.r+ball.r+4&&ball.own!=='c'){ pl.has=true; ball.own='y'; G.lastOut=''; setInfo('🔵','YOU HAVE IT! Dribble RIGHT toward CPU goal. SPACE to shoot!','Law 9 — Possession') }
    }

    function youScore(){
      if(G.goalLock) return; G.goalLock=true; G.sc.y++; setScores({...G.sc})
      setGoalFlash({type:'you',text:'GOAL! ⚽',sub:'Law 10 — Whole ball crossed the goal line!'})
      burst(PR+GW/2,PCY,'#b5ff47',80); for(let i=0;i<6;i++) cheerBurst(Math.random()*W,PY+Math.random()*PH*0.6); whistleBlast()
      showRule('🏆','GOAL! ⚽','The whole ball crossed the goal line between the posts and under the crossbar! VAR checks for offside/handball in the build-up before confirming!','Law 10 — Scoring','#b5ff47')
      setInfo('🏆','GOAL! Whole ball must cross the line. VAR checks offside/handball in build-up!','Law 10 — Scoring'); addEv('⚽ ⚽ YOU SCORED!! ⚽ ⚽')
      setTimeout(()=>{ setGoalFlash(null); resetBall('cpu'); G.goalLock=false },2800)
    }

    function cpuScores(){
      if(G.goalLock) return; G.goalLock=true; G.sc.c++; setScores({...G.sc})
      setGoalFlash({type:'cpu',text:'CPU GOAL 😤',sub:'Stay compact! Mark runners! Block shooting angles!'})
      burst(PL-GW/2,PCY,'#ff4444',80); whistleBlast()
      showRule('😤','Goal Conceded!','Stay compact — narrow and deep as a unit. Mark runners entering the box. Block shooting angles!','Law 10 — Defence','#ff6666')
      setInfo('😤','Conceded! Stay compact, mark runners. Defend as a team!','Law 10 — Defence'); addEv('😤 CPU scored...')
      setTimeout(()=>{ setGoalFlash(null); resetBall('you'); G.goalLock=false },2800)
    }

    function resetBall(who){
      ball.x=PCX; ball.y=PCY; ball.vx=0; ball.vy=0; ball.own=null; G.trail=[]
      pl.has=false; cpu.has=false; G.lastOut=''
      if(who==='you'){ pl.x=PCX-40; pl.y=PCY } else { cpu.x=PCX+40; cpu.y=PCY }
      pausedRef.current=false  // always running after first kickoff
    }

    G.kick=()=>{
      if(pl.kickCD>0) return
      if(pl.has){
        const inBox=pl.x>PR-(PR-PL)*0.17&&pl.y>PCY-PH*0.23&&pl.y<PCY+PH*0.23
        const ang=Math.atan2(PCY-pl.y,PR-pl.x)+(Math.random()-0.5)*0.2
        const pow=G.stamina>50?11+Math.random()*4:8+Math.random()*3
        ball.vx=Math.cos(ang)*pow; ball.vy=Math.sin(ang)*pow
        pl.has=false; ball.own=null; ball.spin=ball.vx*0.3; pl.kickCD=8
        burst(ball.x,ball.y,'rgba(181,255,71,0.5)',10)
        showRule('💥',inBox?'Shooting!':'Long Shot!',inBox?'In the box — aim TOP CORNERS! Only 15cm of space for the keeper!':'Long shot — aim low to corners. Power + placement beats keepers!','Law 10 — Shooting','#b5ff47')
        setInfo('💥','Shot! Aim corners — low shots are hardest for keepers to save!','Law 10 — Shooting'); addEv('💥 Shot on goal!')
      } else {
        const d=Math.hypot(ball.x-pl.x,ball.y-pl.y)
        if(d<75){ const ang=Math.atan2(ball.y-pl.y,ball.x-pl.x); ball.vx=Math.cos(ang)*9; ball.vy=Math.sin(ang)*9; ball.own=null; cpu.has=false; pl.kickCD=15; burst(ball.x,ball.y,'rgba(100,200,255,0.5)',8); showRule('⚡','Gegenpressing!','You won the ball back immediately! Win it high = attack before defence organises!','Law 12 — Pressing','#88ccff'); setInfo('⚡','Counter-press! Win ball high — attack NOW!','Law 12 — Gegenpressing'); addEv('⚡ Counter-press WIN!') }
      }
    }

    function checkOffside(){
      G.offsideTimer++; if(G.offsideTimer<280) return; G.offsideTimer=0
      if(pl.x>PCX&&!pl.has){ const defs=opp.filter(o=>!o.rc).map(o=>o.x).sort((a,b)=>a-b); const secondLast=defs[defs.length-2]||PR; if(pl.x>secondLast){ showRule('🚩','OFFSIDE!','You are ahead of the second-last defender. Step BACK before receiving! Arms cannot be offside. Does not apply at throw-ins or corners.','Law 11 — Offside','#ffaa44'); setInfo('🚩','OFFSIDE position! Step back behind the second-last defender!','Law 11'); addEv('🚩 Offside position!') } }
    }

    function checkHalf(){
      if(G.secs===150&&G.half===1&&!G.halfDone){ G.halfDone=true; setHalf(2); whistleBlast(); showRule('🔔','HALF TIME!','Teams swap ends for the second half. 15-minute break. Team that conceded last goal takes kickoff!','Law 7 — Duration','#b5ff47'); setInfo('🔔','HALF TIME! Teams swap ends. Kickoff after break!','Law 7 — Duration'); addEv('🔔 HALF TIME! Swap ends') }
    }

    // ── MAIN FRAME LOOP ──
    let tick=0
    function frame(){
      if(!G.running) return
      ctx.clearRect(0,0,W,H)
      drawBg(); drawLines()

      if(pausedRef.current){
        // Show frozen pitch — no game logic
        team.forEach(t=>drawPlayer(t))
        opp.forEach(o=>drawPlayer(o))
        drawPlayer(cpu); drawPlayer(pl,true)
        drawRef(); drawBall(); drawParts(); drawMinimap(); drawStamina()
        drawPausedOverlay()
        raf.current=requestAnimationFrame(frame)
        return
      }

      // Normal game logic
      updatePlayer(); updateCPU(); updateBall()
      checkOffside(); checkHalf()
      team.forEach(t=>drawPlayer(t)); opp.forEach(o=>drawPlayer(o))
      drawPlayer(cpu); drawPlayer(pl,true)
      drawRef(); drawBall(); drawParts()
      drawMinimap(); drawStamina(); drawWhistleFlash()

      // Shoot hint
      if(pl.has){
        const dg=Math.hypot(pl.x-PR,pl.y-PCY)
        if(dg<(PR-PL)*0.4){
          ctx.save(); const pulse=0.5+0.5*Math.sin(Date.now()*0.008); ctx.globalAlpha=pulse*0.85
          ctx.fillStyle='#b5ff47'; ctx.font='bold 14px Arial'; ctx.textAlign='center'
          ctx.fillText('⚽ PRESS SPACE TO SHOOT!',PR-120,PY+40); ctx.restore()
        }
      }

      tick++
      if(tick%60===0){
        G.secs++
        setTime(String(Math.floor(G.secs/60)).padStart(2,'0')+':'+String(G.secs%60).padStart(2,'0'))
        G.yPoss+=(50-G.yPoss)*0.003; G.cPoss=100-G.yPoss
        setPoss({y:Math.round(G.yPoss),c:Math.round(G.cPoss)}); setStamina(Math.round(G.stamina))
      }
      raf.current=requestAnimationFrame(frame)
    }

    resetBall('you')
    frame()
    return ()=>{ G.running=false; if(raf.current) cancelAnimationFrame(raf.current) }
  },[])

  useEffect(()=>{
    const kd=e=>{ const G=S.current; if(!G.keys) return; G.keys[e.key]=true; if(e.key===' '||e.key==='Enter'){ G.kick?.(); e.preventDefault() } if(e.key==='Shift') G.sprint=true; if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault() }
    const ku=e=>{ const G=S.current; if(!G.keys) return; G.keys[e.key]=false; if(e.key==='Shift') G.sprint=false }
    window.addEventListener('keydown',kd); window.addEventListener('keyup',ku)
    return ()=>{ window.removeEventListener('keydown',kd); window.removeEventListener('keyup',ku) }
  },[])

  const sk=(k,v)=>{ if(S.current.keys) S.current.keys[k]=v }
  const ss=v=>{ S.current.sprint=v }
  const Btn=({label,onD,onU,st={}})=>(
    <button onMouseDown={onD} onMouseUp={onU} onTouchStart={e=>{onD();e.preventDefault()}} onTouchEnd={e=>{onU();e.preventDefault()}} style={{width:44,height:44,borderRadius:8,border:'1px solid rgba(255,255,255,0.18)',background:'rgba(0,0,0,0.82)',color:'#fff',fontSize:'1rem',cursor:'pointer',display:'grid',placeItems:'center',userSelect:'none',WebkitUserSelect:'none',...st}}>{label}</button>
  )

  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'#000',display:'flex',flexDirection:'column',fontFamily:'Arial,sans-serif'}}>
      <div style={{height:50,background:'rgba(0,0,0,0.93)',borderBottom:'1px solid rgba(181,255,71,0.2)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 14px',flexShrink:0,zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:34,height:34,borderRadius:'50%',background:'#1a55ee',display:'grid',placeItems:'center',fontSize:'0.7rem',fontWeight:700,color:'#fff',border:'2px solid rgba(181,255,71,0.55)'}}>YOU</div>
          <div style={{width:72,height:7,background:'rgba(255,255,255,0.12)',borderRadius:3,overflow:'hidden'}}>
            <div style={{width:stamina+'%',height:'100%',background:stamina>60?'#b5ff47':stamina>30?'#ffcc00':'#ff4444',borderRadius:3,transition:'width 0.3s'}}/>
          </div>
          <span style={{fontSize:'0.6rem',color:'#8aad8e'}}>STM</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:'1.5rem',fontWeight:900,color:'#b5ff47',fontFamily:'monospace',padding:'0 14px',borderLeft:'1px solid rgba(181,255,71,0.2)',borderRight:'1px solid rgba(181,255,71,0.2)'}}>{scores.y} — {scores.c}</span>
          <div style={{lineHeight:1.4}}><div style={{fontSize:'0.7rem',color:'#8aad8e',fontFamily:'monospace'}}>{time} · H{half}</div><div style={{fontSize:'0.58rem',color:'#556655'}}>You {poss.y}% · CPU {poss.c}%</div></div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{maxWidth:160,textAlign:'right'}}>{events.slice(0,3).map(e=>(<div key={e.id} style={{fontSize:'0.58rem',color:'#7aaa7a',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{e.txt}</div>))}</div>
          <button onClick={()=>setShowHow(h=>!h)} style={{background:'transparent',border:'1px solid rgba(181,255,71,0.3)',borderRadius:4,color:'#b5ff47',padding:'4px 10px',cursor:'pointer',fontSize:'0.62rem'}}>❓ HOW</button>
          <button onClick={onClose} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.2)',borderRadius:4,color:'rgba(255,255,255,0.5)',padding:'4px 10px',cursor:'pointer',fontSize:'0.65rem'}}>✕</button>
        </div>
      </div>

      <div style={{flex:1,position:'relative',overflow:'hidden'}}>
        <canvas ref={canvasRef} style={{display:'block',position:'absolute',top:0,left:0,width:'100%',height:'100%'}}/>

        {showHow&&(
          <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.9)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:40}}>
            <div style={{background:'rgba(6,20,8,0.98)',border:'1px solid rgba(181,255,71,0.35)',borderRadius:16,padding:'28px 32px',maxWidth:480,width:'90%'}}>
              <div style={{fontSize:'1.3rem',fontWeight:800,color:'#b5ff47',marginBottom:16,textAlign:'center'}}>⚽ How to Play</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
                {[{k:'↑↓←→ / WASD',v:'Move your player'},{k:'SPACE or ⚽',v:'Kick / Shoot'},{k:'Hold SHIFT',v:'Sprint (uses stamina)'},{k:'Walk into ball',v:'Pick up possession'}].map(({k,v})=>(
                  <div key={k} style={{background:'rgba(181,255,71,0.06)',border:'1px solid rgba(181,255,71,0.15)',borderRadius:8,padding:'10px 12px'}}>
                    <div style={{fontSize:'0.75rem',fontWeight:700,color:'#b5ff47',marginBottom:4}}>{k}</div>
                    <div style={{fontSize:'0.68rem',color:'#8aad8e'}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{background:'rgba(181,255,71,0.08)',border:'1px solid rgba(181,255,71,0.2)',borderRadius:10,padding:'12px 16px',marginBottom:16}}>
                <div style={{fontSize:'0.72rem',fontWeight:700,color:'#b5ff47',marginBottom:6}}>⚡ Quick Tips</div>
                <div style={{fontSize:'0.67rem',color:'#8aad8e',lineHeight:1.8}}>
                  • You are <strong style={{color:'#4488ff'}}>BLUE #10</strong> with a lime ring — easy to spot<br/>
                  • Walk INTO the white ball to pick it up — a lime dot appears below you<br/>
                  • CPU is <strong style={{color:'#ff4444'}}>SLOWER</strong> than you — use your speed!<br/>
                  • Get close to the right goal then press SPACE to SHOOT<br/>
                  • FIFA rules pop up at the bottom as events happen live
                </div>
              </div>
              <button
                onClick={kickOff}
                style={{width:'100%',padding:'14px',background:'#b5ff47',border:'none',borderRadius:999,color:'#060f08',fontWeight:700,fontSize:'1rem',cursor:'pointer',letterSpacing:'0.04em'}}
              >
                ⚽ KICK OFF — LET'S PLAY!
              </button>
            </div>
          </div>
        )}

        {countdown !== null && (
          <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.78)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:35,pointerEvents:'none'}}>
            <div key={countdown} style={{fontSize:'clamp(6rem,22vw,13rem)',fontWeight:900,color:'#b5ff47',fontFamily:'Arial Black,Arial',lineHeight:1,animation:'countPop 0.9s ease-out forwards',textShadow:'0 0 80px rgba(181,255,71,0.8)'}}>
              {countdown}
            </div>
            <div style={{fontSize:'1.1rem',color:'rgba(255,255,255,0.45)',marginTop:20,letterSpacing:'0.14em',fontWeight:600}}>GET READY</div>
          </div>
        )}

        {goalFlash&&(
          <div style={{position:'absolute',inset:0,background:goalFlash.type==='you'?'rgba(0,22,0,0.82)':'rgba(22,0,0,0.82)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,zIndex:30,pointerEvents:'none'}}>
            <div style={{fontSize:'clamp(2.5rem,9vw,5.5rem)',fontWeight:900,color:goalFlash.type==='you'?'#b5ff47':'#ff4444',fontFamily:'Arial Black,Arial'}}>{goalFlash.text}</div>
            <div style={{fontSize:'0.88rem',color:'rgba(255,255,255,0.55)',textAlign:'center',maxWidth:400}}>{goalFlash.sub}</div>
          </div>
        )}

        {rulePopup&&(
          <div style={{position:'absolute',bottom:8,left:10,zIndex:25,maxWidth:310,animation:'slideUp 0.22s ease'}}>
            <div style={{background:'rgba(3,12,4,0.97)',border:`1px solid ${rulePopup.col}55`,borderRadius:10,padding:'11px 14px'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <span style={{fontSize:'1.5rem',flexShrink:0}}>{rulePopup.icon}</span>
                <div><div style={{fontSize:'0.74rem',fontWeight:700,color:rulePopup.col}}>{rulePopup.title}</div><div style={{fontSize:'0.6rem',color:'rgba(181,255,71,0.42)'}}>{rulePopup.law}</div></div>
              </div>
              <div style={{fontSize:'0.67rem',color:'#a8cca8',lineHeight:1.65}}>{rulePopup.body}</div>
            </div>
          </div>
        )}

        <div style={{position:'absolute',bottom:12,right:12,display:'grid',gridTemplateColumns:'repeat(3,44px)',gap:4,zIndex:20}}>
          <div/><Btn label="▲" onD={()=>sk('ArrowUp',true)} onU={()=>sk('ArrowUp',false)}/><div/>
          <Btn label="◀" onD={()=>sk('ArrowLeft',true)} onU={()=>sk('ArrowLeft',false)}/>
          <Btn label="⚽" onD={()=>S.current.kick?.()} onU={()=>{}} st={{background:'rgba(181,255,71,0.18)',border:'2px solid rgba(181,255,71,0.65)',color:'#b5ff47',fontSize:'1.2rem'}}/>
          <Btn label="▶" onD={()=>sk('ArrowRight',true)} onU={()=>sk('ArrowRight',false)}/>
          <div/><Btn label="▼" onD={()=>sk('ArrowDown',true)} onU={()=>sk('ArrowDown',false)}/><div/>
          <button onMouseDown={()=>ss(true)} onMouseUp={()=>ss(false)} onTouchStart={e=>{ss(true);e.preventDefault()}} onTouchEnd={e=>{ss(false);e.preventDefault()}} style={{gridColumn:'span 3',height:30,borderRadius:6,border:'1px solid rgba(255,255,255,0.18)',background:'rgba(0,0,0,0.82)',color:'#fff',fontSize:'0.62rem',letterSpacing:'0.06em',cursor:'pointer',marginTop:3}}>⚡ SPRINT (hold SHIFT)</button>
        </div>
      </div>

      <div style={{height:52,background:'rgba(0,0,0,0.94)',borderTop:'1px solid rgba(181,255,71,0.15)',display:'flex',alignItems:'center',padding:'0 14px',gap:10,flexShrink:0,zIndex:10}}>
        <span style={{fontSize:'1.2rem',flexShrink:0}}>{infoData.icon}</span>
        <span style={{fontSize:'0.67rem',color:'#b0d0b0',lineHeight:1.5,flex:1}}>{infoData.text}</span>
        <span style={{fontSize:'0.58rem',color:'rgba(181,255,71,0.45)',flexShrink:0,textAlign:'right',maxWidth:110,lineHeight:1.4}}>{infoData.law}</span>
      </div>

      <style>{`
        @keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes countPop{0%{transform:scale(2.2);opacity:0}30%{opacity:1;transform:scale(1)}80%{opacity:1;transform:scale(0.95)}100%{transform:scale(0.6);opacity:0}}
      `}</style>
    </div>
  )
}