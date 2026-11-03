import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { CONFIG } from '../src/config.js'

const AGENTS = [
  { folder: '01-sales-scripts', defaultName: 'Scripter' },
  { folder: '02-copywriting-email-sms', defaultName: 'Copywriter' },
  { folder: '03-debug-automation-backend', defaultName: 'Fixer' },
  { folder: '04-workflow-builder', defaultName: 'Architect' },
]

const CLAUDE_ROOT = 'C:\\Users\\John Michael\\.claude\\projects'
const PROJECT_ROOT = process.cwd()
const AGENTS_ROOT = path.join(PROJECT_ROOT, 'agents')

function sanitize(text) {
  if (!text) return ''
  return text.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[hidden]')
    .replace(/(\+?\d[\d\s\-().]{6,}\d)/g, '[hidden]')
    .replace(/\b\d{7,}\b/g, '[hidden]')
}

function formatTime(ts) {
  return new Date(ts).toLocaleString('en-US', { year:'numeric', month:'2-digit', day:'2-digit', hour:'numeric', minute:'2-digit', second:'2-digit' })
}

function agentSessionDir(agentFolder) {
  const safe = AGENTS_ROOT.replace(/[^A-Za-z0-9]/g,'-')
  const name = agentFolder.replace(/[^A-Za-z0-9]/g,'-')
  const base = path.join(CLAUDE_ROOT, safe + '-' + name)
  return base
}

async function listSessions(dir) {
  try {
    const files = await fsp.readdir(dir).catch(() => [])
    return files.filter(f=>f.endsWith('.jsonl'))
  } catch { return [] }
}

async function tailFile(file, bytes=65536) {
  try {
    const stat = await fsp.stat(file)
    const size = Math.min(stat.size, bytes)
    const fd = await fsp.open(file,'r')
    const buf = Buffer.alloc(size)
    await fd.read(buf,0,size, stat.size-size)
    await fd.close()
    return buf.toString('utf8')
  } catch { return '' }
}

function parseTail(content) {
  const recs = []
  for (const line of content.split('\n')) {
    try { const o = JSON.parse(line); if (o.timestamp) recs.push(o) } catch {}
  }
  return recs
}

function getDisplayName(folder) {
  const mdPath = path.join(AGENTS_ROOT, folder, 'CLAUDE.md')
  try {
    const txt = fs.readFileSync(mdPath,'utf8')
    const m = txt.split('\n').find(l=>l.startsWith('# '))
    if (m) return m.replace(/^#\s+/,'').trim()
  } catch {}
  return AGENTS.find(a=>a.folder===folder)?.defaultName || folder
}

let lastStates = new Map()
let clients = []

function broadcast(states) {
  const payload = JSON.stringify({ type:'update', states })
  for (const res of clients) {
    try { res.write(`data: ${payload}\n\n`) } catch {}
  }
}

async function checkClaudeProcess() {
  return new Promise(resolve => {
    execFile('tasklist', ['/FI','IMAGENAME eq claude.exe','/FO','CSV','/NH'], (err, stdout) => {
      if (err) return resolve(false)
      return resolve(stdout && stdout.trim().length>0 && stdout.includes('claude.exe'))
    })
  })
}

async function evaluate() {
  const processRunning = await checkClaudeProcess()
  const now = Date.now()
  const states = {}
  for (const ag of AGENTS) {
    const folder = ag.folder
    const displayName = getDisplayName(folder)
    const dir = agentSessionDir(folder)
    const sessions = await listSessions(dir)
    let latestFile = null
    let latestMtime = 0
    for (const s of sessions) {
      const fp = path.join(dir, s)
      try {
        const st = await fsp.stat(fp)
        if (st.mtimeMs > latestMtime) { latestMtime = st.mtimeMs; latestFile = fp }
      } catch {}
    }
    let task = ''
    let action = ''
    let lastActivity = null
    let taskGiven = false
    let forcedActive = false
    let forcedInactive = false
    const ACTIVATE_RE = /\b(activate|active|start work|begin)\b/i
    const DEACTIVATE_RE = /\b(deactivate|stop|done for today|shutdown)\b/i
    if (latestFile) {
      const content = await tailFile(latestFile)
      const recs = parseTail(content)
      if (recs.length) {
        // keyword detection for activation/deactivation
        const recent = recs.slice(-50)
        const extractTexts = (msg) => {
          const texts = []
          if (!msg || !Array.isArray(msg.content)) return texts
          for (const c of msg.content) {
            if (c.type === 'text' && typeof c.text === 'string') texts.push(c.text)
          }
          return texts
        }
        for (const r of recent) {
          let texts = []
          let ts = r.timestamp
          if (r.type === 'user' && r.message) {
            texts = extractTexts(r.message)
          } else if (r.type === 'api-request-blob' && r.message?.role === 'user') {
            texts = extractTexts(r.message)
          }
          for (const t of texts) {
            if (ACTIVATE_RE.test(t)) { forcedActive = true; lastActivity = new Date(ts).getTime() }
            if (DEACTIVATE_RE.test(t)) { forcedInactive = true; lastActivity = new Date(ts).getTime() }
          }
        }
        // find first user message that is not a system interrupt / activation noise
        const firstUser = recs.find(r=>r.type==='user' && r.message && r.message.role==='user' && r.message.content && typeof r.message.content[0]?.text === 'string' && r.message.content[0].text.trim().length>0)
        if (firstUser) {
          taskGiven = true
          const text = firstUser.message.content?.[0]?.text || ''
          task = sanitize(text.split('\n')[0]).slice(0,100)
        }
        // last activity: any record
        const last = recs[recs.length-1]
        if (last.timestamp && !lastActivity) lastActivity = new Date(last.timestamp).getTime()
        // current action
        const lastAssistant = [...recs].reverse().find(r=>r.type==='assistant')
        if (lastAssistant && lastAssistant.message && lastAssistant.message.content) {
          const c = lastAssistant.message.content.find(i=>i.type==='tool_use')
          if (c) {
            const name = c.name
            if (name==='Bash' || name==='PowerShell') action = 'Running a command'
            else if (name==='Grep' || name==='Glob') action = 'Searching files'
            else if (name==='WebSearch') action = 'Searching the web'
            else if (name==='Agent') action = 'Running a sub-agent'
            else action = 'Reading '+ (path.basename(c.input?.file_path||''))
          } else {
            action = 'Thinking'
          }
        }
      }
    }
    let status = 'INACTIVE'
    if (!processRunning) status = 'INACTIVE'
    else if (!latestFile) status = 'INACTIVE'
    else if (forcedInactive) status = 'INACTIVE'
    else if (forcedActive) status = 'ACTIVE'
    // New session with recent activity but no prior task: treat as ACTIVE for up to ACTIVE_WINDOW_MIN
    else if (!taskGiven && lastActivity) {
      const ageMin = (now - lastActivity)/60000
      status = ageMin <= CONFIG.ACTIVE_WINDOW_MIN ? 'ACTIVE' : 'INACTIVE'
    }
    else if (!taskGiven) status = 'INACTIVE'
    else {
      const ageMs = lastActivity ? now - lastActivity : Infinity
      const ageMin = ageMs/60000
      if (ageMin <= CONFIG.ACTIVE_WINDOW_MIN) status = 'ACTIVE'
      else if (ageMin <= CONFIG.INACTIVE_AFTER_MIN) status = 'IDLE'
      else status = 'INACTIVE'
    }
    const state = {
      displayName,
      folder,
      task,
      action,
      updatedAt: lastActivity ? new Date(lastActivity).toISOString() : null,
      status,
      lastSeen: lastActivity ? formatTime(lastActivity) : '—',
    }
    const key = folder
    const prev = lastStates.get(key)
    if (!prev || JSON.stringify(prev)!==JSON.stringify(state)) {
      lastStates.set(key, state)
      states[key] = state
    }
  }
  if (Object.keys(states).length) broadcast(states)
}

export function registerSSE(app) {
  app.use('/api/agents/status-stream', (req,res) => {
    res.writeHead(200, {
      'Content-Type':'text/event-stream',
      'Cache-Control':'no-cache',
      'Connection':'keep-alive'
    })
    res.write('\n')
    // send current snapshot immediately so refresh gets last known state
    try {
      const snapshot = {}
      for (const [k,v] of lastStates.entries()) snapshot[k] = v
      if (Object.keys(snapshot).length) res.write(`data: ${JSON.stringify({ type:'update', states: snapshot })}\n\n`)
    } catch {}
    clients.push(res)
    req.on('close', () => { clients = clients.filter(c=>c!==res) })
  })
  // kick off evaluator
  evaluate()
  setInterval(evaluate, CONFIG.TICK_MS)
  // watch session dirs
  for (const ag of AGENTS) {
    const dir = agentSessionDir(ag.folder)
    try {
      fs.watch(dir, () => evaluate())
    } catch {}
  }
}
