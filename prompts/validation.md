# Prompts: Feature 4, validation

Issue #9. User story: As a student, I want a friendly message if I leave the title, course, or due date blank, so that I never save an assignment I can't plan around.

## Key prompts and decisions
- Show a friendly message under each problem field, keep what I typed, and check on the server so the rules can't be skipped.
- Claude offered three levels of rules. I chose **all 3**:
  1. Course, title, and due date are required.
  2. Due date must fall within this academic year (Aug 1, 2026 – Jul 31, 2027), to catch typos like 2062.
  3. Title must be at most 120 characters.

## What was built
- `lib/validation.ts`: the rules as plain functions (`validateAssignment`, `validateCourseName`), kept separate so they're easy to test.
- New and Edit assignment forms: red outline + message under each problem field, plus "Please fix the highlighted fields above."
- The course form uses the same style for "Please enter a course name."
- After an error, everything I typed stays in the form.

## Bug caught while testing
- After a failed save, the text fields kept what I typed, but the **Course and Type dropdowns jumped back to their defaults**. React resets a form after it's submitted, and dropdowns didn't pick up the new values. Fixed by giving the form a `key` that changes on every failed save, so it's rebuilt showing what I chose. Re-tested: the course and type stay selected.

## Manual test (local, as the test user)
- New assignment, all blank → "Please choose a course.", "Please enter a title.", "Please pick a due date."
- Title of 125 characters → "Please keep the title under 120 characters (it's 125)."
- Due date 2062-11-14 → "That date is outside this academic year (Aug 2026 – Jul 2027). Check for a typo?"
- After the errors, course, type, title, date, and notes were all still filled in.
- Fixed the title and date → saved and opened the detail page.
- Edit assignment, cleared the title → "Please enter a title."
- Course form with only a code → "Please enter a course name.", and the code was kept.
