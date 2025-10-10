import React, { useState, useMemo } from 'react';
import { KpiDataPoint } from '../types';
import EmptyState from './EmptyState';

interface KpiTableProps {
  data: KpiDataPoint[];
}

type SortConfig = {
    key: keyof KpiDataPoint;
    direction: 'ascending' | 'descending';
} | null;

const KpiTable: React.FC<KpiTableProps> = ({ data }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? '';
        const bValue = b[sortConfig.key] ?? '';
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key: keyof KpiDataPoint) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: keyof KpiDataPoint) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  if (!data || data.length === 0) {
      return (
          <div className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-card dark:shadow-card-dark">
             <h2 className="text-2xl font-bold text-navy-900 dark:text-white mb-4">KPI Data Explorer</h2>
          <div className="glass-panel space-y-4">
             <h2 className="text-2xl font-semibold text-navy-900 dark:text-white">KPI Data Explorer</h2>
             <EmptyState title="No KPI Data Found" message="Get started by adding a new KPI entry." />
          </div>
      );
  }

  return (
    <div className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-card dark:shadow-card-dark">
      <h2 className="text-2xl font-bold text-navy-900 dark:text-white mb-4">KPI Data Explorer</h2>
    <div className="glass-panel space-y-4">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-usace-blue/70 dark:text-navy-200/80">Insights</span>
        <h2 className="text-2xl font-semibold text-navy-900 dark:text-white">KPI Data Explorer</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/40 dark:divide-white/10">
          <thead className="bg-white/40 text-left text-xs uppercase tracking-wider text-navy-500 backdrop-blur dark:bg-white/5 dark:text-navy-200">
            <tr>
              {['date', 'type', 'metric', 'quantity', 'notes', 'link'].map((key) => (
                <th
                  key={key}
                  scope="col"
                  onClick={() => requestSort(key as keyof KpiDataPoint)}
                  className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-navy-500 transition hover:text-usace-blue dark:text-navy-200 dark:hover:text-white"
                >
                  <span className="flex items-center">
                    {key}
                    <span className="ml-1">{getSortIndicator(key as keyof KpiDataPoint)}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/30 bg-white/60 text-sm text-navy-600 backdrop-blur dark:divide-white/5 dark:bg-white/5 dark:text-navy-100">
            {sortedData.map((item) => (
              <tr key={item.id} className="transition hover:bg-usace-blue/10 hover:text-usace-blue dark:hover:bg-white/10">
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{item.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-navy-900 dark:text-white">{item.metric}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.quantity.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">
                    <span className="block max-w-xs truncate" title={item.notes || ''}>
                        {item.notes || 'N/A'}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.link ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-usace-blue hover:underline" title={item.link}>
                           <span className="block max-w-xs truncate">{item.link}</span>
                        </a>
                    ) : (
                        'N/A'
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KpiTable;