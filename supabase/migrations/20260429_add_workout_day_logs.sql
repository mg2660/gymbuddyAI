create table if not exists workout_day_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  activity_date date not null,
  status text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, activity_date)
);

drop trigger if exists workout_day_logs_set_updated_at on workout_day_logs;
create trigger workout_day_logs_set_updated_at
before update on workout_day_logs
for each row
execute function public.set_updated_at();

alter table if exists workout_day_logs enable row level security;

drop policy if exists "users_manage_own_workout_day_logs" on workout_day_logs;
create policy "users_manage_own_workout_day_logs"
on workout_day_logs
for all
to authenticated
using (
  exists (
    select 1
    from profiles
    where profiles.id = workout_day_logs.profile_id
      and profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from profiles
    where profiles.id = workout_day_logs.profile_id
      and profiles.user_id = auth.uid()
  )
);
