import { useState } from 'react';
import EventDetails from './EventDetails.jsx';
import Feed from './Feed.jsx';

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

export default function App() {
  const [page, setPage] = useState('feed');
  const [joined, setJoined] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 p-6 font-sans">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          {page === 'event' ? (
            <button
              type="button"
              onClick={() => setPage('feed')}
              className="text-sm text-neutral-500 hover:text-neutral-800"
            >
              ← Back
            </button>
          ) : (
            <h1 className="text-xl font-bold tracking-tight text-indigo-600">Recess</h1>
          )}
          <span className="text-xs bg-indigo-50 text-indigo-600 font-medium px-2.5 py-1 rounded-full">UTS</span>
        </div>

        {page === 'event' ? (
          <EventDetails
            event={sampleEvent}
            joined={joined}
            onJoin={() => setJoined(true)}
          />
        ) : (
          <Feed onOpenEvent={() => setPage('event')} />
        )}
      </div>
    </div>
  );
}
