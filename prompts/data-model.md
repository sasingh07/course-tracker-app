# Prompts: Feature 2, data model

Issue #5. User story: As a student, I want each assignment to belong to one of my courses, so that I can see my workload per class.

## Key prompts and decisions
- Build the `courses` and `assignments` tables from PLAN.md section 3, connected one-to-many (a course has many assignments), with row-level security so each user only sees their own rows.
- Claude asked where course management should go, since the CRUD feature (#3) is about assignments. I chose **(a): a simple "add + list courses" page in this feature**. Editing and deleting courses can come later.

## What was built
- `supabase/migrations/0002_courses_assignments.sql`:
  - `courses` (name, code, instructor, color) and `assignments` (title, type, due date, is_done, notes).
  - `type` is limited to homework, reading, quiz, exam, project, paper.
  - Row-level security: users only see and change their own rows. An assignment can only be added to one of the user's own courses.
  - `estimated_hours` is left out for now. It gets added in feature 8, as planned.
- `/courses` page: list of my courses with their color dots, plus an "Add a course" form (8 color choices).
- Shared header with Home / Courses links and Log out.

## Manual test (local, as the test user)
- `/courses` with no courses → "No courses yet."
- Clicked "Add course" with a blank name → "Please enter a course name."
- Added "Test Course" (TEST 101, orange) → appears in the list with an orange dot, and the form clears.
