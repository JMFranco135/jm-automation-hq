import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFile, readdir, stat } from 'node:fs/promises'
import { join, normalize, isAbsolute, sep, resolve } from 'node:path'

function safeJoin(base: string, ...parts: string[]) {
  const p = normalize(join(base, ...parts))
  if (!isAbsolute(p) || !p.startsWith(normalize(base) + sep)) return null
  return p
}

const SECRET_RE = /(^\.env|\.env($|\.)|secret|\.key$|\.pem$|credentials)/i

export default defineConfig(() => {
  const projectRoot = resolve(process.cwd())
  const agentsRoot = join(projectRoot, 'agents')

  return {
    plugins: [
      react(),
      {
        name: 'agents-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            try {
              const url = new URL(req.url || '/', 'http://localhost')
              if (!url.pathname.startsWith('/api/agents')) return next()

              // Handle mark done POST
              if (url.pathname.match(/^\/api\/agents\/[^/]+\/done$/)) {
                if (req.method !== 'POST') { res.statusCode = 405; res.end('Method not allowed'); return }
                const rel = decodeURIComponent(url.pathname.replace('/api/agents/', '').replace('/done', ''))
                const safe = safeJoin(agentsRoot, rel, 'status.json')
                if (!safe) { res.statusCode = 400; res.end('Bad path'); return }
                try {
                  const content = await readFile(safe, 'utf-8')
                  const data = JSON.parse(content)
                  data.task = 'done for today'
                  data.progress = 100
                  data.step = 'Completed'
                  data.needsApproval = false
                  data.updatedAt = new Date().toISOString()
                  const fs = await import('node:fs/promises')
                  await fs.writeFile(safe, JSON.stringify(data, null, 2), 'utf-8')
                  res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
                  res.end(JSON.stringify({ ok: true }))
                } catch {
                  res.statusCode = 500
                  res.end('Error')
                }
                return
              }

              // Handle approval POST
              if (url.pathname.match(/^\/api\/agents\/[^/]+\/approve$/)) {
                if (req.method !== 'POST') { res.statusCode = 405; res.end('Method not allowed'); return }
                const rel = decodeURIComponent(url.pathname.replace('/api/agents/', '').replace('/approve', ''))
                const safe = safeJoin(agentsRoot, rel, 'status.json')
                if (!safe) { res.statusCode = 400; res.end('Bad path'); return }
                try {
                  const content = await readFile(safe, 'utf-8')
                  const data = JSON.parse(content)
                  data.needsApproval = false
                  data.progress = 100
                  data.step = 'Approved via dashboard'
                  data.message = 'Approved via dashboard'
                  data.updatedAt = new Date().toISOString()
                  // Write back
                  const fs = await import('node:fs/promises')
                  await fs.writeFile(safe, JSON.stringify(data, null, 2), 'utf-8')
                  res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
                  res.end(JSON.stringify({ ok: true }))
                } catch {
                  res.statusCode = 500
                  res.end('Error')
                }
                return
              }

              if (req.method !== 'GET') { res.statusCode = 405; res.end('Read only'); return }

              const noStore = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }

              if (url.pathname === '/api/agents/meta') {
                res.writeHead(200, noStore)
                res.end(JSON.stringify({ root: agentsRoot }))
                return
              }
              if (url.pathname === '/api/agents/list') {
                const entries = await readdir(agentsRoot, { withFileTypes: true })
                const agents = entries.filter(e => e.isDirectory()).map(e => e.name).sort()
                res.writeHead(200, noStore)
                res.end(JSON.stringify(agents))
                return
              }

              const rel = decodeURIComponent(url.pathname.replace('/api/agents/', ''))
              const safe = safeJoin(agentsRoot, rel)
              if (!safe) { res.statusCode = 400; res.end('Bad path'); return }

              const info = await stat(safe).catch(() => null)
              if (!info) { res.statusCode = 404; res.end('Not found'); return }

              if (info.isDirectory()) {
                const files = await readdir(safe)
                res.writeHead(200, noStore)
                res.end(JSON.stringify(files))
                return
              }

              const name = safe.split(sep).pop() || ''
              if (SECRET_RE.test(name)) { res.writeHead(403); res.end('Forbidden'); return }

              const buf = await readFile(safe, 'utf-8')
              res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' })
              res.end(buf)
            } catch {
              res.statusCode = 500
              res.end('Error')
            }
          })
        }
      }
    ],
    server: {
      host: '127.0.0.1',
      port: 5174,
      strictPort: true,
    },
    preview: {
      host: '127.0.0.1',
      port: 5174,
    },
  }
})
