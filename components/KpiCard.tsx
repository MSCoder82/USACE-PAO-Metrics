

import React from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  unit?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, unit, icon: Icon }) => {
  return (
    <div className="glass-panel flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="card-title">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-navy-900 dark:text-white">{value}</p>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-usace-red to-usace-blue text-white shadow-md shadow-usace-blue/40">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      </div>
      {unit && <span className="soft-badge w-fit">{unit}</span>}
    </div>
  );
};

export default KpiCard;