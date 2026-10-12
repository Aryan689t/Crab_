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
  titlePrefix = '',
  highlightText = '',
  titleSuffix = '',
  action,
}: PortalPageHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
      <h1 className="font-serif text-2xl sm:text-3xl lg:text-[38px] font-normal tracking-tight text-[#171717] leading-[1.2]">
        {titlePrefix}{' '}
        {highlightText && (
          <span className="text-[#FF6B00]">{highlightText}</span>
        )}{' '}
        {titleSuffix}
      </h1>

      {action && (
        <div className="self-start sm:self-auto shrink-0">
          {action}
        </div>
      )}
    </header>
  );
}
