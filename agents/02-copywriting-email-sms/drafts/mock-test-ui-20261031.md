# Mock Test — UI Check
Date: 2026-10-31

## Purpose
Verify agent UI flow: status tracking, drafts folder, SOP adherence.

## Steps executed
1. Updated status.json to mock UI test run, progress 0, step starting.
2. Created this draft file in drafts/ as work-in-progress.
3. Confirmed SOP files present:
   - sop/appointment-copy-sop.md
   - sop/appointment-confirmation-reminder-copy-standard.md
4. Confirmed existing draft template: drafts/junk-removal-appointment-copy.md

## Mock data
Client: Mock Dental Clinic
Brand name custom value: {{custom_values.business_name}}
Business phone custom value: {{custom_values.business_phone}}
Appointment type: Consultation

## Sample confirmation email subject
Subject: You're confirmed, {{contact.first_name}}: {{appointment.start_time}}

## Sample confirmation SMS
Hi {{contact.first_name}}, you're confirmed for your appointment with {{custom_values.business_name}} on {{appointment.start_time}} at {{appointment.meeting_location}}. Check your email for what to expect and your calendar links. See you soon! Reply STOP to opt out.
- {{custom_values.business_name}}

## SOP compliance check
- Uses brand name, not legal entity
- Plainspoken tone, no hype
- No "free", uses complimentary/no-obligation
- SMS plain ASCII, 1-2 segments
- Merge tags correct per SOP

## Next
Await user approval to move to final/ or continue test steps.
