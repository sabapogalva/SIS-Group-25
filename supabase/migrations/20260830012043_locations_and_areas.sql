-- Locations (campuses, offices, public venues) and the smaller areas
-- within them (libraries, food courts, buildings, workplace areas).
-- Users always select an approximate area, never exact GPS (PRD 8.3/8.4).

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete set null,
  name text not null,
  type text not null check (type in ('campus', 'office', 'public_venue')),
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

comment on table public.locations is
  'Campuses, offices and public venues. organisation_id is null for independent public venues (cafes, libraries, etc). See PRD section 11.';

create index if not exists locations_organisation_id_idx
  on public.locations (organisation_id);

create table if not exists public.areas (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  name text not null,
  type text not null check (type in ('library', 'food_court', 'building', 'workplace_area', 'other')),
  created_at timestamptz not null default now()
);

comment on table public.areas is
  'Approximate areas within a location that users select instead of exact coordinates (PRD section 8.3, Phase 2 privacy rule: store area_id, not exact user coordinates).';

create index if not exists areas_location_id_idx
  on public.areas (location_id);
