'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface RoiTrendChartProps {
  data: Array<{ name: string; roi: number; benchmark: number }>;
}

export default function RoiTrendChart({ data }: RoiTrendChartProps) {
  return (
    <div className="h-64 w-full pt-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#E7E1DA" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#737373"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#E7E1DA' }}
          />
          <YAxis
            stroke="#737373"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#E7E1DA' }}
            tickFormatter={(v) => `${v}x`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E7E1DA',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              fontSize: '12px',
              color: '#171717',
            }}
            formatter={(val: any) => [`${val}× ROI`, 'Measured ROI']}
          />
          <Bar
            dataKey="roi"
            fill="#FF6B00"
            radius={[6, 6, 0, 0]}
            barSize={32}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
