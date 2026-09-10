import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Auth({ mode, onBack, onSuccess }) {
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }

      onSuccess();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
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
          <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Recess</span>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            {isSignUp ? 'Enter your details to join Recess' : 'Enter your details to sign in'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100">
            {errorMsg}
          </div>
        )}


        <form onSubmit={handleSubmit} className="space-y-4">

          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Full Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@uts.edu.au" 
              required
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

        <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              required
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>


          <button
            type="submit"
            disabled={loading}
            
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