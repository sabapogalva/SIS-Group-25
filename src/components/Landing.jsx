export default function Landing({ onGetStarted }) {
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-block bg-orange-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            UTS Campus Coordination
          </div>
          <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight">
            Welcome to Recess
          </h1>
          <p className="text-neutral-600 text-sm">
            Connect with your campus community, post updates, and discover what's happening around UTS today.
          </p>
          <div className="space-y-3 pt-4">
            <button
              onClick={() => onGetStarted('signin')}
              className="w-full bg-neutral-900 text-white font-medium py-3 rounded-xl hover:bg-neutral-800 transition shadow-sm"
            >
              Sign In
            </button>
            <button
              onClick={() => onGetStarted('signup')}
              className="w-full bg-white text-neutral-900 border border-neutral-200 font-medium py-3 rounded-xl hover:bg-neutral-50 transition shadow-sm"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }