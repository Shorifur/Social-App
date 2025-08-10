import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user = null, loading = false } = useContext(AuthContext) || {};

  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
