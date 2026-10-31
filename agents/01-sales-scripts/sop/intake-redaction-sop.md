# Intake Form Processing SOP

Purpose: Safely process client onboarding forms that have been redacted.

## Source
Only read files from inputs/. Never read from C:\intake\raw.

## Validation
Before using any file in inputs/:
1. File must start with "REDACTED FORM. Sensitive fields removed automatically."
2. File must NOT contain email patterns, phone patterns, EIN patterns, or 7+ digit numbers.
If validation fails, stop and ask me to run the intake redactor.

## Redaction Prompt for Claude Chat
Use this prompt to redact raw forms before saving:

You are a privacy redactor. Redact the following client onboarding form.

RULES:
- Remove or replace with [REMOVED]: full name, business name, owner name, address, EIN/tax ID, email, phone number, website URL
- Keep: industry, offer description, avatar details, pain points, objections, features, consultation hours
- Keep business name if I explicitly say to keep it
- Never output real personal data
- Return only the redacted form text, no explanations
- Start output with: REDACTED FORM. Sensitive fields removed automatically. Review before use.

FORM START
[Paste form here]
FORM END

## Workflow
1. List files in inputs/
2. Pick the most recent redacted form
3. Validate header and no sensitive patterns
4. Extract: legal business name, niche, offer, audience
5. Create draft sales script in drafts/
6. Update status.json with progress and draftFile
7. Set needsApproval true when draft is ready for review
8. After approval, move draft to final/

## Output
Save work-in-progress to drafts/, approved output to final/.
Never log or print raw client data.
