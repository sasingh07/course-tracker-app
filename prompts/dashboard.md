# Prompts: Feature 7, dashboard

Issue #15. User story: As a student, I want a chart of assignments due per week plus summary stats (due this week, % completed this week, busiest upcoming week), so that I can spot crunch weeks in my weekly check-in.

## Key prompts and decisions
- Build a `/dashboard` page with 3 stat cards and a bar chart of assignments due per week, using Recharts (from PLAN.md). Keep the math in its own file so the dashboard test (Test #2) can check it directly.
- Week start: I chose **(a) Monday**, since I plan at the start of the week.
- Chart range: I chose **(b) the whole semester** (Aug 24 – Dec 18, 2026), including past weeks.

## What was built
- `lib/stats.ts`: `computeStats(assignments, today)` returns:
  - **Due this week**: assignments due Monday–Sunday of the current week.
  - **Completed this week**: done ÷ due this week, rounded (e.g. 2 of 3 → 67%). Shows "—" when nothing is due.
  - **Busiest upcoming week**: the week from this week onward with the most assignments due (the earliest wins a tie).
  - **Weeks**: one bar per week for the semester, split into done / not done.
- "Today" uses Berkeley's time zone (America/Los_Angeles), not the server's. Vercel's servers run on UTC, so Sunday night in California would otherwise count as Monday.
- `app/dashboard/page.tsx`: stat cards + chart. `weekly-chart.tsx`: stacked bars (green = done, indigo = not done), a dashed "This week" line, and a hover tooltip.
- "Dashboard" link added to the top bar.

## Checked while building
- Ran the math on sample data before building the page: 3 assignments due this week with 2 done → "Due this week" = 3 and 67%. That matches Test #2 in PLAN.md.
- First version of the chart had unevenly spaced week labels (Oct 5 and Oct 12 bunched together). Changed it to label every other week.

## Manual test (local, as the test user)
- Two test assignments (Nov 20 done, Dec 1 not done) → Due this week 0, Completed "—" (nothing due this week), Busiest upcoming week = Week of Nov 16 (1).
- Chart: green bar at Nov 16, indigo bar at Nov 30. Hover → "Week of Nov 16 · Done: 1 · Not done: 0". No console or server errors.
