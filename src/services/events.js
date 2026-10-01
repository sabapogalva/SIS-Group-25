import { supabase } from '../lib/supabaseClient';

const edgeFunctionUnavailable = (error) => {
  const message = String(error?.message ?? error ?? '').toLowerCase();
  return message.includes('failed to fetch')
    || message.includes('functionsfetcherror')
    || message.includes('not found')
    || message.includes('404')
    || error?.context?.status === 404;
};

async function invokeWithLocalFallback(functionName, body, fallback) {
  const { data, error } = await supabase.functions.invoke(functionName, { body });
  if (!error) return data?.data ?? data;
  // Local Supabase projects do not always run the Edge Function server. The
  // same RLS-protected operation is safe as a development fallback; hosted
  // deployments use the function path above.
  if (edgeFunctionUnavailable(error)) return fallback();
  throw error;
}

export async function loadActiveMapPoints() {
  const { data, error } = await supabase.rpc('active_map_points', {
    p_area_ids: null,
    p_location_id: null,
    p_include_presence: true,
  });
  if (error) throw error;
  return data ?? [];
}

export async function loadAreas() {
  const { data, error } = await supabase
    .from('areas')
    .select('id, name, type, location_id, locations(id, name, type, latitude, longitude)')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function createActivity(payload) {
  return invokeWithLocalFallback('create-activity', payload, async () => {
    const { data, error } = await supabase
      .from('activities')
      .insert(payload)
      .select('id, title, description, category, start_time, end_time, participant_limit, location_label, latitude, longitude, area_id')
      .single();
    if (error) throw error;
    return data;
  });
}

export async function createOfficialEvent(payload) {
  return invokeWithLocalFallback('create-official-event', payload, async () => {
    const { data, error } = await supabase.from('official_events').insert(payload).select().single();
    if (error) throw error;
    return data;
  });
}

export async function rsvpToEvent(eventId, status = 'going') {
  return invokeWithLocalFallback('rsvp-to-event', { event_id: eventId, status }, async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');
    const { data, error } = await supabase
      .from('event_rsvps')
      .upsert({ event_id: eventId, user_id: user.id, status }, { onConflict: 'event_id,user_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  });
}

export async function joinActivity(activityId) {
  const { data, error } = await supabase
    .from('activity_participants')
    .insert({ activity_id: activityId, status: 'pending' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function subscribeToMapChanges(onChange) {
  const channel = supabase
    .channel('recess-map-updates')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_participants' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'official_events' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'event_rsvps' }, onChange)
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export function mapPointToFeedItem(point) {
  const official = point.point_type === 'official_event';
  return {
    id: point.point_id,
    remoteId: point.point_id,
    type: 'event',
    source: point.point_type,
    title: point.title,
    location: point.location_name ?? point.area_name ?? 'Campus meeting point',
    time: formatTimeWindow(point.starts_at, point.ends_at),
    author: official ? 'Organisation event' : 'Recess community',
    description: point.category ? formatCategory(point.category) : null,
    latitude: point.latitude,
    longitude: point.longitude,
    participantCount: point.participant_count,
    participantLimit: point.participant_limit,
    isCreator: point.is_creator === true,
  };
}

function formatTimeWindow(start, end) {
  if (!start) return 'Time to be confirmed';
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;
  const formatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  return endDate ? `${formatter.format(startDate)} – ${formatter.format(endDate)}` : formatter.format(startDate);
}

function formatCategory(category) {
  return category.replaceAll('_', ' ');
}
