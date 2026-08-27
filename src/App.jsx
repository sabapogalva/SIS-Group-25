import { useState } from 'react';
import EventDetails from './EventDetails.jsx';

const sampleEvent = {
  title: 'Capstone study session',
  description: 'Working through architecture diagrams and sprint planning before Friday’s demo.',
  location: 'Building 11, Level 4 — UTS Library',
  time: 'Friday, 3:00 PM – 5:00 PM',
  host: {
    name: 'Alex Chen',
    initials: 'AC',
    detail: 'Software Engineering · 4th year',
  },
};

export default function App() {
  const [joined, setJoined] = useState(false);

  return (
    <EventDetails
      event={sampleEvent}
      joined={joined}
      onJoin={() => setJoined(true)}
    />
  );
}
