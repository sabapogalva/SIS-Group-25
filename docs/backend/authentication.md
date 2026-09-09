# Authentication and Verification Flow

This document covers Jay Nguyen's Phase 1 backend tasks (email verification,
approved-domain validation, organisation linking, profile creation, account
status, access restriction, consent, testing and frontend integration).

## Signup contract

The frontend uses Supabase Auth's normal email/password signup. It must pass
the consent flags in `options.data`:

```js
const { data, error } = await supabase.auth.signUp({
  email: email.trim().toLowerCase(),
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
    data: {
      display_name: displayName,
      terms_accepted: true,
      privacy_accepted: true,
    },
  },
})
```

The database trigger is authoritative. It normalises the domain, looks it up
in `public.organisation_domains`, and rejects the signup unless it belongs to
an approved university or company. Public providers such as Gmail are rejected
with an error message beginning with `[invalid_domain]`.

The trigger also requires both consent flags. Missing consent is rejected with
`[consent_required]`. The flags are only an input assertion; the database
records the acceptance timestamps itself.

## Verification lifecycle

1. Supabase Auth creates the user and sends its confirmation email (when email
   confirmation is enabled in the Supabase dashboard).
2. The `on_auth_user_created_profile` trigger creates a corresponding
   `public.profiles` row with the resolved `organisation_id` and an account
   status of `pending`.
3. The user opens the confirmation link and Supabase sets
   `auth.users.email_confirmed_at`.
4. The `on_auth_user_state_changed` trigger copies that timestamp to
   `profiles.email_verified_at` and changes `profiles.account_status` to
   `verified`.
5. If a confirmed email is changed, the new address must also use an approved
   domain. The profile is linked to the new organisation and becomes pending
   again until the new address is confirmed.

## Profile fields

`public.profiles` stores the public-facing profile fields (`display_name`,
`bio`, `course_or_role`, `avatar_url`) plus the following server-controlled
fields:

- `organisation_id`: resolved from the verified email domain;
- `account_type`: `student` for university domains, `professional` for
  company domains;
- `account_status`: `pending`, `verified`, `suspended` or `deleted`;
- `email_verified_at`;
- `terms_accepted_at` and `privacy_accepted_at`.

The client cannot change organisation, account type, account status,
verification or consent fields. Profiles are created by the Auth trigger; no
client insert policy exists.

## Access-control rule

Use `public.is_verified_user()` in RLS policies for every core feature added in
later phases (availability, activities, map presence, matching, connections,
messages and reports). The function returns true only when:

- the current Auth user has a confirmed email;
- the profile status is `verified`; and
- both consent timestamps are present.

An unverified user may read and update their own pending profile so the
frontend can show the verification state and complete editable profile fields,
but cannot access other users or core features.

## Frontend error handling

Supabase Auth may wrap a database-trigger error in its normal Auth error
object. The frontend should show a safe message based on the stable prefix:

| Prefix | User-facing meaning |
|---|---|
| `[invalid_domain]` | Use an approved university or organisation email. |
| `[consent_required]` | Accept the Terms and Privacy Policy to continue. |
| `[forbidden]` | The requested protected account change is not allowed. |

Never display SQL details, stack traces or the user's full email address in a
public profile or map response.

## Local verification checklist

Before opening a pull request:

1. Apply migrations with `npx supabase db reset` while Docker is running.
2. Confirm `student@uts.edu.au` (or an approved company domain) is accepted.
3. Confirm `person@gmail.com` is rejected.
4. Confirm signup without either consent flag is rejected.
5. Confirm a new profile starts as `pending`.
6. Confirm email confirmation changes the profile to `verified`.
7. Confirm a pending user cannot read another profile.
8. Confirm a normal client cannot change organisation, status or consent.
9. Run `npx supabase test db`.

## Integration notes for the frontend

- Use `supabase.auth.onAuthStateChange` to react to `SIGNED_IN` and
  `USER_UPDATED` events.
- After confirmation, query the current user's profile to obtain
  `account_status` and `organisation_id`.
- Route `pending` users to the verification screen rather than Discover,
  Activities, Map or Chat.
- Keep the Supabase service-role key out of the browser; only the URL and anon
  key belong in the Vite environment.
