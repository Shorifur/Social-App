import { useAR } from 'react-ar-filters';

function CameraView() {
  const { frameRef } = useAR({ 
    filters: ['dog-ears', 'rainbow-vomit'] 
  });

  return <video ref={frameRef} autoPlay />;
}