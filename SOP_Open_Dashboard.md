# SOP — Open Ops OS Dashboard (Pixel Agents)

**Purpose:** Standard steps to launch the local Ops OS UI and reach the Pixel Agents dashboard.

**Applies to:** Ops OS repo `C:\Users\John Michael\OneDrive\Desktop\claude-website`

**Prerequisites**
- Node.js ≥18 and npm installed
- Windows PowerShell
- `.env.local` present with `VITE_PIXEL_AGENTS_URL` (see `.env.local.example`)

---

## 1. Verify environment

1. Open PowerShell in the project folder:
   ```powershell
   cd "C:\Users\John Michael\OneDrive\Desktop\claude-website"
   ```
2. Confirm env file exists:
   ```powershell
   Get-Content .env.local
   ```
   Expected line:
   ```
   VITE_PIXEL_AGENTS_URL=http://127.0.0.1:3100?token=...
   ```
   The current file contains:
   ```
   VITE_PIXEL_AGENTS_URL=http://127.0.0.1:3100?token=c78ed903-5d2e-433b-8a16-4605c50a3c9d
   ```

## 2. Install dependencies (once)

```powershell
npm install
```

## 3. Start the dev server

```powershell
npm run dev
```

Vite will start on `http://127.0.0.1:5173` (strict port).  
Dev server config: `vite.config.ts` → `server.host = '127.0.0.1'`, `port = 5173`.

Wait for output: `Local: http://127.0.0.1:5173/`.

## 4. Open the dashboard UI

1. Open a browser to `http://127.0.0.1:5173`
2. The app title is **Ops OS** (`index.html` → `<title>Ops OS</title>`)
3. In the left sidebar (`src/components/Sidebar.tsx`), the default active view is **Dashboard**.
   - Sidebar groups:
     - MAIN → Dashboard
     - WORKFLOW → Automations, Backend
     - LIBRARY → SOP Library
     - AGENTS → Agent Setup
4. The main pane shows:
   - Top bar with title and reachability status for `VITE_PIXEL_AGENTS_URL`
   - `IframePanel` loading the Pixel Agents URL from env
   - `AgentActivityPanel` on the right

The Dashboard view is rendered when `active === 'dashboard'` in `src/App.tsx`:
```tsx
{active === 'dashboard' && url && (
  <div style={{ flex: 1, display: 'flex' }}>
    <div style={{ flex: 1 }}>
      <IframePanel url={url} />
    </div>
    <AgentActivityPanel />
  </div>
)}
```

## 5. Verify connectivity

- TopBar displays a reachability indicator; App checks `HEAD` to the base URL every 10s.
- If `VITE_PIXEL_AGENTS_URL` is missing, the UI shows:
  > VITE_PIXEL_AGENTS_URL not set in .env.local
  > Create .env.local with VITE_PIXEL_AGENTS_URL=http://127.0.0.1:3100?token=…

## 6. Common issues

- Port in use: Vite config uses `strictPort: true`. Stop any process on 5173 or change port in `vite.config.ts`.
- Iframe not loading: Ensure Pixel Agents is running at `http://127.0.0.1:3100` and the token in `.env.local` is valid.
- Blank page: Check browser console for `VITE_PIXEL_AGENTS_URL` error; restart dev server after changing `.env.local`.

## 7. Stop server

In the PowerShell window running Vite, press `Ctrl+C`.

---

**Last updated:** 2026-10-31  
**Repo:** `C:\Users\John Michael\OneDrive\Desktop\claude-website`  
**App entry:** `src/main.tsx` → `src/App.tsx`  
**Env example:** `.env.local.example`
