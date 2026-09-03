-- Organisations and their approved email domains.
-- Reference data: universities, companies and approved venue organisations
-- that Recess users are verified against (PRD section 4 / 11, Phase 1 auth).

create extension if not exists pgcrypto;

create table if not exists public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('university', 'company', 'venue')),
  created_at timestamptz not null default now()
);

comment on table public.organisations is
  'Universities, companies and approved venue organisations. See PRD section 4/11.';

-- One organisation can have multiple approved domains
-- (e.g. separate student/staff domains for the same university).
create table if not exists public.organisation_domains (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  domain text not null unique,
  created_at timestamptz not null default now()
);

comment on table public.organisation_domains is
  'Approved email domains used to verify signups and link a user to an organisation (PRD section 8.1, Phase 1 required rules: student@uts.edu.au allowed, person@gmail.com rejected).';

create index if not exists organisation_domains_organisation_id_idx
  on public.organisation_domains (organisation_id);
