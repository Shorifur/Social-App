import React from 'react';
import { useMediaQuery } from 'react-responsive';
import dynamic from 'next/dynamic';

// Lazy-load 3D avatar (no SSR)
const Avatar3D = dynamic(() => import('./Avatar3D'), {
  ssr: false,
  loading: () => (
    <div className="w-[120px] h-[120px] rounded-full bg-gray-200 animate-pulse" />
  ),
});

// Dummy user object (replace with real user data via props or context)
const user = {
  name: 'Username',
  bio: 'User bio or description here',
  avatar2D: '/default-avatar.png', // Replace with actual image path
};

export default function ProfileHeader() {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  return (
    <div className="profile-header flex items-center gap-4">
      {isMobile ? (
        <img
          src={user.avatar2D}
          alt="User Avatar"
          className="w-[120px] h-[120px] rounded-full object-cover"
        />
      ) : (
        <div className="w-[150px] h-[150px]">
          <Avatar3D />
        </div>
      )}
      <div>
        <h2 className="text-xl font-bold">{user.name}</h2>
        <p className="text-sm text-gray-500">{user.bio}</p>
      </div>
    </div>
  );
}
