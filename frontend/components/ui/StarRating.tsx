'use client';

import React from 'react';

interface StarRatingProps {
  rating: number; // e.g. 4.3 or 5
  reviewCount?: number;
  size?: 'xs' | 'sm' | 'md';
  variant?: 'badge' | 'minimal';
  className?: string;
}

/**
 * StarRating component renders an SVG star rating badge or inline label
 * (e.g., "4.3 ★" or "4.8 ★") strictly using SVG vectors—never emojis.
 */
export function StarRating({
  rating = 4.8,
  reviewCount,
  size = 'sm',
  variant = 'badge',
  className = '',
}: StarRatingProps) {
  // Format rating to 1 decimal place (e.g. 4.3 or 5.0)
  const formattedRating = Number(rating).toFixed(1);

  const sizeClasses = {
    xs: {
      svg: 'w-2.5 h-2.5',
      text: 'text-[10px]',
      padding: 'px-1.5 py-0.5 gap-1',
    },
    sm: {
      svg: 'w-3 h-3',
      text: 'text-[11px]',
      padding: 'px-1.5 py-0.5 gap-1',
    },
    md: {
      svg: 'w-3.5 h-3.5',
      text: 'text-xs',
      padding: 'px-2 py-0.5 gap-1.5',
    },
  }[size];

  if (variant === 'minimal') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold text-[#92400E] ${sizeClasses.text} ${className}`}
        title={`Rating: ${formattedRating} / 5.0`}
      >
        <span>{formattedRating}</span>
        {/* Crisp vector Star SVG */}
        <svg
          className={`${sizeClasses.svg} text-[#F59E0B] fill-[#F59E0B] shrink-0`}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </svg>
        {reviewCount !== undefined && (
          <span className="text-[#A3A3A3] text-[10px] font-normal">({reviewCount})</span>
        )}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-md bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] font-bold shadow-2xs shrink-0 select-none ${sizeClasses.padding} ${sizeClasses.text} ${className}`}
      title={`Verified Rating: ${formattedRating} / 5.0`}
    >
      <span>{formattedRating}</span>
      {/* Crisp vector Star SVG */}
      <svg
        className={`${sizeClasses.svg} text-[#F59E0B] fill-[#F59E0B] shrink-0`}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </svg>
      {reviewCount !== undefined && (
        <span className="text-[#B45309]/70 text-[10px] font-medium">({reviewCount})</span>
      )}
    </span>
  );
}

export default StarRating;
