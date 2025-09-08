// client/src/utils/socket.js
import { io } from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Global socket instance (not auto-connected)
let socket = io(API_URL, {
  autoConnect: false,
  transports: ['websocket'], // force websocket for stability
});

// Connect with token
export const connectSocket = (token) => {
  if (!token) return null;

  // Disconnect first if already connected
  if (socket && socket.connected) {
    disconnectSocket();
  }

  socket.auth = { token };
  socket.connect();

  // Core events
  socket.on('connect', () => {
    console.log('✅ Connected to socket server:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('⚠️ Disconnected from server:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error.message);
  });

  return socket;
};

// Disconnect socket safely
export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
    console.log('🛑 Socket disconnected');
  }
};

// Get socket anywhere
export const getSocket = () => socket;

export default socket;
