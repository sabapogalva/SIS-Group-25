-- Development seed data.
-- Applied automatically by `supabase db reset` / `supabase start` on a
-- local dev stack. NOT applied automatically to a shared/staging/prod
-- project -- see docs/backend/environment-setup.md.

insert into public.organisations (id, name, type) values
  ('00000000-0000-0000-0000-000000000001', 'University of Technology Sydney', 'university'),
  ('00000000-0000-0000-0000-000000000002', 'Example Co', 'company')
on conflict (id) do nothing;

insert into public.organisation_domains (organisation_id, domain) values
  ('00000000-0000-0000-0000-000000000001', 'student.uts.edu.au'),
  ('00000000-0000-0000-0000-000000000002', 'examplecompany.com')
on conflict (domain) do nothing;

insert into public.locations (id, organisation_id, name, type, latitude, longitude) values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'UTS City Campus', 'campus', -33.8835, 151.2005),
  ('00000000-0000-0000-0000-000000000102', null, 'Central Park Cafe', 'public_venue', -33.8830, 151.1996)
on conflict (id) do nothing;

insert into public.areas (id, location_id, name, type) values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 'UTS Library', 'library'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000101', 'Central Food Court', 'food_court'),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000101', 'Building 11', 'building')
on conflict (id) do nothing;
