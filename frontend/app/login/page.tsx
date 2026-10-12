'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/lib/auth-context';
import { Sparkles, ArrowRight, User, Building2, Lock, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('CREATOR');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      await login(email, password, role);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoRole: UserRole) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const demoEmail = demoRole === 'CREATOR' ? 'alex.chen@crab.demo' : 'partnerships@aws.demo';
      await login(demoEmail, 'Password123!', demoRole);
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col justify-between">
      {/* Header */}
      <header className="px-8 h-20 flex items-center justify-between border-b border-[#E7E8F0] bg-white">
        <Link href="/" className="flex items-center space-x-3 group">
          <img
            src="/crab-logo.png"
            alt="CRAB"
            className="w-10 h-10 object-contain group-hover:scale-105 transition-transform"
          />
          <div>
            <span className="font-bold text-xl tracking-tight text-[#17182B]">CRAB</span>
            <span className="hidden sm:inline-block ml-2 text-xs text-[#8B90A5] border-l border-[#E7E8F0] pl-2 font-medium">
              Opportunity Engine
            </span>
          </div>
        </Link>
        <Link href="/signup" className="text-xs font-bold text-[#F4511E] hover:underline">
          Don't have an account? Sign Up
        </Link>
      </header>

      {/* Main Card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E7E8F0] p-8 shadow-[0_4px_12px_0_rgba(23,24,43,0.04)] space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-[#17182B]">Welcome back to CRAB</h1>
            <p className="text-xs text-[#626782]">
              Sign in to your Creator or Brand workspace
            </p>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#F5F6FA] rounded-xl border border-[#E7E8F0]">
            <button
              type="button"
              onClick={() => setRole('CREATOR')}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition ${
                role === 'CREATOR'
                  ? 'bg-white text-[#17182B] shadow-sm'
                  : 'text-[#8B90A5] hover:text-[#17182B]'
              }`}
            >
              <img
                src="/crab-logo.png"
                alt="Creator"
                className="w-4 h-4 object-contain"
              />
              <span>Creator View</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('BRAND')}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition ${
                role === 'BRAND'
                  ? 'bg-white text-[#17182B] shadow-sm'
                  : 'text-[#8B90A5] hover:text-[#17182B]'
              }`}
            >
              <img
                src="/crab-logo.png"
                alt="Brand"
                className="w-4 h-4 object-contain"
              />
              <span>Brand View</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Standard Login Form */}
          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#17182B]">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8B90A5]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'CREATOR' ? 'creator@example.com' : 'brand@company.com'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] placeholder-[#8B90A5] focus:outline-none focus:border-[#8580E8] focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-[#17182B]">Password</label>
                <span className="text-[11px] text-[#8B90A5]">Demo: Any password</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8B90A5]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] placeholder-[#8B90A5] focus:outline-none focus:border-[#8580E8] focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#F4511E] hover:bg-[#D94316] text-white text-xs font-bold shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : `Enter as ${role === 'CREATOR' ? 'Creator' : 'Brand'}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Try Demo Section */}
          <div className="pt-4 border-t border-[#E7E8F0] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#17182B] uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F4511E]" />
                <span>Try Demo</span>
              </span>
              <span className="text-[10px] text-[#8B90A5] font-medium">Instant judge access</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickDemoLogin('CREATOR')}
                className="p-3.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] hover:bg-[#F3F3FC] hover:border-[#8580E8] text-left transition flex flex-col justify-between space-y-1.5 group disabled:opacity-50"
              >
                <span className="text-xs font-bold text-[#17182B] flex items-center space-x-1.5 group-hover:text-[#8580E8] transition-colors">
                  <User className="w-4 h-4 text-[#8580E8]" />
                  <span>Explore as Creator</span>
                </span>
                <span className="text-[11px] text-[#626782]">Alex Chen (Tech & AI)</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickDemoLogin('BRAND')}
                className="p-3.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] hover:bg-[#FFF5F2] hover:border-[#F4511E] text-left transition flex flex-col justify-between space-y-1.5 group disabled:opacity-50"
              >
                <span className="text-xs font-bold text-[#17182B] flex items-center space-x-1.5 group-hover:text-[#F4511E] transition-colors">
                  <Building2 className="w-4 h-4 text-[#F4511E]" />
                  <span>Explore as Brand</span>
                </span>
                <span className="text-[11px] text-[#626782]">AWS Partnerships</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-[#8B90A5] border-t border-[#E7E8F0] bg-white">
        © 2026 CRAB Platform • Creators Reaching Aligned Brands
      </footer>
    </div>
  );
}
