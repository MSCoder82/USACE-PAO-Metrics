import React, { useState, useMemo } from 'react';
import { KpiDataPoint, EntryType, Campaign } from '../types';
import KpiCard from './KpiCard';
import KpiBarChart from './KpiBarChart';
import KpiPieChart from './KpiPieChart';
// Fix: Removed unused UsersIcon and kept VideoCameraIcon, which is now implemented and used.
import { PresentationChartBarIcon, ChartPieIcon, GlobeAltIcon, VideoCameraIcon } from './Icons';

interface DashboardProps {
  data: KpiDataPoint[];
  campaigns: Campaign[];
}

const Dashboard: React.FC<DashboardProps> = ({ data, campaigns }) => {
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

  return (
    <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 dark:text-white">PAO Dashboard</h2>
            <div className="flex items-center space-x-2">
                <label htmlFor="campaign-filter" className="text-sm font-medium text-gray-700 dark:text-navy-300">Filter by Campaign:</label>
                <select 
                    id="campaign-filter"
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="block w-full max-w-xs pl-3 pr-10 py-2 text-base border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 dark:text-white focus:outline-none focus:ring-usace-blue focus:border-usace-blue sm:text-sm rounded-md"
                >
                    <option value="all">All Campaigns</option>
                    {campaigns.map(campaign => (
                        <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                    ))}
                </select>
            </div>
        </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Media Pickups (Latest)" value={mediaPickupsLatest?.quantity.toLocaleString() ?? 'N/A'} unit="pickups" icon={PresentationChartBarIcon} />
        <KpiCard title="Social Engagement (Latest)" value={engagementLatest?.quantity.toLocaleString() ?? 'N/A'} unit="%" icon={ChartPieIcon}/>
        <KpiCard title="News Releases (Total)" value={pressReleasesTotal.toLocaleString() ?? 'N/A'} unit="releases" icon={GlobeAltIcon}/>
        {/* Fix: Used the more appropriate VideoCameraIcon for the Video Views card. */}
        <KpiCard title="Video Views (Latest)" value={videoViewsLatest?.quantity.toLocaleString() ?? 'N/A'} unit="views" icon={VideoCameraIcon}/>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-md dark:shadow-2xl dark:shadow-navy-950/50">
          <h3 className="text-lg font-semibold text-navy-800 dark:text-white mb-4">Monthly Media Pickups</h3>
          <KpiBarChart data={filteredData} />
        </div>
        <div className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-md dark:shadow-2xl dark:shadow-navy-950/50">
           <h3 className="text-lg font-semibold text-navy-800 dark:text-white mb-4">Entries by Type</h3>
          <KpiPieChart data={filteredData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;