import axios from './api';

export const uploadMedia = async (file) => {
  const formData = new FormData();
  formData.append('media', file);
  
  try {
    const response = await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-auth-token': localStorage.getItem('token')
      }
    });
    return response.data.url;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

export const validateFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'video/mp4'];
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Only JPEG, PNG, and MP4 files are allowed');
  }

  if (file.size > maxSize) {
    throw new Error('File size must be less than 50MB');
  }
};