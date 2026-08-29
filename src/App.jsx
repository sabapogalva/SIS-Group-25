import { useState } from 'react';

import Header from './components/Header';
import PresenceStrip from './components/PresenceStrip';
import StatusInput from './components/StatusInput';
import StatusCard from './components/StatusCard';
import EventCard from './components/EventCard';
import EventForm from './components/EventForm';
import EventDetails from './components/EventDetails';

import { CURRENT_USER, SEED_FEED, SAMPLE_EVENT } from './constants/seed';
import { makeId, initials } from './utils/helpers';

// --- Main App ---

export default function App() {
  const [feed, setFeed] = useState(SEED_FEED);
  const [showEventForm, setShowEventForm] = useState(false);
  const [page, setPage] = useState('feed');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [joined, setJoined] = useState(false);


  const handlePostStatus = (text) => {
    setFeed(prev => [{ id: makeId(), type: 'status', text, time: 'Just now', author: CURRENT_USER }, ...prev]);
  };

  const handlePublishEvent = ({ title, location, time }) => {
    setFeed(prev => [{ id: makeId(), type: 'event', title, location, time, author: CURRENT_USER }, ...prev]);
    setShowEventForm(false);
  };

  const handleOpenEvent = (item) => {
    setSelectedEvent({
      title: item.title,
      description: 'Join us for this campus event! RSVP below to confirm your attendance.',
      location: item.location,
      time: item.time,
      host: {
        name: item.author,
        initials: initials(item.author),
        detail: 'UTS Student',
      },
    });
    setJoined(false);
    setPage('event');
  };

const currentEvent = selectedEvent ?? SAMPLE_EVENT;

  return (
    <div className="min-h-screen bg-orange-50 p-4 md:p-8 font-sans">
      <div className="max-w-xl mx-auto">

    <Header
        page={page}
        onBack={() => setPage('feed')}
        showEventForm={showEventForm}
        onToggle={() => setShowEventForm(f => !f)}
    />

    {page === 'event' ? (
          <EventDetails
            event={currentEvent}
            joined={joined}
            onJoin={() => setJoined(true)}
          />
        ) : (
          <div className="space-y-3">
            <PresenceStrip />

            {showEventForm && (
              <EventForm
                onSubmit={handlePublishEvent}
                onCancel={() => setShowEventForm(false)}
              />
            )}

            <StatusInput onPost={handlePostStatus} />

            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 px-1 pt-1">
              Today's updates
            </p>

            {feed.length === 0 && (
              <p className="text-center text-neutral-400 text-sm py-16">
                Nothing here yet. Post a status or host an event.
              </p>
            )}

            {feed.map(item =>
              item.type === 'event'
                ? <EventCard key={item.id} item={item} onOpen={() => handleOpenEvent(item)} />
                : <StatusCard key={item.id} item={item} />
            )}
            
          </div>
        )}

        <footer className="text-center text-[11px] text-neutral-400 mt-12 pt-6 border-t border-neutral-100">
          Recess v1.3 · Campus coordination for UTS
        </footer>

      </div>
    </div>
  );
}