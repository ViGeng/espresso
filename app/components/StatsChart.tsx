'use client';

import {
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface StatsChartProps {
  data: Array<{ date: string; cups: number }>;
}

export default function StatsChart({ data }: StatsChartProps) {
  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Take last 30 days if available, or all data
  const chartData = sortedData.slice(-30).map(item => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
  }));

  if (chartData.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-zinc-500">
        No stats available yet
      </div>
    );
  }

  return (
    <div style={{ height: '300px', width: '100%', marginTop: '20px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <XAxis 
            dataKey="displayDate" 
            stroke="#666" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#666" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              color: '#fff',
            }}
            cursor={{ stroke: '#333', strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey="cups"
            stroke="#c4a77d"
            strokeWidth={3}
            dot={{ fill: '#c4a77d', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
