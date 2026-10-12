'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

export interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  children: React.ReactNode;
  widthClassName?: string;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  ariaLabel?: string;
  ariaLabelledBy?: string;
}

export function SideDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  headerContent,
  footerContent,
  children,
  widthClassName = 'max-w-xl md:max-w-2xl',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  ariaLabel,
  ariaLabelledBy = 'side-drawer-title',
}: SideDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Manage keyboard accessibility (Escape key to dismiss)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  // Focus management & body scroll locking
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;

      // Prevent background scrolling while drawer is open
      const originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      window.addEventListener('keydown', handleKeyDown);

      // Focus close button for accessible keyboard navigation
      const timeoutId = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      return () => {
        clearTimeout(timeoutId);
        document.body.style.overflow = originalBodyOverflow;
        window.removeEventListener('keydown', handleKeyDown);

        // Restore keyboard focus to triggering element
        if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Dismiss only if click originated directly on the backdrop, not on drawer children
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      aria-labelledby={!ariaLabel && title ? ariaLabelledBy : undefined}
    >
      {/* 1. Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in cursor-pointer"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* 2. Side Drawer Container */}
      <div
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()}
        className={`relative z-10 w-full ${widthClassName} bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-250 ease-out`}
      >
        {/* Sticky Header */}
        <div className="p-4 sm:p-5 border-b border-[#E7E1DA] flex items-start justify-between gap-3 sticky top-0 bg-white/95 backdrop-blur-md z-20 shrink-0">
          <div className="flex-1 min-w-0 pr-2">
            {headerContent ? (
              headerContent
            ) : (
              <div className="space-y-0.5">
                {title && (
                  <h2
                    id={ariaLabelledBy}
                    className="text-lg sm:text-xl font-bold text-[#171717] truncate"
                  >
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <div className="text-xs text-[#737373] truncate">
                    {subtitle}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-2 -mr-1 -mt-1 rounded-xl text-[#737373] hover:text-[#171717] hover:bg-[#F8F6F2] transition cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            aria-label="Close details drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>

        {/* Sticky Footer */}
        {footerContent && (
          <div className="p-4 sm:p-5 border-t border-[#E7E1DA] bg-white/95 backdrop-blur-md sticky bottom-0 z-20 shrink-0">
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
}
