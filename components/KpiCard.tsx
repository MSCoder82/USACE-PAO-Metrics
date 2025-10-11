

import React from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  unit?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, unit, icon: Icon }) => {
  return (
    <div className="relative overflow-hidden rounded-lg bg-white dark:bg-navy-800 px-4 pb-12 pt-5 shadow-card dark:shadow-card-dark sm:px-6 sm:pt-6">
      <div className="glass-panel flex flex-col gap-5 p-4 sm:gap-6 sm:p-5 lg:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="card-title">{title}</p>
            <p className="mt-3 text-2xl font-semibold text-navy-900 sm:text-3xl dark:text-white">{value}</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-usace-red to-usace-blue text-white shadow-md shadow-usace-blue/40 sm:h-12 sm:w-12">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
          </span>
        </div>
        {unit && <span className="soft-badge w-fit text-[10px] sm:text-xs">{unit}</span>}
      </div>
    </div>
  );
};

export default KpiCard;