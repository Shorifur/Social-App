import axios from './api';

export const createPost = (postData) => axios.post('/posts', postData);
export const getPosts = () => axios.get('/posts');
export const likePost = (postId) => axios.post(`/posts/${postId}/like`);