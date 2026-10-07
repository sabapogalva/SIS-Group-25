import { getCategory, toTagList } from '../lib/eventCategories';

export default function EventDetails({ event, joined, onJoin }) {
  const { title, location, time, description, host, isCreator } = event;

  const c = getCategory(event.category);
  const tags = toTagList(event.tags);

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs">
        <div className={`border-b border-neutral-100 p-5`}>
          <p className={`mb-1 text-xs font-medium ${c.text}`}>
            <span aria-hidden="true">{c.emoji}</span> {c.label} event
          </p>

          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            {title}
          </h2>

          {description && (
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">
              {description}
            </p>
          )}
        </div>

        <div className="space-y-4 border-b border-neutral-100 p-5">
          <div className="flex gap-3">
            <div
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${c.soft} ${c.text}`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>

            <div>
              <p className="text-xs text-neutral-400">Location</p>
              <p className="text-sm font-medium text-neutral-800">{location}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${c.soft} ${c.text}`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <div>
              <p className="text-xs text-neutral-400">Time</p>
              <p className="text-sm font-medium text-neutral-800">{time}</p>
            </div>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="border-b border-neutral-100 p-5">
            <p className="mb-3 text-xs text-neutral-400">Who this is for</p>

            <div className="flex flex-wrap gap-1.5">
              {tags.map(tag => (
                <span
                  key={tag}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${c.chip}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="p-5">
          <p className="mb-3 text-xs text-neutral-400">Posted by</p>

          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white ${c.solid}`}
            >
              {host.initials}
            </div>

            <div>
              <p className="text-sm font-semibold text-neutral-900">
                {host.name}
              </p>
              <p className="text-xs text-neutral-500">{host.detail}</p>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onJoin}
        disabled={joined || isCreator}
        className={`mt-5 w-full rounded-xl py-3.5 text-sm font-semibold transition-all ${
          joined || isCreator
            ? 'cursor-default bg-neutral-100 text-neutral-400'
            : `${c.joinButton} text-white shadow-xs`
        }`}
      >
        {isCreator
          ? 'You are hosting this event'
          : joined
            ? "You're going"
            : 'Join event'}
      </button>
    </>
  );
}
