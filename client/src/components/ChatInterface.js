// client/src/components/ChatInterface.js
import React, { useState, useEffect, useRef } from 'react';
import { getSocket } from '../utils/socket';
import { getConversations, getMessages, createConversation } from '../api/chat';
import Chat from './Chat';
import './ChatInterface.css';

const ChatInterface = ({ currentUser }) => {
  const socket = getSocket();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await getConversations(token);
        setConversations(data);
      } catch (error) {
        console.error('❌ Error loading conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();

    if (socket) {
      // Message events
      socket.on('new-message', handleNewMessage);
      socket.on('user-typing', handleTyping);

      // Presence events
      socket.on('user-online', handleUserOnline);
      socket.on('user-offline', handleUserOffline);
      socket.on('online-users', handleOnlineUsers);

      // Join presence room
      socket.emit('join-presence', currentUser._id);
    }

    return () => {
      if (socket) {
        socket.off('new-message', handleNewMessage);
        socket.off('user-typing', handleTyping);
        socket.off('user-online', handleUserOnline);
        socket.off('user-offline', handleUserOffline);
        socket.off('online-users', handleOnlineUsers);

        socket.emit('leave-presence', currentUser._id);
      }
    };
  }, [socket, currentUser._id]);

  // Handlers
  const handleNewMessage = (message) => {
    if (selectedConversation && message.conversationId === selectedConversation._id) {
      setMessages(prev => [...prev, message]);
    }
    // Refresh conversations for latest preview
    loadConversations();
  };

  const handleTyping = ({ userId, isTyping }) => {
    setTypingUsers(prev =>
      isTyping
        ? [...new Set([...prev, userId])]
        : prev.filter(id => id !== userId)
    );
  };

  const handleUserOnline = (userId) => {
    setOnlineUsers(prev => [...new Set([...prev, userId])]);
  };

  const handleUserOffline = (userId) => {
    setOnlineUsers(prev => prev.filter(id => id !== userId));
  };

  const handleOnlineUsers = (users) => {
    setOnlineUsers(users);
  };

  const loadMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const data = await getMessages(conversationId, 1, token);
      setMessages(data);
    } catch (error) {
      console.error('❌ Error loading messages:', error);
    }
  };

  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation._id);

    if (socket) {
      socket.emit('join-conversation', conversation._id);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageData = {
      conversationId: selectedConversation._id,
      text: newMessage,
      senderId: currentUser._id,
      receiverId: selectedConversation.participants.find(p => p._id !== currentUser._id)._id
    };

    if (socket) {
      socket.emit('send-message', messageData);
    }

    setNewMessage('');
  };

  const handleTypingStart = () => {
    if (socket && selectedConversation) {
      socket.emit('typing', {
        chatId: selectedConversation._id,
        userId: currentUser._id,
        isTyping: true
      });
    }
  };

  const handleTypingStop = () => {
    if (socket && selectedConversation) {
      socket.emit('typing', {
        chatId: selectedConversation._id,
        userId: currentUser._id,
        isTyping: false
      });
    }
  };

  const startNewConversation = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const conversation = await createConversation(userId, token);
      setConversations(prev => [conversation, ...prev]);
      selectConversation(conversation);
    } catch (error) {
      console.error('❌ Error creating conversation:', error);
    }
  };

  if (isLoading) {
    return <div className="chat-interface-loading">Loading conversations...</div>;
  }

  return (
    <div className="chat-interface">
      <div className="conversations-sidebar">
        <div className="sidebar-header">
          <h3>Conversations</h3>
          <span className="online-count">{onlineUsers.length} online</span>
        </div>

        <div className="conversations-list">
          {conversations.map(conversation => (
            <div
              key={conversation._id}
              className={`conversation-item ${selectedConversation?._id === conversation._id ? 'active' : ''}`}
              onClick={() => selectConversation(conversation)}
            >
              <div className="conversation-info">
                <h4>
                  {conversation.participants.find(p => p._id !== currentUser._id)?.name || 'Unknown'}
                </h4>
                <p>{conversation.lastMessage?.text || 'No messages yet'}</p>
              </div>
              <div className="conversation-status">
                {onlineUsers.includes(conversation.participants.find(p => p._id !== currentUser._id)?._id) && (
                  <span className="online-dot">🟢</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main">
        {selectedConversation ? (
          <>
            <Chat
              currentConversation={selectedConversation}
              currentUser={currentUser}
            />

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="typing-indicator">
                {typingUsers.length === 1
                  ? 'Someone is typing...'
                  : `${typingUsers.length} people are typing...`}
              </div>
            )}

            <div className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleTypingStart}
                onKeyUp={(e) => {
                  if (e.key === 'Enter') {
                    sendMessage();
                    handleTypingStop();
                  } else {
                    handleTypingStop();
                  }
                }}
                placeholder="Type a message..."
              />
              <button onClick={sendMessage} disabled={!newMessage.trim()}>
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="no-conversation-selected">
            <p>Select a conversation or start a new one</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
