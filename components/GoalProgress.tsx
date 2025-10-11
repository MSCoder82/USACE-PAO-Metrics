import React from 'react';

interface GoalProgressProps {
  metric: string;
  currentValue: number;
  targetValue: number;
  endDate: string;
  campaignName?: string;
}

const GoalProgress: React.FC<GoalProgressProps> = ({ metric, currentValue, targetValue, endDate, campaignName }) => {
  const progressPercentage = targetValue > 0 ? Math.min((currentValue / targetValue) * 100, 100) : 0;

  const daysRemaining = () => {
    const end = new Date(endDate);
    const now = new Date();
    // To ignore time part of date
    end.setUTCHours(0,0,0,0);
    now.setUTCHours(0,0,0,0);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Ended';
    if (diffDays === 0) return 'Ends today';
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} left`;
  };

  return (
    <div className="bg-white dark:bg-navy-800 p-4 rounded-lg shadow-card dark:shadow-card-dark flex flex-col justify-between">
      <div className="glass-panel flex h-full flex-col gap-4 p-5">
        <div className="space-y-3">
          {campaignName && (
            <span className="soft-badge">{campaignName}</span>
          )}
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-lg font-semibold text-navy-900 dark:text-white" title={metric}>{metric}</h4>
            <span className="text-xs font-semibold uppercase tracking-wide text-navy-500 dark:text-navy-200">{daysRemaining()}</span>
          </div>
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium text-navy-600 dark:text-navy-100">{currentValue.toLocaleString()} / {targetValue.toLocaleString()}</span>
            <span className="text-lg font-semibold text-usace-blue">{progressPercentage.toFixed(0)}%</span>
          </div>
        </div>
        <div className="relative h-2.5 overflow-hidden rounded-full bg-white/60 dark:bg-white/10">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-usace-red to-usace-blue transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default GoalProgress;