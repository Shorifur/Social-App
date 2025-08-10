import React, { useState } from 'react';
import { useStories } from './useStories';
import { Button, CircularProgress, Snackbar } from '@mui/material';
import StoryViewer from '../components/StoryViewer'; // You'll create this

export default function Stories() {
  const [media, setMedia] = useState(null);
  const { createStory, trackView, loading, error } = useStories();

  const handleSubmit = async () => {
    try {
      await createStory({
        userId: JSON.parse(localStorage.getItem('user'))._id,
        mediaUrl: media // In practice, you'll upload this first
      });
      // Refresh stories list or redirect
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Story creation form */}
      <input 
        type="file" 
        onChange={(e) => setMedia(e.target.files[0])}
        accept="image/*,video/*"
      />
      <Button 
        onClick={handleSubmit} 
        disabled={loading}
        startIcon={loading && <CircularProgress size={20} />}
      >
        Post Story
      </Button>

      {/* Story viewer component */}
      <StoryViewer onView={trackView} />

      {/* Error handling */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        message={error}
      />
    </div>
  );
}