import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔐 Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ⚠️ Handle global errors (e.g., auto-logout on 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 📝 Get comments (Axios)
export const getComments = async (postId) => {
  const res = await api.get(`/posts/${postId}/comments`);
  return res.data;
};

// 🗨️ Create comment (Axios)
export const createComment = async (postId, text) => {
  const res = await api.post(`/posts/${postId}/comments`, { text });
  return res.data;
};

// 👍 Like a post
export const likePost = async (postId) => {
  const res = await api.post(`/posts/${postId}/like`);
  return res.data;
};

// 🆕 Create a post
export const createPost = async (content) => {
  const res = await api.post('/posts', { content });
  return res.data;
};

// 🗨️ Alternative: Add comment (native fetch)
export const addComment = async (postId, text) => {
  const res = await fetch(`/api/comments/${postId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ text }),
  });
  return await res.json();
};

// 📝 Alternative: Get comments (native fetch)
export const getCommentsFetch = async (postId) => {
  const res = await fetch(`/api/comments/${postId}`);
  return await res.json();
};

export default api;
