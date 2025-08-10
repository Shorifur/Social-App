import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

const AvatarModel = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="hotpink" />
  </mesh>
);

export default function Profile3D() {
  return (
    <div className="profile-3d">
      <Suspense fallback={<div>Loading avatar...</div>}>
        <Canvas>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <AvatarModel />
        </Canvas>
      </Suspense>
    </div>
  );
}
