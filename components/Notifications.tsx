import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Notification } from '../types';
import { firestoreService } from '../services/firestoreService';
import Spinner from './Spinner';

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = firestoreService.getNotifications(user.id, (fetchedNotifications) => {
      setNotifications(fetchedNotifications);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllAsRead = async () => {
    if (!user || unreadCount === 0) return;
    await firestoreService.markAllNotificationsAsRead(user.id);
  };

  const timeSince = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300 hover:text-teal-400 relative">
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-navy-700 rounded-lg shadow-lg z-10 border border-navy-600">
          <div className="p-3 flex justify-between items-center border-b border-navy-600">
            <div className="font-bold text-slate-200">Notifications</div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className="text-xs text-teal-400 hover:underline">Mark all as read</button>
            )}
          </div>
          <div className="py-1 max-h-96 overflow-y-auto">
            {loading && <div className="flex justify-center p-4"><Spinner size="sm"/></div>}
            {!loading && notifications.length === 0 && (
              <div className="text-center py-4 text-sm text-slate-400">No notifications yet.</div>
            )}
            {!loading && notifications.map(n => (
              <div key={n.id} className={`px-4 py-3 border-l-4 ${n.isRead ? 'border-transparent' : 'border-teal-500 bg-navy-900/40'}`}>
                <p className="text-sm text-slate-300">{n.message}</p>
                <p className="text-xs text-slate-500 mt-1">{timeSince(n.createdAt instanceof Date ? n.createdAt : n.createdAt.toDate())}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
