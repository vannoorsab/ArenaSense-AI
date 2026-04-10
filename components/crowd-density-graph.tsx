'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface CrowdDensityGraphProps {
  data: number[];
}

export default function CrowdDensityGraph({ data }: CrowdDensityGraphProps) {
  const chartData = data.map((density, idx) => ({
    time: idx,
    density: density,
  }));

  const avgDensity = data.length > 0 ? data.reduce((a, b) => a + b, 0) / data.length : 0;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 12 }}
          label={{ value: 'Time (minutes)', position: 'insideBottom', offset: -5 }}
        />
        <YAxis
          domain={[0, 100]}
          label={{ value: 'Density %', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            border: 'none',
            borderRadius: '0.5rem',
            color: 'white',
            fontSize: '12px',
          }}
          formatter={(value) => {
            if (typeof value === 'number') return `${value.toFixed(1)}%`;
            return value;
          }}
        />
        <ReferenceLine
          y={70}
          stroke="#ef4444"
          strokeDasharray="5,5"
          label={{ value: 'High (70%)', position: 'right', fontSize: 12, fill: '#ef4444' }}
        />
        <ReferenceLine
          y={85}
          stroke="#991b1b"
          strokeDasharray="5,5"
          label={{ value: 'Critical (85%)', position: 'right', fontSize: 12, fill: '#991b1b' }}
        />
        <Line
          type="monotone"
          dataKey="density"
          stroke="#3b82f6"
          dot={false}
          isAnimationActive={false}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
