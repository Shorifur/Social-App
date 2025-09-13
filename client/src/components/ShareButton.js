// src/components/ShareButton.js
import React, { useState } from 'react';

const ShareButton = ({ postId, shareCount = 0 }) => {
  const [isShared, setIsShared] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsShared(true);
      // Here you would update the share count via API
    } catch (error) {
      console.error('Error sharing post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      className={`share-btn ${isShared ? 'shared' : ''}`}
      onClick={handleShare}
      disabled={isLoading}
    >
      {isLoading ? 'Sharing...' : `🔗 Share (${shareCount})`}
    </button>
  );
};

export default ShareButton;