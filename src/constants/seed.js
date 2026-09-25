import { makeId } from '../utils/helpers';

export const CURRENT_USER = 'Salha';

export const PRESENCE_USERS = ['Salha', 'Ahmed', 'Saba', 'Jay'];


export const SEED_FEED = [
  {
    id: 'event-1',
    type: 'event',
    title: 'Study group at UTS Library',
    location: 'UTS Library (Building 11)',
    time: 'Today, 2:00 PM',
    author: 'Sarah Brown',
    mapX: 818,
    mapY: 1080,
  },
  {
    id: 'event-2',
    type: 'event',
    title: 'Basketball meetup',
    location: 'UTS Broadway Building',
    time: 'Today, 5:00 PM',
    author: 'James Lee',
    mapX: 990,
    mapY: 1230,
  },
];


export const SAMPLE_EVENT = {
  title: 'Capstone study session',
  description: 'Working through architecture diagrams and sprint planning before Friday demo.',
  location: 'Building 11, Level 4',
  time: 'Friday 28th August, 3:00 PM – 5:00 PM',
  latitude: -33.8832,
  longitude: 151.2006,
  host: {
    name: 'Alex Chen',
    initials: 'AC',
    detail: 'Software Engineering · 4th year',
  },
};