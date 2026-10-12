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

interface BrandPerformanceChartProps {
  data: Array<{ label: string; impressions: number; engagements?: number }>;
}

export default function BrandPerformanceChart({ data }: BrandPerformanceChartProps) {
  return (
    <div className="h-64 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="brandReachGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.24} />
              <stop offset="95%" stopColor="#FF6B00" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#E7E1DA" vertical={false} />
          <XAxis
            dataKey="label"
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
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
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
            formatter={(val: any) => [`${Number(val).toLocaleString()} impressions`, 'Reach']}
          />
          <Area
            type="monotone"
            dataKey="impressions"
            stroke="#FF6B00"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#brandReachGradient)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
