import React, { useState, useEffect, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import ThemeToggle from './ThemeToggle';
import Avatar from './Avatar';
import { Profile, View } from '../types';
import { UserCircleIcon } from './Icons';

interface HeaderProps {
    session: Session;
    profile: Profile;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    setActiveView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ session, profile, theme, toggleTheme, setActiveView }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-3 bg-transparent rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-navy-800 focus:ring-usace-red"
                >
                    <Avatar url={profile.avatarUrl} name={session.user.email} size={32} />
                    <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-medium text-navy-800 dark:text-white">{session.user.email}</span>
                        <span className="text-xs text-gray-500 dark:text-navy-400">{profile.teamName}</span>
                    </div>
                </button>
                {dropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-navy-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <button
                            onClick={() => {
                                setActiveView('profile');
                                setDropdownOpen(false);
                            }}
                            className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-navy-200 hover:bg-gray-100 dark:hover:bg-navy-600"
                        >
                           <UserCircleIcon className="h-5 w-5 mr-3" />
                           My Profile
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-navy-200 hover:bg-gray-100 dark:hover:bg-navy-600"
                        >
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;