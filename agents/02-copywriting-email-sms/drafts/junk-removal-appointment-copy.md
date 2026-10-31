# Junk Removal — Appointment Confirmation & Reminders
*Template only. No real client data. Built from agents/01-sales-scripts/final/junk-removal-sales-script.md using SOP appointment-copy-sop.md*

**Brand placeholders**
- `{{custom_values.business_name}}`
- `{{custom_values.business_phone}}`

**Service context from script**
- Appointment type: complimentary on-site estimate
- What happens: we come out to your home, walk the space with you, and give you the exact price and plan on the spot
- Prep themes: clear access to areas, note items for careful handling, reusable material sorting

---

## 1. Confirmation Email
Subject: You're confirmed, {{contact.first_name}}: {{appointment.start_time}}
Preview text: Your appointment details and calendar links are inside.

Hi {{contact.first_name}},

You're all set. Here are your appointment details:

Date: {{appointment.only_start_date}}
Time: {{appointment.only_start_time}}
Location: {{contact.address1}}

WHAT TO EXPECT
We'll arrive at your home, walk the space with you, and give you the exact price and plan on the spot. We keep as much reusable material out of the landfill as possible, show up when we say we will, and sweep the space clean before we leave. No pressure to decide on the spot.

BEFORE WE MEET
Jot down any spots or problem areas you want us to look at, and make sure we can access the areas you want cleared. If there are items you want handled carefully inside the home, note those so we can plan for them.

Add it to your calendar so it doesn't slip:
Google Calendar: {{appointment.add_to_google_calendar}}
Apple / Outlook: {{appointment.add_to_ical_outlook}}

If anything changes, call or text us at {{custom_values.business_phone}}.

See you soon,
{{custom_values.business_name}}

---

## 2. Confirmation SMS
Hi {{contact.first_name}}, you're confirmed for your appointment with {{custom_values.business_name}} on {{appointment.start_time}} at your location. Check your email for what to expect and your calendar links. See you soon! Reply STOP to opt out.
- {{custom_values.business_name}}

---

## 3. 24-Hour Reminder Email
Subject: See you tomorrow at {{appointment.only_start_time}}
Preview text: A quick reminder, plus one thing that helps us make the most of your time.

Hi {{contact.first_name}},

Quick reminder: your appointment with {{custom_values.business_name}} is tomorrow.

Date: {{appointment.only_start_date}}
Time: {{appointment.only_start_time}}
Location: {{contact.address1}}

ONE THING THAT HELPS
If you can, clear a path to the areas you'd like us to look at. It lets us spend the time on your questions instead of moving things.

WHAT WE'LL COVER
- A look at the areas you're concerned about
- How we handle reusable material and keep the space clean
- A clear price, with no obligation

Questions before then? Call or text {{custom_values.business_phone}}.

See you tomorrow,
{{custom_values.business_name}}

---

## 4. 24-Hour Reminder SMS
Hi {{contact.first_name}}, just a reminder that your appointment with {{custom_values.business_name}} is tomorrow at {{appointment.only_start_time}}. Please make sure we can easily get to the areas you'd like us to look at. Questions? Call or text {{custom_values.business_phone}}.
- {{custom_values.business_name}}

---

## 5. 3-Hour Reminder Email
Subject: Today at {{appointment.only_start_time}}
Preview text: Everything you need for today in one place.

Hi {{contact.first_name}},

We're on for today at {{appointment.only_start_time}}.
Location: {{contact.address1}}

We'll arrive in a marked van. Please make sure someone is there to let us in, and have the areas you want cleared accessible.

Running behind? Call or text {{custom_values.business_phone}} and we'll work around you.

{{custom_values.business_name}}

---

## 6. 3-Hour Reminder SMS
Hi {{contact.first_name}}, see you in about 3 hours, at {{appointment.only_start_time}}. Have the spots that bother you most in mind and we'll take a close look at those first. Anything come up? Call or text {{custom_values.business_phone}}.
- {{custom_values.business_name}}

---

## 7. 30-Minute Reminder SMS
Hi {{contact.first_name}}, almost time! Your appointment starts in about 30 minutes, at {{appointment.only_start_time}}. Running behind or need to push it back? Text us at {{custom_values.business_phone}} and we'll work around you.
- {{custom_values.business_name}}

---

*Notes*
- Uses "appointment" in messages per SOP; calendar name can be "Complimentary On-Site Estimate"
- Location uses {{contact.address1}} for mobile service
- No "free" used; "complimentary" / "no obligation" per SOP
- SMS is plain ASCII, 1-2 segments
