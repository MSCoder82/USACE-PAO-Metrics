import React from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
    session: Session;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ session, theme, toggleTheme }) => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  }

  return (
    <header className="flex-shrink-0 bg-white dark:bg-navy-800 border-b border-navy-200 dark:border-navy-700">
      <div className="flex items-center justify-between p-4 h-16">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-navy-800 dark:text-white tracking-tight">
            PAO KPI Tracker
          </h1>
        </div>
        <div className="flex items-center space-x-4">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <div className="text-sm text-gray-600 dark:text-navy-300">
                Signed in as <span className="font-medium text-navy-800 dark:text-white">{session.user.email}</span>
            </div>
            <button
                onClick={handleSignOut}
                className="inline-flex justify-center rounded-md border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 py-2 px-4 text-sm font-medium text-gray-700 dark:text-navy-100 shadow-sm hover:bg-gray-50 dark:hover:bg-navy-600 focus:outline-none focus:ring-2 focus:ring-usace-red focus:ring-offset-2 dark:focus:ring-offset-navy-800 transition-colors"
            >
                Sign Out
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;