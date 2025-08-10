// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api'; // your axios or fetch wrapper

export const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Async initialization on mount to check token and fetch user data
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Optionally set token on your api headers here
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Fetch user data
          const { data } = await api.get('/auth/me'); // your endpoint to get current user
          setUser(data);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  // Login function example
  const login = async (credentials) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', credentials);
      localStorage.setItem('token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(data.user);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function example
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
