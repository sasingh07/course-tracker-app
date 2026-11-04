# Prompts: Docs (schema.md, README, Plan vs. Reality)

Issue #27.

## Key prompts and decisions
- Write `schema.md` (every table, its columns, how the tables relate, and a comparison with PLAN.md section 3), replace the default Next.js README with a real one, and add the Plan vs. Reality table at the bottom of PLAN.md without changing the original plan above it.
- Email confirmation: I decided to **keep it off**, so classmates can sign up and try the app instantly. The README says so.
- Claude drafted the facts for each Plan vs. Reality row from what was actually built. The **Learning** column is mine to write.

## What was written
- `schema.md`: diagram, all 4 tables, relationships in plain English, the row-level security rules, and a "Plan vs. what was built" table (UUID IDs, date+time `created_at`, `estimated_hours` added in feature 8, database-level rules, security policies and triggers that weren't in the plan).
- `README.md`: what the app does, the live URL, tools, how to run it (env file, the 4 SQL files, `npm run dev`), and how to run the tests.
- `PLAN.md`: Plan vs. Reality table with all 10 features, both tests, and the cut backup feature.
