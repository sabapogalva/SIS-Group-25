-- Phase 3: user-created activities (small, spontaneous meetups).
-- Same pattern as auth/availability: rules live in constraints/triggers/RLS,
-- not an Edge Function.

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),

  creator_id uuid not null
    references public.profiles(id)
    on delete cascade,

  -- always an approved area, never a free-text address/lat/lng
  area_id uuid not null
    references public.areas(id)
    on delete restrict,

  title text not null,
  description text,

  category text not null
    check (category in (
      'coffee_break', 'lunch', 'study_session',
      'walk', 'casual_game', 'group_discussion', 'other'
    )),

  start_time timestamptz not null,
  end_time timestamptz not null,

  -- number of OTHER people who can join, doesn't include the creator
  participant_limit smallint not null default 3,

  -- "full"/"expired" are derived, not stored
  status text not null default 'open'
    check (status in ('open', 'cancelled')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint activities_title_length
    check (char_length(btrim(title)) between 3 and 80),
  constraint activities_description_length
    check (description is null or char_length(description) <= 500),
  constraint activities_valid_time
    check (end_time > start_time),
  constraint activities_max_duration
    check (end_time - start_time <= interval '4 hours'),
  constraint activities_participant_limit_range
    check (participant_limit between 1 and 5)
);

comment on table public.activities is
  'Small, user-created spontaneous meetups (coffee break, study session, walk, etc). Location is always an approved area_id, never a free-text address.';

create index if not exists activities_area_id_end_time_idx
  on public.activities (area_id, end_time);

create index if not exists activities_creator_id_idx
  on public.activities (creator_id);

create index if not exists activities_end_time_idx
  on public.activities (end_time);

create index if not exists activities_status_idx
  on public.activities (status);


create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Generic updated_at-on-write trigger, shared across tables.';

drop trigger if exists on_activity_updated on public.activities;
create trigger on_activity_updated
  before update on public.activities
  for each row
  execute function public.set_updated_at();


-- Active = open and not expired. Expiry comes from end_time, not a stored
-- flag, same as availabilities.
create or replace function public.activity_is_active(p_activity_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.activities a
    where a.id = p_activity_id
      and a.status = 'open'
      and a.end_time > now()
  )
$$;

comment on function public.activity_is_active(uuid) is
  'True when the activity is open and has not expired.';

revoke all on function public.activity_is_active(uuid) from public, anon;
grant execute on function public.activity_is_active(uuid) to authenticated;

-- activity_accepted_count() lives in the next migration -- it queries
-- activity_participants, which doesn't exist yet.


create or replace function public.guard_activity_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_open_count int;
begin
  if tg_op = 'INSERT' then
    if new.end_time <= now() then
      raise exception using
        errcode = 'P0001',
        message = '[invalid_time_window] An activity cannot start or end in the past.';
    end if;

    -- max 3 open activities per creator
    select count(*) into v_open_count
    from public.activities a
    where a.creator_id = new.creator_id
      and a.status = 'open'
      and a.end_time > now();

    if v_open_count >= 3 then
      raise exception using
        errcode = 'P0001',
        message = '[rate_limited] You already have 3 open activities. Cancel or wait for one to finish before creating another.';
    end if;

    return new;
  end if;

  -- UPDATE from here.

  if new.id is distinct from old.id
    or new.creator_id is distinct from old.creator_id
    or new.created_at is distinct from old.created_at
  then
    raise exception using
      errcode = 'P0001',
      message = '[forbidden] Protected activity fields cannot be changed.';
  end if;

  -- edits are allowed even after people are accepted; participants pick
  -- up the change over Realtime
  if old.status = 'cancelled' and new.status = 'cancelled' then
    raise exception using
      errcode = 'P0001',
      message = '[activity_cancelled] This activity has been cancelled and can no longer be edited.';
  end if;

  if old.end_time <= now() and new.status <> 'cancelled' then
    raise exception using
      errcode = 'P0001',
      message = '[expired] This activity has already ended and can no longer be edited.';
  end if;

  if new.participant_limit < old.participant_limit
     and new.participant_limit < public.activity_accepted_count(new.id)
  then
    raise exception using
      errcode = 'P0001',
      message = '[activity_full] participant_limit cannot be set below the number of already-accepted participants.';
  end if;

  if new.end_time <= new.start_time then
    raise exception using
      errcode = 'P0001',
      message = '[invalid_time_window] end_time must be after start_time.';
  end if;

  return new;
end;
$$;

comment on function public.guard_activity_write() is
  'Time-window validity, per-creator rate limit, and edit rules on activities.';

drop trigger if exists on_activity_write_guard on public.activities;
create trigger on_activity_write_guard
  before insert or update on public.activities
  for each row
  execute function public.guard_activity_write();


alter table public.activities enable row level security;

create policy "verified users can create their own activities"
  on public.activities
  for insert
  to authenticated
  with check (
    creator_id = auth.uid()
    and public.is_verified_user()
  );

create policy "creators can update their own activities"
  on public.activities
  for update
  to authenticated
  using (
    creator_id = auth.uid()
    and public.is_verified_user()
  )
  with check (
    creator_id = auth.uid()
    and public.is_verified_user()
  );

-- no delete policy: cancelling sets status = 'cancelled' instead

-- select policy is added in the next migration, once
-- is_activity_participant() exists
