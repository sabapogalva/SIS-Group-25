-- Phase 1: authentication, institutional-domain verification and profiles.
--
-- Supabase Auth owns auth.users. These triggers make the database the
-- authoritative enforcement point for approved institutional email domains,
-- profile creation and email-verification status. The client must still use
-- Supabase Auth's normal signUp/confirm flow (see docs/backend/authentication.md).

create or replace function public.email_domain(p_email text)
returns text
language sql
immutable
as $$
  select case
    when trim(p_email) is null
      or trim(p_email) !~* '^[^@[:space:]]+@[^@[:space:]]+$'
      then null
    else lower(split_part(trim(p_email), '@', 2))
  end
$$;

comment on function public.email_domain(text) is
  'Normalises and validates the domain portion of an email address.';

create or replace function public.organisation_for_email(p_email text)
returns table (organisation_id uuid, organisation_type text)
language sql
stable
security definer
set search_path = public
as $$
  select o.id, o.type
  from public.organisation_domains od
  join public.organisations o on o.id = od.organisation_id
  where lower(trim(od.domain)) = public.email_domain(p_email)
    and o.type in ('university', 'company')
  order by o.id
  limit 1
$$;

comment on function public.organisation_for_email(text) is
  'Resolves an approved university/company domain to its organisation.';

-- This resolver is used by Auth triggers, not exposed as a general-purpose
-- client RPC. Approved domains remain readable through the reference tables.
revoke all on function public.organisation_for_email(text) from public, anon, authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organisation_id uuid not null references public.organisations(id) on delete restrict,
  account_type text not null check (account_type in ('student', 'professional')),
  display_name text,
  bio text,
  course_or_role text,
  avatar_url text,
  account_status text not null default 'pending'
    check (account_status in ('pending', 'verified', 'suspended', 'deleted')),
  email_verified_at timestamptz,
  terms_accepted_at timestamptz not null,
  privacy_accepted_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'User profile linked to an authenticated account and an approved organisation (Phase 1).';

create index if not exists profiles_organisation_id_idx
  on public.profiles (organisation_id);

create index if not exists profiles_status_idx
  on public.profiles (account_status);

create or replace function public.validate_auth_user_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_organisation_id uuid;
begin
  select r.organisation_id
    into v_organisation_id
  from public.organisation_for_email(new.email) r;

  if v_organisation_id is null then
    raise exception using
      errcode = 'P0001',
      message = format(
        '[invalid_domain] %s is not an approved university or organisation email.',
        coalesce(new.email, '(missing email)')
      );
  end if;

  return new;
end;
$$;

comment on function public.validate_auth_user_email() is
  'Rejects Auth signups and email changes outside approved university/company domains.';

drop trigger if exists on_auth_user_validate_email on auth.users;
create trigger on_auth_user_validate_email
  before insert or update of email on auth.users
  for each row execute function public.validate_auth_user_email();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_organisation_id uuid;
  v_organisation_type text;
  v_terms_accepted boolean;
  v_privacy_accepted boolean;
  v_display_name text;
begin
  select r.organisation_id, r.organisation_type
    into v_organisation_id, v_organisation_type
  from public.organisation_for_email(new.email) r;

  if v_organisation_id is null then
    raise exception using
      errcode = 'P0001',
      message = '[invalid_domain] The account email is not approved.';
  end if;

  v_terms_accepted := lower(coalesce(
    new.raw_user_meta_data ->> 'terms_accepted',
    new.raw_user_meta_data ->> 'termsAccepted',
    'false'
  )) = 'true';
  v_privacy_accepted := lower(coalesce(
    new.raw_user_meta_data ->> 'privacy_accepted',
    new.raw_user_meta_data ->> 'privacyAccepted',
    'false'
  )) = 'true';

  if not v_terms_accepted or not v_privacy_accepted then
    raise exception using
      errcode = 'P0001',
      message = '[consent_required] Terms and privacy consent are required.';
  end if;

  v_display_name := nullif(btrim(coalesce(
    new.raw_user_meta_data ->> 'display_name',
    new.raw_user_meta_data ->> 'displayName',
    ''
  )), '');

  insert into public.profiles (
    id,
    organisation_id,
    account_type,
    display_name,
    account_status,
    email_verified_at,
    terms_accepted_at,
    privacy_accepted_at
  ) values (
    new.id,
    v_organisation_id,
    case when v_organisation_type = 'university' then 'student' else 'professional' end,
    v_display_name,
    case when new.email_confirmed_at is null then 'pending' else 'verified' end,
    new.email_confirmed_at,
    now(),
    now()
  );

  return new;
end;
$$;

comment on function public.handle_new_auth_user() is
  'Creates a pending profile for a valid Auth user and records mandatory consent.';

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

create or replace function public.sync_auth_user_state()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_organisation_id uuid;
  v_organisation_type text;
begin
  if new.email is distinct from old.email then
    select r.organisation_id, r.organisation_type
      into v_organisation_id, v_organisation_type
    from public.organisation_for_email(new.email) r;

    update public.profiles
    set organisation_id = v_organisation_id,
        account_type = case when v_organisation_type = 'university'
                            then 'student' else 'professional' end,
        account_status = case when new.email_confirmed_at is null
                              then 'pending' else 'verified' end,
        email_verified_at = new.email_confirmed_at,
        updated_at = now()
    where id = new.id;
  elsif new.email_confirmed_at is distinct from old.email_confirmed_at then
    update public.profiles
    set account_status = case when new.email_confirmed_at is null
                              then 'pending' else 'verified' end,
        email_verified_at = new.email_confirmed_at,
        updated_at = now()
    where id = new.id;
  end if;

  return new;
end;
$$;

comment on function public.sync_auth_user_state() is
  'Synchronises profile organisation and account status with Auth email changes/confirmation.';

drop trigger if exists on_auth_user_state_changed on auth.users;
create trigger on_auth_user_state_changed
  after update of email, email_confirmed_at on auth.users
  for each row execute function public.sync_auth_user_state();

create or replace function public.is_verified_user(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.id = auth.uid()
      and (p_user_id is null or p_user_id = auth.uid())
      and p.account_status = 'verified'
      and u.email_confirmed_at is not null
      and p.terms_accepted_at is not null
      and p.privacy_accepted_at is not null
  )
$$;

comment on function public.is_verified_user(uuid) is
  'Returns true only for an authenticated account with confirmed email and verified status.';

revoke all on function public.is_verified_user(uuid) from public, anon;
grant execute on function public.is_verified_user(uuid) to authenticated;

create or replace function public.prevent_profile_protected_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- auth.uid() is null for Auth triggers/service-role operations. Those
  -- server-side paths are allowed to update verification state. A normal
  -- authenticated client can edit only the user-facing profile fields.
  if auth.uid() is not null and (
    new.id is distinct from old.id
    or new.organisation_id is distinct from old.organisation_id
    or new.account_type is distinct from old.account_type
    or new.account_status is distinct from old.account_status
    or new.email_verified_at is distinct from old.email_verified_at
    or new.terms_accepted_at is distinct from old.terms_accepted_at
    or new.privacy_accepted_at is distinct from old.privacy_accepted_at
    or new.created_at is distinct from old.created_at
  ) then
    raise exception using
      errcode = 'P0001',
      message = '[forbidden] Protected profile fields cannot be changed by the client.';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists on_profile_protected_changes on public.profiles;
create trigger on_profile_protected_changes
  before update on public.profiles
  for each row execute function public.prevent_profile_protected_changes();

alter table public.profiles enable row level security;

create policy "users can read their own profile"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "verified users can read verified profiles"
  on public.profiles for select to authenticated
  using (public.is_verified_user() and account_status = 'verified');

create policy "users can update their own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid() and account_status <> 'suspended')
  with check (id = auth.uid() and account_status <> 'suspended');

-- There is intentionally no client INSERT policy: profiles are created by
-- handle_new_auth_user() only. There is also no client DELETE policy.
