
import FollowButton from './FollowButton';

const UserProfile = ({ user }) => {
  return (
    <div className="user-profile">
      <div className="profile-header">
        <img src={user.profilePicture || '/default-avatar.jpg'} alt={user.username} />
        <div className="profile-info">
          <h2>{user.username}</h2>
          <p>{user.bio || 'No bio yet'}</p>
          <div className="stats">
            <span>{user.followerCount || 0} followers</span>
            <span>{user.followingCount || 0} following</span>
            <span>{user.postCount || 0} posts</span>
          </div>
        </div>
        <FollowButton 
          userId={user._id} 
          username={user.username}
          onFollowChange={(isFollowing) => {
            // Update local state if needed
          }}
        />
      </div>
      {/* Rest of profile component */}
    </div>
  );
};