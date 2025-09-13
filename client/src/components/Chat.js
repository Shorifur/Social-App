// client/src/components/Chat.js
import React, { useState, useEffect, useRef } from 'react';
import { getSocket } from '../utils/socket';
import './Chat.css';

const Chat = ({ currentConversation, currentUser }) => {
  const socket = getSocket();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket listeners
  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      console.log('✅ Connected to chat server');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('⚠️ Disconnected from chat server');
    };

    const handleMessageReceived = (message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleMessagesHistory = (messagesHistory) => {
      setMessages(messagesHistory);
    };

    const handleTypingIndicator = ({ userId, isTyping }) => {
      setTypingUsers(prev =>
        isTyping
          ? [...new Set([...prev, userId])]
          : prev.filter(id => id !== userId)
      );
    };

    // Join conversation room when component mounts
    if (currentConversation) {
      socket.emit('join-conversation', currentConversation._id);
      socket.emit('get-messages', currentConversation._id);
    }

    // Register listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('message-received', handleMessageReceived);
    socket.on('messages-history', handleMessagesHistory);
    socket.on('typing-indicator', handleTypingIndicator);

    return () => {
      if (currentConversation) {
        socket.emit('leave-conversation', currentConversation._id);
      }
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('message-received', handleMessageReceived);
      socket.off('messages-history', handleMessagesHistory);
      socket.off('typing-indicator', handleTypingIndicator);
    };
  }, [currentConversation, socket]);

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim() || !currentConversation) return;

    const messageData = {
      conversationId: currentConversation._id,
      content: newMessage.trim(),
      sender: currentUser._id,
      timestamp: new Date()
    };

    socket.emit('send-message', messageData);

    // Optimistic render
    setMessages(prev => [
      ...prev,
      {
        ...messageData,
        _id: Date.now(),
        sender: { _id: currentUser._id, name: currentUser.name }
      }
    ]);

    setNewMessage('');
    socket.emit('typing', {
      chatId: currentConversation._id,
      userId: currentUser._id,
      isTyping: false
    });
  };

  // Typing handler
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    socket.emit('typing', {
      chatId: currentConversation._id,
      userId: currentUser._id,
      isTyping: e.target.value.length > 0
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!currentConversation) {
    return (
      <div className="chat-container">
        <div className="chat-placeholder">
          <p>Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>{currentConversation.name || 'Chat'}</h3>
        <span
          className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}
        >
          {isConnected ? '🟢 Online' : '🔴 Offline'}
        </span>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message._id || message.timestamp}
            className={`message ${
              message.sender._id === currentUser._id
                ? 'own-message'
                : 'other-message'
            }`}
          >
            <div className="message-content">
              <p>{message.content}</p>
              <span className="message-time">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          {typingUsers.length === 1
            ? 'Someone is typing...'
            : `${typingUsers.length} people are typing...`}
        </div>
      )}

      <div className="chat-input-container">
        <div className="chat-input">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={!isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
