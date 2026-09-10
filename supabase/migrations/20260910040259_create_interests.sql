-- Phase 2: Interests and profile interests
-- Interests are shared reference data.
-- profile_interests links verified users to the interests they select.

create table if not exists public.interests (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

comment on table public.interests is
  'Shared list of interests that users can select for their profiles.';


create table if not exists public.profile_interests (
  id uuid primary key default gen_random_uuid(),

  profile_id uuid not null
    references public.profiles(id)
    on delete cascade,

  interest_id uuid not null
    references public.interests(id)
    on delete cascade,

  created_at timestamptz not null default now(),

  constraint profile_interests_unique
    unique (profile_id, interest_id)
);

comment on table public.profile_interests is
  'Links user profiles to their selected interests.';


-- =========================================================
-- Indexes
-- =========================================================

create index if not exists profile_interests_profile_id_idx
  on public.profile_interests (profile_id);

create index if not exists profile_interests_interest_id_idx
  on public.profile_interests (interest_id);


-- =========================================================
-- Row Level Security
-- =========================================================

alter table public.interests enable row level security;
alter table public.profile_interests enable row level security;


-- Verified users may view the available interest list.

create policy "verified users can read interests"
  on public.interests
  for select
  to authenticated
  using (
    public.is_verified_user()
  );


-- Verified users may view profile interests.
-- This is needed later for profiles and matching.

create policy "verified users can read profile interests"
  on public.profile_interests
  for select
  to authenticated
  using (
    public.is_verified_user()
  );


-- Users may add interests only to their own profile.

create policy "verified users can add their own interests"
  on public.profile_interests
  for insert
  to authenticated
  with check (
    profile_id = auth.uid()
    and public.is_verified_user()
  );


-- Users may remove interests only from their own profile.

create policy "verified users can remove their own interests"
  on public.profile_interests
  for delete
  to authenticated
  using (
    profile_id = auth.uid()
    and public.is_verified_user()
  );