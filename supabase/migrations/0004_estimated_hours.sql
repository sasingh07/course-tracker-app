-- Feature 8: estimated hours per assignment.
-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.

-- Optional, so existing assignments stay valid.
-- Whole or half hours from 0.5 to 100 (matches lib/validation.ts).
alter table public.assignments
  add column estimated_hours numeric(4, 1)
  check (
    estimated_hours is null
    or (estimated_hours between 0.5 and 100 and estimated_hours * 2 = floor(estimated_hours * 2))
  );
