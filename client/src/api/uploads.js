import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Upload profile picture
export const uploadProfilePicture = async (file, token) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await axios.post(`${API_URL}/uploads/profile`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
};

// Upload post images
export const uploadPostImages = async (files, token) => {
  const formData = new FormData();
  
  // Append each file to the form data
  files.forEach(file => {
    formData.append('images', file);
  });

  const response = await axios.post(`${API_URL}/uploads/post`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
};

// Delete an uploaded image
export const deleteImage = async (filename, token) => {
  const response = await axios.delete(`${API_URL}/uploads/${filename}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
};