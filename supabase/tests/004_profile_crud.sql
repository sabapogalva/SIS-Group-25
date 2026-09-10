begin;

select plan(14);

-- 1. profiles table exists
select has_table(
  'public',
  'profiles',
  'profiles table exists'
);

-- 2. display_name is available for profile editing
select has_column(
  'public',
  'profiles',
  'display_name',
  'profiles has display_name'
);

-- 3. bio is available for profile editing
select has_column(
  'public',
  'profiles',
  'bio',
  'profiles has bio'
);

-- 4. course_or_role is available for profile editing
select has_column(
  'public',
  'profiles',
  'course_or_role',
  'profiles has course_or_role'
);

-- 5. avatar_url is available for profile editing
select has_column(
  'public',
  'profiles',
  'avatar_url',
  'profiles has avatar_url'
);

-- 6. updated_at exists
select has_column(
  'public',
  'profiles',
  'updated_at',
  'profiles has updated_at'
);

-- 7. RLS is enabled
select ok(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.profiles'::regclass
  ),
  'RLS is enabled on profiles'
);

-- 8. users can read their own profile policy exists
select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'users can read their own profile'
      and cmd = 'SELECT'
  ),
  'users can read their own profile'
);

-- 9. verified users can read verified profiles policy exists
select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'verified users can read verified profiles'
      and cmd = 'SELECT'
  ),
  'verified users can read verified profiles'
);

-- 10. users can update their own profile policy exists
select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'users can update their own profile'
      and cmd = 'UPDATE'
  ),
  'users can update their own profile'
);

-- 11. clients cannot directly insert profiles
select is(
  (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and cmd = 'INSERT'
  ),
  0::bigint,
  'clients cannot directly insert profiles'
);

-- 12. clients cannot directly delete profiles
select is(
  (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and cmd = 'DELETE'
  ),
  0::bigint,
  'clients cannot directly delete profiles'
);

-- 13. Auth creates profiles automatically
select ok(
  exists (
    select 1
    from pg_trigger
    where tgrelid = 'auth.users'::regclass
      and tgname = 'on_auth_user_created_profile'
      and not tgisinternal
  ),
  'Auth signup automatically creates a profile'
);

-- 14. protected profile fields are guarded by a trigger
select ok(
  exists (
    select 1
    from pg_trigger
    where tgrelid = 'public.profiles'::regclass
      and tgname = 'on_profile_protected_changes'
      and not tgisinternal
  ),
  'protected profile fields are guarded'
);

select * from finish();

rollback;