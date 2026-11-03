# Prompts: Test 2, dashboard stat

Issue #25. Given I have 3 assignments due this week (2 done, 1 not done) and 1 due next week, when I open the dashboard, then "Due this week" shows 3 and "% completed this week" shows 67%.

## Key prompts and decisions
- Write the dashboard test from PLAN.md section 4 as its own PR (I chose two separate test PRs).
- Test the same `computeStats()` function the dashboard page uses, with "today" fixed at Tue Nov 3, 2026, so the result never depends on what day the test runs.
- Added two small edge cases: Sunday counts as the same week (weeks start Monday), and a week with nothing due shows "—" instead of a percentage.
- For the red run, break the code with a realistic bug: **forgetting to filter to "this week"**.

## What the test does (plain English)
It gives `computeStats` four assignments: Monday (done), Thursday (done), Friday (not done), and the next Tuesday (not done), with today set to Tuesday Nov 3. Then it checks:
1. "Due this week" = **3** and "% completed this week" = **67%** (2 of 3), because next week's assignment must be left out.
2. A Sunday Nov 8 assignment still counts as this week.
3. With only next week's assignment, "Due this week" = 0 and the percentage is empty (the dashboard shows "—").

## Red, then green
- **Break** (in `lib/stats.ts`, not committed): `const thisWeeks = assignments; // TEMP BREAK: forgot to filter to this week`
- **Red:** 2 failed, 1 passed. "expected 4 to be 3": next week's assignment was counted as this week. The empty-week check also failed ("expected 1 to be 0"). The Sunday check passed, because with one assignment the missing filter doesn't change anything. The test stops at the first wrong number, so it reported 4 vs 3 and never reached the 67% check (which would have been 50%).
- **Undo:** restored the `.filter((a) => weekStartOf(a.due_date) === thisWeek)` line. `git diff` showed `lib/stats.ts` back to its committed version.
- **Green:** 3 passed. With both test files: 8 passed.

## What would break it
Removing or getting wrong the "only this week" filter in `computeStats` (or starting weeks on Sunday instead of Monday) would make "Due this week" count the wrong assignments and fail this test.
