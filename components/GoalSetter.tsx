import React, { useState, useMemo, useEffect } from 'react';
import { KpiGoal, Campaign } from '../types';
import { useNotification } from '../contexts/NotificationProvider';
import { METRIC_OPTIONS } from '../constants';
import EmptyState from './EmptyState';

interface GoalSetterProps {
  goals: KpiGoal[];
  onAddGoal: (goal: Omit<KpiGoal, 'id'>) => void;
  campaigns: Campaign[];
}

const GoalSetter: React.FC<GoalSetterProps> = ({ goals, onAddGoal, campaigns }) => {
  const [metric, setMetric] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [campaignId, setCampaignId] = useState<string>('');
  const { showToast } = useNotification();

  const allMetrics = useMemo(() => {
    const uniqueMetrics = new Set(Object.values(METRIC_OPTIONS).flat());
    return Array.from(uniqueMetrics).sort();
  }, []);

  const campaignMap = useMemo(() => {
    return new Map(campaigns.map(c => [c.id, c.name]));
  }, [campaigns]);

  useEffect(() => {
    if (allMetrics.length > 0 && !metric) {
      setMetric(allMetrics[0]);
    }
  }, [allMetrics, metric]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metric || !targetValue || !startDate || !endDate) {
      showToast('Please fill out all fields.', 'error');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      showToast('End date cannot be before the start date.', 'error');
      return;
    }
    onAddGoal({
      metric,
      target_value: parseInt(targetValue, 10),
      start_date: startDate,
      end_date: endDate,
      campaign_id: campaignId ? parseInt(campaignId, 10) : undefined,
    });
    setTargetValue('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setCampaignId('');
  };

  const sortedGoals = useMemo(() => {
    return [...goals].sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  }, [goals]);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <div className="glass-panel space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-usace-blue/70 dark:text-navy-200/80">Set</span>
            <h2 className="mt-2 text-2xl font-semibold text-navy-900 dark:text-white">Create KPI goal</h2>
            <p className="mt-2 text-sm text-navy-600 dark:text-navy-200">Align teams on measurable outcomes across campaigns.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="flex flex-col gap-2 text-sm font-semibold text-navy-600 dark:text-navy-200">
              KPI metric
              <select id="metric" value={metric} onChange={e => setMetric(e.target.value)} required className="input-modern">
                {allMetrics.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-navy-600 dark:text-navy-200">
              Campaign (optional)
              <select id="campaign" value={campaignId} onChange={e => setCampaignId(e.target.value)} className="input-modern">
                <option value="">No specific campaign</option>
                {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-navy-600 dark:text-navy-200">
              Target value
              <input type="number" id="target-value" value={targetValue} onChange={e => setTargetValue(e.target.value)} required placeholder="e.g., 100" className="input-modern" />
            </label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-semibold text-navy-600 dark:text-navy-200">
                Start date
                <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="input-modern" />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-navy-600 dark:text-navy-200">
                End date
                <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="input-modern" />
              </label>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="surface-button">Set goal</button>
            </div>
          </form>
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="glass-panel space-y-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-usace-blue/70 dark:text-navy-200/80">Roadmap</span>
            <h2 className="text-2xl font-semibold text-navy-900 dark:text-white">Existing goals</h2>
          </div>
          {sortedGoals.length > 0 ? (
            <div className="subtle-scrollbar max-h-[28rem] overflow-y-auto">
              <ul className="divide-y divide-white/40 dark:divide-white/10">
                {sortedGoals.map(goal => {
                  const campaignName = goal.campaign_id ? campaignMap.get(goal.campaign_id) : null;
                  return (
                    <li key={goal.id} className="py-4">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-lg font-semibold text-navy-900 dark:text-white">{goal.metric}</h3>
                        {campaignName && (
                          <span className="soft-badge w-fit">{campaignName}</span>
                        )}
                        <p className="text-sm text-navy-600 dark:text-navy-200">
                          Target: <span className="font-semibold text-navy-900 dark:text-white">{goal.target_value.toLocaleString()}</span>
                        </p>
                        <p className="text-xs font-semibold uppercase tracking-wide text-usace-blue/80 dark:text-navy-200/80">
                          {goal.start_date} — {goal.end_date}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <EmptyState title="No Goals Found" message="Set your first KPI goal using the form on the left." />
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalSetter;
