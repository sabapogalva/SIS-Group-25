-- Phase 2: Availability
-- Users share an approximate area and time window.
-- Exact GPS coordinates are never stored here.

create table if not exists public.availabilities (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  area_id uuid not null
    references public.areas(id)
    on delete restrict,

  start_time timestamptz not null,
  end_time timestamptz not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint availabilities_valid_time
    check (end_time > start_time)
);

comment on table public.availabilities is
  'Stores verified users availability using an approximate area_id and time window. Exact GPS is not stored.';


-- =========================================================
-- Indexes
-- =========================================================

create index if not exists availabilities_user_id_idx
  on public.availabilities (user_id);

create index if not exists availabilities_area_id_idx
  on public.availabilities (area_id);

create index if not exists availabilities_end_time_idx
  on public.availabilities (end_time);

create index if not exists availabilities_area_end_time_idx
  on public.availabilities (area_id, end_time);


-- =========================================================
-- Automatically update updated_at
-- =========================================================

create or replace function public.set_availability_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists on_availability_updated
  on public.availabilities;

create trigger on_availability_updated
  before update on public.availabilities
  for each row
  execute function public.set_availability_updated_at();


-- =========================================================
-- Row Level Security
-- =========================================================

alter table public.availabilities enable row level security;


-- Verified users can create availability only for themselves.

create policy "verified users can create their own availability"
  on public.availabilities
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.is_verified_user()
  );


-- Verified users can read active availability.
-- Expired availability is automatically hidden.
-- This allows the map and later matching feature to use the data.

create policy "verified users can read active availability"
  on public.availabilities
  for select
  to authenticated
  using (
    public.is_verified_user()
    and end_time > now()
  );


-- Users can only update their own availability.

create policy "verified users can update their own availability"
  on public.availabilities
  for update
  to authenticated
  using (
    user_id = auth.uid()
    and public.is_verified_user()
  )
  with check (
    user_id = auth.uid()
    and public.is_verified_user()
  );


-- Users can only delete their own availability.

create policy "verified users can delete their own availability"
  on public.availabilities
  for delete
  to authenticated
  using (
    user_id = auth.uid()
    and public.is_verified_user()
  );