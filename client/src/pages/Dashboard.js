// client/src/pages/Dashboard.js
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import CreatePost from '../components/CreatePost';
import PostFeed from '../components/PostFeed';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [refreshPosts, setRefreshPosts] = useState(0);

  const handlePostCreated = () => {
    setRefreshPosts(prev => prev + 1);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        {/* Left Sidebar */}
        <aside className="sidebar">
          <div className="user-card">
            <img 
              src={user?.profilePicture || '/default-avatar.jpg'} 
              alt={user?.firstName || 'User'} 
              className="user-avatar-large"
            />
            <h3>{user?.firstName} {user?.lastName}</h3>
            <p>@{user?.username}</p>
          </div>
        </aside>

        {/* Main Feed */}
        <main className="main-feed">
          <CreatePost onPostCreated={handlePostCreated} />
          {/* PostFeed will re-render when refreshPosts changes */}
          <PostFeed key={refreshPosts} />
        </main>

        {/* Right Sidebar */}
        <aside className="sidebar">
          <div className="trending-section">
            <h3>Trending Topics</h3>
            {/* Add trending topics here */}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
