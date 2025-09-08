import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import Webcam from 'react-webcam';
import { getSocket } from '../utils/socket';
import '../styles/CallManager.css';

const CallManager = ({ currentUser, callReceiver }) => {
  const [peer, setPeer] = useState(null);
  const [myPeerId, setMyPeerId] = useState('');
  const [call, setCall] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, ringing, in-call, ended
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const webcamRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socket = getSocket();

  useEffect(() => {
    initializePeer();
    setupSocketListeners();

    return () => {
      if (peer) {
        peer.destroy();
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const initializePeer = () => {
    const newPeer = new Peer({
      host: process.env.REACT_APP_PEER_HOST || 'localhost',
      port: process.env.REACT_APP_PEER_PORT || 9000,
      path: '/peerjs'
    });

    newPeer.on('open', (id) => {
      setMyPeerId(id);
      console.log('My peer ID is: ' + id);
    });

    newPeer.on('call', (incomingCall) => {
      setCall(incomingCall);
      setCallStatus('ringing');
      
      // Show incoming call notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Incoming Call', {
          body: `Incoming call from ${callReceiver?.name}`,
          icon: callReceiver?.avatar
        });
      }
    });

    newPeer.on('error', (err) => {
      console.error('Peer error:', err);
      setCallStatus('error');
    });

    setPeer(newPeer);
  };

  const setupSocketListeners = () => {
    if (!socket) return;

    socket.on('call-request', (data) => {
      if (data.receiverId === currentUser.id) {
        setCallStatus('ringing');
        setCallReceiver(data.caller);
      }
    });

    socket.on('call-accepted', (data) => {
      if (data.callerId === currentUser.id) {
        setCallStatus('in-call');
        startCall(data.peerId);
      }
    });

    socket.on('call-rejected', (data) => {
      if (data.callerId === currentUser.id) {
        setCallStatus('rejected');
        setTimeout(() => setCallStatus('idle'), 3000);
      }
    });

    socket.on('call-ended', (data) => {
      if (data.receiverId === currentUser.id || data.callerId === currentUser.id) {
        endCall();
      }
    });
  };

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      setLocalStream(stream);
      
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setCallStatus('error');
      return null;
    }
  };

  const initiateCall = async (isVideoCall = true) => {
    if (!peer || !callReceiver) return;

    setCallStatus('calling');
    const stream = await startLocalStream();
    if (!stream) return;

    setIsVideoEnabled(isVideoCall);

    // Notify the receiver about the call
    socket.emit('call-request', {
      caller: currentUser,
      callerId: currentUser.id,
      receiverId: callReceiver.id,
      isVideoCall: isVideoCall,
      peerId: myPeerId
    });

    // Set timeout for call rejection
    setTimeout(() => {
      if (callStatus === 'calling') {
        socket.emit('call-rejected', {
          callerId: currentUser.id,
          receiverId: callReceiver.id
        });
        setCallStatus('rejected');
        setTimeout(() => setCallStatus('idle'), 3000);
      }
    }, 30000); // 30 second timeout
  };

  const startCall = (peerId) => {
    if (!peer || !localStream) return;

    const call = peer.call(peerId, localStream);
    setCall(call);

    call.on('stream', (remoteStream) => {
      setRemoteStream(remoteStream);
      setCallStatus('in-call');
    });

    call.on('close', () => {
      endCall();
    });

    call.on('error', (err) => {
      console.error('Call error:', err);
      setCallStatus('error');
    });
  };

  const answerCall = async () => {
    if (!call || !peer) return;

    const stream = await startLocalStream();
    if (!stream) return;

    call.answer(stream);
    setCallStatus('in-call');

    call.on('stream', (remoteStream) => {
      setRemoteStream(remoteStream);
    });

    // Notify the caller that the call was accepted
    socket.emit('call-accepted', {
      callerId: call.metadata.callerId,
      receiverId: currentUser.id,
      peerId: myPeerId
    });
  };

  const rejectCall = () => {
    if (!call) return;

    // Notify the caller that the call was rejected
    socket.emit('call-rejected', {
      callerId: call.metadata.callerId,
      receiverId: currentUser.id
    });

    setCallStatus('rejected');
    setCall(null);
    setTimeout(() => setCallStatus('idle'), 3000);
  };

  const endCall = () => {
    if (call) {
      call.close();
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    setRemoteStream(null);
    setCall(null);
    setCallStatus('ended');
    
    // Notify the other party that the call ended
    if (callReceiver) {
      socket.emit('call-ended', {
        callerId: currentUser.id,
        receiverId: callReceiver.id
      });
    }
    
    setTimeout(() => setCallStatus('idle'), 3000);
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  return (
    <div className="call-manager">
      {/* Call Status Display */}
      <div className={`call-status ${callStatus}`}>
        {callStatus === 'calling' && `Calling ${callReceiver?.name}...`}
        {callStatus === 'ringing' && `Incoming call from ${callReceiver?.name}`}
        {callStatus === 'rejected' && 'Call rejected'}
        {callStatus === 'ended' && 'Call ended'}
        {callStatus === 'error' && 'Call error'}
      </div>

      {/* Video Elements */}
      <div className="video-container">
        {isVideoEnabled && callStatus === 'in-call' && (
          <div className="local-video">
            <Webcam
              audio={false}
              ref={webcamRef}
              muted={true}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}
        
        {remoteStream && callStatus === 'in-call' && (
          <div className="remote-video">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="call-controls">
        {callStatus === 'idle' && (
          <>
            <button 
              className="btn-video-call"
              onClick={() => initiateCall(true)}
              disabled={!callReceiver}
            >
              <i className="fas fa-video"></i>
              Video Call
            </button>
            <button 
              className="btn-audio-call"
              onClick={() => initiateCall(false)}
              disabled={!callReceiver}
            >
              <i className="fas fa-phone"></i>
              Audio Call
            </button>
          </>
        )}

        {callStatus === 'calling' && (
          <button className="btn-end-call" onClick={endCall}>
            <i className="fas fa-phone-slash"></i>
            Cancel Call
          </button>
        )}

        {callStatus === 'ringing' && (
          <>
            <button className="btn-answer-call" onClick={answerCall}>
              <i className="fas fa-phone"></i>
              Answer
            </button>
            <button className="btn-reject-call" onClick={rejectCall}>
              <i className="fas fa-phone-slash"></i>
              Reject
            </button>
          </>
        )}

        {callStatus === 'in-call' && (
          <>
            <button 
              className={`btn-toggle ${isVideoEnabled ? 'active' : 'inactive'}`}
              onClick={toggleVideo}
            >
              <i className={`fas fa-video${isVideoEnabled ? '' : '-slash'}`}></i>
            </button>
            <button 
              className={`btn-toggle ${isAudioEnabled ? 'active' : 'inactive'}`}
              onClick={toggleAudio}
            >
              <i className={`fas fa-microphone${isAudioEnabled ? '' : '-slash'}`}></i>
            </button>
            <button className="btn-end-call" onClick={endCall}>
              <i className="fas fa-phone-slash"></i>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CallManager;