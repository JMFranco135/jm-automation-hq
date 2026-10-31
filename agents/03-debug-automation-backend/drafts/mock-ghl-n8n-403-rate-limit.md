# Mock Debug Task: GHL → n8n Webhook 403 Forbidden - Rate Limit

## Scenario
Local service business client (Landscaping niche) has a GoHighLevel workflow that triggers on new contact created → sends webhook to n8n webhook node → enriches lead with Clearbit API → adds to HubSpot.

## Error Reported
n8n webhook node logs show:
`403 Forbidden - Rate limit exceeded`
GHL Workflow History shows: `Webhook request failed with status 403`
Timestamp: 2026-10-31 21:40 UTC
Frequency: Intermittent, ~30% of new contacts since 2026-10-31 20:00

## Logs provided
GHL Workflow Log:
```
POST https://n8n.example.com/webhook/landscaping-leads
Headers: 
  Authorization: Bearer {{N8N_WEBHOOK_TOKEN}}
  Content-Type: application/json
Response: 403 Forbidden
Body: {"error":"Rate limit exceeded","code":403,"retryAfter":60}
```

n8n Execution log:
```
Incoming request received at 21:40:12
Rate limiter: 120 requests / minute threshold exceeded
Current count: 143 requests in last 60s
Webhook rejected before processing
```

## Initial Check
SOPs/prompts empty, working from CLAUDE.md process.

## Likely Causes (ranked)
1. n8n rate limiter configured at 120/min but GHL workflow firing bursts on bulk import
2. Webhook token is correct but n8n instance hitting global API rate limits
3. Multiple GHL workflows pointing to same n8n webhook URL causing duplicate hits
4. n8n webhook node not configured with proper queue mode for high volume

## Next Step
Need to verify n8n rate limiter settings and GHL workflow trigger volume. Proposed smallest fix: add delay queue in GHL or increase n8n rate limit with proper backoff.

## Test Plan
1. Check n8n rate limiter settings in webhook node
2. Monitor GHL workflow trigger frequency during peak
3. Implement fix with test contact
4. Verify 200 OK and n8n execution completes
