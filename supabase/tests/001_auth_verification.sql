begin;

select plan(14);

select has_table('public', 'profiles', 'profiles table exists');
select has_column('public', 'profiles', 'account_status', 'profiles has account status');
select has_column('public', 'profiles', 'organisation_id', 'profiles link to an organisation');
select has_column('public', 'profiles', 'terms_accepted_at', 'profiles store Terms consent');

select is(
  public.email_domain('student@uts.edu.au'),
  'uts.edu.au',
  'email domains are normalised to lowercase'
);

select is(
  public.email_domain(' Student@STUDENT.UTS.EDU.AU '),
  'student.uts.edu.au',
  'email domains ignore surrounding whitespace'
);

select is(
  public.email_domain('not-an-email'),
  null::text,
  'malformed email addresses have no domain'
);

select results_eq(
  $$ select organisation_type from public.organisation_for_email('student@uts.edu.au') $$,
  $$ values ('university'::text) $$,
  'an approved university email resolves to a university'
);

select is(
  (select count(*) from public.organisation_for_email('person@gmail.com')),
  0::bigint,
  'a public Gmail address does not resolve to an organisation'
);

select ok(
  exists (
    select 1
    from pg_trigger
    where tgrelid = 'auth.users'::regclass
      and tgname = 'on_auth_user_validate_email'
  ),
  'Auth email validation trigger exists'
);

select ok(
  exists (
    select 1
    from pg_trigger
    where tgrelid = 'auth.users'::regclass
      and tgname = 'on_auth_user_created_profile'
  ),
  'profile creation trigger exists'
);

select ok(
  exists (
    select 1
    from pg_trigger
    where tgrelid = 'auth.users'::regclass
      and tgname = 'on_auth_user_state_changed'
  ),
  'email verification sync trigger exists'
);

select is(
  public.is_verified_user('00000000-0000-0000-0000-000000000099'::uuid),
  false,
  'an unknown user is not verified'
);

select * from finish();
rollback;
