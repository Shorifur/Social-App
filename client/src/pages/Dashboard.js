import React, { useContext } from 'react';
import Skeleton from '@mui/material/Skeleton';
import PostList from '../components/PostList';
import { AuthContext } from '../context/AuthContext';

function Dashboard() {
  const { loading = false } = useContext(AuthContext) || {};

  return (
    <div style={{ padding: '2rem' }}>
      {loading ? (
        <Skeleton
          variant="rectangular"
          width={500}
          height={300}
          animation="wave"
          sx={{ borderRadius: 2 }}
        />
      ) : (
        <PostList />
      )}
    </div>
  );
}

export default Dashboard;
