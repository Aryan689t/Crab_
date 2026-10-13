'use client';

import React from 'react';
import Link from 'next/link';
import { CrabLogo } from './CrabLogo';

export interface FooterProps {
  variant?: 'marketing' | 'portal' | 'auth';
  portalRole?: 'creator' | 'brand';
  className?: string;
}

export function Footer({
  variant = 'marketing',
  portalRole = 'creator',
  className = '',
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  // Variant 1: Minimal Auth & Utility Footer (for Login, Signup, 404)
  if (variant === 'auth') {
    return (
      <footer
        className={`w-full py-6 px-4 border-t border-[#E7E8F0] bg-white text-xs text-[#8B90A5] ${className}`}
        role="contentinfo"
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <CrabLogo size={18} />
            <span className="font-medium text-[#171717]">CRAB</span>
            <span className="text-[#8B90A5]">
              © {currentYear} CRAB Platform • Creators Reaching Aligned Brands
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <Link href="/" className="hover:text-[#FF6B00] transition-colors">
              Home
            </Link>
            <Link href="/login" className="hover:text-[#FF6B00] transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-[#FF6B00] transition-colors">
              Create Account
            </Link>
            <a href="/#faq" className="hover:text-[#FF6B00] transition-colors">
              FAQ & Support
            </a>
          </div>
        </div>
      </footer>
    );
  }

  // Variant 2: Minimal Portal Footer (for Creator & Brand Dashboards)
  if (variant === 'portal') {
    const isBrand = portalRole === 'brand';

    return (
      <footer
        className={`w-full border-t border-[#E7E1DA] bg-white/70 backdrop-blur-xs py-3.5 px-4 sm:px-6 mt-auto shrink-0 ${className}`}
        role="contentinfo"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#737373]">
          {/* Brand & Copyright */}
          <div className="flex items-center flex-wrap gap-2.5">
            <Link href="/" className="flex items-center gap-1.5 hover:opacity-85 transition">
              <CrabLogo size={18} />
              <span className="font-bold text-[#171717] tracking-tight">CRAB</span>
            </Link>
            <span className="text-[#D4CEC5] hidden sm:inline">•</span>
            <span className="text-[11px] font-semibold text-[#FF6B00] bg-[#FFF4EB] px-2 py-0.5 rounded-full">
              {isBrand ? 'Brand Space' : 'Creator Space'}
            </span>
            <span className="text-[#D4CEC5] hidden sm:inline">•</span>
            <span className="text-[11px]">© {currentYear} CRAB Platform. All rights reserved.</span>
          </div>

          {/* Quick Contextual Navigation */}
          <nav aria-label="Portal footer navigation" className="flex items-center flex-wrap gap-3.5 text-[11px]">
            {isBrand ? (
              <>
                <Link href="/brand/dashboard" className="hover:text-[#171717] transition-colors">
                  Overview
                </Link>
                <Link href="/brand/campaigns" className="hover:text-[#171717] transition-colors">
                  Campaigns
                </Link>
                <Link href="/brand/creators" className="hover:text-[#171717] transition-colors">
                  Find Creators
                </Link>
                <Link href="/brand/inbox" className="hover:text-[#171717] transition-colors">
                  Inbox
                </Link>
                <Link href="/brand/profile" className="hover:text-[#171717] transition-colors">
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link href="/creator/dashboard" className="hover:text-[#171717] transition-colors">
                  Overview
                </Link>
                <Link href="/creator/discover" className="hover:text-[#171717] transition-colors">
                  Discover
                </Link>
                <Link href="/creator/opportunities" className="hover:text-[#171717] transition-colors">
                  Opportunities
                </Link>
                <Link href="/creator/inbox" className="hover:text-[#171717] transition-colors">
                  Inbox
                </Link>
                <Link href="/creator/profile" className="hover:text-[#171717] transition-colors">
                  Profile
                </Link>
              </>
            )}
            <span className="text-[#D4CEC5]">•</span>
            <Link href="/" className="hover:text-[#FF6B00] transition-colors font-medium">
              CRAB Home
            </Link>
          </nav>
        </div>
      </footer>
    );
  }

  // Variant 3: Comprehensive Marketing Footer (for Landing & Public Pages)
  return (
    <footer
      className={`bg-[#0a0a0a] text-white py-16 px-6 border-t border-white/10 ${className}`}
      role="contentinfo"
    >
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        {/* Brand Section */}
        <div className="space-y-4 md:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <CrabLogo size={32} className="group-hover:scale-105 transition-transform" />
            <span className="font-serif font-bold text-xl text-white tracking-tight">CRAB</span>
          </Link>
          <p className="text-xs text-white/60 leading-relaxed">
            Connecting creators and brands to build meaningful collaborations. Direct partnerships
            built on shared taste, audience resonance, and zero agency middlemen.
          </p>
        </div>

        {/* Platform Navigation */}
        <div>
          <div className="font-mono text-xs font-semibold text-[#FF6B00] uppercase tracking-wider mb-4">
            Platform Navigation
          </div>
          <ul className="space-y-2.5 text-xs text-white/70">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/creator/discover" className="hover:text-white transition-colors">
                Discover Opportunities
              </Link>
            </li>
            <li>
              <Link href="/brand/creators" className="hover:text-white transition-colors">
                Find Creators
              </Link>
            </li>
            <li>
              <Link href="/creator/dashboard" className="hover:text-white transition-colors">
                Creator Portal
              </Link>
            </li>
            <li>
              <Link href="/brand/dashboard" className="hover:text-white transition-colors">
                Brand Portal
              </Link>
            </li>
          </ul>
        </div>

        {/* Platform Exploration */}
        <div>
          <div className="font-mono text-xs font-semibold text-[#FF6B00] uppercase tracking-wider mb-4">
            Platform Exploration
          </div>
          <ul className="space-y-2.5 text-xs text-white/70">
            <li>
              <a href="/#story" className="hover:text-white transition-colors">
                Our Founding Mission
              </a>
            </li>
            <li>
              <a href="/#gallery" className="hover:text-white transition-colors">
                Creative Disciplines
              </a>
            </li>
            <li>
              <a href="/#how-it-works" className="hover:text-white transition-colors">
                Four-Step Workflow
              </a>
            </li>
            <li>
              <a href="/#principles" className="hover:text-white transition-colors">
                Alignment Principles
              </a>
            </li>
            <li>
              <a href="/#faq" className="hover:text-white transition-colors">
                FAQ & Support
              </a>
            </li>
          </ul>
        </div>

        {/* Account & Access */}
        <div>
          <div className="font-mono text-xs font-semibold text-[#FF6B00] uppercase tracking-wider mb-4">
            Account & Access
          </div>
          <ul className="space-y-2.5 text-xs text-white/70 mb-5">
            <li>
              <Link href="/login" className="hover:text-white transition-colors">
                Sign In
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:text-white transition-colors">
                Create Account
              </Link>
            </li>
          </ul>
          <div className="font-mono text-xs font-semibold text-[#FF6B00] uppercase tracking-wider mb-2">
            Guiding Ethos
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            Direct influence is built on authentic audience trust, transparent creative terms, and real collaboration.
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1240px] mx-auto pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-4">
        <p>© {currentYear} CRAB Platform. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/login" className="hover:text-white/80 transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="hover:text-white/80 transition-colors">
            Sign Up
          </Link>
          <a href="/#principles" className="hover:text-white/80 transition-colors">
            Alignment Manifesto
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
