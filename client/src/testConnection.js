// src/utils/testConnection.js
export const testBackendConnection = async () => {
  const endpoints = [
    '/api/health',
    '/api/auth/test',
    '/api/posts',
    '/api/conversations'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log(`${endpoint}: ${response.status}`);
    } catch (error) {
      console.error(`${endpoint}: ERROR - ${error.message}`);
    }
  }
};