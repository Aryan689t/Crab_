'use client';

import React, { useState } from 'react';
import { CreatorSidebar } from '../../components/CreatorSidebar';
import { PanelLeftClose, PanelLeftOpen, User } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#F8F6F2]">
      {/* Sidebar */}
      <CreatorSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative bg-[#F8F6F2]">

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
