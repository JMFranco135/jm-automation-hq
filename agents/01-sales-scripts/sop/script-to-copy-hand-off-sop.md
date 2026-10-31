# Script → Copy Hand-off SOP

## Purpose
Define the exact workflow from intake form → approved sales script → copywriter email/SMS creation. Ensures the Copywriter agent always works from approved final scripts, never drafts.

## Roles
- **Scripter agent** (`01-sales-scripts`): creates qualifier sales scripts from redacted intake forms
- **Copywriter agent** (`02-copywriting-email-sms`): creates appointment confirmation and reminder email/SMS sequences based on approved scripts

## Workflow

### 1. Intake
- Form uploaded to `01-sales-scripts/inputs/`
- Must start with REDACTED FORM header and contain no email, phone, EIN, or 7+ digit numbers
- If invalid, stop and ask user to run through intake redactor first

### 2. Draft script
- At task start, update `01-sales-scripts/status.json`:
```json
{
  "task": "short description",
  "progress": 0,
  "step": "starting",
  "needsApproval": false,
  "message": "",
  "mode": "manual",
  "updatedAt": "ISO timestamp"
}
```
- Read relevant files in `prompts/`, `sop/`, `docs/`, `resources/`
- Create draft in `01-sales-scripts/drafts/`
- Update status.json after each step, increment progress 0-100
- When draft is ready, set `needsApproval: true` and message with draft file path

### 3. Review & Approve
- User reviews draft
- On approval, Scripter:
  - Moves file to `01-sales-scripts/final/`
  - Adds header block:
    ```
    Client:
    Niche:
    Offer:
    Approved Date:
    Source SOP:
    ```
  - Updates `final/INDEX.md` with row: File | Niche | Offer | Client | Approved Date | Notes
  - Updates status.json: progress 100, step "approved", needsApproval false

### 4. Copywriter picks up
- Copywriter agent reads `01-sales-scripts/final/INDEX.md` to discover approved scripts
- Reads the referenced final script for blanks, niche, offer, and SOP context
- Creates copy drafts in `02-copywriting-email-sms/drafts/` using SOP `appointment-copy-sop.md`
- Updates its own `status.json` with needsApproval true when draft is ready
- On approval, moves to `02-copywriting-email-sms/final/`

## Naming conventions
- Sales scripts: `niche-offer-script.md` e.g. `junk-removal-sales-script.md`
- Copy drafts: `niche-appointment-copy.md` e.g. `junk-removal-appointment-copy.md`

## Do not
- Never edit dashboard source code or files outside agent folder
- Never put real API keys, passwords, or client secrets in files; use placeholders {{API_KEY}}
- Never auto-continue past a step without explicit approval; manual mode is default
- Save work-in-progress to drafts/, approved output to final/

## Status tracking
- Always update status.json after each step
- If step needs approval, set needsApproval true with clear message
- Never auto-continue past approval step
