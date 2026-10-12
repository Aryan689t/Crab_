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
  sparklineVariant?: 1 | 2 | 3 | 4;
}

export function CreatorMetricCard({
  label,
  value,
  trend,
  subtext,
  isPositive = true,
  icon: Icon,
  sparklineVariant = 1,
}: CreatorMetricCardProps) {
  // Sparkline SVG path variations
  const sparklines = {
    1: 'M2 18 C 15 15, 25 22, 40 12 C 55 2, 70 14, 85 8 L 85 24 L 2 24 Z',
    2: 'M2 16 C 18 20, 32 10, 48 15 C 62 18, 72 6, 85 5 L 85 24 L 2 24 Z',
    3: 'M2 19 C 14 14, 28 17, 45 10 C 60 4, 72 12, 85 7 L 85 24 L 2 24 Z',
    4: 'M2 17 C 20 18, 35 12, 50 14 C 65 16, 75 9, 85 9 L 85 24 L 2 24 Z',
  };

  const sparklineStroke = {
    1: 'M2 18 C 15 15, 25 22, 40 12 C 55 2, 70 14, 85 8',
    2: 'M2 16 C 18 20, 32 10, 48 15 C 62 18, 72 6, 85 5',
    3: 'M2 19 C 14 14, 28 17, 45 10 C 60 4, 72 12, 85 7',
    4: 'M2 17 C 20 18, 35 12, 50 14 C 65 16, 75 9, 85 9',
  };

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
          {value}
        </div>
      </div>

      {/* Bottom Row: Trend & Sparkline */}
      <div className="flex items-end justify-between gap-2 pt-1">
        <div>
          {trend && (
            <span
              className={`inline-flex items-center text-xs font-medium ${
                isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend}
            </span>
          )}
          {subtext && !trend && (
            <span className="text-xs text-[#737373] font-normal">{subtext}</span>
          )}
        </div>

        {/* Mini Ambient Sparkline */}
        <div className="w-20 h-7 shrink-0 opacity-80 group-hover:opacity-100 transition">
          <svg viewBox="0 0 87 24" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={`grad-${sparklineVariant}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#FF6B00" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={sparklines[sparklineVariant]}
              fill={`url(#grad-${sparklineVariant})`}
            />
            <path
              d={sparklineStroke[sparklineVariant]}
              fill="none"
              stroke="#FF6B00"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
