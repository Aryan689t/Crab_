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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <CreatorSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
