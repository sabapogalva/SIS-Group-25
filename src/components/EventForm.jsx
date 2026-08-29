import { useState } from 'react';

const inputClass = "w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all font-[inherit]";

export default function EventForm({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !location.trim()) return;
    onSubmit({ title: title.trim(), location: location.trim(), time: time.trim() || 'TBD' });
  };

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