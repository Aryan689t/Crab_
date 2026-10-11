'use client';

import React from 'react';
import { useAuth } from '../../../lib/auth-context';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Bell,
  Lock,
  CreditCard,
  UserCircle
} from 'lucide-react';

export default function CreatorSettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="p-8">Loading settings...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#17182B]">Settings</h1>
        <p className="text-sm text-[#626782] mt-1">Manage your account preferences and notifications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation Sidebar */}
        <div className="md:col-span-1 space-y-1">
          <button className="w-full text-left px-4 py-2.5 rounded-xl bg-[#F4511E]/10 text-[#F4511E] text-sm font-semibold flex items-center gap-2">
            <UserCircle className="w-4 h-4" /> Account
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-xl text-[#626782] hover:bg-white hover:text-[#17182B] text-sm font-medium transition flex items-center gap-2">
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-xl text-[#626782] hover:bg-white hover:text-[#17182B] text-sm font-medium transition flex items-center gap-2">
            <Lock className="w-4 h-4" /> Privacy & Security
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-xl text-[#626782] hover:bg-white hover:text-[#17182B] text-sm font-medium transition flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Payments
          </button>
        </div>

        {/* Settings Content Area */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E7E8F0] shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-[#17182B]">Account Details</h2>
              <p className="text-xs text-[#626782] mt-1">Update your email address and primary account information.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#17182B]">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#8B90A5] cursor-not-allowed"
                />
                <p className="text-[10px] text-[#8B90A5]">To change your login email, please contact support.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#17182B]">Timezone</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8F0] bg-[#F8F9FC] text-sm text-[#17182B] focus:outline-none focus:border-[#F4511E] focus:bg-white transition">
                  <option>UTC (Coordinated Universal Time)</option>
                  <option>PST (Pacific Standard Time)</option>
                  <option>EST (Eastern Standard Time)</option>
                  <option>IST (Indian Standard Time)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E7E8F0] flex justify-end">
              <button className="px-6 py-2.5 rounded-xl bg-[#F4511E] hover:bg-[#D94316] text-white text-sm font-semibold shadow-sm transition">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
