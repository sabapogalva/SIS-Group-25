# Backend Contribution Guide

Phase 0 deliverable: "Define naming and branch conventions" -> this document.

## Branches

Format: `feature/backend/<short-kebab-case-name>`, matching Backend Docs v0.1:

```
feature/backend/supabase-foundation
feature/backend/auth-verification
feature/backend/profiles-interests
feature/backend/availability
feature/backend/locations-map-data
feature/backend/activities
feature/backend/activity-participants
feature/backend/official-events
feature/backend/event-rsvps
feature/backend/matching
feature/backend/connections
feature/backend/chat-realtime
feature/backend/block-report
```

One branch per phase/feature area, not per task -- small related tasks
(e.g. "create profile schema" + "add profile CRUD") share a branch and PR
when they land together naturally.

## Commits

Conventional-commit style: `<type>(backend): <summary>`

Types used so far: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.
Example: `feat(backend): add activities schema and RLS policies`

## Database migrations

- Never hand-write a migration filename. Always use:
  ```bash
  npx supabase migration new <snake_case_description>
  ```
  This generates a correctly-ordered `<timestamp>_<name>.sql` file in
  `supabase/migrations/`.
- One logical change per migration (e.g. "create table X", "add policy Y"),
  not one giant migration per phase. Small migrations are easier to review
  and easier to roll back.
- Migrations are the only way schema changes happen. No manual edits to
  the shared dev/staging/production database through the dashboard.
- Run locally with `npx supabase db reset` (requires Docker) before
  pushing, so the migration + seed data are known to apply cleanly.

## SQL / schema naming conventions

- Tables: `snake_case`, plural (`organisations`, `activity_participants`).
- Columns: `snake_case`, singular (`organisation_id`, `created_at`).
- Primary keys: `id uuid primary key default gen_random_uuid()`.
- Foreign keys: `<referenced_table_singular>_id`, e.g. `location_id`
  references `locations(id)`.
- Timestamps: `created_at timestamptz not null default now()`; add
  `updated_at` (+ trigger) only on tables that are actually edited after
  creation (profiles, activities, etc. -- not static reference data).
- Every table gets `alter table ... enable row level security;` in the
  same migration that creates it, even if the only policy is "public
  read" for now. Never ship a table without RLS explicitly considered.
- Add a `comment on table ...` for every table explaining its purpose in
  one line, referencing the relevant PRD section where useful.

## Pull requests

Per the team's Definition of Done, a backend PR is not "done" until:
- Implementation is committed;
- A migration exists if the database changed;
- RLS policies are implemented (or explicitly deferred with a comment
  explaining why, e.g. "no client writes yet");
- Input validation and error handling are in place (Edge Functions);
- Relevant tests pass;
- API documentation is updated (see `docs/backend/api-contract.md`);
- Another backend team member has reviewed it;
- Frontend has what it needs to integrate (table/column names, example
  queries, or the relevant Edge Function contract).

## Environment variables

See `docs/backend/environment-setup.md`.
