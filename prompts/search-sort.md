# Prompts: Feature 6, find things (search / filter / sort)

Issue #13. User story: As a student, I want to search assignments by title, filter by course or status, and sort by due date or newest added, so that I can answer "what's due next?" quickly.

## Key prompts and decisions
- Add a toolbar above the list: search, course filter, status filter, sort. Keep the choices in the web address so refresh and the back button keep them.
- Search behavior: I chose **(a) results update as you type** (300 ms after the last keystroke).
- Default status: I chose **(b) Not done**. Finished work is hidden until I switch the Status filter, which suits my Monday planning.
- Asked whether "Done" should be its own tab like "Starred". Options were (a) keep Done in the Status dropdown, or (b) replace the dropdown with `To do | Done | All | Starred` tabs. I chose **(a)**: the tabs pick *which* assignments (all vs starred) and the dropdown picks *status*, so combinations like "Starred + Done" still work.

## What was built
- `app/assignments/filters.ts`: reads and writes the filters in the URL (`q`, `course`, `status`, `sort`, `view`). Defaults: status = Not done, sort = due date.
- `app/assignments/toolbar.tsx`: search box + Course / Status (Not done, Done, All statuses) / Sort (Due date soonest, Newest added) dropdowns.
- The home page filters in the database: title search (`ilike`, with `%` and `_` treated as plain text), course, status, and sort order.
- Works together with the All / Starred tabs. Switching tabs keeps the filters.
- Empty messages: "No assignments match these filters. Clear filters", and when everything's done, "Nothing left to do 🎉 Show finished assignments".
- Note: ticking an assignment done in the default "Not done" view makes it disappear from the list. This is expected: it moves to "Done".

## Manual test (local, as the test user, with 2 test assignments)
- Default view: Validation test (Nov 20) then Final project (Dec 1), soonest first.
- Sort → Newest added: Final project moves to the top. URL becomes `/?sort=newest`.
- Typed "proj" → only Final project. URL `/?q=proj&sort=newest`.
- Typed more ("projzzz") → "No assignments match these filters. Clear filters".
- Refreshed `/?q=proj&sort=newest` → the search box and sort are still set.
- Ticked Validation test as done → hidden from the default Not done view. Status → Done shows it, crossed out.
