# Backend Testing Structure

Phase 0 deliverable: "Configure basic testing structure" -> this setup.

## Approach

Two layers, matching what each part of the backend actually needs:

1. **Database / RLS tests (pgTAP)** -- `supabase/tests/*.sql`. These run
   against a real local Postgres via the Supabase CLI and test schema and
   Row Level Security directly: "an anon user can select organisations",
   "a user cannot read another user's availability", etc. This is the
   most important layer for this project, since privacy/safety rules
   (Phase 1-5) live in RLS policies.

   Requires Docker + `supabase start`:
   ```bash
   npx supabase test db
   ```

2. **Edge Function tests** -- once Edge Functions exist (Phase 1+), each
   function gets a colocated test using Deno's built-in test runner
   (Edge Functions run on Deno). Example layout:
   ```
   supabase/functions/create-activity/index.ts
   supabase/functions/create-activity/index.test.ts
   ```
   Run with `npx supabase functions serve` locally + `deno test`, or via
   the function's own test command once added.

## Example pgTAP test (template)

`supabase/tests/001_organisations_rls.sql`:

```sql
begin;
select plan(2);

select has_table('public', 'organisations', 'organisations table exists');

select results_eq(
  $$ select count(*)::int from public.organisations $$,
  $$ values (2) $$,
  'seed data inserts exactly 2 organisations'
);

select * from finish();
rollback;
```

(Not added yet as a real file -- add the first real test alongside the
first migration that needs one, e.g. when `base_rls_policies` policies
are exercised for real in Phase 1.)

## What we are NOT doing in the MVP

- No load/performance testing framework yet (Phase 6 "test matching
  performance" is the first place this becomes relevant).
- No CI pipeline wired up yet -- out of scope for Phase 0, revisit in
  Phase 6 "Configure staging environment".

## Local testing requires Docker

`supabase start` / `npx supabase test db` need Docker Desktop running
locally. If a teammate doesn't have Docker, they can still write
migrations and get them reviewed, but can't run `db reset` / pgTAP tests
locally until Docker is installed, or until the shared dev project (once
linked) is used for manual verification instead.
