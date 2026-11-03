# Prompts: Feature 3, assignments (create / read / update / delete)

Issue #7. User story: As a student, I want to add an assignment, see my list, open its detail page, edit it, and delete it (with an "are you sure?" prompt), so that my list matches the syllabus as things change.

## Key prompts and decisions
- Build list, new, detail, edit, and delete-with-confirmation pages for assignments.
- **Home page = assignment list.** I chose this so the app opens straight to what's due.
- **Done checkbox on the list.** I chose this so my end-of-week check-in is quick.
- Friendly "please fill in X" messages are left for feature 4 (validation). For now, a failed save shows a general "Couldn't save" message.

## What was built
- `/` lists my assignments sorted by due date: done checkbox, course color dot, title (links to detail), type, due date. Done items are crossed out.
- `/assignments/new`: form with course dropdown, title, type, due date, notes. If I have no courses yet, it links to `/courses` instead.
- `/assignments/[id]`: detail page with Edit and Delete.
- `/assignments/[id]/edit`: the same form, pre-filled.
- Delete shows an inline "Are you sure? … will be deleted for good." with "Yes, delete" / "Cancel".
- Header link "Home" renamed to "Assignments".

## Manual test (local, as the test user)
- Create: added "Test Problem Set" (quiz, due Nov 14, notes) → opened its detail page with all fields correct.
- Edit: changed the title and the due date to Nov 16 → detail page shows the changes.
- Done checkbox: ticked it on the list → crossed out, and still checked after a page reload.
- Delete: "Delete" → "Are you sure?" → "Cancel" kept it. "Delete" → "Yes, delete" removed it and went back to the list. Its old URL now shows 404.
