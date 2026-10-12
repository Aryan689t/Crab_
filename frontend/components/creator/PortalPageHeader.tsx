'use client';

import React from 'react';

interface PortalPageHeaderProps {
  eyebrow?: string;
  titlePrefix?: string;
  highlightText?: string;
  titleSuffix?: string;
  description?: string;
  action?: React.ReactNode;
}

export function PortalPageHeader({
  eyebrow = 'CREATOR STUDIO',
  titlePrefix = '',
  highlightText = '',
  titleSuffix = '',
  description = '',
  action,
}: PortalPageHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2">
      <div className="space-y-1.5 max-w-3xl">
        {eyebrow && (
          <div className="text-[11px] font-mono font-semibold tracking-wider text-[#737373] uppercase">
            {eyebrow}
          </div>
        )}
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-[38px] font-normal tracking-tight text-[#171717] leading-[1.2]">
          {titlePrefix}{' '}
          {highlightText && (
            <span className="text-[#FF6B00]">{highlightText}</span>
          )}{' '}
          {titleSuffix}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-[#737373] pt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="self-start sm:self-auto shrink-0 pt-1">
          {action}
        </div>
      )}
    </header>
  );
}
