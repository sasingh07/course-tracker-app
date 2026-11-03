# Prompts: Feature 9, crunch-week warning (my feature #2)

Issue #19. User story: As a student, I want any week with more than 15 estimated hours due to be flagged, so that I can start early on those weeks.

## Key prompts and decisions
- Flag weeks with **more than 15** estimated hours due (threshold from PLAN.md). Uses the hours from feature 8, so no database change.
- Where to warn: I chose **(a) the dashboard and a banner on the assignment list**, so I see it every time I open the app.
- Which hours count: I chose **(a) all hours due that week, done or not**, matching the plan's wording ("more than 15 estimated hours due").

## What was built
- `lib/stats.ts`: `CRUNCH_HOURS = 15`, `isCrunch(hours)`, and `upcomingCrunchWeeks(assignments, today)` (crunch weeks from this week onward, soonest first). Each chart week also gets a `crunch` flag.
- `components/crunch-banner.tsx`: "⚠ Crunch week ahead · Week of Nov 30: 16h due · More than 15 estimated hours. Start early!" Shown on the assignment list (with a "See dashboard" link) and on the dashboard. Hidden when there are no crunch weeks.
- Dashboard chart: crunch weeks' bars turn red, and the Hours view has a dashed red **15h** line.
- The banner always uses all assignments, even when search/filters narrow the list.

## Checked
- Sample data: a week at exactly 15h is **not** a crunch week, and 15.5h **is**. A past crunch week (Oct 19) is red on the chart but not in the "upcoming" warning.

## Manual test (local, as the test user)
- "Final project" at 8h → no banner.
- Changed it to 16h → the list shows "⚠ Crunch week ahead · Week of Nov 30: 16h due".
- Dashboard: same banner. Hours chart shows a red 16h bar above the dashed 15h line.
