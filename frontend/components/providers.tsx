'use client';

import React from 'react';
import { AuthProvider } from '../lib/auth-context';
import { NotificationProvider } from '../lib/notification-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>{children}</NotificationProvider>
    </AuthProvider>
  );
}
