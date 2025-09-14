import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import socket from '../utils/socket'; // your socket utility

// Context
const AuthContext = createContext({
  currentUser: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

// Hook for consuming Auth
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===============================
  // Initialize on app mount
  // ===============================
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch current user
        const { data } = await api.get('/api/auth/me');
        setCurrentUser(data.user);

        // Connect socket after auth success
        const connectedSocket = socket.connectSocket(token);
        if (connectedSocket) {
          console.log('🔌 Socket connected after auth init');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ===============================
  // Login
  // ===============================
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });

      const { token, refreshToken, user } = data;

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      setCurrentUser(user);

      // Connect socket after login
      const connectedSocket = socket.connectSocket(token);
      if (connectedSocket) {
        console.log('🔌 Socket connected after login');
      }

      return { success: true };
    } catch (err) {
      console.error('Login failed:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed',
      };
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // Logout
  // ===============================
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setCurrentUser(null);

    // Disconnect socket
    socket.disconnectSocket();
    console.log('🛑 Socket disconnected after logout');
  };

  // ===============================
  // Context value
  // ===============================
  const value = {
    currentUser,
    loading,
    login,
    logout,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
