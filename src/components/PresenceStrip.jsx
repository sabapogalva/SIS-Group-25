import { PRESENCE_USERS } from '../constants/seed';

const initials = (name) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

export default function PresenceStrip() {
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