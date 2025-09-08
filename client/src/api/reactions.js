// client/src/api/reactions.js
import axiosInstance from './base'; // Use the base Axios instance

// Add reaction to a post
export const reactToPost = async (postId, reactionType) => {
  try {
    const response = await axiosInstance.post(`/api/posts/${postId}/reactions`, {
      type: reactionType
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Remove reaction from a post
export const removeReaction = async (postId) => {
  try {
    const response = await axiosInstance.delete(`/api/posts/${postId}/reactions`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get reactions for a post
export const getPostReactions = async (postId) => {
  try {
    const response = await axiosInstance.get(`/api/posts/${postId}/reactions`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all reactions of a specific user
export const getUserReactions = async (userId) => {
  try {
    const response = await axiosInstance.get(`/api/users/${userId}/reactions`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get the current user's reaction to a specific post
export const getUserReaction = async (postId) => {
  try {
    const response = await axiosInstance.get(`/api/posts/${postId}/reactions/me`);
    return response.data;
  } catch (error) {
    // If the user hasn't reacted, return null instead of throwing error
    if (error.response?.status === 404) {
      return null;
    }
    throw error.response?.data || error;
  }
};

// Export as a single object for convenience
const reactionsApi = {
  reactToPost,
  removeReaction,
  getPostReactions,
  getUserReactions,
  getUserReaction
};

export default reactionsApi;
