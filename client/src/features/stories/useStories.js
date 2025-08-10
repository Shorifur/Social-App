import { useState } from 'react';
import axios from '../../utils/api';

export default function useStories() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createStory = async (storyData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/stories', storyData, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create story');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const trackView = async (storyId) => {
    const userId = JSON.parse(localStorage.getItem('user'))._id;
    await axios.put(`/stories/${storyId}/view`, { userId }, {
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    });
  };

  return { createStory, trackView, loading, error };
}