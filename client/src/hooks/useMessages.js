// In client/src/hooks/useMessages.js
import { useState, useEffect, useCallback } from 'react';
import { 
  getConversations, 
  getMessages, 
  sendMessage as apiSendMessage 
} from '../api/messages';
import SocketService from '../utils/socket';
import { useAuth } from './useAuth';

export const useMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadConversations();
      setupSocketListeners();
    }

    return () => {
      // Cleanup socket listeners
      const socket = SocketService.getSocket();
      if (socket) {
        socket.off('new_message');
        socket.off('conversation_updated');
        socket.off('user_typing');
        socket.off('user_stop_typing');
      }
    };
  }, [user]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await getConversations();
      setConversations(response.conversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId, page = 1) => {
    try {
      setLoading(true);
      const response = await getMessages(conversationId, page);
      
      if (page === 1) {
        setMessages(response.messages);
      } else {
        setMessages(prev => [...response.messages, ...prev]);
      }
      
      return response.hasMore;
    } catch (error) {
      console.error('Error loading messages:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    const socket = SocketService.getSocket();
    if (socket) {
      // Listen for new messages
      socket.on('new_message', (message) => {
        setMessages(prev => [...prev, message]);
        
        // Update conversation list
        setConversations(prev => {
          const updated = prev.map(conv => 
            conv._id === message.conversationId 
              ? { ...conv, lastMessage: message, lastMessageAt: new Date() }
              : conv
          );
          return updated.sort((a, b) => 
            new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt)
          );
        });
      });

      // Listen for conversation updates
      socket.on('conversation_updated', (conversation) => {
        setConversations(prev => {
          const filtered = prev.filter(conv => conv._id !== conversation._id);
          return [conversation, ...filtered].sort((a, b) => 
            new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt)
          );
        });
      });

      // Listen for typing indicators
      socket.on('user_typing', (data) => {
        if (data.userId !== user.id) {
          setTypingUsers(prev => {
            if (!prev.includes(data.userId)) {
              return [...prev, data.userId];
            }
            return prev;
          });
        }
      });

      socket.on('user_stop_typing', (data) => {
        setTypingUsers(prev => prev.filter(id => id !== data.userId));
      });
    }
  };

  const sendMessage = async (content, messageType = 'text', mediaUrl = null) => {
    if (!currentConversation) return;

    try {
      const socket = SocketService.getSocket();
      if (socket) {
        socket.emit('send_message', {
          conversationId: currentConversation._id,
          content,
          messageType,
          mediaUrl
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback to API
      await apiSendMessage(currentConversation._id, content, messageType, mediaUrl);
    }
  };

  const startTyping = () => {
    if (!currentConversation) return;
    
    const socket = SocketService.getSocket();
    if (socket) {
      socket.emit('typing_start', { conversationId: currentConversation._id });
    }
  };

  const stopTyping = () => {
    if (!currentConversation) return;
    
    const socket = SocketService.getSocket();
    if (socket) {
      socket.emit('typing_stop', { conversationId: currentConversation._id });
    }
  };

  const joinConversation = (conversationId) => {
    const socket = SocketService.getSocket();
    if (socket) {
      socket.emit('join_conversation', { conversationId });
    }
  };

  const leaveConversation = (conversationId) => {
    const socket = SocketService.getSocket();
    if (socket) {
      socket.emit('leave_conversation', { conversationId });
    }
  };

  return {
    conversations,
    currentConversation,
    setCurrentConversation,
    messages,
    loading,
    typingUsers,
    loadConversations,
    loadMessages,
    sendMessage,
    startTyping,
    stopTyping,
    joinConversation,
    leaveConversation
  };
};