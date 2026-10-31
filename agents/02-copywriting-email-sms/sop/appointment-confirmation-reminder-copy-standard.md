# Appointment Confirmation & Reminder Copy Standard

Oct 31, 2026 · @Day

## How to use this

Every client gets the same seven-touch sequence. Only the bracketed lines and the custom values change from client to client.

- **`{{double braces}}`** are GHL merge tags and custom values. GHL fills them in when the message sends, so leave them as they are.
- **`[BRACKETS]`** are lines we write for each client during the build, using the client's own words from the onboarding form. Replace the whole thing, brackets included.
- **The sequence:** confirmation (email + SMS), then 24-hour (email + SMS), then 3-hour (email + SMS), then 30-minute (SMS only).

These rules come from the patterns we've settled on across recent client builds. Where a client has asked for something different, their request wins. Note it in their build file.

## Brand name and tone

Use the name the customer knows, and write like a person on the client's team, not like a booking system.

**Brand name**

- Use the customer-facing brand (the DBA), not the legal entity. For example, use "Reclaim Space Co", not "Jukin Junk LLC".
- The legal name appears only where compliance requires it: Terms of Service, Privacy Policy, the A2P consent line, and the footer.
- Store the brand name once as the custom value `{{custom_values.business_name}}` so every template pulls the same spelling.
- Sign off every SMS as the company (`- {{custom_values.business_name}}`). Write in the owner's first person ("Marc here") only if the texts actually send from the owner's own number.

**Tone**

- Plainspoken and trust-first. Say what will happen at the appointment in plain terms, with no hype.
- Every message carries one useful thing, such as a prep tip, what to expect, or how to reach us. A message that only restates the time reads as automated.
- Never repeat the same hook twice in one sequence. Each touch gets its own point (see "What each touch is for").
- Never use "free". Use "complimentary", "no-cost" or "no-obligation" instead.
- No outcome or results claims, no testimonials, and no pressure language ("spots are filling up") unless the client has approved them in writing.
- Never write "we're on our way" in an automated message. The workflow can't know where the team is.

**SMS formatting**

- Plain ASCII only: straight quotes, regular hyphens, no em dashes, no curly apostrophes, no emoji. Any one of these switches the text to Unicode, which cuts a segment from 160 to 70 characters and roughly doubles the cost.
- Aim for 1 to 2 segments (320 characters or fewer with real names and times filled in).

## Appointment type wording

In customer-facing email and SMS, call it "your appointment" (or "your \[Business Name\] appointment"). Keep the full appointment name on the calendar and landing page.

**Why "appointment" in messages:** the calendar name tends to change during a build ("No-Cost Steam Cleaning Estimate" became "Estimate" and then "Appointment"). If a message hard-codes the name, every template has to be edited each time it changes. "Appointment" never goes stale and reads like a person talking.

**Naming the calendar itself** (this still matters for the calendar, the landing page and the ads):

| If the first meeting... | Use a word like | Example |
| --- | --- | --- |
| Prices a job with a knowable scope | Estimate, Quote | Moving Job Estimate |
| Looks at the property or space before pricing | Assessment, Walkthrough | Property Assessment & Quote |
| Is a conversation to see if the service fits | Consultation | Complimentary Consultation |
| Reviews the client's business or systems before anything is priced | Audit, Review | Systems Audit Call |

- Use the client's own word for what happens. If the ad script or sales script names it, match that.
- "Complimentary" or "No-Cost" only goes in the name if the first meeting really costs nothing. Confirm this against the sales script.
- If a client wants the specific name in messages, create a custom value `{{custom_values.appointment_type}}` and use it in place of "appointment". A rename then updates every message in one place.
- **Location-neutral wording:** if the appointment can be in person, by phone or on Zoom, avoid "visit", "call" and "come by" in shared templates.

## Placeholders and merge tags

Use only the tags below, and run a test booking in each new sub-account to confirm they fill in before the workflow goes live.

**GHL merge tags (filled automatically)**

| Tag | Fills in | Use it in |
| --- | --- | --- |
| `{{contact.first_name}}` | Lead's first name | Every greeting |
| `{{appointment.start_time}}` | Full date and time | Confirmation (email + SMS) |
| `{{appointment.only_start_date}}` | Date only | Email detail boxes |
| `{{appointment.only_start_time}}` | Time only | 24h, 3h, 30m ("tomorrow at...", "today at...") |
| `{{appointment.meeting_location}}` | Location set on the calendar | Office, clinic or video-link appointments |
| `{{contact.address1}}` | Address the lead entered | Mobile services where we go to the customer (only if the booking form collects an address) |
| `{{appointment.add_to_google_calendar}}` | Google Calendar link | Confirmation email only |
| `{{appointment.add_to_ical_outlook}}` | Apple / Outlook link | Confirmation email only |

**Custom values (set once per sub-account under Settings > Custom Values)**

| Custom value | Example |
| --- | --- |
| `{{custom_values.business_name}}` | California Steam Co |
| `{{custom_values.business_phone}}` | (714) 922-5653 |
| `{{custom_values.appointment_type}}` (optional) | Property Assessment & Quote |

GHL builds the key from the name you give the custom value. Check the key it actually generates and match the templates to it.

**Tags we've used by mistake (don't use)**

- `{{customer.name}}` and `{{business.name}}` are not GHL tags and send blank or as literal text.
- `{{appointment.meeting.location}}` is a typo. The correct tag uses an underscore: `{{appointment.meeting_location}}`.
- Don't use `{{contact.full_name}}` in greetings. First name reads warmer and keeps SMS shorter.

**Left out by default:** reschedule and cancel links. Clients have repeatedly asked to remove them, so customers call or text the business number instead. Add `{{appointment.reschedule_link}}` only if a client asks for it.

## What each touch is for

Yes, the 24-hour and 3-hour reminders should differ. The 24-hour reminder is the last point where the lead has time to prepare. The 3-hour reminder is same-day logistics. If both say the same thing, the second one reads as spam.

| Touch | Its job | The one useful thing it carries | Opt-out line |
| --- | --- | --- | --- |
| Confirmation (email + SMS) | Lock it in | What will happen at the appointment, plus calendar links (email) | Yes, "Reply STOP to opt out" |
| 24 hours (email + SMS) | Prepare | One or two things to have ready (access, documents, the areas to look at) | Only if the A2P sample messages show it |
| 3 hours (email + SMS) | Same-day logistics | Where to go or how we'll arrive, plus one thing to have in mind | Only if the A2P sample messages show it |
| 30 minutes (SMS) | Last nudge | An easy out if they're running late | No |

- **Email vs. SMS at the same touch:** the email carries the detail, and the SMS is the short version.
- **The 3-hour email is optional.** Many people don't check email on the day of an appointment, so keep it to a few lines. Skip it for clients who want less volume; the 3-hour SMS does the real work.
- **Calendar links go in the confirmation email only.** They've already done their job by the 24-hour touch.
- **The "Reply STOP to opt out" line** must appear on the first text. The reminders go to the same opted-in contact. Match whatever the client's A2P campaign samples show.

## Example templates

The email copy goes into the client's branded HTML shell (table layout, inline styles, logo and calendar badges hosted in the GHL Media Library). SMS is ready to paste. Each bracketed line has an example; rewrite it in the client's own words.

With sample data filled in (a 7-letter first name, "California Steam Co", a full date and time), every SMS below comes to 197 to 277 characters, which is 2 segments, all plain ASCII.

### 1. Confirmation email (sends immediately)

- **Subject:** You're confirmed, {{contact.first\_name}}: {{appointment.start\_time}}
- **Preview text:** Your appointment details and calendar links are inside.

```text
Hi {{contact.first_name}},

You're all set. Here are your appointment details:

Date: {{appointment.only_start_date}}
Time: {{appointment.only_start_time}}
Location: {{appointment.meeting_location}}

WHAT TO EXPECT
[2-3 sentences, in the client's words, on what actually happens.
Ex: We'll look the space over, walk you through what it would take,
and give you a clear price. No pressure to decide on the spot.]

BEFORE WE MEET
[1-2 prep items specific to this service.
Ex: Jot down any spots or problem areas you want us to look at.]

Add it to your calendar so it doesn't slip:
Google Calendar: {{appointment.add_to_google_calendar}}
Apple / Outlook: {{appointment.add_to_ical_outlook}}

If anything changes, call or text us at {{custom_values.business_phone}}.

See you soon,
{{custom_values.business_name}}
```

### 2. Confirmation SMS (sends immediately)

```text
Hi {{contact.first_name}}, you're confirmed for your appointment with {{custom_values.business_name}} on {{appointment.start_time}} at {{appointment.meeting_location}}. Check your email for what to expect and your calendar links. See you soon! Reply STOP to opt out.
- {{custom_values.business_name}}
```

### 3. 24-hour reminder email

- **Subject:** See you tomorrow at {{appointment.only\_start\_time}}
- **Preview text:** A quick reminder, plus one thing that helps us make the most of your time.

```text
Hi {{contact.first_name}},

Quick reminder: your appointment with {{custom_values.business_name}} is tomorrow.

Date: {{appointment.only_start_date}}
Time: {{appointment.only_start_time}}
Location: {{appointment.meeting_location}}

ONE THING THAT HELPS
[The single most useful prep step, with the reason.
Ex: If you can, clear a path to the areas you'd like us to look at.
It lets us spend the time on your questions instead of moving things.]

WHAT WE'LL COVER
[2-3 short bullets in the client's words.
Ex: - A look at the areas you're concerned about
    - What we'd recommend and why
    - A clear price, with no obligation]

Questions before then? Call or text {{custom_values.business_phone}}.

See you tomorrow,
{{custom_values.business_name}}
```

### 4. 24-hour reminder SMS

```text
Hi {{contact.first_name}}, just a reminder that your appointment with {{custom_values.business_name}} is tomorrow at {{appointment.only_start_time}}. [One-line prep tip. Ex: Please make sure we can easily get to the areas you'd like us to look at.] Questions? Call or text {{custom_values.business_phone}}.
- {{custom_values.business_name}}
```

### 5. 3-hour reminder email (optional, keep it short)

- **Subject:** Today at {{appointment.only\_start\_time}}
- **Preview text:** Everything you need for today in one place.

```text
Hi {{contact.first_name}},

We're on for today at {{appointment.only_start_time}}.
Location: {{appointment.meeting_location}}

[One same-day logistics line.
Ex (office): Parking is in the lot behind the building. Check in at the front desk.
Ex (mobile): We'll arrive in a marked van. Please make sure someone is there to let us in.]

Running behind? Call or text {{custom_values.business_phone}} and we'll work around you.

{{custom_values.business_name}}
```

### 6. 3-hour reminder SMS

```text
Hi {{contact.first_name}}, see you in about 3 hours, at {{appointment.only_start_time}}. [One thing to have in mind. Ex: Have the spots that bother you most in mind and we'll take a close look at those first.] Anything come up? Call or text {{custom_values.business_phone}}.
- {{custom_values.business_name}}
```

### 7. 30-minute reminder SMS

```text
Hi {{contact.first_name}}, almost time! Your appointment starts in about 30 minutes, at {{appointment.only_start_time}}. Running behind or need to push it back? Text us at {{custom_values.business_phone}} and we'll work around you.
- {{custom_values.business_name}}
```

**For mobile services** (we go to the customer): swap `{{appointment.meeting_location}}` for `{{contact.address1}}`, or write "at your location" if the booking form doesn't collect an address.

## Pre-launch checklist

Run through this for every client before the workflow goes live.

- [ ] Custom values `business_name` and `business_phone` are created in the sub-account, and the keys match the templates
- [ ] Every \[BRACKETED\] line is rewritten in the client's own words, with no brackets left
- [ ] Customer-facing copy uses the brand name, not the legal entity
- [ ] A search for "free" across all copy finds nothing
- [ ] SMS copy is plain ASCII: no em dashes, curly quotes or emoji
- [ ] The confirmation SMS includes "Reply STOP to opt out", and the reminders match the A2P campaign's sample messages
- [ ] The location tag is right for the business type (`meeting_location` for a fixed location, `contact.address1` for mobile)
- [ ] A test booking shows every merge tag filled in the email and SMS, with nothing blank and no literal `{{...}}`
- [ ] Logo and calendar badge images load from the GHL Media Library (not base64)
- [ ] Subject lines for the confirmation and 24-hour emails are clearly different, so the reminder doesn't get buried in the same thread
