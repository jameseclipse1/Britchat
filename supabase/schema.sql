-- BritChat schema. Paste this whole file into the Supabase SQL editor and run it once.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  display_name text not null,
  role text not null default 'chatter' check (role in ('chatter', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  topic_id text not null,
  best_score int not null,
  total_questions int not null,
  attempts int not null default 1,
  last_attempt_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

alter table public.profiles enable row level security;
alter table public.quiz_progress enable row level security;

-- Helper: is the current user an admin? (security definer avoids RLS recursion)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles: everyone reads their own row; admins read every row.
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- No client-side insert/update policy: accounts are created/edited only via
-- the service-role key (see lib/supabase/admin.ts), which bypasses RLS.

-- quiz_progress: a chatter reads/writes only their own rows; admins read all.
create policy "quiz_progress_select_own_or_admin" on public.quiz_progress
  for select using (user_id = auth.uid() or public.is_admin());

create policy "quiz_progress_insert_own" on public.quiz_progress
  for insert with check (user_id = auth.uid());

create policy "quiz_progress_update_own" on public.quiz_progress
  for update using (user_id = auth.uid());
