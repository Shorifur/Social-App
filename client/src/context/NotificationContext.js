// context/NotificationContext.js
import React, { createContext, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const notify = (message, type = 'info') => {
    toast[type](message);
    setUnreadCount(prev => prev + 1);
  };

  return (
    <NotificationContext.Provider value={{ notify, unreadCount }}>
      {children}
      <ToastContainer position="bottom-right" />
    </NotificationContext.Provider>
  );
}