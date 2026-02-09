import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { notificationsAPI } from '../services/api';
import { useAuth } from './AuthContext';
import io from 'socket.io-client';

const NotificationsContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fetch notifications on mount and when authenticated
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const response = await notificationsAPI.getNotifications();
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Real-time notifications via socket
  const socketRef = useRef(null);
  useEffect(() => {
    if (!isAuthenticated) return;

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');
    socketRef.current = io(SOCKET_URL, { withCredentials: true });

    socketRef.current.on('connect', () => {
      // console.log('Notifications socket connected', socketRef.current.id);
    });

    socketRef.current.on('new-item', (data) => {
      try {
        const newNotif = {
          _id: `socket-${Date.now()}`,
          type: data.type || 'item_added',
          title: data.title || 'New item',
          message: data.message || data.title,
          data: { itemId: data.itemId, itemType: data.itemType },
          read: false,
          createdAt: data.createdAt || new Date().toISOString(),
        };
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
      } catch (e) {
        console.error('Failed to handle new-item socket event', e);
      }
    });

    socketRef.current.on('new-book', (data) => {
      try {
        const newNotif = {
          _id: `socket-book-${Date.now()}`,
          type: data.type || 'book_listing',
          title: data.title || 'New book listed',
          message: data.message || data.title,
          data: { bookId: data.bookId, price: data.price },
          read: false,
          createdAt: data.createdAt || new Date().toISOString(),
        };
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
      } catch (e) {
        console.error('Failed to handle new-book socket event', e);
      }
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      // Update unread count if deleted notification was unread
      const deletedNotif = notifications.find(n => n._id === notificationId);
      if (deletedNotif && !deletedNotif.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};