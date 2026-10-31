export default function IframePanel({ url }: { url: string }) {
  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <iframe src={url} title="Pixel Agents" style={{ width: '100%', height: '100%', border: 0, background: '#000' }} />
      <a href={url} target="_blank" rel="noopener" style={{ position: 'absolute', top: 8, right: 8, fontSize: 12, padding: '6px 10px', background: 'var(--panel)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 6, textDecoration: 'none' }}>
        Open office in new window
      </a>
    </div>
  )
}
