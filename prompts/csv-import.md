# Prompts: Feature 10, CSV import (my feature #3)

Issue #21. User story: As a student, I want to upload a CSV of a course's assignments (title, due date, type, estimated hours), so that I don't have to type 7 syllabi in by hand.

## Key prompts and decisions
- Earlier, during planning, I considered PDF/Word import but chose **CSV only** to keep it free and small (see `prompts/plan.md`).
- Build an Import page: pick a course, choose a `.csv`, check every row with the same rules as the New assignment form, and offer a downloadable template.
- Preview: I chose **(a) show a preview table first** (✓ / ✗ per row with the reason), then click Import.
- Bad rows: I chose **(a) skip bad rows**, import the good ones, and say how many were skipped.

## What was built
- `lib/csv-import.ts`: reads the header (case/spaces don't matter: "Due Date" → `due_date`), accepts dates as `2026-11-20` or `11/20/2026`, defaults a blank type to homework, and checks each row with `validateAssignment` plus "type must be one of the 6 types". Max 200 rows per file.
- `public/assignments-template.csv`: a sample file with the right header row.
- `/assignments/import` page: course + file → preview table → "Import N assignments" → "✓ Imported N, skipped M with problems."
- `importAssignments` server action: **re-checks every row on the server** (the browser preview could be bypassed), saves the good rows in one insert, and skips the bad ones. Row-level security still applies, so you can only import into your own course.
- "Import CSV" button next to "+ New assignment" on the list.
- PapaParse (from PLAN.md) does the CSV parsing.

## Problems hit while testing
- **Crash on Import:** the first time I clicked Import, the page showed a server error ("Cannot read properties of undefined (reading 'apply')") and nothing was saved. The server log showed the action never ran ("in 0ms"). After **restarting the local dev server**, the same import worked. The cause was a stale development build after many file edits, not the import code. Lesson: when an error makes no sense after lots of edits, restart the dev server before changing code.
- **Changed how the file is read:** while debugging, I switched from giving PapaParse the File object (which reads it in the background with callbacks) to reading the file's text first (`await file.text()`) and parsing that text directly. It's simpler and runs in one step.
- **Test-harness note:** the automated browser was hidden, so the page sometimes hadn't finished loading before the test picked a file, which made it look like "nothing happens". Waiting for the page to be ready fixed the test. This wasn't an app bug.

## Manual test (local, as the test user)
- Uploaded a 6-row file (the template's 4 rows + a row with a blank title + a row with a 2062 date, the "essay" type, and 300 hours).
- Preview: "4 of 6 rows ready to import", with ✗ and reasons on lines 6 and 7. `11/16/2026` showed as "Mon, Nov 16".
- Import → "✓ Imported 4 assignments, skipped 2 with problems." All 4 appear on the list with their hours. The crunch banner updated (week of Nov 30: 28h).
- A file with the wrong header (`name,date`) → "The file is missing the columns: title, due_date. Use the template's header row: …"
