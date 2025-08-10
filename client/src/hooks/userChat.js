import { useState, useEffect } from 'react';
import io from 'socket.io-client';

export const useChat = (userId) => {
  const [messages, setMessages] = useState([]);
  const socket = io('http://localhost:5000');

  useEffect(() => {
    socket.emit('joinUserRoom', userId);

    socket.on('newMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => socket.disconnect();
  }, [userId]);

  const sendMessage = (receiverId, text) => {
    socket.emit('sendMessage', { senderId: userId, receiverId, text });
  };

  return { messages, sendMessage };
};