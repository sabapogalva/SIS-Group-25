-- Phase 3: activity participants (join requests + membership).

create table if not exists public.activity_participants (
  id uuid primary key default gen_random_uuid(),

  activity_id uuid not null
    references public.activities(id)
    on delete cascade,

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'left')),

  -- auto-inserted by insert_creator_as_participant() below, so
  -- "who's in this activity" is always a single status = 'accepted' query
  is_creator boolean not null default false,

  created_at timestamptz not null default now(),
  responded_at timestamptz,

  constraint activity_participants_unique_membership
    unique (activity_id, user_id)
);

comment on table public.activity_participants is
  'Join requests and membership for an activity. The creator gets an auto-accepted row.';

create index if not exists activity_participants_activity_status_idx
  on public.activity_participants (activity_id, status);

create index if not exists activity_participants_user_id_idx
  on public.activity_participants (user_id);


create or replace function public.insert_creator_as_participant()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.activity_participants (
    activity_id, user_id, status, is_creator, responded_at
  ) values (
    new.id, new.creator_id, 'accepted', true, now()
  );
  return new;
end;
$$;

comment on function public.insert_creator_as_participant() is
  'Gives the creator an accepted, is_creator participant row when an activity is created.';

drop trigger if exists on_activity_created_add_creator on public.activities;
create trigger on_activity_created_add_creator
  after insert on public.activities
  for each row
  execute function public.insert_creator_as_participant();


-- Accepted, non-creator participants -- what participant_limit is checked
-- against. Defined here (not the previous migration) since it queries
-- this table.
create or replace function public.activity_accepted_count(p_activity_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.activity_participants ap
  where ap.activity_id = p_activity_id
    and ap.status = 'accepted'
    and ap.is_creator = false
$$;

comment on function public.activity_accepted_count(uuid) is
  'Number of accepted, non-creator participants.';

revoke all on function public.activity_accepted_count(uuid) from public, anon;
grant execute on function public.activity_accepted_count(uuid) to authenticated;

create or replace function public.is_activity_creator(
  p_activity_id uuid,
  p_user_id uuid default auth.uid()
)
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
      and a.creator_id = p_user_id
  )
$$;

comment on function public.is_activity_creator(uuid, uuid) is
  'True when p_user_id created the given activity.';

create or replace function public.is_activity_participant(
  p_activity_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.activity_participants ap
    where ap.activity_id = p_activity_id
      and ap.user_id = p_user_id
      and ap.status = 'accepted'
  )
$$;

comment on function public.is_activity_participant(uuid, uuid) is
  'True when p_user_id is an accepted participant (creator included).';

-- Visibility helper for application code. Not used by the activities
-- select policy itself -- see the comment on that policy below.
create or replace function public.can_view_activity(p_activity_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_verified_user()
    and (
      public.activity_is_active(p_activity_id)
      or public.is_activity_creator(p_activity_id)
      or public.is_activity_participant(p_activity_id)
    )
$$;

comment on function public.can_view_activity(uuid) is
  'Visibility gate for activities, for application code. Not used by the activities select policy -- see that policy''s comment.';

revoke all on function public.is_activity_creator(uuid, uuid) from public, anon;
revoke all on function public.is_activity_participant(uuid, uuid) from public, anon;
revoke all on function public.can_view_activity(uuid) from public, anon;
grant execute on function public.is_activity_creator(uuid, uuid) to authenticated;
grant execute on function public.is_activity_participant(uuid, uuid) to authenticated;
grant execute on function public.can_view_activity(uuid) to authenticated;

-- Inlined as direct column checks (status/end_time/creator_id) instead of
-- calling can_view_activity(), which re-queries activities by id -- a
-- select policy that re-queries its own table breaks insert/update ...
-- returning on that table. Keep this in sync with can_view_activity() if
-- either changes.
create policy "users can view activities they're allowed to see"
  on public.activities
  for select
  to authenticated
  using (
    public.is_verified_user()
    and (
      (status = 'open' and end_time > now())
      or creator_id = auth.uid()
      or public.is_activity_participant(id)
    )
  );


create or replace function public.guard_activity_participant_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_activity record;
begin
  select a.creator_id, a.status, a.end_time, a.participant_limit
    into v_activity
  from public.activities a
  where a.id = coalesce(new.activity_id, old.activity_id);

  if tg_op = 'INSERT' then
    -- the creator's own row comes from insert_creator_as_participant();
    -- RLS already blocks a real client from setting is_creator = true
    if new.is_creator then
      return new;
    end if;

    if new.user_id = v_activity.creator_id then
      raise exception using
        errcode = 'P0001',
        message = '[forbidden] The creator is already a participant in their own activity.';
    end if;

    if v_activity.status = 'cancelled' then
      raise exception using
        errcode = 'P0001',
        message = '[activity_cancelled] This activity has been cancelled.';
    end if;

    if v_activity.end_time <= now() then
      raise exception using
        errcode = 'P0001',
        message = '[expired] This activity has already ended.';
    end if;

    if public.activity_accepted_count(new.activity_id) >= v_activity.participant_limit then
      raise exception using
        errcode = 'P0001',
        message = '[activity_full] This activity already has its maximum number of participants.';
    end if;

    return new;
  end if;

  -- UPDATE from here -- accept/decline/leave transition rules. A
  -- declined request can never become pending/accepted again by the
  -- requester; only the creator can move declined -> accepted.
  if old.is_creator then
    if new.status <> old.status then
      raise exception using
        errcode = 'P0001',
        message = '[invalid_transition] The creator''s own participant row cannot change status -- cancel the activity instead.';
    end if;
    return new;
  end if;

  if auth.uid() = v_activity.creator_id then
    if old.status = 'pending' and new.status = 'accepted' then
      if public.activity_accepted_count(new.activity_id) >= v_activity.participant_limit then
        raise exception using
          errcode = 'P0001',
          message = '[activity_full] This activity already has its maximum number of participants.';
      end if;
      new.responded_at := now();
      return new;
    elsif old.status = 'pending' and new.status = 'declined' then
      new.responded_at := now();
      return new;
    elsif old.status = 'declined' and new.status = 'accepted' then
      if public.activity_accepted_count(new.activity_id) >= v_activity.participant_limit then
        raise exception using
          errcode = 'P0001',
          message = '[activity_full] This activity already has its maximum number of participants.';
      end if;
      new.responded_at := now();
      return new;
    else
      raise exception using
        errcode = 'P0001',
        message = format('[invalid_transition] Cannot change participant status from %s to %s.', old.status, new.status);
    end if;
  elsif auth.uid() = old.user_id then
    -- own row: only leaving is allowed
    if new.status = 'left' and old.status in ('pending', 'accepted') then
      new.responded_at := now();
      return new;
    else
      raise exception using
        errcode = 'P0001',
        message = format('[invalid_transition] Cannot change participant status from %s to %s.', old.status, new.status);
    end if;
  end if;

  raise exception using
    errcode = 'P0001',
    message = '[forbidden] You are not allowed to change this participant row.';
end;
$$;

comment on function public.guard_activity_participant_write() is
  'Who can join, and the accept/decline/leave transition rules.';

drop trigger if exists on_activity_participant_write_guard on public.activity_participants;
create trigger on_activity_participant_write_guard
  before insert or update on public.activity_participants
  for each row
  execute function public.guard_activity_participant_write();


alter table public.activity_participants enable row level security;

create policy "verified users can request to join"
  on public.activity_participants
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.is_verified_user()
    and status = 'pending'
    and is_creator = false
  );

create policy "own row, creator, or fellow accepted participants can view"
  on public.activity_participants
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_activity_creator(activity_id)
    or (status = 'accepted' and public.is_activity_participant(activity_id))
  );

create policy "participants leave, creators respond"
  on public.activity_participants
  for update
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_activity_creator(activity_id)
  )
  with check (
    user_id = auth.uid()
    or public.is_activity_creator(activity_id)
  );

-- no delete policy: leaving/declining are status changes, keeps history
-- for moderation
