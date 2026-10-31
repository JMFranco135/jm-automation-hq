# Security Guidelines — Handling Client Data in Sales Scripts

**Scope:** All work in agents/01-sales-scripts for real clients.

## Principles
- Never store real PII in scripts, SOPs, or templates.
- Work inside agent folder only. Never edit dashboard source or files outside your folder.
- Practical and ready to use, but safe by default.

## What is prohibited
- Real API keys, passwords, client secrets. Use placeholders like {{API_KEY}}.
- Real client emails, phone numbers, names, addresses, lead IDs, ad account data.
- Screenshots of CRM with real data.
- Pasted conversation logs containing identifiable client info.

## Safe workflow
1. Pseudonymize before sharing
   - Names → Client_A, Lead_123
   - Emails → a***@example.com
   - Phones → ***-***-1234
   - Keep mapping locally, never in repo.

2. Use placeholders in all templates
   - [NAME], [EMAIL], [PHONE], [BUSINESS], [CITY]
   - Never fill with real data in SOPs or drafts.

3. File locations
   - Work-in-progress → drafts/
   - Approved output → final/
   - SOPs → sop/
   - Examples → resources/ with fake personas only.

4. Status tracking
   - Update status.json with task progress only.
   - Do not put PII in `message` or `step` fields.

5. Commands
   - Before running commands that delete or overwrite files, ask first.
   - Only work inside your own agent folder.

6. Secrets handling
   - Store secrets in a secure vault outside this folder.
   - Reference them as {{SECRET_NAME}} in configs.

7. Review before sharing
   - Scan any pasted script/sample for real data.
   - Replace with fake examples if needed.

## Checklist before saving a file
- [ ] No real names/emails/phones/addresses
- [ ] Placeholders used instead of real values
- [ ] No API keys or secrets
- [ ] File is in correct folder per SOP
- [ ] Status.json updated, no PII in messages

## If you need to process live client data
- Process in GoHighLevel/Zapier/n8n/Make with proper access controls
- Do not paste live data into chat
- Use test/sandbox data for script testing

Violations: Flag immediately and remove the file. When in doubt, redact.
