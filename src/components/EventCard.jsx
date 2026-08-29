import Avatar from './Avatar';

export default function EventCard({ item, onOpen }) {
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