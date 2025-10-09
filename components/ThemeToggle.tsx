import React from 'react';
import { SunIcon, MoonIcon } from './Icons';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      aria-pressed={theme === 'dark'}
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/40 bg-white/70 text-navy-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-usace-red focus-visible:ring-offset-2 dark:border-white/10 dark:bg-white/10 dark:text-navy-100 dark:focus-visible:ring-offset-navy-900"
    >
      {theme === 'light' ? (
        <MoonIcon className="h-5 w-5" />
      ) : (
        <SunIcon className="h-5 w-5" />
      )}
    </button>
  );
};

export default ThemeToggle;
