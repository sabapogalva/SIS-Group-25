import { useState } from 'react';

const currentUser = 'Salha';

let nextId = 1;
const makeId = () => nextId++;

export default function App() {
  const [status, setStatus] = useState('');
  const [feed, setFeed] = useState([
    { 
      id: makeId(), 
      text: 'Working on software engineering capstone architecture 💻', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: currentUser
    }
  ]);

  const handlePost = (e) => {
    e.preventDefault();
    if (!status.trim()) return;
    setFeed([
      { 
        id: makeId(), 
        text: status, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        author: currentUser
      }, 
      ...feed
    ]);
    setStatus('');
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6 font-sans">
      <div className="max-w-md mx-auto">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold tracking-tight text-indigo-600">Recess</h1>
          <span className="text-xs bg-indigo-50 text-indigo-600 font-medium px-2.5 py-1 rounded-full">UTS</span>
        </div>

        <form onSubmit={handlePost} className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm mb-4">
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
              disabled={!status.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-200 disabled:cursor-not-allowed text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all"
            >
              Post Status
            </button>
          </div>
        </form>

        <div className="space-y-2">
          {feed.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-neutral-700">{item.author}</span>
                <span className="text-xs text-neutral-400">{item.time}</span>
              </div>
              <p className="text-sm text-neutral-800">{item.text}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}