# Prompts: Feature 1, sign up and login

Issue #3. User story: As a student, I want to create an account and log in and out, so that my courses and assignments are private to me.

## Setup decisions
- Created a free Supabase project (`course-tracker`, region West US). I added the Project URL and publishable key to `.env.local` myself. That file is ignored by Git.
- First attempt at the URL was the REST endpoint (`.../rest/v1/`) without `https://`. Claude's check caught it, and I re-copied the plain Project URL.
- Asked Claude to create the Next.js skeleton (TypeScript, Tailwind, App Router) and rename the package from `tmp-app` to `course-tracker-app`.

## Key prompts
- "go ahead": build sign up / login / log out with Supabase Auth (email + password), the `users` table, and a page that only logged-in users can see.
- Email confirmation: **"Off for now"**. I turned off "Confirm email" in Supabase so test accounts work without a real inbox.
  - **TODO before final deploy:** decide whether to turn email confirmation back on.

## What was built
- `/signup` and `/login` pages (one shared form) with friendly error messages.
- Log out button on the home page.
- `proxy.ts` sends logged-out visitors to `/login`.
- `supabase/migrations/0001_users.sql`: the `users` table, a rule so each user only sees their own row, and a trigger that adds a row on every sign up.
- Dark theme colors from PLAN.md section 6.

## Bug caught while testing
- After the first sign up, Next.js showed "1 issue": the home page used the clock (`Date.now()`, inside the Supabase client) while Next.js was pre-building the page. Fixed by adding `await connection()` so the page is built fresh for each visit. The error didn't come back after reloading.

## Manual test (local)
- Signed up as a test user → landed on the home page, showing that user's email.
- Logged out → sent to `/login`. Visiting `/` while logged out also redirects to `/login`.
- Wrong password → "Wrong email or password."
- Correct password → back on the home page.
