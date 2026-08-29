import { useState } from 'react';

import EventDetails from './EventDetails.jsx';
// --- Constants ---

const CURRENT_USER = 'Salha';

let nextId = 1;
const makeId = () => nextId++;
const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const initials = (name) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const PRESENCE_USERS = ['Salha', 'Ahmed', 'Saba', 'Jay'];

const SEED_FEED = [
  { id: makeId(), type: 'event', title: 'Capstone sprint — frontend sync', location: 'UTS Library, Level 4', time: '2:00 PM', author: 'Salha' },
  { id: makeId(), type: 'status', text: 'Working on software engineering capstone architecture', time: '10 min ago', author: 'Ahmed' },
  { id: makeId(), type: 'status', text: 'Anyone in the DB labs? Looking for a study buddy til 5pm', time: '22 min ago', author: 'Saba' },
  { id: makeId(), type: 'event', title: 'Coffee run — Tower Building cafe', location: 'Tower Building, Ground Floor', time: '3:30 PM', author: 'Jay' },
];

const sampleEvent = {
    title: 'Capstone study session',
    description: 'Working through architecture diagrams and sprint planning before Friday’s demo.',
    location: 'Building 11, Level 4',
    time: 'Friday 28th August, 3:00 PM – 5:00 PM',
    host: {
      name: 'Alex Chen',
      initials: 'AC',
      detail: 'Software Engineering · 4th year',
     },
    };
// --- Sub-components ---

function Avatar({ name, variant = 'neutral' }) {
  const styles = variant === 'pro'
    ? 'bg-orange-100 text-orange-700 border-orange-200'
    : 'bg-neutral-100 text-neutral-500 border-neutral-200';
  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border shrink-0 ${styles}`}>
      {initials(name)}
    </div>
  );
}

function PresenceStrip() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-100 rounded-xl mb-1">
      <div className="flex">
        {PRESENCE_USERS.map((user, i) => (
          <div
            key={user}
            className="w-6 h-6 rounded-md bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-[9px] border-2 border-white"
            style={{ marginRight: i < PRESENCE_USERS.length - 1 ? '-5px' : '0' }}
          >
            {initials(user)}
          </div>
        ))}
      </div>
      <span className="text-xs text-neutral-400 ml-2">
        <span className="font-semibold text-neutral-600">4 people</span> active in the last 15 min
      </span>
    </div>
  );
}

function EventCard({ item, onOpen }) {
  return (
    <div className="bg-white border border-neutral-100 border-l-[3px] border-l-orange-500 rounded-2xl p-4 hover:border-neutral-200 hover:border-l-orange-500 transition-colors">
      <div className="flex justify-between items-start mb-2.5">
        <div className="flex gap-2.5 items-start">
          <Avatar name={item.author} variant="pro" />
          <div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 rounded px-1.5 py-0.5 mb-1">
             Campus event            
             
             </span>
            <h3 className="text-sm font-bold text-neutral-950 leading-tight">{item.title}</h3>
          </div>
        </div>
        <span className="text-[11px] text-neutral-400 whitespace-nowrap pt-0.5 ml-2">{item.time}</span>
      </div>
      <p className="text-xs text-neutral-500 flex items-center gap-1.5 ml-10 mb-2.5">
        <span className="text-orange-500">📍</span>
        {item.location}
      </p>
      <div className="flex justify-between items-center ml-10 pt-2.5 border-t border-neutral-100">
        <span className="text-[11px] text-neutral-400">
          Hosted by <span className="font-medium text-neutral-600">{item.author}</span>
        </span>
        <button onClick={onOpen} className="text-[11px] font-semibold text-orange-600 hover:text-orange-800 transition-colors">
          RSVP →
        </button>
      </div>
    </div>
  );
}

function StatusCard({ item }) {
  return (
    <div className="bg-white border border-neutral-100 rounded-2xl p-4 hover:border-neutral-200 transition-colors">
      <div className="flex gap-2.5 items-center mb-3">
        <Avatar name={item.author} variant="neutral" />
        <div>
          <p className="text-sm font-semibold text-neutral-900 leading-none">{item.author}</p>
          <p className="text-[11px] text-neutral-400 mt-0.5">{item.time}</p>
        </div>
      </div>
      <p className="text-sm text-neutral-800 bg-neutral-50 rounded-xl px-3 py-2.5 leading-relaxed">
        {item.text}
      </p>
    </div>
  );
}

function FeedItem({ item, onOpen }) {
    if (item.type === 'event') return <EventCard item={item} onOpen={onOpen} />;
    return <StatusCard item={item} />;
}

function StatusInput({ onPost }) {
  const [text, setText] = useState('');
  const MAX = 200;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onPost(text.trim());
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-neutral-100 rounded-2xl p-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What are you working on right now?"
        maxLength={MAX}
        rows={2}
        className="w-full text-sm border-none focus:outline-none text-neutral-800 placeholder-neutral-400 bg-transparent resize-none leading-relaxed"
      />
      <div className="flex justify-between items-center border-t border-neutral-100 pt-3">
        <span className="text-[11px] text-neutral-400">{MAX - text.length}</span>
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-200 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          Post status
        </button>
      </div>
    </form>
  );
}

function EventForm({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) return;
    onSubmit({ title: title.trim(), location: location.trim(), time: time.trim() || 'TBD' });
  };

  const inputClass = "w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all font-[inherit]";

  return (
    <div className="bg-white border border-orange-200 rounded-2xl p-5">
      <h2 className="text-sm font-bold text-neutral-950 mb-0.5">Host a campus event</h2>
      <p className="text-xs text-neutral-400 mb-4">Open it up — anyone nearby can see it and RSVP.</p>
      <div className="space-y-3">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Event title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="React study session"
            maxLength={80}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="UTS Building 11, Lab 302"
            maxLength={80}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Time</label>
          <input
            type="text"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="3:00 PM"
            maxLength={40}
            className={inputClass}
          />
        </div>
      </div>
      <div className="flex gap-2 mt-5">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!title.trim() || !location.trim()}
          className="flex-[2] bg-orange-600 hover:bg-orange-700 disabled:bg-orange-200 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          Publish event
        </button>
      </div>
    </div>
  );
}

function Header({ page, onBack, showEventForm, onToggle }) {
    return (
      <header className="bg-white border border-neutral-100 rounded-2xl px-4 py-3 flex justify-between items-center sticky top-4 z-10 mb-5 shadow-sm">
        <div className="flex items-center gap-2.5">
          {page === 'event' ? (
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
            >
              ← Back
            </button>
          ) : (
            <>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center border border-orange-200">
                <span className="text-orange-700 font-bold text-sm">R</span>
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight text-neutral-950 leading-none">Recess</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">Work, study, connect</p>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {page === 'feed' && (
            <>
              <div className="flex items-center gap-1.5 text-xs text-neutral-500 bg-white border border-neutral-100 rounded-full px-3 py-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500" />
                </span>
                <span className="sr-only">Live — </span>
                UTS Campus
              </div>
              <button
                onClick={onToggle}
                className="text-xs bg-orange-600 hover:bg-orange-700 text-white font-semibold px-3.5 py-2 rounded-xl transition-colors"
              >
                {showEventForm ? '✕ Cancel' : '+ Host event'}
              </button>
            </>
          )}
        </div>
      </header>
    );
  }

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

   const handleOpenEvent = (eventData) => {
        setSelectedEvent(eventData);
        setJoined(false);
        setPage('event');
    };

       const currentEventDetails = selectedEvent ? {
        title: selectedEvent.title,
        description: 'Join us for this campus event! RSVP below to confirm your attendance.',
        location: selectedEvent.location,
        time: selectedEvent.time,
        host: {
        name: selectedEvent.author,
        initials: initials(selectedEvent.author),
        detail: 'UTS Student',
        }
    } : sampleEvent;


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
            event={currentEventDetails}
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

            {feed.map(item => (
              <FeedItem 
                key={item.id} 
                item={item} 
                onOpen={() => handleOpenEvent(item)} 
              />
            ))}
          </div>
        )}

        <footer className="text-center text-[11px] text-neutral-400 mt-12 pt-6 border-t border-neutral-100">
          Recess v1.3 · Campus coordination for UTS
        </footer>

      </div>
    </div>
  );
}