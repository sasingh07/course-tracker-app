# Prompts: Feature 5, stars

Issue #11. User story: As a student, I want to star high-stakes assignments (midterms, projects) and view only starred ones, so that the big deadlines stand out.

## Key prompts and decisions
- Build the `stars` junction table from PLAN.md section 3: each row means "this user starred this assignment". One table for everyone, not one per user.
- Claude asked where the starred view should live. I chose **(a): `All | Starred ★` tabs on the home page**, rather than a separate `/starred` page.

## What was built
- `supabase/migrations/0003_stars.sql`: the `stars` table (`id`, `user_id` → users, `assignment_id` → assignments, `created_at`).
  - Unique on (`user_id`, `assignment_id`), so the same assignment can't be starred twice.
  - Row-level security: users only see, add, and remove their own stars, and can only star their own assignments.
  - Deleting an assignment also deletes its stars.
- ☆/★ button on every row of the list and on the detail page. Clicking it adds or removes a row in `stars`.
- `All (n) | Starred ★ (n)` tabs above the list. `/?view=starred` shows only starred assignments.

## Manual test (local, as the test user)
- List showed `All (1) | Starred ★ (0)` and a ☆ on the row.
- Clicked ☆ → turned into a gold ★. The Starred tab showed `(1)` with the assignment in it.
- Detail page showed ★ next to the title. Clicked it to unstar.
- Starred tab → `(0)`, with "No starred assignments yet. Click ☆ next to a midterm or project to star it."
- No server errors.
