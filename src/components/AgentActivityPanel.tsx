import { useEffect, useState, useRef } from 'react'
import { CONFIG } from '../config'

type AgentState = {
  displayName: string
  folder: string
  task: string
  action: string
  updatedAt: string | null
  status: 'ACTIVE' | 'IDLE' | 'INACTIVE'
  lastSeen: string
}

const AGENTS = [
  { folder: '01-sales-scripts', defaultName: 'Scripter' },
  { folder: '02-copywriting-email-sms', defaultName: 'Copywriter' },
  { folder: '03-debug-automation-backend', defaultName: 'Fixer' },
  { folder: '04-workflow-builder', defaultName: 'Architect' },
]

function sanitize(text: string) {
  return text.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[hidden]')
    .replace(/(\+?\d[\d\s\-().]{6,}\d)/g, '[hidden]')
    .replace(/\b\d{7,}\b/g, '[hidden]')
}
function truncate(text: string, max = 100) {
  if (!text) return ''
  const t = text.trim()
  return t.length > max ? t.slice(0, max-1)+'…' : t
}
const emojiMap: Record<string,string> = { 'Scripter':'✍️','Copywriter':'📝','Fixer':'🐛','Architect':'⚙️' }
const statusColor: Record<string,string> = {
  ACTIVE:'var(--status-active)',
  IDLE:'var(--status-idle)',
  INACTIVE:'var(--status-inactive)'
}

export default function AgentActivityPanel() {
  const [states, setStates] = useState<Record<string,AgentState>>({})
  const [panelWidth,setPanelWidth] = useState(320)
  const [panelCollapsed,setPanelCollapsed] = useState(false)
  const hidden = useRef(false)
  useEffect(()=>{
    const h = ()=>{ hidden.current=document.hidden }
    document.addEventListener('visibilitychange', h)
    return ()=>document.removeEventListener('visibilitychange', h)
  },[])
  useEffect(()=>{
    const base: Record<string,AgentState> = {}
    AGENTS.forEach(a=>{ base[a.folder] = { displayName:a.defaultName, folder:a.folder, task:'', action:'', updatedAt:null, status:'INACTIVE', lastSeen:'—' }})
    setStates(base)
    const es = new EventSource('/api/agents/status-stream')
    es.onmessage = (e)=>{
      try {
        const data = JSON.parse(e.data)
        if (data.type==='update') {
          setStates(s=>({...s, ...data.states}))
        }
      } catch {}
    }
    es.onerror = ()=>{
      // fallback polling
      const iv = setInterval(async ()=>{
        if (hidden.current) return
        // no polling endpoint; rely on SSE
      }, 2000)
      return ()=>clearInterval(iv)
    }
    return ()=>es.close()
  },[])
  return (
    <div>
      <aside className="glass" style={{width: panelCollapsed?0:panelWidth, borderLeft:'1px solid var(--glass-border)', background:'var(--glass-bg)', padding: panelCollapsed?0:12, overflowY:'auto', transition:'width 0.2s', minWidth: panelCollapsed?0:280, overflowX:'hidden', borderRadius:0}}>
      {!panelCollapsed && <h3 style={{margin:'4px 0 12px',display:'flex',justifyContent:'space-between',alignItems:'center'}} className="gradient-text">Agent Activity <button onClick={()=>setPanelCollapsed(true)} style={{background:'transparent',border:'none',color:'white',cursor:'pointer',fontSize:16}}>◀</button></h3>}
      {!panelCollapsed && AGENTS.map(ag=>{
        const s = states[ag.folder] || {displayName:ag.defaultName,folder:ag.folder,task:'',action:'',updatedAt:null,status:'INACTIVE',lastSeen:'—'}
        const label = s.status
        const color = statusColor[label]
        const currentAction = label==='ACTIVE' ? (s.action||'Thinking') : label==='IDLE' ? 'Waiting for your input or approval' : 'No active session'
        const emoji = emojiMap[s.displayName] || '🤖'
        const hue = [...s.folder].reduce((h,c)=>h+c.charCodeAt(0),0)%360
        return (
          <div key={ag.folder} className="glass glass-gradient-border" style={{border:'1px solid var(--glass-border)',borderRadius:'var(--radius-md)',padding:12,marginBottom:10,background:'var(--glass-bg)'}}>
            <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:8}}>
              <div style={{width:36,height:36,borderRadius:'var(--radius-sm)',background:`hsl(${hue} 70% 45%)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{emoji}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <div style={{fontWeight:600,fontSize:14}} className="gradient-text">{s.displayName}</div>
                  <span className={label==='ACTIVE'?'status-dot-blink':label==='IDLE'?'status-dot-idle':''} style={{width:8,height:8,borderRadius:'50%',background:color,display:'inline-block'}}/>
                </div>
                <div style={{fontSize:12,color:'var(--muted)'}}>{ag.folder}</div>
              </div>
              <div style={{fontSize:10,color:'var(--muted)',textTransform:'uppercase',letterSpacing:0.5}}>{label}</div>
            </div>
            <div style={{fontSize:13,marginBottom:2,fontWeight:500}}>{truncate(sanitize(s.task||''),100)}</div>
            <div style={{fontSize:12,color:'var(--muted)',marginBottom:6}}>{currentAction}</div>
            <div style={{fontSize:10,color:'var(--muted)'}}>{s.lastSeen}</div>
            <div style={{display:'flex',gap:6,marginTop:8}}>
              <button
                onClick={()=>{
                  const cmd = `cd /d "%USERPROFILE%\\OneDrive\\Desktop\\claude-website\\agents\\${ag.folder}" && start claude`
                  navigator.clipboard.writeText(cmd)
                }}
                title="Copy terminal command"
                style={{flex:1,padding:'6px 8px',fontSize:12,background:'var(--glass-bg)',border:'1px solid var(--glass-border)',borderRadius:'var(--radius-sm)',color:'white',cursor:'pointer',transition:'transform 0.08s ease, background 0.12s ease',WebkitTapHighlightColor:'transparent'}}
                onMouseDown={e=>{e.currentTarget.style.transform='translateY(1px) scale(0.98)'; e.currentTarget.style.background='var(--glass-bg-hover, rgba(255,255,255,0.08))'}}
                onMouseUp={e=>{e.currentTarget.style.transform=''; e.currentTarget.style.background='var(--glass-bg)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform=''; e.currentTarget.style.background='var(--glass-bg)'}}
              >Copy terminal</button>
            </div>
          </div>
        )
      })}
      </aside>
      {panelCollapsed && <button onClick={()=>setPanelCollapsed(false)} className="glass accent-glow" style={{position:'fixed',right:0,top:'50%',transform:'translateY(-50%)',width:32,height:32,color:'white',background:'var(--glass-bg)',border:'1px solid var(--glass-border)',borderRight:'none',borderRadius:'var(--radius-sm) 0 0 var(--radius-sm)',cursor:'pointer',fontSize:16,zIndex:1000}}>▶</button>}
    </div>
  )
}
