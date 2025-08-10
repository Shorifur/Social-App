import React, { useEffect, useState } from 'react';
import axios from '../utils/api';

// Story Expiry Badge Component
const StoryExpiry = ({ createdAt }) => {
  const expiry = new Date(createdAt);
  expiry.setHours(expiry.getHours() + 24);

  const [timeLeft, setTimeLeft] = useState(
    Math.floor((expiry - new Date()) / 3600000)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(Math.floor((expiry - new Date()) / 3600000));
    }, 60000);
    return () => clearInterval(timer);
  }, [expiry]);

  return (
    <div className="expiry-badge">
      Expires in: {timeLeft > 0 ? `${timeLeft}h` : '<1h'}
    </div>
  );
};

export default function StoryViewer({ onView }) {
  const [stories, setStories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await axios.get('/stories');
        setStories(res.data);
      } catch (err) {
        console.error('Failed to fetch stories', err);
      }
    };
    fetchStories();
  }, []);

  const handleView = (storyId) => {
    onView(storyId);
    // Progress to next story after 5 seconds
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % stories.length);
    }, 5000);
  };

  if (stories.length === 0) return <div>No stories available</div>;

  return (
    <div className="story-viewer">
      {stories[currentIndex] && (
        <div key={stories[currentIndex]._id} className="story-item">
          <img
            src={stories[currentIndex].mediaUrl}
            alt="Story"
            onLoad={() => handleView(stories[currentIndex]._id)}
          />
          <div className="story-meta">
            <span>Posted by: {stories[currentIndex].userId.username}</span>
            <StoryExpiry createdAt={stories[currentIndex].createdAt} />
          </div>
        </div>
      )}
    </div>
  );
}
