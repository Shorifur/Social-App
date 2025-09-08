// In client/src/api/settings.js
import api from './base';

export const getSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

export const updateSettings = async (settings) => {
  const response = await api.put('/settings', settings);
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put('/settings/profile', profileData);
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.put('/settings/password', passwordData);
  return response.data;
};

export const updateProfilePicture = async (imageUrl) => {
  const response = await api.put('/settings/profile-picture', { profilePicture: imageUrl });
  return response.data;
};

export const updateCoverPhoto = async (imageUrl) => {
  const response = await api.put('/settings/cover-photo', { coverPhoto: imageUrl });
  return response.data;
};

export const deactivateAccount = async () => {
  const response = await api.post('/settings/deactivate');
  return response.data;
};