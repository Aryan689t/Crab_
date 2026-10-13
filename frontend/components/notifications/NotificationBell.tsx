'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  MessageSquare,
  Paperclip,
  Briefcase,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { useMessageNotifications, MessageNotificationItem } from '../../lib/notification-context';
import { fetchApi } from '../../lib/api';

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return 'Recent';
  }
}

export function NotificationBell({ className = '' }: { className?: string }) {
  const { user, token } = useAuth();
  const router = useRouter();
  const {
    unreadCount,
    notifications,
    loading,
    error,
    refresh,
    markAllAsRead,
    markConversationAsReadLocally,
  } = useMessageNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click or escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleNotificationClick = async (notif: MessageNotificationItem) => {
    setIsOpen(false);

    // Update local context read state immediately
    markConversationAsReadLocally(notif.conversationId);

    // Persist read status to backend
    if (token) {
      fetchApi(`/api/conversations/${notif.conversationId}/read`, { method: 'POST' }, token).catch(
        () => null
      );
    }

    // Determine target inbox path
    const targetPath =
      user?.role === 'CREATOR'
        ? `/creator/inbox?conversationId=${notif.conversationId}`
        : `/brand/inbox?conversationId=${notif.conversationId}`;

    router.push(targetPath);
  };

  const inboxHref = user?.role === 'CREATOR' ? '/creator/inbox' : '/brand/inbox';

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Trigger Bell Button */}
      <button
        type="button"
        id="notification-bell-btn"
        aria-label={`Message notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) refresh();
        }}
        className="relative inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-[#E7E1DA] text-[#171717] hover:text-[#FF6B00] hover:border-[#FF6B00]/40 transition shadow-2xs cursor-pointer focus:outline-none"
        title="Message Notifications"
      >
        <Bell className="w-4 h-4" />

        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF6B00] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-2xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div
          id="notification-popover"
          className="absolute right-0 mt-2 w-[340px] sm:w-[380px] bg-white rounded-2xl border border-[#E7E1DA] shadow-xl z-50 overflow-hidden flex flex-col max-h-[480px] animate-in fade-in-50 slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="p-3.5 border-b border-[#E7E1DA] flex items-center justify-between bg-[#FAF9F6]">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xs text-[#171717]">Message Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#FFF4EB] text-[#FF6B00] text-[10px] font-bold">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-[#FF6B00] hover:text-[#E56000] flex items-center gap-1 transition"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications Body */}
          <div className="overflow-y-auto flex-1 divide-y divide-[#E7E1DA]/50">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-5 h-5 border-2 border-neutral-300 border-t-[#FF6B00] rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#737373]">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="p-5 text-center space-y-2">
                <AlertCircle className="w-5 h-5 text-rose-500 mx-auto" />
                <p className="text-xs text-rose-600 font-medium">{error}</p>
                <button
                  type="button"
                  onClick={() => refresh()}
                  className="px-3 py-1 rounded-lg bg-[#F8F6F2] text-xs font-semibold text-[#171717] hover:bg-[#E7E1DA] inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#F8F6F2] text-[#737373] flex items-center justify-center mx-auto">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-[#171717]">No messages yet</h4>
                <p className="text-[11px] text-[#737373] max-w-xs mx-auto">
                  When collaborators send you direct messages, proposals, or attachments, they will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = !notif.isRead;

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition relative group ${
                      isUnread ? 'bg-[#FFF9F5] hover:bg-[#FFF4EB]' : 'hover:bg-[#F8F6F2]'
                    }`}
                  >
                    {/* Unread indicator bar */}
                    {isUnread && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-[#FF6B00]" />
                    )}

                    {/* Sender Avatar */}
                    <div className="w-9 h-9 rounded-xl bg-[#171717] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      {notif.sender.avatar}
                    </div>

                    {/* Notification Details */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-bold text-xs text-[#171717] truncate">
                            {notif.sender.name}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.2 rounded bg-neutral-100 text-neutral-600 shrink-0">
                            {notif.sender.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#737373] shrink-0 font-medium">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>

                      {/* Campaign Context */}
                      {notif.campaignTitle && (
                        <div className="flex items-center gap-1 text-[10px] text-[#FF6B00] truncate font-medium">
                          <Briefcase className="w-3 h-3 shrink-0" />
                          <span className="truncate">{notif.campaignTitle}</span>
                        </div>
                      )}

                      {/* Message Preview */}
                      <p className="text-xs text-[#525252] truncate line-clamp-1 leading-snug">
                        {notif.hasAttachment && (
                          <Paperclip className="w-3 h-3 inline mr-1 text-[#737373]" />
                        )}
                        {notif.messagePreview}
                      </p>
                    </div>

                    {/* Small Unread Ping */}
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-[#FF6B00] shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-[#FAF9F6] border-t border-[#E7E1DA] text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push(inboxHref);
              }}
              className="text-xs font-semibold text-[#171717] hover:text-[#FF6B00] transition inline-flex items-center gap-1"
            >
              <span>Go to Full Inbox</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
