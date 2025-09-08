// In client/src/api/messages.js
import api from './base';

export const getConversations = async () => {
  const response = await api.get('/messages/conversations');
  return response.data;
};

export const getOrCreateConversation = async (userId) => {
  const response = await api.get(`/messages/conversation/${userId}`);
  return response.data;
};

export const getMessages = async (conversationId, page = 1, limit = 50) => {
  const response = await api.get(`/messages/${conversationId}/messages?page=${page}&limit=${limit}`);
  return response.data;
};

export const sendMessage = async (conversationId, content, messageType = 'text', mediaUrl = null) => {
  const response = await api.post(`/messages/${conversationId}/send`, {
    content,
    messageType,
    mediaUrl
  });
  return response.data;
};

export const deleteMessage = async (messageId) => {
  const response = await api.delete(`/messages/message/${messageId}`);
  return response.data;
};