'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { PlatformBreakdown } from './PlatformBreakdown';

const DATA_BY_RANGE = {
  '30D': [
    { month: 'W1', audience: 50200, label: 'Week 1' },
    { month: 'W2', audience: 51800, label: 'Week 2' },
    { month: 'W3', audience: 53400, label: 'Week 3' },
    { month: 'W4', audience: 55000, label: 'Week 4' },
  ],
  '90D': [
    { month: 'Aug', audience: 34000, label: 'August' },
    { month: 'Sep', audience: 43000, label: 'September' },
    { month: 'Oct', audience: 55000, label: 'October' },
  ],
  '6M': [
    { month: 'Jun', audience: 16000, label: 'June' },
    { month: 'Jul', audience: 26000, label: 'July' },
    { month: 'Aug', audience: 34000, label: 'August' },
    { month: 'Sep', audience: 43000, label: 'September' },
    { month: 'Oct', audience: 55000, label: 'October' },
  ],
  '1Y': [
    { month: 'Nov', audience: 8000, label: 'Nov 2025' },
    { month: 'Jan', audience: 11000, label: 'Jan 2026' },
    { month: 'Mar', audience: 14000, label: 'Mar 2026' },
    { month: 'May', audience: 19000, label: 'May 2026' },
    { month: 'Jul', audience: 26000, label: 'Jul 2026' },
    { month: 'Sep', audience: 43000, label: 'Sep 2026' },
    { month: 'Oct', audience: 55000, label: 'Oct 2026' },
  ],
};

type RangeKey = '30D' | '90D' | '6M' | '1Y';

export function AudienceGrowthChart() {
  const [range, setRange] = useState<RangeKey>('6M');
  const currentData = DATA_BY_RANGE[range];

  return (
    <section className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-6 flex flex-col justify-between">
      {/* Header with Title and Range Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="p-2 rounded-xl bg-[#FFF2E8] text-[#FF6B00] mt-0.5 shrink-0">
            <BarChart3 className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-[#171717] tracking-tight">
              Audience growth
            </h3>
            <p className="text-xs text-[#737373]">
              Connected platform snapshots • Last 5 months
            </p>
          </div>
        </div>

        {/* Time-Range Filter Buttons */}
        <div className="inline-flex items-center gap-1 p-1 bg-[#F8F6F2] rounded-xl border border-[#E7E1DA] self-start sm:self-auto">
          {(['30D', '90D', '6M', '1Y'] as RangeKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setRange(key)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                range === key
                  ? 'bg-[#FF6B00] text-white shadow-xs'
                  : 'text-[#737373] hover:text-[#171717] hover:bg-white/60'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={currentData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="audienceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.24} />
                <stop offset="95%" stopColor="#FF6B00" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="#F2ECE5"
            />
            <XAxis
              dataKey="month"
              stroke="#9CA3AF"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E7E1DA' }}
              dy={6}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v / 1000}K`}
              domain={[0, 'dataMax + 8000']}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#171717] text-white px-3 py-2 rounded-xl text-xs shadow-lg space-y-0.5 border border-neutral-700">
                      <div className="text-[10px] text-neutral-400 font-medium">
                        {data.label || data.month}
                      </div>
                      <div className="text-sm font-bold text-[#FF6B00]">
                        {data.audience.toLocaleString()} followers
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="audience"
              stroke="#FF6B00"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#audienceGradient)"
              dot={{ r: 4, fill: '#FF6B00', stroke: '#FFFFFF', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#FF6B00', stroke: '#FFFFFF', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Platform Breakdown Strip */}
      <PlatformBreakdown />
    </section>
  );
}
