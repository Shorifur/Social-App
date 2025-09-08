// client/src/api/auth.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Register user
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    console.error('Register Error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Login user
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
  } catch (error) {
    console.error('Login Error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Get current user
export const getCurrentUser = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Get Current User Error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Export as both named and default
export const authAPI = {
  register,
  login,
  getCurrentUser,
};

export default authAPI;
