# Ops OS

Local CRM-style dashboard with Pixel Agents embedded.

## Start Pixel Agents
```bash
npx pixel-agents --port 3100
```
Copy the printed URL ending in `?token=...` into `.env.local` as:
```
VITE_PIXEL_AGENTS_URL=http://127.0.0.1:3100?token=YOUR_TOKEN_HERE
```
The token is also stored in `~/.pixel-agents/standalone-token`.

## Start dashboard
```bash
npm install
npm run dev
```
Open http://127.0.0.1:5173

## Notes
- Everything binds to 127.0.0.1 only.
- Never commit `.env.local`.
- Add SOPs under `/sops` as Markdown.
- Agents live in `agents/` at project root. Display names come from the first `# heading` in each agent's CLAUDE.md. Folder names are permanent for Pixel Agents and start commands.

## Intake Redactor
Client onboarding forms go to `C:\intake\raw`. The script watches every 2s, redacts sensitive fields by question keywords and patterns, and writes redacted files to `agents/01-sales-scripts/inputs/`. Raw files move to `C:\intake\processed` on success or `C:\intake\quarantine` on safety failure.

Run `npm run intake` to watch, `npm run intake -- --once` to process once. Settings are at top of `tools/redact-intake.mjs`: keyword list, KEEP_BUSINESS_NAME flag, folders.

Never paste raw forms into the dashboard. Agents only read redacted files from inputs/.
