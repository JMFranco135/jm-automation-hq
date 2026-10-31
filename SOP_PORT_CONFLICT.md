# SOP: Vite Port 5174 In Use

## Problem
`npm run dev` fails with:
```
Error: Port 5174 is already in use
```

## Root Cause
A previous Vite dev server or Node process is still bound to 127.0.0.1:5174. `vite.config.ts` has `server.strictPort: true`, so Vite will not fall back to another port.

## Quick Fix
1. Find process using port:
   ```powershell
   Get-NetTCPConnection -LocalPort 5174 | Select-Object -Property LocalAddress, LocalPort, State, OwningProcess
   ```
2. Identify process:
   ```powershell
   Get-Process -Id <OwningProcess>
   ```
3. Stop it:
   ```powershell
   Stop-Process -Id <OwningProcess> -Force
   ```
4. Start dev server:
   ```powershell
   npm run dev
   ```

## Automated Fix
Use the clean script that kills the port holder first:
```powershell
npm run dev:clean
```
This checks if 5174 is in use, force-stops the owning process, then launches Vite.

## Prevention
- Always close the terminal window after `npm run dev` finishes, or press Ctrl+C to stop gracefully.
- If you frequently hit this, consider changing `vite.config.ts` server options:
  ```ts
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: false, // will auto-increment to 5175, 5176, etc.
  }
  ```
  Note: this changes the URL you must open.

## Verification
After starting, you should see:
```
VITE v5.4.21  ready in XXX ms
Local:   http://127.0.0.1:5174/
```
Dashboard loads at http://127.0.0.1:5174/ with Ops OS UI and right side Agent Activity panel.
