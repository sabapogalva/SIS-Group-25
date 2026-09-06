import { makeId } from '../utils/helpers';

export const CURRENT_USER = 'Salha';

export const PRESENCE_USERS = ['Salha', 'Ahmed', 'Saba', 'Jay'];

export const SEED_FEED = [
  { id: makeId(), type: 'event', title: 'Capstone sprint — frontend sync', location: 'UTS Library, Level 4', time: '2:00 PM', author: 'Salha',  latitude: -33.8832,
    longitude: 151.2006 },
  { id: makeId(), type: 'status', text: 'Working on software engineering capstone architecture', time: '10 min ago', author: 'Ahmed' },
  { id: makeId(), type: 'status', text: 'Anyone in the DB labs? Looking for a study buddy til 5pm', time: '22 min ago', author: 'Saba' },
  { id: makeId(), type: 'event', title: 'Coffee run — Tower Building cafe', location: 'Tower Building, Ground Floor', time: '3:30 PM', author: 'Jay' },
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