import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { UsaceLogoIcon, CheckCircleIcon, XCircleIcon } from './Icons';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // The onAuthStateChange listener in App.tsx will handle the redirect.
    } catch (error: any) {
      setIsError(true);
      setMessage(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    
    try {
      setLoading(true);
      // This will attempt to sign up the user.
      const { error } = await supabase.auth.signUp({ email, password });

      if (error) {
        // If an error occurs (e.g., user already exists), throw it to be caught below.
        throw error;
      }
      
      // A trigger in the Supabase backend should automatically create the user profile.
      // This avoids RLS issues with the client trying to write to the profiles table.
      setIsError(false);
      setMessage('Registration successful! Please check your email to confirm your account.');

    } catch (error: any) {
      setIsError(true);
      // Provide a more user-friendly message for the most common error.
      if (error.message.includes('User already registered')) {
         setMessage('A user with this email already exists. Please use the Sign In button.');
      } else {
         setMessage(error.error_description || error.message);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const MessageDisplay = () => {
      if (!message) return null;
      const Icon = isError ? XCircleIcon : CheckCircleIcon;
      return (
        <div className={`p-4 rounded-md text-sm flex items-start ${isError ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'}`}>
            <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
            <span>{message}</span>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-50 dark:bg-navy-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
             <UsaceLogoIcon className="h-12 w-auto text-usace-red" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            USACE PAO KPI Tracker
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-navy-300">
            Sign in or create an account to continue
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-800 placeholder-gray-500 dark:placeholder-navy-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-usace-blue focus:border-usace-blue focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-800 placeholder-gray-500 dark:placeholder-navy-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-usace-blue focus:border-usace-blue focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <MessageDisplay />

          <div className="flex items-center justify-between gap-4">
            <button
              type="submit"
              onClick={handleLogin}
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-usace-blue hover:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-usace-blue disabled:bg-navy-400 disabled:opacity-75 transition-colors"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={handleSignup}
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-usace-blue text-sm font-medium rounded-md text-usace-blue bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-usace-red disabled:opacity-50 transition-colors"
            >
              {loading ? '...' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;