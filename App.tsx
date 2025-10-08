import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { KpiDataPoint, View, Role, Campaign, Profile, KpiGoal } from './types';
import { MOCK_CAMPAIGN_DATA, MOCK_KPI_DATA, MOCK_KPI_GOALS, NAVIGATION_ITEMS } from './constants';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import KpiTable from './components/KpiTable';
import DataEntry from './components/DataEntry';
import PlanBuilder from './components/PlanBuilder';
import Campaigns from './components/Campaigns';
import GoalSetter from './components/GoalSetter';
import SocialMedia from './components/SocialMedia';
import Auth from './components/Auth';
import ProfilePage from './components/ProfilePage';
import { supabase, isSupabaseConfigured, supabaseConfigurationError } from './lib/supabase';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useTheme } from './contexts/ThemeProvider';
import { useNotification } from './contexts/NotificationProvider';
import Spinner from './components/Spinner';

const FALLBACK_PROFILE: Profile = {
  role: 'chief',
  teamId: 101,
  teamName: 'Public Affairs Office',
};

const App: React.FC = () => {
  const supabaseEnabled = isSupabaseConfigured && supabaseConfigurationError === null;
  const [kpiData, setKpiData] = useState<KpiDataPoint[]>(() => (supabaseEnabled ? [] : [...MOCK_KPI_DATA]));
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => (supabaseEnabled ? [] : [...MOCK_CAMPAIGN_DATA]));
  const [goals, setGoals] = useState<KpiGoal[]>(() => (supabaseEnabled ? [] : [...MOCK_KPI_GOALS]));
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(() => (supabaseEnabled ? null : { ...FALLBACK_PROFILE }));
  const [isLoading, setIsLoading] = useState(supabaseEnabled);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useNotification();

  const handleSetActiveView = useCallback((view: View) => {
    setActiveView(view);
    setIsSidebarOpen(false);
  }, []);

  const handleSidebarToggle = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);


  const fetchKpiData = useCallback(async () => {
    if (!supabaseEnabled) {
      setKpiData([...MOCK_KPI_DATA]);
      return;
    }
    const { data, error } = await supabase.from('kpi_data').select('*').order('date', { ascending: false });
    if (error) {
      console.error('Error fetching KPI data:', error);
      showToast('Error fetching KPI data.', 'error');
    } else {
      setKpiData(data as KpiDataPoint[]);
    }
  }, [showToast, supabaseEnabled]);

  const fetchCampaigns = useCallback(async () => {
    if (!supabaseEnabled) {
      setCampaigns([...MOCK_CAMPAIGN_DATA]);
      return;
    }
    const { data, error } = await supabase.from('campaigns').select('*').order('start_date', { ascending: false });
    if (error) {
      console.error('Error fetching campaigns:', error);
      showToast('Error fetching campaigns.', 'error');
    } else {
      setCampaigns(data as Campaign[]);
    }
  }, [showToast, supabaseEnabled]);

  const fetchGoals = useCallback(async () => {
    if (!supabaseEnabled) {
      setGoals([...MOCK_KPI_GOALS]);
      return;
    }
    const { data, error } = await supabase.from('kpi_goals').select('*').order('start_date', { ascending: false });
    if (error) {
        console.error('Error fetching KPI goals:', error);
        showToast('Error fetching KPI goals.', 'error');
    } else {
        setGoals(data as KpiGoal[]);
    }
  }, [showToast, supabaseEnabled]);

  const isMountedRef = useRef(true);
  const isInitializingRef = useRef(false);

  const handleSession = useCallback(
    async (currentSession: Session | null, options: { fetchData?: boolean } = {}) => {
      if (!supabaseEnabled) {
        return;
      }
      if (!isMountedRef.current) {
        return;
      }

      setSession(currentSession);

      if (!currentSession) {
        setProfile(null);
        setKpiData([]);
        setCampaigns([]);
        setGoals([]);
        return;
      }

      if (options.fetchData === false) {
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, avatar_url, teams (id, name)')
          .eq('id', currentSession.user.id)
          .single();

        if (!isMountedRef.current) {
          return;
        }

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setProfile({
            role: (data.role as Role) || 'staff',
            teamId: data.teams?.id ?? -1,
            teamName: data.teams?.name ?? 'No Team',
            avatarUrl: data.avatar_url,
          });
        } else {
          setProfile({ role: 'staff', teamId: -1, teamName: 'Unknown Team' });
        }

        await Promise.all([fetchKpiData(), fetchCampaigns(), fetchGoals()]);
      } catch (error) {
        if (!isMountedRef.current) {
          return;
        }

        const typedError = error as { message?: string; code?: string };
        console.error(
          `Error fetching user profile: ${typedError.message || 'An unknown error occurred'}. Code: ${typedError.code || 'N/A'}`
        );
        if (typedError.code === '42P01') {
          showToast('Database error: A required table is missing. Run the setup SQL.', 'error');
        } else {
          showToast('Error fetching user profile.', 'error');
        }
        setProfile({ role: 'staff', teamId: -1, teamName: 'Error' });
      }
    },
    [fetchKpiData, fetchCampaigns, fetchGoals, showToast, supabaseEnabled]
  );

  const initializeSession = useCallback(async (options: { showLoading?: boolean } = {}) => {
    if (!supabaseEnabled) {
      return;
    }
    if (isInitializingRef.current) {
      return;
    }

    isInitializingRef.current = true;

    try {
      if (isMountedRef.current && options.showLoading !== false) {
        setIsLoading(true);
      }

      const { data, error } = await supabase.auth.getSession();

      if (!isMountedRef.current) {
        return;
      }

      if (error) {
        console.error('Error retrieving auth session:', error);
      }

      await handleSession(data?.session ?? null);
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }

      console.error('Unexpected error initializing authentication session:', error);
      showToast('Error initializing authentication session. Please refresh and try again.', 'error');
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      isInitializingRef.current = false;
    }
  }, [handleSession, showToast, supabaseEnabled]);

  useEffect(() => {
    if (!supabaseEnabled) {
      setProfile({ ...FALLBACK_PROFILE });
      setIsLoading(false);
      return;
    }
    // This listener handles the entire auth lifecycle: initial load, login, and logout.
    isMountedRef.current = true;

    void initializeSession();

    const handledEvents: AuthChangeEvent[] = ['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED'];
    const silentEvents: AuthChangeEvent[] = ['TOKEN_REFRESHED'];

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMountedRef.current) {
          return;
        }

      if (silentEvents.includes(event)) {
        await handleSession(session, { fetchData: false });
        return;
      }

      if (event === 'INITIAL_SESSION') {
        return;
      }

      if (!handledEvents.includes(event)) {
        return;
      }

      if (isMountedRef.current) {
        setIsLoading(true);
      }

      try {
        await handleSession(session ?? null);
      } catch (error) {
        if (!isMountedRef.current) {
          return;
        }

        console.error('Unexpected error handling auth state change:', error);
        showToast('Authentication update failed. Please refresh the page.', 'error');
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [handleSession, initializeSession, showToast, supabaseEnabled]);

  useEffect(() => {
    if (!supabaseEnabled) {
      return;
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void initializeSession({ showLoading: false });
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        void initializeSession({ showLoading: false });
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initializeSession, supabaseEnabled]);


  const addKpiDataPoint = useCallback(async (newDataPoint: Omit<KpiDataPoint, 'id'>) => {
    if (!supabaseEnabled) {
      setKpiData((prevData) => {
        const nextId = prevData.reduce((max, item) => Math.max(max, item.id), 0) + 1;
        return [{ id: nextId, ...newDataPoint }, ...prevData];
      });
      handleSetActiveView('table');
      showToast('KPI entry successfully added!', 'success');
      return;
    }
    if (!session?.user) {
        showToast("No user session found. Cannot add KPI data.", 'error');
        return;
    }
    // team_id will be set by a database trigger based on the user's profile
    const { error } = await supabase.from('kpi_data').insert([
      { ...newDataPoint, user_id: session.user.id }
    ]);
    if (error) {
      console.error('Error inserting KPI data:', error);
      showToast(`Error: ${error.message}`, 'error');
    } else {
      await fetchKpiData(); // Refetch data
      handleSetActiveView('table'); // Switch to table view
      showToast("KPI entry successfully added!", 'success');
    }
  }, [session, fetchKpiData, showToast, handleSetActiveView, supabaseEnabled]);

  const addCampaign = useCallback(async (newCampaign: Omit<Campaign, 'id'>) => {
    if (!supabaseEnabled) {
      setCampaigns((prevCampaigns) => {
        const nextId = prevCampaigns.reduce((max, item) => Math.max(max, item.id), 0) + 1;
        return [...prevCampaigns, { id: nextId, ...newCampaign }];
      });
      showToast("Campaign created successfully!", 'success');
      return;
    }
    if (!session?.user) {
        showToast("No user session found. Cannot add campaign.", 'error');
        return;
    }
    // team_id will be set by a database trigger based on the user's profile
    const { error } = await supabase.from('campaigns').insert([
        { ...newCampaign, user_id: session.user.id }
    ]);

    if (error) {
        console.error('Error inserting campaign:', error);
        showToast(`Error: ${error.message}`, 'error');
    } else {
        await fetchCampaigns(); // Refetch campaigns
        showToast("Campaign created successfully!", 'success');
    }
  }, [session, fetchCampaigns, showToast, supabaseEnabled]);

  const addGoal = useCallback(async (newGoal: Omit<KpiGoal, 'id'>) => {
    if (!supabaseEnabled) {
      setGoals((prevGoals) => {
        const nextId = prevGoals.reduce((max, item) => Math.max(max, item.id), 0) + 1;
        return [...prevGoals, { id: nextId, ...newGoal }];
      });
      showToast("Goal created successfully!", 'success');
      return;
    }
    if (!session?.user) {
        showToast("No user session found. Cannot add goal.", 'error');
        return;
    }
    const { error } = await supabase.from('kpi_goals').insert([
        { ...newGoal, user_id: session.user.id }
    ]);

    if (error) {
        console.error('Error inserting KPI goal:', error);
        showToast(`Error: ${error.message}`, 'error');
    } else {
        await fetchGoals();
        showToast("Goal created successfully!", 'success');
    }
  }, [session, fetchGoals, showToast, supabaseEnabled]);

  const onProfileUpdate = (updatedProfileData: Partial<Profile>) => {
    setProfile(prevProfile => {
        if (!prevProfile) return null;
        return { ...prevProfile, ...updatedProfileData };
    });
    showToast('Profile updated successfully!', 'success');
  };
  
  const visibleNavItems = useMemo(() => {
    if (!profile) return [];
    return NAVIGATION_ITEMS.filter(item => item.roles.includes(profile.role));
  }, [profile]);

  const isViewAllowed = useCallback((view: View) => {
    if (!profile) return false;
    if (view === 'profile') return true; // Any authenticated user can see their own profile
    const item = NAVIGATION_ITEMS.find(navItem => navItem.id === view);
    return item ? item.roles.includes(profile.role) : false;
  }, [profile]);
  
  useEffect(() => {
    if (profile && !isViewAllowed(activeView)) {
      handleSetActiveView('dashboard');
    }
  }, [profile, activeView, isViewAllowed, handleSetActiveView]);

  const renderActiveView = () => {
    if (!profile || !isViewAllowed(activeView)) {
      // Default to dashboard if current view is not allowed
      return <Dashboard data={kpiData} campaigns={campaigns} goals={goals} />;
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard data={kpiData} campaigns={campaigns} goals={goals} />;
      case 'table':
        return <KpiTable data={kpiData} />;
      case 'data-entry':
        return <DataEntry onSubmit={addKpiDataPoint} campaigns={campaigns} />;
      case 'plan-builder':
        return <PlanBuilder />;
      case 'campaigns':
        return <Campaigns campaigns={campaigns} onAddCampaign={addCampaign} />;
      case 'goals':
        return <GoalSetter goals={goals} onAddGoal={addGoal} campaigns={campaigns} />;
      case 'social-media':
        return <SocialMedia role={profile.role} campaigns={campaigns} />;
      case 'profile':
        if (!session) {
          return <Dashboard data={kpiData} campaigns={campaigns} goals={goals} />;
        }
        return <ProfilePage session={session} profile={profile} onProfileUpdate={onProfileUpdate} />;
      default:
        return <Dashboard data={kpiData} campaigns={campaigns} goals={goals} />;
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (supabaseEnabled && (!session || !profile)) {
    return <Auth />;
  }

  if (!profile) {
    return <Spinner />;
  }

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden text-navy-900 transition-colors duration-300 ease-out dark:text-navy-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white/70 via-white/20 to-navy-100/20 dark:from-navy-950 dark:via-navy-950/70 dark:to-navy-900" />
      <Sidebar
        navigationItems={visibleNavItems}
        activeView={activeView}
        setActiveView={handleSetActiveView}
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
      />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-navy-950/60 backdrop-blur-sm lg:hidden"
          onClick={handleSidebarClose}
          aria-hidden="true"
        />
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          session={session ?? undefined}
          profile={profile}
          theme={theme}
          toggleTheme={toggleTheme}
          setActiveView={handleSetActiveView}
          onMenuToggle={handleSidebarToggle}
          isSupabaseEnabled={supabaseEnabled}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-8 sm:px-6 lg:px-12 subtle-scrollbar">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
