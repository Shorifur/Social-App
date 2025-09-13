import React, { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'peerjs';
import Webcam from 'react-webcam';
import { getSocket } from '../utils/socket';
import '../styles/CallManager.css';

const CallManager = ({ currentUser, callReceiver: initialCallReceiver }) => {
  const [peer, setPeer] = useState(null);
  const [myPeerId, setMyPeerId] = useState('');
  const [call, setCall] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, ringing, in-call, ended
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [callReceiver, setCallReceiver] = useState(initialCallReceiver);
  
  const webcamRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socket = getSocket();

  // Initialize PeerJS
  useEffect(() => {
    const newPeer = new Peer({
      host: process.env.REACT_APP_PEER_HOST || 'localhost',
      port: process.env.REACT_APP_PEER_PORT || 9000,
      path: process.env.REACT_APP_PEER_PATH || '/peerjs',
      secure: process.env.NODE_ENV === 'production'
    });

    newPeer.on('open', id => {
      setMyPeerId(id);
      console.log('My peer ID:', id);
    });

    newPeer.on('call', incomingCall => {
      setCall(incomingCall);
      setCallStatus('ringing');
      setCallReceiver(incomingCall.metadata?.caller || callReceiver);

      // Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Incoming Call', {
          body: `Incoming call from ${incomingCall.metadata?.caller?.name || 'Unknown'}`,
          icon: incomingCall.metadata?.caller?.avatar
        });
      }
    });

    newPeer.on('error', err => {
      console.error('Peer error:', err);
      setCallStatus('error');
    });

    setPeer(newPeer);

    return () => {
      newPeer.destroy();
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Update remote video stream
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('call-request', data => {
      if (data.receiverId === currentUser.id) {
        setCallStatus('ringing');
        setCallReceiver(data.caller);
      }
    });

    socket.on('call-accepted', data => {
      if (data.callerId === currentUser.id) {
        setCallStatus('in-call');
        startCall(data.peerId);
      }
    });

    socket.on('call-rejected', data => {
      if (data.callerId === currentUser.id) {
        setCallStatus('rejected');
        setTimeout(() => setCallStatus('idle'), 3000);
      }
    });

    socket.on('call-ended', data => {
      if (data.receiverId === currentUser.id || data.callerId === currentUser.id) {
        endCall();
      }
    });

    return () => {
      socket.off('call-request');
      socket.off('call-accepted');
      socket.off('call-rejected');
      socket.off('call-ended');
    };
  }, [socket, currentUser]);

  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      setLocalStream(stream);

      if (webcamRef.current) webcamRef.current.srcObject = stream;

      return stream;
    } catch (err) {
      console.error('Media device error:', err);
      setCallStatus('error');
      return null;
    }
  }, [isVideoEnabled, isAudioEnabled]);

  const initiateCall = useCallback(async (isVideoCall = true) => {
    if (!peer || !callReceiver) return;

    setCallStatus('calling');
    const stream = await startLocalStream();
    if (!stream) return;

    setIsVideoEnabled(isVideoCall);

    socket.emit('call-request', {
      caller: currentUser,
      callerId: currentUser.id,
      receiverId: callReceiver.id,
      isVideoCall,
      peerId: myPeerId
    });

    setTimeout(() => {
      if (callStatus === 'calling') {
        socket.emit('call-rejected', {
          callerId: currentUser.id,
          receiverId: callReceiver.id
        });
        setCallStatus('rejected');
        setTimeout(() => setCallStatus('idle'), 3000);
      }
    }, 30000);
  }, [peer, callReceiver, startLocalStream, currentUser, myPeerId, callStatus]);

  const startCall = useCallback(peerId => {
    if (!peer || !localStream) return;

    const outgoingCall = peer.call(peerId, localStream, { metadata: { caller: currentUser } });
    setCall(outgoingCall);

    outgoingCall.on('stream', remote => {
      setRemoteStream(remote);
      setCallStatus('in-call');
    });

    outgoingCall.on('close', endCall);
    outgoingCall.on('error', err => {
      console.error('Call error:', err);
      setCallStatus('error');
    });
  }, [peer, localStream, currentUser]);

  const answerCall = useCallback(async () => {
    if (!call) return;

    const stream = await startLocalStream();
    if (!stream) return;

    call.answer(stream);
    setCallStatus('in-call');

    call.on('stream', remote => setRemoteStream(remote));

    socket.emit('call-accepted', {
      callerId: call.metadata?.caller?.id,
      receiverId: currentUser.id,
      peerId: myPeerId
    });
  }, [call, startLocalStream, socket, currentUser, myPeerId]);

  const rejectCall = useCallback(() => {
    if (!call) return;

    socket.emit('call-rejected', {
      callerId: call.metadata?.caller?.id,
      receiverId: currentUser.id
    });

    setCallStatus('rejected');
    setCall(null);
    setTimeout(() => setCallStatus('idle'), 3000);
  }, [call, socket, currentUser]);

  const endCall = useCallback(() => {
    if (call) call.close();
    if (localStream) localStream.getTracks().forEach(track => track.stop());

    setLocalStream(null);
    setRemoteStream(null);
    setCall(null);
    setCallStatus('ended');

    if (callReceiver) {
      socket.emit('call-ended', {
        callerId: currentUser.id,
        receiverId: callReceiver.id
      });
    }

    setTimeout(() => setCallStatus('idle'), 3000);
  }, [call, localStream, socket, currentUser, callReceiver]);

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => (track.enabled = !track.enabled));
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => (track.enabled = !track.enabled));
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  return (
    <div className="call-manager">
      <div className={`call-status ${callStatus}`}>
        {callStatus === 'calling' && `Calling ${callReceiver?.name}...`}
        {callStatus === 'ringing' && `Incoming call from ${callReceiver?.name}`}
        {callStatus === 'rejected' && 'Call rejected'}
        {callStatus === 'ended' && 'Call ended'}
        {callStatus === 'error' && 'Call error'}
      </div>

      <div className="video-container">
        {isVideoEnabled && callStatus === 'in-call' && (
          <div className="local-video">
            <Webcam audio={false} ref={webcamRef} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        {remoteStream && callStatus === 'in-call' && (
          <div className="remote-video">
            <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
      </div>

      <div className="call-controls">
        {callStatus === 'idle' && (
          <>
            <button className="btn-video-call" onClick={() => initiateCall(true)} disabled={!callReceiver}>
              <i className="fas fa-video"></i> Video Call
            </button>
            <button className="btn-audio-call" onClick={() => initiateCall(false)} disabled={!callReceiver}>
              <i className="fas fa-phone"></i> Audio Call
            </button>
          </>
        )}

        {callStatus === 'calling' && (
          <button className="btn-end-call" onClick={endCall}>
            <i className="fas fa-phone-slash"></i> Cancel Call
          </button>
        )}

        {callStatus === 'ringing' && (
          <>
            <button className="btn-answer-call" onClick={answerCall}>
              <i className="fas fa-phone"></i> Answer
            </button>
            <button className="btn-reject-call" onClick={rejectCall}>
              <i className="fas fa-phone-slash"></i> Reject
            </button>
          </>
        )}

        {callStatus === 'in-call' && (
          <>
            <button className={`btn-toggle ${isVideoEnabled ? 'active' : 'inactive'}`} onClick={toggleVideo}>
              <i className={`fas fa-video${isVideoEnabled ? '' : '-slash'}`}></i>
            </button>
            <button className={`btn-toggle ${isAudioEnabled ? 'active' : 'inactive'}`} onClick={toggleAudio}>
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
