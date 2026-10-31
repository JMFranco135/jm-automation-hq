# Mock Test 2 — Status Update Flow
Date: 2026-10-31

## Purpose
Test status.json progression and drafts creation.

## Step 1: Init
- status.json set to progress 0, step starting
- Mode manual, needsApproval false

## Step 2: Create draft
This file created as work-in-progress.

## Mock client profile
Niche: Junk removal
Brand: Reclaim Space Co
Phone: {{custom_values.business_phone}}
Location type: Mobile service -> use {{contact.address1}}

## SOP check points exercised
- Seven-touch sequence: confirmation, 24h, 3h, 30m
- Brand name usage
- SMS ASCII only
- No "free"
- Merge tags correct

## Sample 24-hour reminder SMS
Hi {{contact.first_name}}, just a reminder that your appointment with {{custom_values.business_name}} is tomorrow at {{appointment.only_start_time}}. Please make sure we can easily get to the areas you'd like us to look at. Questions? Call or text {{custom_values.business_phone}}.
- {{custom_values.business_name}}

## Step 3: Update status
Progress will move to 50% upon draft completion.

## Notes
Ready for approval to finalize or continue testing.
