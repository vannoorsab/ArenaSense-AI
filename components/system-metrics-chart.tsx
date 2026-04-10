'use client';

import { useMemo } from 'react';
import { CrowdData } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SystemMetricsChartProps {
  crowdData: Map<string, CrowdData>;
}

export default function SystemMetricsChart({ crowdData }: SystemMetricsChartProps) {
  const data = useMemo(() => {
    return Array.from(crowdData.values())
      .filter((c) => !c.zone.startsWith('exit'))
      .sort((a, b) => b.density - a.density)
      .slice(0, 15)
      .map((crowd) => ({
        name: crowd.zone.split('-').slice(1).join(' '),
        density: crowd.density,
        capacity: crowd.capacity,
        current: crowd.currentCount,
      }));
  }, [crowdData]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={80}
          tick={{ fontSize: 12 }}
        />
        <YAxis label={{ value: 'Density %', angle: -90, position: 'insideLeft' }} />
        <Tooltip
          formatter={(value) => {
            if (typeof value === 'number') return `${value.toFixed(0)}%`;
            return value;
          }}
          contentStyle={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            border: 'none',
            borderRadius: '0.5rem',
            color: 'white',
            fontSize: '12px',
          }}
        />
        <Legend />
        <Bar
          dataKey="density"
          fill="hsl(35 100% 55%)"
          name="Current Density"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
