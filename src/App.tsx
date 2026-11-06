import { useEffect, useState } from 'react'
import './theme.css'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import IframePanel from './components/IframePanel'
import AgentSetup from './components/AgentSetup'
import AgentActivityPanel from './components/AgentActivityPanel'
import ObsidianBrain from './components/ObsidianBrain'
// import SOPLibrary from './components/SOPLibrary'

function App() {
  const [active, setActive] = useState('brain')
  const url = import.meta.env.VITE_PIXEL_AGENTS_URL as string | undefined
  const [error, setError] = useState<string | null>(null)
  const [reachable, setReachable] = useState<boolean | null>(null)

  useEffect(() => {
    if (!url) setError('VITE_PIXEL_AGENTS_URL not set in .env.local')
  }, [url])

  useEffect(() => {
    if (!url) return
    const check = async () => {
      try {
        const base = url.split('?')[0]
        const res = await fetch(base, { method: 'HEAD' })
        setReachable(res.ok)
      } catch {
        setReachable(false)
      }
    }
    check()
    const iv = setInterval(check, 10000)
    return () => clearInterval(iv)
  }, [url])

  if (error) {
    return (
      <div style={{ padding: 24, fontFamily: 'system-ui' }}>
        <h1>Ops OS – Iframe Test</h1>
        <p style={{ color: 'red' }}>{error}</p>
        <p>Create .env.local with VITE_PIXEL_AGENTS_URL=http://127.0.0.1:3100?token=…</p>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui' }}>
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <Sidebar active={active} onSelect={setActive} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <TopBar title={active} reachable={reachable} />
          <main style={{ flex: 1, display: 'flex', minHeight: 0 }}>
            {active === 'dashboard' && url && (
              <div style={{ flex: 1, display: 'flex' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <div style={{ flex: 1, minHeight: 0 }}>
                    <IframePanel url={url} />
                  </div>
                </div>
                <AgentActivityPanel />
              </div>
            )}
            {active === 'agents' && <AgentSetup />}
            {active === 'brain' && <ObsidianBrain />}
            {/* {active === 'sops' && <SOPLibrary />} */}
            {active !== 'dashboard' && active !== 'agents' && active !== 'brain' && /* active !== 'sops' && */ (
              <div style={{ padding: 24, color: 'var(--muted)' }}>Page for {active} coming in next phase.</div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
