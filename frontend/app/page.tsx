'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import {
  Sparkles,
  ArrowRight,
  User,
  Building2,
  Compass,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  BarChart3,
  TrendingUp,
} from 'lucide-react';

export default function RootLandingPage() {
  const { user, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Disabled auto-redirect during development so you can view the landing page
    /*
    if (user) {
      if (user.role === 'CREATOR') {
        router.push('/creator/dashboard');
      } else {
        router.push('/brand/dashboard');
      }
    }
    */
  }, [user, router]);

  const enterDemo = async (role: 'CREATOR' | 'BRAND') => {
    const email = role === 'CREATOR' ? 'tech.creator@crab-platform.local' : 'acme.brand@crab-platform.local';
    await login(email, 'Password123!', role);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col justify-between">
      {/* Top Header */}
      <header className="px-8 h-20 flex items-center justify-between border-b border-[#E7E8F0] bg-white sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F4511E] flex items-center justify-center text-white font-bold text-xl shadow-sm">
            🦀
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-[#17182B]">CRAB</span>
            <span className="hidden sm:inline-block ml-2 text-xs text-[#8B90A5] border-l border-[#E7E8F0] pl-2 font-medium">
              Creators Reaching Aligned Brands
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/login"
            className="px-4 py-2 text-xs font-bold text-[#17182B] hover:text-[#F4511E] transition"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 rounded-xl bg-[#F4511E] hover:bg-[#D94316] text-white text-xs font-bold shadow-sm transition"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 flex-1 w-full flex flex-col items-center justify-center text-center space-y-8">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#F3F3FC] text-xs font-bold text-[#8580E8] border border-[#8580E8]/20 shadow-sm">
          <Sparkles className="w-4 h-4 text-[#8580E8]" />
          <span>AI-Powered Two-Sided Opportunity Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#17182B] tracking-tight max-w-4xl leading-[1.15]">
          Discover High-Alignment Creator Partnerships with{' '}
          <span className="bg-gradient-to-r from-[#8580E8] to-[#F4511E] bg-clip-text text-transparent">
            Explainable AI
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#626782] max-w-2xl leading-relaxed">
          CRAB connects creators and brands through deep contextual intelligence, pgvector semantic embeddings, and transparent match scoring — going far beyond basic follower counts.
        </p>

        {/* Quick Persona Launch Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl pt-6">
          <button
            onClick={() => enterDemo('CREATOR')}
            className="p-6 rounded-2xl bg-white border-2 border-[#E7E8F0] hover:border-[#8580E8] shadow-sm hover:shadow-md transition text-left space-y-4 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#F3F3FC] text-[#8580E8] flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F3F3FC] text-[#8580E8] group-hover:bg-[#8580E8] group-hover:text-white transition">
                Enter Creator Workspace →
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#17182B]">I'm a Creator</h3>
              <p className="text-xs text-[#626782] mt-1 leading-relaxed">
                Explore brand campaigns, inspect your audience vector dossier, and manage inbound offers.
              </p>
            </div>
          </button>

          <button
            onClick={() => enterDemo('BRAND')}
            className="p-6 rounded-2xl bg-white border-2 border-[#E7E8F0] hover:border-[#F4511E] shadow-sm hover:shadow-md transition text-left space-y-4 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#FFF5F2] text-[#F4511E] flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFF5F2] text-[#F4511E] group-hover:bg-[#F4511E] group-hover:text-white transition">
                Enter Brand Workspace →
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#17182B]">I'm a Brand</h3>
              <p className="text-xs text-[#626782] mt-1 leading-relaxed">
                Launch structured campaigns, discover creators with explainable match scores, and track sprints.
              </p>
            </div>
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl pt-10 text-left">
          <div className="p-5 rounded-2xl bg-white border border-[#E7E8F0] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#8580E8] flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-[#17182B]">Explainable Match Fit</h4>
            <p className="text-xs text-[#626782]">
              Every match displays exact percentage breakdowns across semantics, audience overlap, and platform fit.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E7E8F0] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#F4511E] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-[#17182B]">Campaign Workspaces</h4>
            <p className="text-xs text-[#626782]">
              Manage deliverables, track approvals, and coordinate milestones seamlessly with invited creators.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E7E8F0] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-[#17182B]">Creator Intelligence</h4>
            <p className="text-xs text-[#626782]">
              AI-generated dossiers extract audience personas and commercial suitability without guesswork.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E7E8F0] bg-white py-6">
        <div className="max-w-6xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8B90A5] gap-4">
          <p>© 2026 CRAB Platform • Creators Reaching Aligned Brands</p>
          <div className="flex space-x-6">
            <Link href="/login" className="hover:underline">Sign In</Link>
            <Link href="/signup" className="hover:underline">Create Account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
