-- Feature 1: users table.
-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.

-- One row per account. The id is the same as the Supabase login id.
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now()
);

-- Row Level Security: each user can only see and edit their own row.
alter table public.users enable row level security;

create policy "Users can read their own row"
  on public.users for select
  using ((select auth.uid()) = id);

create policy "Users can update their own row"
  on public.users for update
  using ((select auth.uid()) = id);

-- When someone signs up, automatically add their row to public.users.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
