

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { KpiDataPoint } from '../types';
import { useTheme } from '../contexts/ThemeProvider';

interface KpiBarChartProps {
    data: KpiDataPoint[];
}

const KpiBarChart: React.FC<KpiBarChartProps> = ({ data }) => {
    const { theme } = useTheme();
    const tickColor = theme === 'dark' ? '#9cb9d1' : '#33455d';
    const gridColor = theme === 'dark' ? '#334155' : 'rgba(148, 163, 184, 0.25)';

    const mediaMentionsData = data
        .filter(d => d.metric === 'Media pickups')
        .reduce((acc, current) => {
            const month = new Date(current.date).toLocaleString('default', { month: 'short', year: '2-digit' });
            if (!acc[month]) {
                acc[month] = 0;
            }
            acc[month] += current.quantity;
            return acc;
        }, {} as Record<string, number>);
    
    const chartData = Object.keys(mediaMentionsData).map(month => ({
        name: month,
        'Pickups': mediaMentionsData[month]
    })).sort((a, b) => new Date(`1 ${a.name}`).getTime() - new Date(`1 ${b.name}`).getTime());
    
    if (chartData.length === 0) {
        return (
            <div style={{ width: '100%', height: 300 }} className="flex items-center justify-center text-gray-500 dark:text-navy-400">
                No media pickup data available.
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart
                    data={chartData}
                    margin={{
                        top: 10,
                        right: 20,
                        left: 10,
                        bottom: 10,
                    }}
                >
                    <defs>
                        <linearGradient id="mediaPickupsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={theme === 'dark' ? '#60a5fa' : '#2563eb'} stopOpacity={0.95} />
                            <stop offset="100%" stopColor={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} stopOpacity={0.85} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" tick={{ fill: tickColor }} fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: tickColor }} fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                        cursor={{ fill: theme === 'dark' ? 'rgba(148, 163, 184, 0.08)' : 'rgba(37, 99, 235, 0.08)' }}
                        contentStyle={{
                            backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                            borderRadius: 16,
                            borderColor: theme === 'dark' ? '#1e293b' : '#e2e8f0',
                            boxShadow: '0 20px 45px -30px rgba(15, 23, 42, 0.45)'
                        }}
                        labelStyle={{ color: tickColor, fontWeight: 600 }}
                    />
                    <Legend wrapperStyle={{ color: tickColor }} />
                    <Bar dataKey="Pickups" fill="url(#mediaPickupsGradient)" radius={[12, 12, 12, 12]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default KpiBarChart;