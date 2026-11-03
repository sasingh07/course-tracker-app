# Prompts: Feature 8, estimated hours (my feature #1)

Issue #17. User story: As a student, I want to enter how many hours I expect each assignment to take, so that I can see my real workload per week, not just how many things are due.

## Key prompts and decisions
- Add the `estimated_hours` column that PLAN.md section 3 saved for this feature. Show hours on the form, list, detail page, and dashboard.
- Allowed values: I chose **(a) whole or half hours from 0.5 to 100**. It's optional, so assignments without an estimate are fine.
- Chart: I chose **(a) an `Assignments | Hours` toggle**, so I keep both views.

## What was built
- `supabase/migrations/0004_estimated_hours.sql`: adds `estimated_hours` (number) to `assignments`. The database also rejects values outside 0.5–100 or not in half-hour steps.
- `lib/validation.ts`: new `validateHours` rule with friendly messages ("Please enter between 0.5 and 100 hours.", "Please use whole or half hours, like 2 or 1.5.").
- New / Edit form: "Estimated hours" field next to Type and Due date.
- List shows hours (e.g. "3h"). The detail page has an "Estimated" field.
- Dashboard: a 4th card, **Hours due this week**, and an `Assignments | Hours` toggle on the weekly chart. Assignments without an estimate count as 0 hours.

## Checked
- Ran the math and the rule on sample data: 2.5h (done) + 4h + blank, all due this week → "Hours due this week" = 6.5, with 2.5 done / 4 not done in that week's bar. Rule: "", 2, 1.5, 0.5, 100 accepted; 0, 101, 2.3, "abc" rejected with the right messages.

## Manual test (local, as the test user)
- Edited "Final project": 300 → "Please enter between 0.5 and 100 hours."; 2.3 → "Please use whole or half hours, like 2 or 1.5."; 8 → saved, and the detail page shows "Estimated 8h".
- List row shows "8h".
- Dashboard: 2×2 cards with "Hours due this week" = 0h (nothing due this week). Chart toggle → Hours shows an 8-hour bar in the week of Nov 30.
