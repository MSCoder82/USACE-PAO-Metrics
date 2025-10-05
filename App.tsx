import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { KpiDataPoint, View, Role, Campaign } from './types';
import { NAVIGATION_ITEMS } from './constants';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import KpiTable from './components/KpiTable';
import DataEntry from './components/DataEntry';
import PlanBuilder from './components/PlanBuilder';
import Campaigns from './components/Campaigns';
import Auth from './components/Auth';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useTheme } from './contexts/ThemeProvider';
import { useNotification } from './contexts/NotificationProvider';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const [kpiData, setKpiData] = useState<KpiDataPoint[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useNotification();


  const fetchKpiData = useCallback(async () => {
    const { data, error } = await supabase.from('kpi_data').select('*').order('date', { ascending: false });
    if (error) {
      console.error('Error fetching KPI data:', error);
      showToast('Error fetching KPI data.', 'error');
    } else {
      setKpiData(data as KpiDataPoint[]);
    }
  }, [showToast]);

  const fetchCampaigns = useCallback(async () => {
    const { data, error } = await supabase.from('campaigns').select('*').order('start_date', { ascending: false });
    if (error) {
      console.error('Error fetching campaigns:', error);
      showToast('Error fetching campaigns.', 'error');
    } else {
      setCampaigns(data as Campaign[]);
    }
  }, [showToast]);

  useEffect(() => {
    // This listener handles the entire auth lifecycle: initial load, login, and logout.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoading(true);
      setSession(session);
      if (session) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (error && error.code !== 'PGRST116') { 
            throw error;
          }
          
          setRole(data?.role as Role || 'staff');
          // Fetch data after session is confirmed
          await Promise.all([fetchKpiData(), fetchCampaigns()]);

        } catch (error) {
          const typedError = error as { message?: string; code?: string };
          console.error(
            `Error fetching user role: ${typedError.message || 'An unknown error occurred'}. Code: ${typedError.code || 'N/A'}`
          );
          showToast('Error fetching user profile.', 'error');
          setRole('staff');
        }
      } else {
        setRole(null);
        setKpiData([]); // Clear data on logout
        setCampaigns([]); // Clear data on logout
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchKpiData, fetchCampaigns, showToast]);


  const addKpiDataPoint = useCallback(async (newDataPoint: Omit<KpiDataPoint, 'id'>) => {
    if (!session?.user) {
        showToast("No user session found. Cannot add KPI data.", 'error');
        return;
    }
    const { error } = await supabase.from('kpi_data').insert([
      { ...newDataPoint, user_id: session.user.id }
    ]);
    if (error) {
      console.error('Error inserting KPI data:', error);
      showToast(`Error: ${error.message}`, 'error');
    } else {
      await fetchKpiData(); // Refetch data
      setActiveView('table'); // Switch to table view
      showToast("KPI entry successfully added!", 'success');
    }
  }, [session, fetchKpiData, showToast]);

  const addCampaign = useCallback(async (newCampaign: Omit<Campaign, 'id'>) => {
    if (!session?.user) {
        showToast("No user session found. Cannot add campaign.", 'error');
        return;
    }
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
  }, [session, fetchCampaigns, showToast]);
  
  const visibleNavItems = useMemo(() => {
    if (!role) return [];
    return NAVIGATION_ITEMS.filter(item => item.roles.includes(role));
  }, [role]);

  const isViewAllowed = useCallback((view: View) => {
    if (!role) return false;
    const item = NAVIGATION_ITEMS.find(navItem => navItem.id === view);
    return item ? item.roles.includes(role) : false;
  }, [role]);
  
  useEffect(() => {
    if (role && !isViewAllowed(activeView)) {
      setActiveView('dashboard');
    }
  }, [role, activeView, isViewAllowed]);

  const renderActiveView = () => {
    if (!role || !isViewAllowed(activeView)) {
      return <Dashboard data={kpiData} campaigns={campaigns} />;
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard data={kpiData} campaigns={campaigns} />;
      case 'table':
        return <KpiTable data={kpiData} />;
      case 'data-entry':
        return <DataEntry onSubmit={addKpiDataPoint} campaigns={campaigns} />;
      case 'plan-builder':
        return <PlanBuilder />;
      case 'campaigns':
        return <Campaigns campaigns={campaigns} onAddCampaign={addCampaign} />;
      default:
        return <Dashboard data={kpiData} campaigns={campaigns} />;
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="flex h-screen bg-navy-50 dark:bg-navy-950 font-sans text-navy-900 dark:text-navy-100">
      <Sidebar 
        navigationItems={visibleNavItems} 
        activeView={activeView} 
        setActiveView={setActiveView} 
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header session={session} theme={theme} toggleTheme={toggleTheme} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default App;