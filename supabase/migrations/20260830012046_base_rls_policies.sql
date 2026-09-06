-- Baseline Row Level Security for the Phase 0 foundation tables.
--
-- organisations / organisation_domains / locations / areas are reference
-- data: readable by anyone -- including anon, since approved-domain lookup
-- during signup happens before a session exists -- but writable only by
-- service_role (migrations/admin). No direct client writes for the MVP.
--
-- Later phases add per-table RLS for user-owned data (profiles,
-- availabilities, activities, etc). This migration only covers Phase 0.

alter table public.organisations enable row level security;
alter table public.organisation_domains enable row level security;
alter table public.locations enable row level security;
alter table public.areas enable row level security;

create policy "organisations are publicly readable"
  on public.organisations for select
  using (true);

create policy "organisation_domains are publicly readable"
  on public.organisation_domains for select
  using (true);

create policy "locations are publicly readable"
  on public.locations for select
  using (true);

create policy "areas are publicly readable"
  on public.areas for select
  using (true);

-- No insert/update/delete policies are defined for anon/authenticated:
-- with RLS enabled and no matching policy, those operations are denied
-- by default. Only the service_role key (bypasses RLS) or a migration
-- can modify this reference data.
