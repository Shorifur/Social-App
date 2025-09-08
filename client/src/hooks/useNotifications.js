// client/src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import { getNotifications, markAsRead, markAllAsRead } from '../api/notifications';
import { getSocket } from '../utils/socket';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  /**
   * Load notifications from API
   */
  const loadNotifications = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await getNotifications(page);
      setNotifications(response.notifications || []);
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Setup socket listeners
   */
  useEffect(() => {
    if (!user) return;

    loadNotifications();

    const socket = getSocket();
    if (!socket) return;

    // Incoming new notification
    socket.on('new_notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    // All notifications marked as read
    socket.on('notifications_all_read', () => {
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    });

    // Cleanup
    return () => {
      socket.off('new_notification');
      socket.off('notifications_all_read');
    };
  }, [user, loadNotifications]);

  /**
   * Mark single notification as read
   */
  const markNotificationAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  };

  /**
   * Mark all notifications as read
   */
  const markAllNotificationsAsRead = async () => {
    try {
      await markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

      const socket = getSocket();
      if (socket) {
        socket.emit('mark_all_notifications_read');
      }
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };
};
