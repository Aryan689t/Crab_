'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function PerformanceChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="viewGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8580E8" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8580E8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F7" />
        <XAxis dataKey="month" stroke="#8B90A5" fontSize={12} tickLine={false} />
        <YAxis stroke="#8B90A5" fontSize={12} tickLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#17182B',
            borderRadius: '12px',
            color: '#fff',
            border: 'none',
            fontSize: '12px',
          }}
        />
        <Area
          type="monotone"
          dataKey="views"
          stroke="#8580E8"
          strokeWidth={2.5}
          fillOpacity={1}
          fill="url(#viewGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
