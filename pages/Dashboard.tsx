import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { KpiDataPoint, View, Role, Campaign, Profile, KpiGoal } from '../types';
import { MOCK_CAMPAIGN_DATA, MOCK_KPI_DATA, MOCK_KPI_GOALS, NAVIGATION_ITEMS } from '../constants';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import KpiTable from '../components/KpiTable';
import DataEntry from '../components/DataEntry';
import PlanBuilder from '../components/PlanBuilder';
import Campaigns from '../components/Campaigns';
import GoalSetter from '../components/GoalSetter';
import SocialMedia from '../components/SocialMedia';
import ProfilePage from '../components/ProfilePage';
import { supabase, isSupabaseConfigured, supabaseConfigurationError } from '../lib/supabase';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useTheme } from '../contexts/ThemeProvider';
import { useNotification } from '../contexts/NotificationProvider';
import Spinner from '../components/Spinner';

const DESKTOP_BREAKPOINT = 1024;
const isDesktopViewport = () => typeof window !== 'undefined' && window.innerWidth >= DESKTOP_BREAKPOINT;

const FALLBACK_PROFILE: Profile = {
  role: 'chief',
  teamId: 101,
  teamName: 'Public Affairs Office',
};

const DashboardPage: React.FC = () => {
  const supabaseEnabled = isSupabaseConfigured && supabaseConfigurationError === null;
  const [isDemoMode, setIsDemoMode] = useState(() => !supabaseEnabled);
  const [kpiData, setKpiData] = useState<KpiDataPoint[]>(() => (!supabaseEnabled ? [...MOCK_KPI_DATA] : []));
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => (!supabaseEnabled ? [...MOCK_CAMPAIGN_DATA] : []));
  const [goals, setGoals] = useState<KpiGoal[]>(() => (!supabaseEnabled ? [...MOCK_KPI_GOALS] : []));
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(() => (!supabaseEnabled ? { ...FALLBACK_PROFILE } : null));
  const [isLoading, setIsLoading] = useState(supabaseEnabled);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => isDesktopViewport());

  const { theme, toggleTheme } = useTheme();
  const { showToast } = useNotification();

  const handleSetActiveView = useCallback((view: View) => {
    setActiveView(view);
    if (!isDesktopViewport()) {
      setIsSidebarOpen(false);
    }
  }, []);

  const handleSidebarToggle = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleSidebarClose = useCallback(() => {
    if (!isDesktopViewport()) {
      setIsSidebarOpen(false);
    }
  }, []);

  const fetchKpiData = useCallback(async () => {
    if (!supabaseEnabled || isDemoMode) {
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
  }, [showToast, supabaseEnabled, isDemoMode]);

  const fetchCampaigns = useCallback(async () => {
    if (!supabaseEnabled || isDemoMode) {
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
  }, [showToast, supabaseEnabled, isDemoMode]);

  const fetchGoals = useCallback(async () => {
    if (!supabaseEnabled || isDemoMode) {
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
  }, [showToast, supabaseEnabled, isDemoMode]);

  const isMountedRef = useRef(true);
  const isInitializingRef = useRef(false);

  const handleSession = useCallback(
    async (currentSession: Session | null, options: { fetchData?: boolean } = {}) => {
      if (!supabaseEnabled || isDemoMode) return;
      if (!isMountedRef.current) return;

      setSession(currentSession);

      if (!currentSession) {
        setProfile(null);
        setKpiData([]);
        setCampaigns([]);
        setGoals([]);
        return;
      }

      if (options.fetchData === false) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, avatar_url, teams (id, name)')
          .eq('id', currentSession.user.id)
          .single();

        if (!isMountedRef.current) return;

        if (error && error.code !== 'PGRST116') throw error;

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
        if (!isMountedRef.current) return;
        const typedError = error as { message?: string; code?: string };
        console.error(
          `Error fetching user profile: ${typedError.message || 'An unknown error occurred'}. Code: ${
            typedError.code || 'N/A'
          }`
        );
        if (typedError.code === '42P01') {
          showToast('Database error: A required table is missing. Run the setup SQL.', 'error');
        } else {
          showToast('Error fetching user profile.', 'error');
        }
        setProfile({ role: 'staff', teamId: -1, teamName: 'Error' });
      }
    },
    [fetchKpiData, fetchCampaigns, fetchGoals, showToast, supabaseEnabled, isDemoMode]
  );

  const initializeSession = useCallback(
    async ({ showLoadingIndicator = true }: { showLoadingIndicator?: boolean } = {}) => {
      if (!supabaseEnabled || isDemoMode) return;
      if (isInitializingRef.current) return;

      isInitializingRef.current = true;

      try {
        if (isMountedRef.current && showLoadingIndicator) {
          setIsLoading(true);
        }

        const { data, error } = await supabase.auth.getSession();
        if (!isMountedRef.current) return;
        if (error) console.error('Error retrieving auth session:', error);

        await handleSession(data?.session ?? null);
      } catch (error) {
        if (isMountedRef.current) {
          console.error('Unexpected error initializing authentication session:', error);
          showToast('Error initializing authentication session. Please refresh and try again.', 'error');
        }
      } finally {
        if (isMountedRef.current && showLoadingIndicator) {
          setIsLoading(false);
        }
        isInitializingRef.current = false;
      }
    },
    [handleSession, showToast, supabaseEnabled, isDemoMode]
  );

  const hasShownDemoToastRef = useRef(false);
  const showDemoModeNotification = useCallback(
    (message: string) => {
      if (hasShownDemoToastRef.current) return;
      showToast(message, 'error');
      hasShownDemoToastRef.current = true;
    },
    [showToast]
  );

  useEffect(() => {
    if (!supabaseEnabled || isDemoMode) {
      setProfile({ ...FALLBACK_PROFILE });
      setKpiData([...MOCK_KPI_DATA]);
      setCampaigns([...MOCK_CAMPAIGN_DATA]);
      setGoals([...MOCK_KPI_GOALS]);
      setIsLoading(false);
      setIsDemoMode(true);
      if (!supabaseEnabled) {
        showDemoModeNotification(
          'Supabase credentials were not found or are still set to the placeholder values. Demo data is being displayed.'
        );
      }
      return;
    }

    isMountedRef.current = true;
    void initializeSession();

    const handledEvents: AuthChangeEvent[] = ['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED'];
    const silentEvents: AuthChangeEvent[] = ['TOKEN_REFRESHED'];

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMountedRef.current) return;

      if (silentEvents.includes(event)) {
        await handleSession(session, { fetchData: false });
        return;
      }

      if (!handledEvents.includes(event)) return;

      if (isMountedRef.current) setIsLoading(true);

      try {
        await handleSession(session ?? null);
      } catch (error) {
        if (isMountedRef.current) {
          console.error('Unexpected error handling auth state change:', error);
          showToast('Authentication update failed. Please refresh the page.', 'error');
        }
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [handleSession, initializeSession, isDemoMode, showDemoModeNotification, supabaseEnabled]);

  useEffect(() => {
    if (!supabaseEnabled || isDemoMode) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void initializeSession({ showLoadingIndicator: false });
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        void initializeSession({ showLoadingIndicator: false });
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initializeSession, supabaseEnabled, isDemoMode]);

  useEffect(() => {
    if (!supabaseEnabled || isDemoMode) return;
    if (!isLoading) return;

    const timeoutId = window.setTimeout(() => {
      if (session || !isMountedRef.current) return;

      console.warn('Supabase initialization timed out. Switching to demo mode.');
      setIsDemoMode(true);
      setProfile({ ...FALLBACK_PROFILE });
      setKpiData([...MOCK_KPI_DATA]);
      setCampaigns([...MOCK_CAMPAIGN_DATA]);
      setGoals([...MOCK_KPI_GOALS]);
      setIsLoading(false);
      showDemoModeNotification('Supabase did not respond in time. Demo data is being displayed.');
    }, 6000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [supabaseEnabled, isDemoMode, isLoading, session, showDemoModeNotification]);

  const addKpiDataPoint = useCallback(
    async (newDataPoint: Omit<KpiDataPoint, 'id'>) => {
      if (!supabaseEnabled || isDemoMode) {
        setKpiData((prevData) => {
          const nextId = prevData.reduce((max, item) => Math.max(max, item.id), 0) + 1;
          return [{ id: nextId, ...newDataPoint }, ...prevData];
        });
        handleSetActiveView('table');
        showToast('KPI entry successfully added!', 'success');
        return;
      }

      if (!session?.user) {
        showToast('No user session found. Cannot add KPI data.', 'error');
        return;
      }

      const { error } = await supabase.from('kpi_data').insert([{ ...newDataPoint, user_id: session.user.id }]);
      if (error) {
        console.error('Error inserting KPI data:', error);
        showToast(`Error: ${error.message}`, 'error');
      } else {
        await fetchKpiData();
        handleSetActiveView('table');
        showToast('KPI entry successfully added!', 'success');
      }
    },
    [session, fetchKpiData, showToast, handleSetActiveView, supabaseEnabled, isDemoMode]
  );

  const addCampaign = useCallback(
    async (newCampaign: Omit<Campaign, 'id'>) => {
      if (!supabaseEnabled || isDemoMode) {
        setCampaigns((prevCampaigns) => {
          const nextId = prevCampaigns.reduce((max, item) => Math.max(max, item.id), 0) + 1;
          return [...prevCampaigns, { id: nextId, ...newCampaign }];
        });
        showToast('Campaign created successfully!', 'success');
        return;
      }

      if (!session?.user) {
        showToast('No user session found. Cannot add campaign.', 'error');
        return;
      }

      const { error } = await supabase.from('campaigns').insert([{ ...newCampaign, user_id: session.user.id }]);
      if (error) {
        console.error('Error inserting campaign:', error);
        showToast(`Error: ${error.message}`, 'error');
      } else {
        await fetchCampaigns();
        showToast('Campaign created successfully!', 'success');
      }
    },
    [session, fetchCampaigns, showToast, supabaseEnabled, isDemoMode]
  );

  const addGoal = useCallback(
    async (newGoal: Omit<KpiGoal, 'id'>) => {
      if (!supabaseEnabled || isDemoMode) {
        setGoals((prevGoals) => {
          const nextId = prevGoals.reduce((max, item) => Math.max(max, item.id), 0) + 1;
          return [...prevGoals, { id: nextId, ...newGoal }];
        });
        showToast('Goal created successfully!', 'success');
        return;
      }

      if (!session?.user) {
        showToast('No user session found. Cannot add goal.', 'error');
        return;
      }

      const { error } = await supabase.from('kpi_goals').insert([{ ...newGoal, user_id: session.user.id }]);
      if (error) {
        console.error('Error inserting KPI goal:', error);
        showToast(`Error: ${error.message}`, 'error');
      } else {
        await fetchGoals();
        showToast('Goal created successfully!', 'success');
      }
    },
    [session, fetchGoals, showToast, supabaseEnabled, isDemoMode]
  );

  const onProfileUpdate = (updatedProfileData: Partial<Profile>) => {
    setProfile((prevProfile) => (prevProfile ? { ...prevProfile, ...updatedProfileData } : null));
    showToast('Profile updated successfully!', 'success');
  };

  const visibleNavItems = useMemo(() => {
    if (!profile) return [];
    return NAVIGATION_ITEMS.filter((item) => item.roles.includes(profile.role));
  }, [profile]);

  const isViewAllowed = useCallback(
    (view: View) => {
      if (!profile) return false;
      if (view === 'profile') return true;
      const item = NAVIGATION_ITEMS.find((navItem) => navItem.id === view);
      return item ? item.roles.includes(profile.role) : false;
    },
    [profile]
  );

  useEffect(() => {
    if (profile && !isViewAllowed(activeView)) {
      handleSetActiveView('dashboard');
    }
  }, [profile, activeView, isViewAllowed, handleSetActiveView]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsSidebarOpen(isDesktopViewport());
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const renderActiveView = () => {
    if (!profile || !isViewAllowed(activeView)) {
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

  if (isLoading) return <Spinner />;
  if (!profile) return <Spinner />;

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden text-navy-900 transition-colors duration-300 ease-out dark:text-navy-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={handleSidebarToggle}
        onClose={handleSidebarClose}
        activeView={activeView}
        setActiveView={handleSetActiveView}
        navigationItems={NAVIGATION_ITEMS}
        profile={profile}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <Header
          session={session}
          profile={profile}
          theme={theme}
          toggleTheme={toggleTheme}
          setActiveView={handleSetActiveView}
          onMenuToggle={handleSidebarToggle}
          isSupabaseEnabled={supabaseEnabled && !isDemoMode}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-navy-50 dark:bg-navy-900 transition-colors duration-300 ease-out">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
