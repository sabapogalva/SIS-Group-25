import { useState } from 'react';

export default function Feed({ onOpenEvent }) {
  const [status, setStatus] = useState('');
  const [feed, setFeed] = useState([
    { text: 'Working on software engineering capstone architecture 💻', time: 'Just now', hasEvent: true },
  ]);

  const handlePost = (e) => {
    e.preventDefault();
    if (!status.trim()) return;
    setFeed([{ text: status, time: 'Just now' }, ...feed]);
    setStatus('');
  };

  return (
    <>
      <form onSubmit={handlePost} className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs mb-4">
        <input
          type="text"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          placeholder="What are you working on right now?"
          className="w-full text-sm border-none focus:outline-none mb-3 text-neutral-800 placeholder-neutral-400"
        />
        <div className="flex justify-end border-t border-neutral-100 pt-3">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all"
          >
            Post Status
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {feed.map((item, index) => (
          <div key={index} className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
            <p className="text-sm text-neutral-800 mb-1">{item.text}</p>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-neutral-400">{item.time}</span>
              {item.hasEvent && (
                <button
                  type="button"
                  onClick={onOpenEvent}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all"
                >
                  Details
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
