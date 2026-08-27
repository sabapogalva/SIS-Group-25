export default function EventDetails({ event, joined, onBack, onJoin }) {
  const { title, location, time, description, host } = event;

  return (
    <div className="min-h-screen bg-neutral-50 p-6 font-sans">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-neutral-500 hover:text-neutral-800"
            >
              ← Back
            </button>
          ) : (
            <h1 className="text-xl font-bold tracking-tight text-indigo-600">Recess</h1>
          )}
          <span className="text-xs bg-indigo-50 text-indigo-600 font-medium px-2.5 py-1 rounded-full">
            UTS
          </span>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-neutral-100">
            <p className="text-xs font-medium text-indigo-600 mb-1">Event</p>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">{title}</h1>
            {description && (
              <p className="text-sm text-neutral-500 mt-2 leading-relaxed">{description}</p>
            )}
          </div>

          <div className="p-5 space-y-4 border-b border-neutral-100">
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Location</p>
                <p className="text-sm font-medium text-neutral-800">{location}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Time</p>
                <p className="text-sm font-medium text-neutral-800">{time}</p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <p className="text-xs text-neutral-400 mb-3">Posted by</p>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                {host.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">{host.name}</p>
                <p className="text-xs text-neutral-500">{host.detail}</p>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onJoin}
          disabled={joined}
          className={`mt-5 w-full py-3.5 rounded-xl text-sm font-semibold transition-all ${
            joined
              ? 'bg-neutral-100 text-neutral-400 cursor-default'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
          }`}
        >
          {joined ? 'You’re going' : 'Join event'}
        </button>
      </div>
    </div>
  );
}
