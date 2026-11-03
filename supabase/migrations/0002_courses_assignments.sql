-- Feature 2: courses and assignments.
-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.

-- My classes. One user has many courses.
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.users (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  code text,
  instructor text,
  color text not null default '#6e79f2',
  created_at timestamptz not null default now()
);

-- The main item. One course has many assignments.
-- (estimated_hours is added later, in feature 8.)
create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  type text not null default 'homework'
    check (type in ('homework', 'reading', 'quiz', 'exam', 'project', 'paper')),
  due_date date not null,
  is_done boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create index courses_user_id_idx on public.courses (user_id);
create index assignments_user_id_idx on public.assignments (user_id);
create index assignments_course_id_idx on public.assignments (course_id);

-- Row Level Security: each user can only see and change their own rows.
alter table public.courses enable row level security;
alter table public.assignments enable row level security;

create policy "Users manage their own courses"
  on public.courses for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- An assignment must belong to the user AND to one of the user's own courses.
create policy "Users manage their own assignments"
  on public.assignments for all
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.courses c
      where c.id = course_id and c.user_id = (select auth.uid())
    )
  );
