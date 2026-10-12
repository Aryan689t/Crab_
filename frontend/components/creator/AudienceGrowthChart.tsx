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
import { BarChart3, TrendingUp } from 'lucide-react';
import { PlatformBreakdown, PlatformStat } from './PlatformBreakdown';

export interface GrowthPoint {
  month: string;
  audience: number;
  label?: string;
}

interface AudienceGrowthChartProps {
  growthData?: GrowthPoint[];
  platformStats?: PlatformStat[];
  isLoading?: boolean;
}

export function AudienceGrowthChart({
  growthData = [],
  platformStats = [],
  isLoading = false,
}: AudienceGrowthChartProps) {
  const hasChartData = growthData && growthData.length >= 2;

  return (
    <section className="bg-white rounded-2xl p-6 border border-[#E7E1DA] shadow-xs space-y-6 flex flex-col justify-between">
      {/* Header with Title */}
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
              {hasChartData
                ? `Historical snapshots (${growthData.length} recorded data points)`
                : 'Audience snapshots recorded over time'}
            </p>
          </div>
        </div>

        {hasChartData && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F8F6F2] rounded-xl border border-[#E7E1DA] text-xs font-semibold text-[#171717]">
            <TrendingUp className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Verified Timeline</span>
          </div>
        )}
      </div>

      {/* Chart Canvas Area or Empty State */}
      <div className="min-h-[16rem] w-full pt-2 flex items-center justify-center">
        {isLoading ? (
          <div className="text-xs text-[#737373] animate-pulse">
            Loading audience timeline...
          </div>
        ) : hasChartData ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
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
                  tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`)}
                  domain={[0, 'auto']}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as GrowthPoint;
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
        ) : (
          <div className="w-full text-center py-10 px-4 bg-[#F8F6F2]/50 border border-dashed border-[#E7E1DA] rounded-xl flex flex-col items-center justify-center gap-2">
            <BarChart3 className="w-8 h-8 text-[#A39A90] stroke-[1.5]" />
            <div className="text-xs font-semibold text-[#171717]">No Historical Growth Data Yet</div>
            <p className="text-[11px] text-[#737373] max-w-sm">
              Growth trends will appear after CRAB tracks periodic snapshots of your connected channels. We never fabricate audience progression or simulated percentage spikes.
            </p>
          </div>
        )}
      </div>

      {/* Platform Breakdown Strip */}
      <PlatformBreakdown stats={platformStats} />
    </section>
  );
}
