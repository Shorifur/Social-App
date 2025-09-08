import React, { useState, useEffect, useRef } from 'react';
import { getSocket } from '../utils/socket';
import { getConversations, getMessages, createConversation } from '../api/chat';
import '../styles/Chat.css';

const ChatInterface = ({ currentUser }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const socket = getSocket();

  useEffect(() => {
    loadConversations();
    
    if (socket) {
      // Listen for new messages
      socket.on('new-message', handleNewMessage);
      
      // Listen for typing indicators
      socket.on('user-typing', handleTyping);
      
      // Listen for message notifications
      socket.on('message-notification', handleMessageNotification);
    }
    
    return () => {
      if (socket) {
        socket.off('new-message');
        socket.off('user-typing');
        socket.off('message-notification');
      }
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await getConversations(token);
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    
    try {
      const token = localStorage.getItem('token');
      const data = await getMessages(conversation._id, 1, token);
      setMessages(data);
      
      // Join conversation room
      if (socket) {
        socket.emit('join-conversation', conversation._id);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleNewMessage = (message) => {
    if (selectedConversation && message.conversationId === selectedConversation._id) {
      setMessages(prev => [...prev, message]);
    }
    // Update conversations list to show latest message
    loadConversations();
  };

  const handleTyping = (data) => {
    if (data.isTyping) {
      setIsTyping(true);
      setTypingUser(data.userId);
    } else {
      setIsTyping(false);
      setTypingUser(null);
    }
  };

  const handleMessageNotification = (notification) => {
    // Show browser notification if app is not focused
    if (!document.hasFocus() && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`New message from ${notification.sender}`, {
        body: notification.message
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageData = {
      conversationId: selectedConversation._id,
      text: newMessage,
      senderId: currentUser.id,
      receiverId: selectedConversation.participants.find(p => p._id !== currentUser.id)._id
    };

    if (socket) {
      socket.emit('send-message', messageData);
    }

    setNewMessage('');
  };

  const handleTypingStart = () => {
    if (socket && selectedConversation) {
      socket.emit('typing-start', {
        conversationId: selectedConversation._id,
        userId: currentUser.id
      });
    }
  };

  const handleTypingStop = () => {
    if (socket && selectedConversation) {
      socket.emit('typing-stop', {
        conversationId: selectedConversation._id,
        userId: currentUser.id
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startNewConversation = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const conversation = await createConversation(userId, token);
      setConversations(prev => [conversation, ...prev]);
      selectConversation(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  return (
    <div className="chat-interface">
      <div className="conversations-list">
        <h3>Conversations</h3>
        {conversations.map(conversation => (
          <div
            key={conversation._id}
            className={`conversation-item ${selectedConversation?._id === conversation._id ? 'active' : ''}`}
            onClick={() => selectConversation(conversation)}
          >
            <img
              src={conversation.participants.find(p => p._id !== currentUser.id)?.avatar || '/default-avatar.jpg'}
              alt="Avatar"
              className="conversation-avatar"
            />
            <div className="conversation-info">
              <h4>{conversation.participants.find(p => p._id !== currentUser.id)?.name}</h4>
              <p className="last-message">
                {conversation.lastMessage?.text || 'No messages yet'}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-messages">
        {selectedConversation ? (
          <>
            <div className="messages-header">
              <h3>
                {selectedConversation.participants.find(p => p._id !== currentUser.id)?.name}
              </h3>
            </div>

            <div className="messages-container">
              {messages.map(message => (
                <div
                  key={message._id}
                  className={`message ${message.sender._id === currentUser.id ? 'sent' : 'received'}`}
                >
                  <img
                    src={message.sender.avatar || '/default-avatar.jpg'}
                    alt="Avatar"
                    className="message-avatar"
                  />
                  <div className="message-content">
                    <p>{message.text}</p>
                    <span className="message-time">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleTypingStart}
                onKeyUp={(e) => {
                  if (e.key === 'Enter') {
                    sendMessage();
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
          <div className="no-conversation">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;