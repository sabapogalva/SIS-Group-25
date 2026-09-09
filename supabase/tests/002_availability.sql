begin;

select plan(14);

-- 1. availabilities table exists
select has_table(
  'public',
  'availabilities',
  'availabilities table exists'
);

-- 2. user_id column exists
select has_column(
  'public',
  'availabilities',
  'user_id',
  'availabilities has user_id'
);

-- 3. area_id column exists
select has_column(
  'public',
  'availabilities',
  'area_id',
  'availabilities has area_id'
);

-- 4. start_time column exists
select has_column(
  'public',
  'availabilities',
  'start_time',
  'availabilities has start_time'
);

-- 5. end_time column exists
select has_column(
  'public',
  'availabilities',
  'end_time',
  'availabilities has end_time'
);

-- 6. exact latitude must not be stored
select ok(
  not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'availabilities'
      and column_name = 'latitude'
  ),
  'availability does not store exact latitude'
);

-- 7. exact longitude must not be stored
select ok(
  not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'availabilities'
      and column_name = 'longitude'
  ),
  'availability does not store exact longitude'
);

-- 8. user_id links to profiles
select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.availabilities'::regclass
      and contype = 'f'
      and pg_get_constraintdef(oid)
        like '%FOREIGN KEY (user_id)%REFERENCES profiles(id)%'
  ),
  'user_id references profiles'
);

-- 9. area_id links to areas
select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.availabilities'::regclass
      and contype = 'f'
      and pg_get_constraintdef(oid)
        like '%FOREIGN KEY (area_id)%REFERENCES areas(id)%'
  ),
  'area_id references areas'
);

-- 10. end_time must be after start_time
select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.availabilities'::regclass
      and conname = 'availabilities_valid_time'
      and contype = 'c'
  ),
  'availability has valid time constraint'
);

-- 11. RLS is enabled
select ok(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.availabilities'::regclass
  ),
  'RLS is enabled on availabilities'
);

-- 12. Four RLS policies exist
select is(
  (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename = 'availabilities'
  ),
  4::bigint,
  'availabilities has four RLS policies'
);

-- 13. Required indexes exist
select is(
  (
    select count(*)
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'availabilities'
      and indexname in (
        'availabilities_user_id_idx',
        'availabilities_area_id_idx',
        'availabilities_end_time_idx',
        'availabilities_area_end_time_idx'
      )
  ),
  4::bigint,
  'availability indexes exist'
);

-- 14. updated_at trigger exists
select ok(
  exists (
    select 1
    from pg_trigger
    where tgrelid = 'public.availabilities'::regclass
      and tgname = 'on_availability_updated'
      and not tgisinternal
  ),
  'availability updated_at trigger exists'
);

select * from finish();

rollback;