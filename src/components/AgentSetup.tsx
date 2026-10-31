import { useEffect, useState } from 'react'

type AgentInfo = {
  name: string
  displayName: string
  role: string
  counts: Record<string, number>
  finalFiles: string[]
}

export default function AgentSetup() {
  const [agents, setAgents] = useState<AgentInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [root, setRoot] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const metaRes = await fetch('/api/agents/meta')
        const meta = await metaRes.json()
        setRoot(meta.root || '')
        const listRes = await fetch('/api/agents/list')
        const names: string[] = await listRes.json()
        const infos: AgentInfo[] = []
        for (const name of names) {
          const [cRes, pRes, sRes, dRes, rRes, fRes] = await Promise.all([
            fetch(`/api/agents/${encodeURIComponent(name)}/CLAUDE.md`).then(r => r.text()).catch(() => ''),
            fetch(`/api/agents/${encodeURIComponent(name)}/prompts`).then(r => r.json()).catch(() => []),
            fetch(`/api/agents/${encodeURIComponent(name)}/sop`).then(r => r.json()).catch(() => []),
            fetch(`/api/agents/${encodeURIComponent(name)}/docs`).then(r => r.json()).catch(() => []),
            fetch(`/api/agents/${encodeURIComponent(name)}/resources`).then(r => r.json()).catch(() => []),
            fetch(`/api/agents/${encodeURIComponent(name)}/final`).then(r => r.json()).catch(() => []),
          ])
          const lines = cRes.split('\n').map(l => l.trim()).filter(Boolean)
          const firstHeading = lines.find(l => l.startsWith('# '))?.replace(/^#\s+/, '') || name
          const roleLine = lines.find(l => l.startsWith('## Role')) ? '' : lines.slice(1,4).join(' ')
          const role = roleLine && !roleLine.includes('Paste role instructions here') ? roleLine : 'Role not set yet'
          infos.push({
            name,
            displayName: firstHeading,
            role: role || 'Role not set yet',
            counts: {
              prompts: pRes.length,
              sop: sRes.length,
              docs: dRes.length,
              resources: rRes.length,
            },
            finalFiles: fRes,
          })
        }
        setAgents(infos)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div style={{ padding: 24 }}>Loading agents…</div>

  return (
    <div style={{ padding: 24 }}>
      <h2>Agent Setup</h2>
      <p style={{ color: 'var(--muted)' }}>Start an agent in its folder, and its character appears in the office.</p>
      <div style={{ display: 'grid', gap: 16 }}>
        {agents.map(a => (
          <div key={a.name} style={{ border: '1px solid var(--border)', borderRadius: 12, background: 'var(--panel)', padding: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{a.displayName}</div>
            <div style={{ color: 'var(--muted)', fontSize: 12, margin: '2px 0 8px' }}>Folder: {a.name}</div>
            <div style={{ color: 'var(--muted)', fontSize: 13, margin: '4px 0 12px' }}>{a.role}</div>
            <div style={{ display: 'flex', gap: 16, fontSize: 13, marginBottom: 12 }}>
              <span>prompts: {a.counts.prompts}</span>
              <span>sop: {a.counts.sop}</span>
              <span>docs: {a.counts.docs}</span>
              <span>resources: {a.counts.resources}</span>
            </div>
            <pre style={{ background: 'var(--bg)', padding: 12, borderRadius: 8, fontSize: 13, overflowX: 'auto' }}>
{`cd "${root}\\${a.name}"
claude`}
            </pre>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, marginBottom: 6 }}>final/ files:</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--muted)', fontSize: 13 }}>
                {a.finalFiles.length ? a.finalFiles.map(f => <li key={f}>{f}</li>) : <li>empty</li>}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
