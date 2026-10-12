'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CreatorMetricCardProps {
  label: string;
  value: string | number;
  trend?: string;
  subtext?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  hasData?: boolean;
}

export function CreatorMetricCard({
  label,
  value,
  trend,
  subtext,
  isPositive = true,
  icon: Icon,
  hasData = true,
}: CreatorMetricCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E7E1DA] shadow-xs flex flex-col justify-between hover:border-[#FF6B00]/30 transition relative overflow-hidden group">
      {/* Top Row: Icon + Label */}
      <div className="flex items-center gap-2.5 text-[#737373]">
        <span className="p-1.5 rounded-lg bg-[#FFF2E8] text-[#FF6B00]">
          <Icon className="w-4 h-4" />
        </span>
        <span className="text-xs font-medium text-[#737373]">{label}</span>
      </div>

      {/* Middle Metric Value */}
      <div className="mt-3.5 mb-2">
        <div className="text-2xl sm:text-[26px] font-bold text-[#171717] tracking-tight leading-none">
          {hasData ? value : '—'}
        </div>
      </div>

      {/* Bottom Row: Trend & Subtext */}
      <div className="flex items-end justify-between gap-2 pt-1">
        <div>
          {hasData && trend && (
            <span
              className={`inline-flex items-center text-xs font-medium ${
                isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend}
            </span>
          )}
          {subtext && (
            <span className="text-xs text-[#737373] font-normal">{subtext}</span>
          )}
          {!hasData && !subtext && (
            <span className="text-xs text-[#A39A90] font-normal italic">No verified data</span>
          )}
        </div>
      </div>
    </div>
  );
}
