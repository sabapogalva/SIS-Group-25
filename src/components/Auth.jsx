import { useState } from 'react';

export default function Auth({ mode, onBack, onSuccess }) {
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');

  const handleSubmit = (e) => {
    e.preventDefault();
    // For pure UI: instantly jump to the main feed app on submit
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-neutral-100 space-y-6">
        <div className="flex justify-between items-center">
          <button 
            onClick={onBack}
            className="text-xs text-neutral-500 hover:text-neutral-800 font-medium"
          >
            ← Back
          </button>
          <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Recess UI</span>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            {isSignUp ? 'Enter your details to join Recess' : 'Enter your details to sign in'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Full Name</label>
              <input 
                type="text" 
                placeholder="Salha Alghoraibi" 
                required
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Email</label>
            <input 
              type="email" 
              placeholder="student@uts.edu.au" 
              required
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-600 text-white font-medium py-2.5 rounded-xl hover:bg-orange-700 transition text-sm shadow-sm"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-neutral-500">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-orange-600 font-semibold hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}