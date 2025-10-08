import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { KpiDataPoint, EntryType } from '../types';
import { useTheme } from '../contexts/ThemeProvider';

interface KpiPieChartProps {
  data: KpiDataPoint[];
}

const COLORS: Record<EntryType, string> = {
  [EntryType.OUTPUT]: '#1d4ed8',
  [EntryType.OUTTAKE]: '#dc2626',
  [EntryType.OUTCOME]: '#38bdf8',
};

const KpiPieChart: React.FC<KpiPieChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const tickColor = theme === 'dark' ? '#9cb9d1' : '#33455d';

  const typeCounts = data.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {} as Record<EntryType, number>);

  const chartData = Object.entries(typeCounts).map(([name, value]) => ({
    name,
    value,
  }));

  if (chartData.length === 0) {
    return (
      <div style={{ width: '100%', height: 300 }} className="flex items-center justify-center text-gray-500 dark:text-navy-400">
        No entry data available.
      </div>
    );
  }

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const percentage = (percent * 100).toFixed(0);

    if (Number(percentage) < 5) return null;

    return (
      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
        {`${percentage}%`}
      </text>
    );
  };

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            labelLine={false}
            dataKey="value"
            nameKey="name"
            label={renderCustomLabel}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.name as EntryType]}
                stroke={theme === 'dark' ? '#0f172a' : '#f1f5f9'}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
              borderRadius: 16,
              borderColor: theme === 'dark' ? '#1e293b' : '#e2e8f0',
              boxShadow: '0 20px 45px -30px rgba(15, 23, 42, 0.45)'
            }}
            itemStyle={{ color: theme === 'dark' ? '#e2e8f0' : '#1f2937', fontWeight: 600 }}
            labelStyle={{ color: tickColor, fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ color: tickColor, fontSize: '14px' }} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default KpiPieChart;
