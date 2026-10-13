'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './auth-context';
import { fetchApi } from './api';

export interface MessageNotificationItem {
  id: string;
  conversationId: string;
  sender: {
    name: string;
    role: string;
    avatar: string;
  };
  messagePreview: string;
  campaignTitle: string | null;
  hasAttachment: boolean;
  attachments?: Array<{
    id: string;
    originalFilename: string;
    mimeType: string;
    fileSize: number;
  }>;
  createdAt: string;
  isRead: boolean;
  readAt: string | null;
}

interface NotificationContextType {
  unreadCount: number;
  notifications: MessageNotificationItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markConversationAsReadLocally: (conversationId: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  notifications: [],
  loading: false,
  error: null,
  refresh: async () => {},
  markAllAsRead: async () => {},
  markConversationAsReadLocally: () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<MessageNotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isFetchingRef = useRef(false);

  const fetchNotifications = useCallback(
    async (silent = false) => {
      if (!token || isFetchingRef.current) return;
      isFetchingRef.current = true;
      if (!silent) setLoading(true);

      try {
        const res = await fetchApi<{
          data: {
            unreadCount: number;
            notifications: MessageNotificationItem[];
          };
        }>('/api/notifications', { cache: 'no-store' }, token);

        if (res?.data) {
          setUnreadCount(res.data.unreadCount ?? 0);
          setNotifications(res.data.notifications ?? []);
          setError(null);
        }
      } catch (err: any) {
        // Silently preserve previous state if polling fails
        if (!silent) {
          setError(err.message || 'Failed to load notifications');
        }
      } finally {
        isFetchingRef.current = false;
        if (!silent) setLoading(false);
      }
    },
    [token]
  );

  const refresh = useCallback(async () => {
    await fetchNotifications(false);
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (!token) return;
    try {
      await fetchApi('/api/notifications/mark-all-read', { method: 'POST' }, token);
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
    } catch (err: any) {
      console.warn('[NOTIFICATIONS] Mark all read failed:', err);
    }
  }, [token]);

  const markConversationAsReadLocally = useCallback((conversationId: string) => {
    setNotifications((prev) => {
      let newlyReadCount = 0;
      const updated = prev.map((n) => {
        if (n.conversationId === conversationId && !n.isRead) {
          newlyReadCount += 1;
          return { ...n, isRead: true, readAt: new Date().toISOString() };
        }
        return n;
      });
      setUnreadCount((c) => Math.max(0, c - newlyReadCount));
      return updated;
    });
  }, []);

  // Poll in-app notifications while session is active (every 5 seconds)
  useEffect(() => {
    if (!token || !user) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    fetchNotifications(false);

    const interval = setInterval(() => {
      // Only poll when window tab is visible
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchNotifications(true);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [token, user, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        loading,
        error,
        refresh,
        markAllAsRead,
        markConversationAsReadLocally,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useMessageNotifications() {
  return useContext(NotificationContext);
}
