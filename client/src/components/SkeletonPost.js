import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Box } from '@mui/material';

export default function SkeletonPost() {
  return (
    <Box
      sx={{
        borderRadius: '20px',
        p: 2,
        mb: 3,
        backgroundColor: '#fff',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      }}
    >
      {/* Header Skeleton */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ ml: 2, flex: 1 }}>
          <Skeleton variant="text" width="40%" height={20} />
          <Skeleton variant="text" width="30%" height={15} />
        </Box>
      </Box>

      {/* Image Skeleton */}
      <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '10px' }} />

      {/* Content Skeleton */}
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="text" width="90%" height={20} />
        <Skeleton variant="text" width="80%" height={20} />
        <Skeleton variant="text" width="60%" height={20} />
      </Box>

      {/* Actions Skeleton */}
      <Box sx={{ display: 'flex', mt: 2, gap: 2 }}>
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="text" width={50} height={20} />
      </Box>
    </Box>
  );
}
