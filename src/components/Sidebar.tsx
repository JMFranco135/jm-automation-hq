import { useState } from 'react'

const groups = [
  { title: 'MAIN', items: [{ label: 'Dashboard', key: 'dashboard' }] },
  { title: 'WORKFLOW', items: [{ label: 'Automations', key: 'automations' }, { label: 'Backend', key: 'backend' }] },
  { title: 'LIBRARY', items: [{ label: 'SOP Library', key: 'sops' }] },
  { title: 'AGENTS', items: [{ label: 'Agent Setup', key: 'agents' }] },
]

export default function Sidebar({ active, onSelect }: { active: string; onSelect: (k: string) => void }) {
  return (
    <aside style={{ width: 260, background: 'var(--sidebar-bg)', color: 'var(--text)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 20, fontWeight: 700, fontSize: 18, borderBottom: '1px solid var(--border)' }}>Ops OS</div>
      <nav style={{ padding: 12, overflowY: 'auto' }}>
        {groups.map(g => (
          <div key={g.title} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, letterSpacing: 1, color: 'var(--muted)', margin: '8px 8px' }}>{g.title}</div>
            {g.items.map(i => (
              <button
                key={i.key}
                onClick={() => onSelect(i.key)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  margin: '2px 0',
                  background: active === i.key ? 'var(--panel)' : 'transparent',
                  color: 'var(--text)',
                  border: '1px solid transparent',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                {i.label}
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}
