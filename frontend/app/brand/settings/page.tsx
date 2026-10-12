'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Bell,
  Lock,
  CheckCircle2,
  Save,
  LogOut,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';
import { PortalPageHeader } from '../../../components/creator/PortalPageHeader';

export default function BrandSettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'security'>('account');
  const [timezone, setTimezone] = useState('IST (Indian Standard Time, UTC +5:30)');
  const [notifyApplications, setNotifyApplications] = useState(true);
  const [notifyMilestones, setNotifyMilestones] = useState(true);
  const [notifyInquiries, setNotifyInquiries] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await logout();
    } catch {
      router.push('/login');
    }
  };

  const emailDisplay = user?.email || 'brand@company.com';
  const brandNameDisplay = user?.displayName || 'Brand Partner';

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        {/* 1. Page Header */}
        <PortalPageHeader
          eyebrow="Organization Settings"
          titlePrefix="Brand workspace & application"
          highlightText="settings."
          description="Manage your enterprise credentials, alert subscriptions, team timezone, and active sessions."
        />

        {/* Save Toast Feedback */}
        {savedSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs transition animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Settings saved successfully!</span>
            </div>
            <button
              onClick={() => setSavedSuccess(false)}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* 2. Main Layout with Left Sub-Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Settings Sidebar (4 cols) */}
          <div className="md:col-span-4 bg-white rounded-2xl border border-[#E7E1DA] p-3 shadow-xs space-y-1">
            {[
              { id: 'account', label: 'Company & Account', icon: Building2 },
              { id: 'notifications', label: 'Alert Subscriptions', icon: Bell },
              { id: 'security', label: 'Privacy & Security', icon: Lock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFF4EB] text-[#FF6B00]'
                      : 'text-[#525252] hover:bg-[#F8F6F2] hover:text-[#171717]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isSelected ? 'text-[#FF6B00]' : 'text-[#737373]'
                    }`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            {/* Sign Out Action */}
            <div className="pt-2 border-t border-[#E7E1DA]/60">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold text-[#737373] hover:text-rose-600 hover:bg-rose-50 transition flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>{signingOut ? 'Signing out...' : 'Sign Out of CRAB'}</span>
              </button>
            </div>
          </div>

          {/* Right Settings Content Area (8 cols) */}
          <div className="md:col-span-8 bg-white rounded-2xl border border-[#E7E1DA] p-6 shadow-xs space-y-6">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Tab 1: Account */}
              {activeTab === 'account' && (
                <div className="space-y-5">
                  <div className="pb-3 border-b border-[#E7E1DA]">
                    <h3 className="font-bold text-sm text-[#171717]">Company Account Information</h3>
                    <p className="text-xs text-[#737373] mt-0.5">
                      Your registered brand email and regional operation settings.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#171717]">Brand Display Name</label>
                    <input
                      type="text"
                      disabled
                      value={brandNameDisplay}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] text-xs text-[#171717] cursor-not-allowed"
                    />
                    <p className="text-[10px] text-[#737373]">
                      To update your public brand information, visit your Brand Profile page.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#171717]">Email Address</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        disabled
                        value={emailDisplay}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] text-xs text-[#737373] cursor-not-allowed"
                      />
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        Verified
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#171717]">Operating Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] focus:border-[#FF6B00] text-xs text-[#171717] focus:outline-none transition cursor-pointer"
                    >
                      <option>IST (Indian Standard Time, UTC +5:30)</option>
                      <option>UTC (Coordinated Universal Time)</option>
                      <option>PST (Pacific Standard Time, UTC -8)</option>
                      <option>EST (Eastern Standard Time, UTC -5)</option>
                      <option>GMT (Greenwich Mean Time)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Tab 2: Notifications */}
              {activeTab === 'notifications' && (
                <div className="space-y-5">
                  <div className="pb-3 border-b border-[#E7E1DA]">
                    <h3 className="font-bold text-sm text-[#171717]">Alert Subscriptions</h3>
                    <p className="text-xs text-[#737373] mt-0.5">
                      Configure when emails and activity notifications are dispatched to your team.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        title: 'New Creator Applications',
                        desc: 'Receive immediate alerts when qualified creators apply to your active campaigns',
                        checked: notifyApplications,
                        setter: setNotifyApplications,
                      },
                      {
                        title: 'Collaboration Deliverable Submissions',
                        desc: 'Notify when creators submit video previews, drafts, or live links for milestone approval',
                        checked: notifyMilestones,
                        setter: setNotifyMilestones,
                      },
                      {
                        title: 'Direct Creator Inquiries & Pitch Requests',
                        desc: 'Alert when creators reach out with custom sponsorship proposals',
                        checked: notifyInquiries,
                        setter: setNotifyInquiries,
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-4 p-4 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA]"
                      >
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-[#171717]">{item.title}</div>
                          <div className="text-[11px] text-[#737373]">{item.desc}</div>
                        </div>

                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={(e) => item.setter(e.target.checked)}
                          className="w-4 h-4 rounded text-[#FF6B00] accent-[#FF6B00] cursor-pointer mt-0.5"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Security */}
              {activeTab === 'security' && (
                <div className="space-y-5">
                  <div className="pb-3 border-b border-[#E7E1DA]">
                    <h3 className="font-bold text-sm text-[#171717]">Security & Authentication</h3>
                    <p className="text-xs text-[#737373] mt-0.5">
                      Enterprise authentication and session verification details.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-emerald-900">
                        Enterprise Session Protected
                      </div>
                      <div className="text-[11px] text-emerald-700">
                        Authenticated with cryptographic scrypt KDF and token rotation.
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#171717]">Account Role</label>
                    <input
                      type="text"
                      disabled
                      value={user?.role || 'BRAND'}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1DA] text-xs text-[#737373] cursor-not-allowed"
                    />
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="pt-4 border-t border-[#E7E1DA] flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Preferences</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
