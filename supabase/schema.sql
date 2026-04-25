create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  age int,
  goal text not null,
  experience_level text not null,
  training_days_per_week int not null,
  session_length_minutes int not null,
  preferred_location text not null,
  available_equipment text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at
before update on profiles
for each row
execute function public.set_updated_at();

create table if not exists profile_limitations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  label text not null,
  kind text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists profile_special_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  details text not null,
  created_at timestamptz not null default now()
);

create table if not exists workout_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  performed_at timestamptz not null,
  focus text not null,
  intensity text not null,
  duration_minutes int not null,
  muscle_groups_hit text[] not null default '{}',
  notes text not null,
  summary_text text,
  created_at timestamptz not null default now()
);

create table if not exists workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_session_id uuid not null references workout_sessions(id) on delete cascade,
  exercise_order int not null,
  name text not null,
  muscle_group text not null,
  sets_count int not null,
  reps_text text not null,
  rest_seconds int not null,
  warmup jsonb not null default '[]'::jsonb,
  tips jsonb not null default '[]'::jsonb,
  substitute text,
  created_at timestamptz not null default now()
);

create table if not exists ai_workout_recommendations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  recommendation_date date not null,
  title text not null,
  focus text not null,
  rationale jsonb not null default '[]'::jsonb,
  summary_bullets jsonb not null default '[]'::jsonb,
  exercises jsonb not null,
  today_special_request text,
  created_at timestamptz not null default now(),
  unique (profile_id, recommendation_date)
);

alter table profiles enable row level security;
alter table profile_limitations enable row level security;
alter table profile_special_requests enable row level security;
alter table workout_sessions enable row level security;
alter table workout_exercises enable row level security;
alter table ai_workout_recommendations enable row level security;

drop policy if exists "users_manage_own_profiles" on profiles;
create policy "users_manage_own_profiles"
on profiles
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users_manage_own_profile_limitations" on profile_limitations;
create policy "users_manage_own_profile_limitations"
on profile_limitations
for all
to authenticated
using (
  exists (
    select 1
    from profiles
    where profiles.id = profile_limitations.profile_id
      and profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from profiles
    where profiles.id = profile_limitations.profile_id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists "users_manage_own_profile_special_requests" on profile_special_requests;
create policy "users_manage_own_profile_special_requests"
on profile_special_requests
for all
to authenticated
using (
  exists (
    select 1
    from profiles
    where profiles.id = profile_special_requests.profile_id
      and profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from profiles
    where profiles.id = profile_special_requests.profile_id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists "users_manage_own_workout_sessions" on workout_sessions;
create policy "users_manage_own_workout_sessions"
on workout_sessions
for all
to authenticated
using (
  exists (
    select 1
    from profiles
    where profiles.id = workout_sessions.profile_id
      and profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from profiles
    where profiles.id = workout_sessions.profile_id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists "users_manage_own_workout_exercises" on workout_exercises;
create policy "users_manage_own_workout_exercises"
on workout_exercises
for all
to authenticated
using (
  exists (
    select 1
    from workout_sessions
    join profiles on profiles.id = workout_sessions.profile_id
    where workout_sessions.id = workout_exercises.workout_session_id
      and profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from workout_sessions
    join profiles on profiles.id = workout_sessions.profile_id
    where workout_sessions.id = workout_exercises.workout_session_id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists "users_manage_own_ai_workout_recommendations" on ai_workout_recommendations;
create policy "users_manage_own_ai_workout_recommendations"
on ai_workout_recommendations
for all
to authenticated
using (
  exists (
    select 1
    from profiles
    where profiles.id = ai_workout_recommendations.profile_id
      and profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from profiles
    where profiles.id = ai_workout_recommendations.profile_id
      and profiles.user_id = auth.uid()
  )
);
