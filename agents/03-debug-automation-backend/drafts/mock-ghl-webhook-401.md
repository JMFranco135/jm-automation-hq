# Mock Debug Task: GHL → Make Webhook 401 Unauthorized

## Scenario
Local service business client (Home Services niche) has a GoHighLevel workflow that triggers on new contact created → sends webhook to Make.com scenario → creates lead in Google Sheets.

## Error Reported
Make webhook module shows:
`401 Unauthorized - Invalid API token`
GHL Workflow History shows: `Webhook request failed with status 401`

Timestamp: 2026-10-29 22:15 UTC
Frequency: 100% of new contacts since 2026-10-28

## Logs provided
GHL Workflow Log:
```
POST https://hook.make.com/abc123xyz
Headers: 
  X-API-Key: {{API_KEY}}
  Content-Type: application/json
Response: 401 Unauthorized
Body: {"error":"Invalid token","code":401}
```

Make Webhook Incoming Requests log shows no requests received.

## Initial Check
SOPs/prompts empty, working from CLAUDE.md process.

## Likely Causes (ranked)
1. API key rotated/changed in Make but not updated in GHL webhook header
2. Header name mismatch - Make expects `Authorization: Bearer {{TOKEN}}` not `X-API-Key`
3. Private app token in GHL expired/revoked after 2026-10-28
4. Make scenario paused or webhook URL changed

## Next Step
Need to verify actual header name expected by Make connection and confirm token validity.
