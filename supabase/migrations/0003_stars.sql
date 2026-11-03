-- Feature 5: stars (junction table).
-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.

-- One row means "this user starred this assignment".
-- One table for everyone, not one per user.
create table public.stars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.users (id) on delete cascade,
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  created_at timestamptz not null default now(),
  -- A user can star the same assignment only once.
  unique (user_id, assignment_id)
);

create index stars_assignment_id_idx on public.stars (assignment_id);

-- Row Level Security: each user only sees, adds, and removes their own stars,
-- and can only star their own assignments.
alter table public.stars enable row level security;

create policy "Users see their own stars"
  on public.stars for select
  using ((select auth.uid()) = user_id);

create policy "Users star their own assignments"
  on public.stars for insert
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.assignments a
      where a.id = assignment_id and a.user_id = (select auth.uid())
    )
  );

create policy "Users remove their own stars"
  on public.stars for delete
  using ((select auth.uid()) = user_id);
