import { useCallback, useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { cancelCalendarEvent, loadCalendarEvents, subscribeToCalendarChanges } from '../services/events';

export default function CalendarView() {
  const [acceptedEvents, setAcceptedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      setAcceptedEvents(await loadCalendarEvents());
    } catch (loadError) {
      setError(loadError?.message ?? 'Unable to load your RSVP calendar.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const unsubscribe = subscribeToCalendarChanges(() => { void refresh(); });
    return unsubscribe;
  }, [refresh]);

  const handleCancel = async (event) => {
    setCancellingId(event.id);
    try {
      await cancelCalendarEvent(event);
      await refresh();
    } catch (cancelError) {
      setError(cancelError?.message ?? 'Unable to cancel this RSVP.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Accepted Events Calendar</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track all the campus sessions and sprints you've RSVP'd to.</p>
        </div>
        <div className="p-3 rounded-2xl bg-orange-50 text-orange-600">
          <CalendarIcon size={28} />
        </div>
      </div>

      {/* Events List Grid / Timeline */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">Upcoming RSVP'd Schedule</h3>
        
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 text-slate-400">
            Loading your RSVP calendar…
          </div>
        ) : error ? (
          <div role="alert" className="bg-red-50 rounded-2xl p-6 border border-red-100 text-sm text-red-700">
            {error}
          </div>
        ) : acceptedEvents.length > 0 ? (
          acceptedEvents.map((event) => (
            <div 
              key={event.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-orange-200"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-orange-50 text-orange-600">
                    <CheckCircle2 size={12} />
                    {event.rsvpStatus === 'interested' ? 'Interested' : event.rsvpStatus === 'pending' ? 'Request pending' : 'RSVP Confirmed'}
                  </span>
                  <span className="text-xs text-slate-400">• Hosted by {event.host}</span>
                </div>
                
                <h4 className="text-lg font-bold text-slate-900">{event.title}</h4>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-orange-500" />
                    {event.time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-orange-500" />
                    {event.location}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <button 
                  onClick={() => handleCancel(event)}
                  disabled={cancellingId === event.id}
                  className="px-4 py-2 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-sm font-medium rounded-xl transition-colors border border-slate-200 hover:border-rose-100"
                >
                  {cancellingId === event.id ? 'Updating…' : event.eventType === 'official_event' ? 'Cancel RSVP' : 'Leave event'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 text-slate-400">
            <CalendarIcon size={48} className="mx-auto mb-3 text-slate-300" />
            <p className="text-base font-medium text-slate-700">No upcoming events on your calendar yet.</p>
            <p className="text-sm text-slate-400 mt-1">RSVP to events from the live feed to see them show up here!</p>
          </div>
        )}
      </div>
    </div>
  );
}
