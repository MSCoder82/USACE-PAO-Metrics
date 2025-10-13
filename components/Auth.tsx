import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UsaceLogoIcon, CheckCircleIcon, XCircleIcon } from './Icons';
import { Team } from '../types';

type AuthMode = 'signIn' | 'signUp';

type AuthProps = {
  initialMode?: AuthMode;
};

const Auth: React.FC<AuthProps> = ({ initialMode = 'signIn' }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  useEffect(() => {
    setMode(initialMode);
    setMessage('');
    setIsError(false);
  }, [initialMode]);

  useEffect(() => {
    if (mode === 'signUp') {
      const fetchTeams = async () => {
        const { data, error } = await supabase.from('teams').select('id, name');
        if (error) {
          console.error('Error fetching teams:', error);
          setIsError(true);
          if (error.code === '42P01') {
            setMessage('Database setup incomplete. The "teams" table is missing. Please run the required SQL setup script.');
          } else {
            setMessage('Could not load teams for registration.');
          }
          setTeams([]);
          setSelectedTeamId('');
        } else {
          setTeams(data);
          if (data.length > 0) {
            setSelectedTeamId(String(data[0].id));
          }
        }
      };
      void fetchTeams();
    } else {
      setTeams([]);
      setSelectedTeamId('');
    }
  }, [mode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
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

    if (!selectedTeamId) {
      setIsError(true);
      setMessage('Please select a team to join.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            team_id: parseInt(selectedTeamId, 10),
          },
        },
      });
      if (error) throw error;

      setIsError(false);
      setMessage('Registration successful! Please check your email to confirm your account.');
    } catch (error: any) {
      setIsError(true);
      if (error.message === 'Database error saving new user') {
        setMessage('An internal database error occurred during signup. Please run the latest SQL setup script.');
      } else if (error.message?.includes('User already registered')) {
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
      <div
        className={`glass-panel p-4 text-sm ${
          isError
            ? 'border-red-200/60 bg-red-50/60 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200'
            : 'border-green-200/60 bg-green-50/60 text-green-800 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 flex-shrink-0" />
          <span>{message}</span>
        </div>
      </div>
    );
  };

  const toggleMode = () => {
    const nextMode: AuthMode = mode === 'signIn' ? 'signUp' : 'signIn';
    setMode(nextMode);
    setMessage('');
    setIsError(false);
    setPassword('');
    if (nextMode === 'signIn') {
      navigate('/login', { replace: true });
    } else {
      navigate('/register', { replace: true });
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/70 via-white/30 to-navy-100/30 dark:from-navy-950 dark:via-navy-950/80 dark:to-navy-900" />
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="glass-panel w-full max-w-md space-y-8 md:p-10">
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-usace-red/20 to-usace-blue/20 text-usace-blue">
              <UsaceLogoIcon className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-semibold text-navy-900 dark:text-white">USACE PAO KPI Tracker</h2>
              <p className="text-sm text-navy-600 dark:text-navy-200">
                {mode === 'signIn' ? 'Sign in to your account' : 'Create a new account'}
              </p>
            </div>
          </div>
          <form className="space-y-5" onSubmit={mode === 'signIn' ? handleLogin : handleSignup}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email-address" className="text-xs font-semibold uppercase tracking-wide text-navy-500 dark:text-navy-200">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-modern"
                  placeholder="name@usace.army.mil"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-navy-500 dark:text-navy-200">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                  required
                  className="input-modern"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {mode === 'signUp' && (
                <div className="space-y-2">
                  <label htmlFor="team" className="text-xs font-semibold uppercase tracking-wide text-navy-500 dark:text-navy-200">
                    Team
                  </label>
                  <select
                    id="team"
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    required
                    className="input-modern"
                  >
                    {teams.length === 0 ? (
                      <option disabled>{message ? '' : 'Loading teams...'}</option>
                    ) : (
                      teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}
            </div>

            <MessageDisplay />

            <div className="space-y-3">
              <button type="submit" disabled={loading} className="surface-button w-full justify-center text-base">
                {loading ? 'Processing…' : mode === 'signIn' ? 'Sign in' : 'Create account'}
              </button>
              <p className="text-center text-sm text-navy-600 dark:text-navy-200">
                {mode === 'signIn' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="font-semibold text-usace-blue hover:text-usace-red"
                >
                  {mode === 'signIn' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
