import { PulseLoader } from 'react-spinners';

export default function Loading() {
  return (
    <div className="loading-overlay">
      <PulseLoader color="#36d7b7" size={15} />
    </div>
  );
}