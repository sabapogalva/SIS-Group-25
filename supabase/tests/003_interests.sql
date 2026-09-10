begin;

select plan(14);

-- 1. interests table exists
select has_table(
  'public',
  'interests',
  'interests table exists'
);

-- 2. profile_interests table exists
select has_table(
  'public',
  'profile_interests',
  'profile_interests table exists'
);

-- 3. interests has name column
select has_column(
  'public',
  'interests',
  'name',
  'interests has name'
);

-- 4. profile_interests has profile_id
select has_column(
  'public',
  'profile_interests',
  'profile_id',
  'profile_interests has profile_id'
);

-- 5. profile_interests has interest_id
select has_column(
  'public',
  'profile_interests',
  'interest_id',
  'profile_interests has interest_id'
);

-- 6. interest names are unique
select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.interests'::regclass
      and contype = 'u'
      and pg_get_constraintdef(oid) like '%UNIQUE (name)%'
  ),
  'interest names are unique'
);

-- 7. profile_id references profiles
select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profile_interests'::regclass
      and contype = 'f'
      and pg_get_constraintdef(oid)
        like '%FOREIGN KEY (profile_id)%REFERENCES profiles(id)%'
  ),
  'profile_id references profiles'
);

-- 8. interest_id references interests
select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profile_interests'::regclass
      and contype = 'f'
      and pg_get_constraintdef(oid)
        like '%FOREIGN KEY (interest_id)%REFERENCES interests(id)%'
  ),
  'interest_id references interests'
);

-- 9. duplicate profile-interest pairs are prevented
select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profile_interests'::regclass
      and conname = 'profile_interests_unique'
      and contype = 'u'
  ),
  'duplicate profile interests are prevented'
);

-- 10. RLS enabled on interests
select ok(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.interests'::regclass
  ),
  'RLS is enabled on interests'
);

-- 11. RLS enabled on profile_interests
select ok(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.profile_interests'::regclass
  ),
  'RLS is enabled on profile_interests'
);

-- 12. interests has one RLS policy
select is(
  (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename = 'interests'
  ),
  1::bigint,
  'interests has one RLS policy'
);

-- 13. profile_interests has three RLS policies
select is(
  (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profile_interests'
  ),
  3::bigint,
  'profile_interests has three RLS policies'
);

-- 14. required indexes exist
select is(
  (
    select count(*)
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'profile_interests'
      and indexname in (
        'profile_interests_profile_id_idx',
        'profile_interests_interest_id_idx'
      )
  ),
  2::bigint,
  'profile interest indexes exist'
);

select * from finish();

rollback;