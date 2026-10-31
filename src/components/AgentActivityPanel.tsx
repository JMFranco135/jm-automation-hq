import { useEffect, useState, useRef } from 'react'

type Status = {
  task?: string
  progress?: number
  step?: string
  needsApproval?: boolean
  message?: string
  mode?: string
  updatedAt?: string
  draftFile?: string
  active?: boolean
}

type AgentCard = {
  name: string
  displayName: string
  status?: Status
}

function isAgentActive(agent: AgentCard, dismissed: Record<string, boolean>) {
  if (!agent.status) return false
  if (agent.status.active === true) return true
  if (agent.status.needsApproval && !dismissed[agent.name]) return true
  const task = (agent.status.task || '').trim().toLowerCase()
  if (!task || task === 'idle' || task === 'done' || task === 'done for today') return false
  if (agent.status.progress === 100 && !agent.status.needsApproval) return false
  return task.length > 0
}

export default function AgentActivityPanel() {
  const [agents, setAgents] = useState<AgentCard[]>([])
  const [dismissedApprovals, setDismissedApprovals] = useState<Record<string, boolean>>({})
  const [hiddenAgents, setHiddenAgents] = useState<Record<string, boolean>>({})
  const [selected, setSelected] = useState<AgentCard | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState<'approve' | 'done' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const projectRoot = 'C:\\Users\\John Michael\\OneDrive\\Desktop\\claude-website'
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      try {
        const listRes = await fetch('/api/agents/list')
        const names: string[] = await listRes.json()
        const cards: AgentCard[] = []
        for (const name of names) {
          const [cRes, sRes] = await Promise.all([
            fetch(`/api/agents/${encodeURIComponent(name)}/CLAUDE.md`).then(r => r.text()).catch(() => ''),
            fetch(`/api/agents/${encodeURIComponent(name)}/status.json`).then(r => r.json()).catch(() => null),
          ])
          const firstHeading = cRes.split('\n').find(l => l.startsWith('# '))?.replace(/^#\s+/, '').trim() || name
          cards.push({ name, displayName: firstHeading, status: sRes || undefined })
        }
        setAgents(cards)
      } catch {}
    }
    load()
    const iv = setInterval(load, 10000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    if (!modalOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen])

  const openFolder = (folder: string) => {
    window.open(`file:///${projectRoot.replace(/\\/g, '/')}/agents/${folder}`, '_blank')
  }

  const handleClose = () => {
    setModalOpen(false)
    setSelected(null)
    setError(null)
    setLoading(null)
  }

  const handleDismiss = (name: string) => {
    setHiddenAgents(prev => ({ ...prev, [name]: true }))
    handleClose()
  }

  const handleOpen = (a: AgentCard) => {
    setSelected(a)
    setModalOpen(true)
    setError(null)
    setLoading(null)
  }

  const approve = async (folder: string) => {
    setLoading('approve')
    setError(null)
    try {
      const res = await fetch(`/api/agents/${encodeURIComponent(folder)}/approve`, { method: 'POST' })
      if (!res.ok) throw new Error('Approve failed')
      setDismissedApprovals(prev => ({ ...prev, [folder]: true }))
      handleClose()
    } catch (e) {
      setError('Approve failed. Try again.')
    } finally {
      setLoading(null)
    }
  }

  const markDone = async (folder: string) => {
    setLoading('done')
    setError(null)
    try {
      const res = await fetch(`/api/agents/${encodeURIComponent(folder)}/done`, { method: 'POST' })
      if (!res.ok) throw new Error('Mark done failed')
      handleClose()
    } catch (e) {
      setError('Mark done failed. Try again.')
    } finally {
      setLoading(null)
    }
  }

  const activeAgents = agents.filter(a => {
    if (hiddenAgents[a.name]) return false
    return isAgentActive(a, dismissedApprovals)
  }).sort((a,b) => {
    const aNeeds = a.status?.needsApproval ? 1 : 0
    const bNeeds = b.status?.needsApproval ? 1 : 0
    if (aNeeds !== bNeeds) return bNeeds - aNeeds
    const aActive = a.status?.active ? 1 : 0
    const bActive = b.status?.active ? 1 : 0
    if (aActive !== bActive) return bActive - aActive
    return 0
  })

  return (
    <aside style={{ width: 300, borderLeft: '1px solid var(--border)', background: 'var(--panel)', padding: 12, overflowY: 'auto' }}>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,165,0,0.5); }
          70% { transform: scale(1.03); box-shadow: 0 0 0 6px rgba(255,165,0,0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,165,0,0); }
      `}</style>
      <h3 style={{ margin: '4px 0 12px' }}>Agent Activity</h3>
      {activeAgents.length === 0 ? (
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>No active agents right now</div>
      ) : activeAgents.map(a => {
        const isDismissed = dismissedApprovals[a.name]
        const isAwaiting = a.status?.needsApproval && !isDismissed
        const emojiMap: Record<string, string> = {
          'Scripter': '✍️',
          'Copywriter': '📝',
          'Fixer': '🐛',
          'Architect': '⚙️',
        }
        const emoji = emojiMap[a.displayName] || '🤖'
        const hue = [...a.name].reduce((h,c)=>h+c.charCodeAt(0),0) % 360
        const statusColor = a.status?.needsApproval && !isDismissed ? '#ff6b6b' : a.status?.active ? '#4ade80' : '#facc15'
        const statusLabel = a.status?.needsApproval && !isDismissed ? 'Needs Approval' : a.status?.active ? 'Active' : 'Working'
        return (
          <div key={a.name} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 10, marginBottom: 10, background: 'var(--bg)', cursor: 'pointer' }} onClick={() => handleOpen(a)}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `hsl(${hue} 70% 45%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, boxShadow: isAwaiting ? '0 0 0 2px rgba(255,165,0,0.5)' : 'none', animation: isAwaiting ? 'pulse 1.8s infinite' : 'none' }}>{emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{a.displayName}</div>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, display: 'inline-block' }} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{a.name}</div>
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {statusLabel}
              </div>
            </div>
            <div style={{ fontSize: 13, marginBottom: 2, fontWeight: 500 }}>{a.status?.task || 'Idle'}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{a.status?.step || ''}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>{a.status?.updatedAt ? new Date(a.status.updatedAt).toLocaleString() : ''}</div>
          </div>
        )
      })}
      {modalOpen && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={handleClose}>
          <div ref={modalRef} style={{ width: 420, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{selected.displayName}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{selected.name}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleClose() }} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <div style={{ fontSize: 14, marginBottom: 8, fontWeight: 500 }}>{selected.status?.task || 'Idle'}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>{selected.status?.step || ''}</div>
            {selected.status?.needsApproval && (
              <div style={{ marginBottom: 12, padding: 10, background: '#2a1a1a', border: '1px solid #5a3a3a', borderRadius: 8, fontSize: 13 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Needs approval</div>
                <div style={{ color: 'var(--muted)', fontSize: 12 }}>{selected.status?.message || 'Awaiting your decision'}</div>
                {selected.status?.draftFile && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>File: {selected.status.draftFile}</div>}
              </div>
            )}
            {error && <div style={{ color: '#ff6b6b', fontSize: 12, marginBottom: 8 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={(e) => { e.stopPropagation(); handleDismiss(selected.name) }} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', cursor: 'pointer' }}>Close</button>
              <button onClick={(e) => { e.stopPropagation(); markDone(selected.name) }} disabled={!!loading} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}> {loading === 'done' ? 'Marking...' : 'Mark Done'} </button>
              <button onClick={(e) => { e.stopPropagation(); approve(selected.name) }} disabled={!!loading} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #7aa2ff', background: '#7aa2ff', color: '#0f1221', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}> {loading === 'approve' ? 'Approving...' : 'Approve'} </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
