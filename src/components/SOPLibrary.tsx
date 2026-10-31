import { useEffect, useState, useMemo } from 'react'

type SOPEntry = {
  id: string
  title: string
  path: string
  content: string
  updated: string
}

export default function SOPLibrary() {
  const [sops, setSops] = useState<SOPEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<SOPEntry | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // Load root SOP markdowns at repo root
        const rootFiles = ['SOP_Open_Dashboard.md']
        const entries: SOPEntry[] = []
        for (const f of rootFiles) {
          try {
            const res = await fetch(`/${f}`)
            if (res.ok) {
              const text = await res.text()
              const title = text.split('\n')[0].replace(/^#\s*/, '') || f
              entries.push({
                id: f,
                title,
                path: f,
                content: text,
                updated: new Date().toISOString(),
              })
            }
          } catch {}
        }
        // Optionally scan agents/*/sop for .md files via vite static serving
        // For now we ship the root SOPs. Add more sources as needed.
        setSops(entries)
        if (entries.length) setSelected(entries[0])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return sops.filter(s => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q))
  }, [sops, query])

  if (loading) return <div style={{ padding: 24 }}>Loading SOP Library…</div>

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
      <aside style={{ width: 320, borderRight: '1px solid var(--border)', background: 'var(--sidebar-bg)', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>SOP Library</div>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search SOPs…"
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
          />
        </div>
        <div style={{ overflowY: 'auto', padding: 8 }}>
          {filtered.map(s => (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 12px',
                margin: '2px 0',
                background: selected?.id === s.id ? 'var(--panel)' : 'transparent',
                color: 'var(--text)',
                border: '1px solid transparent',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{s.path}</div>
            </button>
          ))}
          {filtered.length === 0 && <div style={{ padding: 16, color: 'var(--muted)' }}>No SOPs found.</div>}
        </div>
      </aside>
      <main style={{ flex: 1, overflowY: 'auto', padding: 24, minWidth: 0 }}>
        {selected ? (
          <article>
            <h1 style={{ marginTop: 0 }}>{selected.title}</h1>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>{selected.path} • {new Date(selected.updated).toLocaleString()}</div>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'system-ui', fontSize: 14, lineHeight: 1.6, background: 'var(--panel)', padding: 16, borderRadius: 12, border: '1px solid var(--border)', overflowX: 'auto' }}>{selected.content}</pre>
          </article>
        ) : (
          <div style={{ color: 'var(--muted)' }}>Select an SOP from the left to view.</div>
        )}
      </main>
    </div>
  )
}
