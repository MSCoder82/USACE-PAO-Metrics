import React, { useState, useMemo } from 'react';
import { KpiDataPoint, EntryType, Campaign, KpiGoal } from '../types';
import KpiCard from './KpiCard';
import KpiBarChart from './KpiBarChart';
import KpiPieChart from './KpiPieChart';
import GoalProgress from './GoalProgress';
// Fix: Removed unused UsersIcon and kept VideoCameraIcon, which is now implemented and used.
import { PresentationChartBarIcon, ChartPieIcon, GlobeAltIcon, VideoCameraIcon, TrophyIcon } from './Icons';

interface DashboardProps {
  data: KpiDataPoint[];
  campaigns: Campaign[];
  goals: KpiGoal[];
}

const Dashboard: React.FC<DashboardProps> = ({ data, campaigns, goals }) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | 'all'>('all');

  const filteredData = useMemo(() => {
    if (selectedCampaignId === 'all') {
      return data;
    }
    return data.filter(d => d.campaign_id === selectedCampaignId);
  }, [data, selectedCampaignId]);

  const getLatestValue = (metric: string) => {
    const sortedData = filteredData
      .filter(d => d.metric === metric)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sortedData.length > 0 ? sortedData[0] : null;
  };

  const calculateTotal = (metric: string) => {
    return filteredData
        .filter(d => d.metric === metric)
        .reduce((sum, item) => sum + item.quantity, 0);
  }

  const mediaPickupsLatest = getLatestValue('Media pickups');
  const engagementLatest = getLatestValue('Engagement rate');
  const pressReleasesTotal = calculateTotal('News release');
  const videoViewsLatest = getLatestValue('Video views');

  const activeGoals = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const allActiveGoals = goals.filter(goal => {
        const startDate = new Date(goal.start_date);
        const endDate = new Date(goal.end_date);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        return startDate <= today && endDate >= today;
    });

    if (selectedCampaignId === 'all') {
      return allActiveGoals;
    }
    
    return allActiveGoals.filter(goal => goal.campaign_id === selectedCampaignId);
  }, [goals, selectedCampaignId]);

  const getGoalProgress = (goal: KpiGoal) => {
    const goalStartDate = new Date(goal.start_date);
    const goalEndDate = new Date(goal.end_date);

    return filteredData
        .filter(d => {
            const itemDate = new Date(d.date);
            return d.metric === goal.metric && itemDate >= goalStartDate && itemDate <= goalEndDate;
        })
        .reduce((sum, item) => sum + item.quantity, 0);
  };


  return (
    <div className="space-y-8">
      <div className="glass-panel flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-usace-blue/80 dark:text-navy-200/80">Mission Control</p>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900 dark:text-white">PAO Performance Dashboard</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="campaign-filter" className="text-xs font-semibold uppercase tracking-wide text-navy-500 dark:text-navy-200">
            Filter campaign
          </label>
          <select
            id="campaign-filter"
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="input-modern w-48"
          >
            <option value="all">All Campaigns</option>
            {campaigns.map(campaign => (
              <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <KpiCard title="Media Pickups (Latest)" value={mediaPickupsLatest?.quantity.toLocaleString() ?? 'N/A'} unit="pickups" icon={PresentationChartBarIcon} />
        <KpiCard title="Social Engagement (Latest)" value={engagementLatest?.quantity.toLocaleString() ?? 'N/A'} unit="%" icon={ChartPieIcon}/>
        <KpiCard title="News Releases (Total)" value={pressReleasesTotal.toLocaleString() ?? 'N/A'} unit="releases" icon={GlobeAltIcon}/>
        {/* Fix: Used the more appropriate VideoCameraIcon for the Video Views card. */}
        <KpiCard title="Video Views (Latest)" value={videoViewsLatest?.quantity.toLocaleString() ?? 'N/A'} unit="views" icon={VideoCameraIcon}/>
      </div>

      {activeGoals.length > 0 && (
        <div className="glass-panel space-y-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-usace-blue/15 text-usace-blue">
              <TrophyIcon className="h-5 w-5" />
            </span>
            <h3 className="text-2xl font-semibold text-navy-900 dark:text-white">Active Goals</h3>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {activeGoals.map(goal => {
              const currentValue = getGoalProgress(goal);
              const campaignName = goal.campaign_id
                ? campaigns.find(c => c.id === goal.campaign_id)?.name
                : undefined;
              return (
                <GoalProgress
                  key={goal.id}
                  metric={goal.metric}
                  currentValue={currentValue}
                  targetValue={goal.target_value}
                  endDate={goal.end_date}
                  campaignName={campaignName}
                />
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="glass-panel">
          <h3 className="mb-4 text-lg font-semibold text-navy-900 dark:text-white">Monthly Media Pickups</h3>
          <KpiBarChart data={filteredData} />
        </div>
        <div className="glass-panel">
           <h3 className="mb-4 text-lg font-semibold text-navy-900 dark:text-white">Entries by Type</h3>
          <KpiPieChart data={filteredData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;