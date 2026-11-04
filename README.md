# Course Tracker

A dark-mode web app for tracking my courses and assignments this semester, so I can see what's coming in the weeks ahead and spot crunch weeks before they hit.

**Live app:** https://course-tracker-app-livid.vercel.app

Built for the Intro to Coding (Fall 2026) Solo App Assignment. See [PLAN.md](PLAN.md) for the original plan and the Plan vs. Reality table, and [schema.md](schema.md) for the database.

## What it does
- **Accounts:** sign up with email + password, log in, log out. Each user only ever sees their own data.
- **Courses:** add your classes with an optional code, instructor, and a color tag.
- **Assignments:** add, view, edit, and delete (with an "are you sure?" step). Each has a course, title, type, due date, optional estimated hours, and notes. Tick them done from the list.
- **Validation:** friendly messages for blank fields, typo dates outside the academic year, overly long titles, and invalid hours.
- **Stars:** star the big deadlines and switch to the **Starred ★** tab.
- **Find things:** search titles as you type, filter by course or status (defaults to "Not done"), and sort by due date or newest added.
- **Dashboard:** due this week, % completed this week, hours due this week, busiest upcoming week, and a semester chart of assignments (or hours) due per week.
- **Estimated hours:** see real workload per week, not just a count.
- **Crunch-week warning:** any week with more than 15 estimated hours due is flagged on the list and turns red on the dashboard.
- **CSV import:** upload a syllabus as a CSV, preview every row (✓ / ✗ with reasons), and import the good ones. A template is on the import page.

> Email confirmation is turned **off** in Supabase on purpose, so anyone (e.g. classmates) can sign up and try the app instantly without checking their inbox.

## Tools
| What | Tool |
|---|---|
| Coding agent | Claude Code |
| Framework | Next.js 16 (App Router, TypeScript) |
| Database + login | Supabase (Postgres + Supabase Auth) |
| Hosting | Vercel (redeploys automatically on every merge to `main`) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| CSV parsing | PapaParse |
| Tests | Vitest |
| Code + workflow | GitHub (Issue → branch → pull request → merge for every feature) |

## How to run it yourself

**You need:** Node.js 20+ and a free [Supabase](https://supabase.com) project.

1. **Get the code and install libraries**
   ```bash
   git clone https://github.com/sasingh07/course-tracker-app.git
   cd course-tracker-app
   npm install
   ```
2. **Connect your Supabase project.** Create a file called `.env.local` in the project folder with your project's values (Supabase → Project Settings → Data API / API Keys):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```
   Use the **publishable** key, never the secret / service_role key.
3. **Create the tables.** In Supabase → SQL Editor, run each file in `supabase/migrations/` in order: `0001_users.sql`, `0002_courses_assignments.sql`, `0003_stars.sql`, `0004_estimated_hours.sql`.
4. **Optional:** in Supabase → Authentication → Sign In / Providers → Email, turn off **Confirm email** to sign up without email confirmation.
5. **Start the app**
   ```bash
   npm run dev
   ```
   Then open http://localhost:3000 and sign up.

### Running the tests
The data-isolation test logs in to your Supabase project as two test users. Add them to a file called `.env.test.local` (it's git-ignored):
```
TEST_USER_A_EMAIL=test-a@example.com
TEST_USER_A_PASSWORD=choose-a-password
TEST_USER_B_EMAIL=test-b@example.com
TEST_USER_B_PASSWORD=choose-another-password
```
The accounts are created automatically on the first run (this needs email confirmation turned off). Then:
```bash
npm test
```
- `tests/data-isolation.test.ts`: User B can't see, open, or edit User A's data.
- `tests/dashboard-stats.test.ts`: the dashboard's "due this week" and "% completed" numbers are calculated correctly.

## Project layout
```
app/                    pages (assignment list, courses, dashboard, import, login/signup)
app/assignments/        assignment pages, forms, and server actions
components/             shared pieces (top bar, crunch banner)
lib/                    Supabase client, validation rules, dashboard math, CSV import
supabase/migrations/    SQL that creates the database tables and security rules
tests/                  Vitest tests
prompts/                key prompts and decisions for each feature
```
