import { useState, useEffect, useRef } from 'react';
import axios from '../api/api';
import io from 'socket.io-client';

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // Initialize socket connection once
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:5000');
    }

    const socket = socketRef.current;

    // Join user-specific room for notifications
    socket.emit('joinUserRoom', userId);

    // Fetch existing notifications
    const fetchNotifications = async () => {
      try {
        const { data } = await axios.get('/notifications');
        setNotifications(data);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    fetchNotifications();

    // Listen for incoming notifications
    socket.on('notification', (message) => {
      setNotifications((prev) => [{ message, isNew: true }, ...prev]);
    });

    // Cleanup on unmount
    return () => {
      socket.off('notification');
      // Optionally disconnect socket if no other components use it
      // socket.disconnect();
    };
  }, [userId]);

  return notifications;
};
