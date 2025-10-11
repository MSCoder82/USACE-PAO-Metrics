import React, { useState } from 'react';
import { Campaign } from '../types';
import { useNotification } from '../contexts/NotificationProvider';
import EmptyState from './EmptyState';

interface CampaignsProps {
  campaigns: Campaign[];
  onAddCampaign: (campaign: Omit<Campaign, 'id'>) => void;
}

const Campaigns: React.FC<CampaignsProps> = ({ campaigns, onAddCampaign }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const { showToast } = useNotification();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name || !description || !startDate || !endDate) {
      showToast('Please fill out all fields.', 'error');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      showToast('End date cannot be before the start date.', 'error');
      return;
    }

    onAddCampaign({ name, description, start_date: startDate, end_date: endDate });
    setName('');
    setDescription('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <div className="glass-panel space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-usace-blue/70 dark:text-navy-200/80">Plan</span>
            <h2 className="mt-2 text-2xl font-semibold text-navy-900 dark:text-white">Create campaign</h2>
            <p className="mt-2 text-sm text-navy-600 dark:text-navy-200">Define your next initiative with clear timelines and intent.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="flex flex-col gap-2 text-sm font-semibold text-navy-600 dark:text-navy-200">
              Campaign name
              <input
                type="text"
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="input-modern"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-navy-600 dark:text-navy-200">
              Description
              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                rows={3}
                className="textarea-modern"
              />
            </label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-semibold text-navy-600 dark:text-navy-200">
                Start date
                <input
                  type="date"
                  id="start-date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  required
                  className="input-modern"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-navy-600 dark:text-navy-200">
                End date
                <input
                  type="date"
                  id="end-date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  required
                  className="input-modern"
                />
              </label>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="surface-button">
                Create campaign
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="glass-panel space-y-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-usace-blue/70 dark:text-navy-200/80">Current slate</span>
            <h2 className="text-2xl font-semibold text-navy-900 dark:text-white">Existing campaigns</h2>
          </div>
          {campaigns.length > 0 ? (
            <div className="subtle-scrollbar max-h-[28rem] overflow-y-auto">
              <ul className="divide-y divide-white/40 dark:divide-white/10">
                {campaigns.map((campaign) => (
                  <li key={campaign.id} className="py-4">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-lg font-semibold text-navy-900 dark:text-white">{campaign.name}</h3>
                      <p className="text-sm text-navy-600 dark:text-navy-200">{campaign.description}</p>
                      <p className="text-xs font-semibold uppercase tracking-wide text-usace-blue/80 dark:text-navy-200/80">
                        {campaign.start_date} — {campaign.end_date}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <EmptyState title="No Campaigns Found" message="Create your first campaign using the form on the left." />
          )}
        </div>
      </div>
    </div>
  );
};

export default Campaigns;
