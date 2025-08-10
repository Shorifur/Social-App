import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  autoConnect: false // Connect manually after auth
});

export const connectSocket = (token) => {
  socket.auth = { token };
  socket.connect();
};

export default socket;