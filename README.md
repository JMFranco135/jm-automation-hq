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
Open http://127.0.0.1:5174

Default view is Obsidian Graph. Sidebar → LIBRARY → Obsidian Brain opens the live vault graph.

## Notes
- Everything binds to 127.0.0.1 only.
- Never commit `.env.local`.
- Add SOPs under `/sops` as Markdown.
- Agents live in `agents/` at project root. Display names come from the first `# heading` in each agent's CLAUDE.md. Folder names are permanent for Pixel Agents and start commands.

## Agent status
The right Agent Activity panel always shows four fixed cards: Scripter, Copywriter, Fixer, Architect.
Status rules:
- GREEN ACTIVE: open session with a task given and activity within last 5 minutes
- ORANGE IDLE: task given but no activity for >5 min and ≤30 min
- RED INACTIVE: no session, no task yet, no activity >30 min, or no claude.exe running

Constants in `src/config.ts`:
- `ACTIVE_WINDOW_MIN = 5`
- `INACTIVE_AFTER_MIN = 30`
- `TICK_MS = 5000`
- `PROCESS_NAME = 'claude.exe'`

Colors are CSS variables in `src/theme.css`: `--status-active`, `--status-idle`, `--status-inactive`.

Data source: Claude Code session files `C:\Users\John Michael\.claude\projects\<folder>\*.jsonl` with folder names derived by replacing non-alphanumerics with `-`. The backend reads last 64 KB, uses the most recent session, tracks user prompts as tasks and tool actions/sub-agent work as activity, and pushes updates via Server-Sent Events from `/api/agents/status-stream`. Fallback polling is 2 s when SSE fails; pauses when tab hidden.

Card content:
- Task = first line of newest user prompt, sanitized and truncated to 100 chars
- Action = friendly wording: Reading <file>, Editing <file>, Running a command, Searching files, Searching the web, Running a sub-agent, Thinking, Waiting for your next task, No active session
- Time = last activity in en-US local format
Never show file contents, full paths, or command text.

## Intake Redactor
Client onboarding forms go to `C:\intake\raw`. The script watches every 2s, redacts sensitive fields by question keywords and patterns, and writes redacted files to `agents/01-sales-scripts/inputs/`. Raw files move to `C:\intake\processed` on success or `C:\intake\quarantine` on safety failure.

Run `npm run intake` to watch, `npm run intake -- --once` to process once. Settings are at top of `tools/redact-intake.mjs`: keyword list, KEEP_BUSINESS_NAME flag, folders.

Never paste raw forms into the dashboard. Agents only read redacted files from inputs/.
