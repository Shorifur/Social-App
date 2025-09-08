// In client/src/api/users.js
import api from './base';

export const followUser = async (userId) => {
  const response = await api.post(`/social/follow/follow/${userId}`);
  return response.data;
};

export const unfollowUser = async (userId) => {
  const response = await api.post(`/social/follow/unfollow/${userId}`);
  return response.data;
};

export const checkIsFollowing = async (userId) => {
  const response = await api.get(`/social/follow/is-following/${userId}`);
  return response.data;
};

export const getFollowers = async (userId = null) => {
  const url = userId ? `/social/follow/followers/${userId}` : '/social/follow/followers';
  const response = await api.get(url);
  return response.data;
};

export const getFollowing = async (userId = null) => {
  const url = userId ? `/social/follow/following/${userId}` : '/social/follow/following';
  const response = await api.get(url);
  return response.data;
};