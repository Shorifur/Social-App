// client/src/utils/socket.js
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// Global socket instance (lazy initialized, not auto-connected)
let socket = null;

/**
 * Connects the socket with JWT authentication.
 * Reuses the existing socket if already connected.
 */
export const connectSocket = (token) => {
  if (!token) {
    console.error('❌ No authentication token found');
    return null;
  }

  // If already connected, disconnect first
  if (socket && socket.connected) {
    disconnectSocket();
  }

  // Create socket instance
  socket = io(SOCKET_URL, {
    auth: { token },
    autoConnect: false,
    transports: ['websocket'], // prefer websocket for stability
  });

  // Connect now
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

/**
 * Safely disconnects the socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    console.log('🛑 Socket disconnected');
    socket = null;
  }
};

/**
 * Returns the current socket instance (may be null)
 */
export const getSocket = () => socket;

export default {
  connectSocket,
  disconnectSocket,
  getSocket,
};
