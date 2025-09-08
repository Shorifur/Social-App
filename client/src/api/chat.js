import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get all conversations
export const getConversations = async (token) => {
  const response = await axios.get(`${API_URL}/chat/conversations`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

// Get messages for a conversation
export const getMessages = async (conversationId, page = 1, token) => {
  const response = await axios.get(
    `${API_URL}/chat/conversations/${conversationId}/messages?page=${page}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

// Start a new conversation
export const createConversation = async (participantId, token) => {
  const response = await axios.post(
    `${API_URL}/chat/conversations`,
    { participantId },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

// Delete a conversation
export const deleteConversation = async (conversationId, token) => {
  const response = await axios.delete(
    `${API_URL}/chat/conversations/${conversationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};