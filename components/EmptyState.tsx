import React from 'react';
import { DocumentMagnifyingGlassIcon } from './Icons';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, message, icon: Icon = DocumentMagnifyingGlassIcon }) => {
  return (
    <div className="my-4 rounded-3xl border-2 border-dashed border-white/40 bg-white/40 p-12 text-center backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-usace-blue/20 to-usace-red/20 text-usace-blue">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-navy-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-navy-600 dark:text-navy-200">{message}</p>
    </div>
  );
};

export default EmptyState;
