// client/src/App.js
import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Global styles
import './styles/global.css';
import 'react-lazy-load-image-component/src/effects/blur.css';

import { lightTheme, darkTheme } from './theme/theme';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy loaded pages
const Feed = React.lazy(() => import('./pages/Feed'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Detect system preference
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, []);

  // Load saved mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) setDarkMode(savedMode === 'true');
  }, []);

  // Save mode to localStorage
  const handleThemeChange = (newMode) => {
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Router>
        <Navbar darkMode={darkMode} setDarkMode={handleThemeChange} />

        {/* Suspense fallback for lazy-loaded pages */}
        <Suspense
          fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}
        >
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Feed />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:userId"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>

        {/* Global toast notifications */}
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme={darkMode ? 'dark' : 'light'}
        />
      </Router>
    </ThemeProvider>
  );
}

export default App;
