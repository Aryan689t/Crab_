'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/lib/auth-context';
import { User, Building2, ArrowRight, CheckCircle2, Sparkles, Mail, Lock, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('CREATOR');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter an email address.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      await signup(email, password, selectedRole);
    } catch (err: any) {
      setErrorMsg(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col justify-between">
      {/* Header */}
      <header className="px-8 h-20 flex items-center justify-between border-b border-[#E7E8F0] bg-white">
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F4511E] flex items-center justify-center text-white font-bold text-xl shadow-sm">
            🦀
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-[#17182B]">CRAB</span>
            <span className="hidden sm:inline-block ml-2 text-xs text-[#8B90A5] border-l border-[#E7E8F0] pl-2 font-medium">
              Opportunity Engine
            </span>
          </div>
        </Link>
        <Link href="/login" className="text-xs font-bold text-[#F4511E] hover:underline">
          Already have an account? Sign In
        </Link>
      </header>

      {/* Main Card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-[#E7E8F0] p-8 shadow-[0_4px_12px_0_rgba(23,24,43,0.04)] space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-[#17182B]">Join the CRAB Ecosystem</h1>
            <p className="text-xs text-[#626782]">
              Choose how you want to use the AI-Powered Opportunity Engine
            </p>
          </div>

          {/* Role Choice Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setSelectedRole('CREATOR')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-3 ${
                selectedRole === 'CREATOR'
                  ? 'border-[#8580E8] bg-[#F3F3FC]'
                  : 'border-[#E7E8F0] bg-white hover:border-[#8580E8]/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#8580E8] flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                {selectedRole === 'CREATOR' && (
                  <CheckCircle2 className="w-5 h-5 text-[#8580E8]" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#17182B]">I am a Creator</h3>
                <p className="text-xs text-[#626782] mt-1 leading-relaxed">
                  Discover aligned brand campaigns, understand your audience vector, and close fair deals.
                </p>
              </div>
            </div>

            <div
              onClick={() => setSelectedRole('BRAND')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-3 ${
                selectedRole === 'BRAND'
                  ? 'border-[#F4511E] bg-[#FFF5F2]'
                  : 'border-[#E7E8F0] bg-white hover:border-[#F4511E]/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#F4511E] flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                {selectedRole === 'BRAND' && (
                  <CheckCircle2 className="w-5 h-5 text-[#F4511E]" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#17182B]">I am a Brand</h3>
                <p className="text-xs text-[#626782] mt-1 leading-relaxed">
                  Launch campaigns, discover contextual creators with explainable AI match scores.
                </p>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#17182B]">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8B90A5]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={selectedRole === 'CREATOR' ? 'creator@youtube.com' : 'brand@company.com'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] placeholder-[#8B90A5] focus:outline-none focus:border-[#8580E8] focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#17182B]">Create Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8B90A5]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] placeholder-[#8B90A5] focus:outline-none focus:border-[#8580E8] focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#F4511E] hover:bg-[#D94316] text-white text-xs font-bold shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : `Continue to ${selectedRole === 'CREATOR' ? 'Creator' : 'Brand'} Onboarding`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-[#8B90A5] border-t border-[#E7E8F0] bg-white">
        © 2026 CRAB Platform • Creators Reaching Aligned Brands
      </footer>
    </div>
  );
}
