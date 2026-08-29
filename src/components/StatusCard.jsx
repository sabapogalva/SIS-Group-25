import Avatar from './Avatar';

export default function StatusCard({ item }) {
  return (
    <div className="bg-white border border-neutral-100 rounded-2xl p-4 hover:border-neutral-200 transition-colors">
      <div className="flex gap-2.5 items-center mb-3">
        <Avatar name={item.author} variant="neutral" />
        <div>
          <p className="text-sm font-semibold text-neutral-900 leading-none">{item.author}</p>
          <p className="text-[11px] text-neutral-400 mt-0.5">{item.time}</p>
        </div>
      </div>
      <p className="text-sm text-neutral-800 bg-neutral-50 rounded-xl px-3 py-2.5 leading-relaxed">
        {item.text}
      </p>
    </div>
  );
}