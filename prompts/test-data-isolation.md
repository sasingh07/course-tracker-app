# Prompts: Test 1, data isolation

Issue #23. Given User A has a course and an assignment, when User B logs in and opens their assignment list, then User B sees none of User A's courses or assignments.

## Key prompts and decisions
- Write the data-isolation test from PLAN.md section 4 with Vitest, and prove it works with a red run and a green run.
- I chose **two separate PRs** (one per test).
- To make it fail on purpose, I chose to **temporarily add a permissive security rule in Supabase**, so the test checks the real database protection. The alternative was faking a failure inside the test.

## What the test does (plain English)
It logs in to the real Supabase database as two test users. User A creates a course and an assignment called "User A's private assignment". Then it checks:
1. A **can** see their own assignment (proves the setup worked).
2. B's assignment list does **not** include A's assignment.
3. B's course list does **not** include A's course.
4. B **cannot** open A's assignment directly by its id.
5. B **cannot** change A's assignment title.
At the end it deletes A's test course (which also deletes the assignment).

## Setup
- Installed Vitest. `npm test` runs the tests. `vitest.config.mts` reads the Supabase URL/key from `.env.local` and the test accounts from `.env.test.local` (git-ignored).
- Vitest needed newer Node.js type definitions, so `@types/node` went from 20 to 24 (dev-only).
- `test-b@example.com` is created automatically on the first run.

## Red, then green
- **Break** (pasted in Supabase): `create policy "TEMP BREAK: anyone can read assignments" on public.assignments for select using (true);`. This adds a second rule that lets any logged-in user *read* every assignment. Supabase allows a row if any rule allows it.
- **Red:** 2 failed, 3 passed. Checks 2 and 4 failed: B's list had 13 assignments (everyone's), and B received "User A's private assignment". Checks 3 and 5 still passed, because courses and editing weren't loosened.
- **Restore:** `drop policy "TEMP BREAK: anyone can read assignments" on public.assignments;`
- **Green:** 5 passed.

## What would break it
Removing or loosening the row-level security rule on `assignments`, e.g. a policy with `using (true)`, or turning off RLS on the table, would let User B read User A's assignments and fail this test.
