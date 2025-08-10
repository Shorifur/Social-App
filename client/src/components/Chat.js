import { useState, useEffect } from 'react';
import socket from '../utils/socket';

function Chat({ chatId, userId }) {
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  // Listen for typing events
  useEffect(() => {
    socket.emit('join-chat', chatId);
    socket.on('typing-indicator', ({ userId, isTyping }) => {
      setTypingUsers(prev => 
        isTyping 
          ? [...prev, userId]
          : prev.filter(id => id !== userId)
      );
    });

    return () => {
      socket.off('typing-indicator');
    };
  }, [chatId]);

  const handleTyping = (e) => {
    setIsTyping(e.target.value.length > 0);
    socket.emit('typing', { chatId, userId, isTyping: e.target.value.length > 0 });
  };

  return (
    <div>
      {typingUsers.length > 0 && (
        <div>{typingUsers.length} user(s) typing...</div>
      )}
      <input 
        type="text" 
        onChange={handleTyping}
      />
    </div>
  );
}