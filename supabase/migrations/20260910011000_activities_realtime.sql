-- Expose activities over Realtime so the map/activity views update live.
-- RLS still applies to subscribers.

alter publication supabase_realtime add table public.activities;
alter publication supabase_realtime add table public.activity_participants;
