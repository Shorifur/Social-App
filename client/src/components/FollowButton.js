// In client/src/components/FollowButton.js
import React, { useState, useEffect } from 'react';
import { followUser, unfollowUser, checkIsFollowing } from '../api/users';

const FollowButton = ({ userId, username, onFollowChange }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const checkFollowingStatus = async () => {
      try {
        const response = await checkIsFollowing(userId);
        setIsFollowing(response.isFollowing);
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };
    
    if (userId) {
      checkFollowingStatus();
    }
  }, [userId]);
  
  const handleFollow = async () => {
    setIsLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(userId);
        setIsFollowing(false);
        if (onFollowChange) onFollowChange(false);
      } else {
        await followUser(userId);
        setIsFollowing(true);
        if (onFollowChange) onFollowChange(true);
      }
    } catch (error) {
      console.error('Follow action error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!userId) return null;
  
  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className={`follow-btn ${isFollowing ? 'following' : 'not-following'}`}
    >
      {isLoading ? '...' : isFollowing ? 'Following' : `Follow ${username || ''}`}
    </button>
  );
};

export default FollowButton;