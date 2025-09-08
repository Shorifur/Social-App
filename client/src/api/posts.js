// client/src/api/posts.js
import api from './base';


// ===============================
// Feed & User Posts
// ===============================
export const getFeedPosts = async (page = 1, limit = 10) => {
  const response = await api.get(`/social/posts/feed?page=${page}&limit=${limit}`);
  return response.data;
};

export const getUserPosts = async (userId, page = 1, limit = 10) => {
  const response = await api.get(`/social/posts/user/${userId}?page=${page}&limit=${limit}`);
  return response.data;
};

// ===============================
// Create Post
// ===============================
export const createPost = async (postData) => {
  const response = await api.post('/social/posts', postData);
  return response.data;
};

// ===============================
// Likes
// ===============================
export const likePost = async (postId) => {
  const response = await api.post(`/social/posts/${postId}/like`);
  return response.data;
};

export const unlikePost = async (postId) => {
  const response = await api.post(`/social/posts/${postId}/unlike`);
  return response.data;
};

// (Optional) Toggle like in one endpoint (if backend supports it)
// export const toggleLike = async (postId) => {
//   const response = await api.post(`/posts/${postId}/like`);
//   return response.data;
// };

// ===============================
// Comments
// ===============================
export const addComment = async (postId, content) => {
  const response = await api.post(`/social/posts/${postId}/comments`, { content });
  return response.data;
};

// ===============================
// Delete Post
// ===============================
export const deletePost = async (postId) => {
  const response = await api.delete(`/social/posts/${postId}`);
  return response.data;
};
