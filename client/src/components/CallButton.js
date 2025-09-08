import React, { useState } from 'react';
import CallManager from './CallManager';

const CallButton = ({ currentUser, otherUser }) => {
  const [showCallManager, setShowCallManager] = useState(false);
  const [callType, setCallType] = useState('video'); // video or audio

  const handleVideoCall = () => {
    setCallType('video');
    setShowCallManager(true);
  };

  const handleAudioCall = () => {
    setCallType('audio');
    setShowCallManager(true);
  };

  const closeCallManager = () => {
    setShowCallManager(false);
  };

  return (
    <>
      <div className="call-buttons">
        <button 
          className="btn-video-call-small"
          onClick={handleVideoCall}
          title="Video Call"
        >
          <i className="fas fa-video"></i>
        </button>
        <button 
          className="btn-audio-call-small"
          onClick={handleAudioCall}
          title="Audio Call"
        >
          <i className="fas fa-phone"></i>
        </button>
      </div>

      {showCallManager && (
        <div className="call-modal">
          <div className="call-modal-content">
            <button className="close-modal" onClick={closeCallManager}>
              <i className="fas fa-times"></i>
            </button>
            <CallManager 
              currentUser={currentUser} 
              callReceiver={otherUser}
              callType={callType}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default CallButton;