export default function TopBar({ title, reachable }: { title: string; reachable: boolean | null }) {
  return (
    <header style={{ height: 56, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: 'var(--panel)' }}>
      <div style={{ fontWeight: 600 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Pixel Agents</span>
        <span style={{
          width: 10, height: 10, borderRadius: 999, background: reachable === null ? '#666' : reachable ? '#4caf50' : '#e53935'
        }} />
      </div>
    </header>
  )
}
