import React, { useState, useEffect, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ThemeToggle from './ThemeToggle';
import Avatar from './Avatar';
import { Profile, View } from '../types';
import { Bars3Icon, UserCircleIcon } from './Icons';

interface HeaderProps {
    session?: Session | null;
    profile?: Profile | null;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    setActiveView: (view: View) => void;
    onMenuToggle: () => void;
    isSupabaseEnabled?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  session,
  profile,
  theme,
  toggleTheme,
  setActiveView,
  onMenuToggle,
  isSupabaseEnabled = false,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (isSupabaseEnabled) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Supabase sign-out failed', error);
      }
    }

    navigate('/login', { replace: true });
  };

  const showAccountMenu = Boolean(session && isSupabaseEnabled);
  const primaryLabel = session?.user?.email ?? profile?.teamName ?? 'USACE Public Affairs';
  const secondaryLabel = session?.user?.email
    ? profile?.teamName ?? 'USACE Team'
    : 'Demo data loaded';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showAccountMenu && dropdownOpen) {
      setDropdownOpen(false);
    }
  }, [showAccountMenu, dropdownOpen]);

  return (
    <header className="flex-shrink-0 px-4 pt-6 sm:px-6 lg:px-10">
      <div className="glass-header flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/40 bg-white/70 text-navy-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-usace-red focus-visible:ring-offset-2 dark:border-white/10 dark:bg-white/10 dark:text-navy-100 dark:focus-visible:ring-offset-navy-900 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-usace-blue/80 dark:text-navy-200/80">USACE PAO</p>
            <h1 className="text-xl font-semibold text-navy-900 dark:text-white">KPI Command Center</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <div className="relative" ref={dropdownRef}>
            {showAccountMenu ? (
              <>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/70 px-2 py-1 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-usace-red focus-visible:ring-offset-2 dark:border-white/10 dark:bg-white/10 dark:focus-visible:ring-offset-navy-900"
                >
                  <Avatar url={profile?.avatarUrl} name={primaryLabel} size={36} />
                  <div className="hidden md:flex flex-col items-start text-left">
                    <span className="text-sm font-semibold text-navy-900 dark:text-white">{primaryLabel}</span>
                    <span className="text-xs font-medium text-navy-500/80 dark:text-navy-200/80">{secondaryLabel}</span>
                  </div>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 origin-top-right rounded-2xl border border-white/40 bg-white/90 p-2 shadow-xl ring-1 ring-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-navy-900/90">
                    <button
                      onClick={() => {
                        setActiveView('profile');
                        setDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-navy-600 transition hover:bg-usace-blue/10 hover:text-usace-blue dark:text-navy-100 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      <UserCircleIcon className="h-5 w-5" />
                      My Profile
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-navy-600 transition hover:bg-usace-red/10 hover:text-usace-red dark:text-navy-100 dark:hover:bg-usace-red/20 dark:hover:text-white"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/70 px-3 py-1.5 shadow-sm dark:border-white/10 dark:bg-white/10">
                <Avatar url={profile?.avatarUrl} name={primaryLabel} size={36} />
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-semibold text-navy-900 dark:text-white">{primaryLabel}</span>
                  <span className="text-xs font-medium text-navy-500/80 dark:text-navy-200/80">{secondaryLabel}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;