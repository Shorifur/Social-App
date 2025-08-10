import { useEffect, useState } from 'react';
import socket from '../utils/socket';

export default function OnlineUsers({ userId }) {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!userId) return;

    socket.emit('set-online', userId);
    socket.on('online-users', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off('online-users');
    };
  }, [userId]);

  return (
    <div>
      <h3>Online ({onlineUsers.length})</h3>
      <ul>
        {onlineUsers.map(userId => (
          <li key={userId}>{userId}</li>
        ))}
      </ul>
    </div>
  );
}