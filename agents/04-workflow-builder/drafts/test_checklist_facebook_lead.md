# Test Checklist: Facebook Lead Form → GHL Tag + Notification

**Workflow:** FB Lead Form → GHL New Lead + Notify
**Test Date:** 2026-10-31
**Test Data:** Sample mock data

## Test Sample Data

### Test Case 1: Valid New Lead
```json
{
  "first_name": "Maria",
  "last_name": "Santos",
  "email": "maria.santos@test.com",
  "phone": "09171234567",
  "form_id": "fb_form_12345",
  "page_id": "fb_page_67890",
  "timestamp": "2026-10-31T12:00:00Z"
}
```

### Test Case 2: Missing Email
```json
{
  "first_name": "Juan",
  "last_name": "Dela Cruz",
  "email": "",
  "phone": "09181234567",
  "form_id": "fb_form_12345",
  "page_id": "fb_page_67890",
  "timestamp": "2026-10-31T12:05:00Z"
}
```

### Test Case 3: Duplicate Email
```json
{
  "first_name": "Maria",
  "last_name": "Santos",
  "email": "maria.santos@test.com",
  "phone": "09171234567",
  "form_id": "fb_form_12345",
  "page_id": "fb_page_67890",
  "timestamp": "2026-10-31T12:10:00Z"
}
```

## End-to-End Test Steps

### Step 1: Webhook Reception
- [ ] Trigger test lead submission
- [ ] Verify webhook receives payload
- [ ] Check all required fields present
**Expected:** 200 OK response, payload logged

### Step 2: Parse & Validate
- [ ] Test Case 1: Valid data → Pass validation
- [ ] Test Case 2: Missing email → Reject with error tag
- [ ] Test Case 3: Duplicate → Flag as duplicate
**Expected:** Validation rules applied correctly

### Step 3: GHL Contact Creation/Update
- [ ] Test Case 1: Create new contact
- [ ] Verify first_name, last_name, email, phone saved
- [ ] Verify custom fields: Lead Source, Form ID, Lead Date
**Expected:** Contact created in GHL with correct data

### Step 4: Tag Application
- [ ] Verify tags applied: `new lead`, `facebook lead`, `lead source: facebook ads`
- [ ] Check tags visible in GHL contact
**Expected:** All three tags present

### Step 5: Internal Notification
- [ ] Verify notification draft generated
- [ ] Check message contains all lead details
- [ ] Verify subject line format correct
**Expected:** Message ready to send to client team

## Test Results

| Test Case | Step 1 | Step 2 | Step 3 | Step 4 | Step 5 | Status |
|-----------|--------|--------|--------|--------|--------|--------|
| Valid New Lead | [ ] | [ ] | [ ] | [ ] | [ ] | Pass/Fail |
| Missing Email | [ ] | [ ] | [ ] | [ ] | [ ] | Pass/Fail |
| Duplicate Email | [ ] | [ ] | [ ] | [ ] | [ ] | Pass/Fail |

## Notes
- Use Facebook Test Form for submission
- Check GHL API logs for errors
- Verify phone normalization to E.164
- Test with real Facebook webhook if available
