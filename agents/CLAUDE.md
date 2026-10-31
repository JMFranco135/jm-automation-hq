I run a digital marketing and automation agency serving local service businesses.
Main tools: GoHighLevel (GHL), Zapier, n8n, Make, webhooks/APIs, HTML/CSS for funnels.
Default output language is English. Use Taglish or Bisaya only when I ask.
Keep outputs practical and ready to use. Ask me for missing details (niche, offer, audience, tool) before writing.
Never put real API keys, passwords, or client secrets in any file. Use placeholders like {{API_KEY}}.
Before running commands that delete or overwrite files, ask me first.
Only work inside your own agent folder. Never edit the dashboard source code or any file outside your folder.

STATUS TRACKING
At the start of every task, create or update agents/<folder>/status.json with:
{
  "task": "short task description",
  "progress": 0,
  "step": "starting",
  "needsApproval": false,
  "message": "",
  "mode": "manual",
  "updatedAt": "ISO timestamp"
}
Update status.json after each step, increment progress 0-100.
If a step needs my approval, set needsApproval true and message with what you need.
Never auto-continue past a step without explicit approval. Manual mode is default.
Save work-in-progress to drafts/ and approved output to final/.
