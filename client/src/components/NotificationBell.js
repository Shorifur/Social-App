import React, { useState, useEffect } from 'react';
import { getSocket } from '../utils/socket';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    
    if (socket) {
      // Listen for new likes
      socket.on('new-like', (data) => {
        setNotifications(prev => [{
          id: Date.now(),
          type: 'like',
          message: data.message,
          postId: data.postId,
          read: false,
          timestamp: new Date()
        }, ...prev]);
        
        setUnreadCount(prev => prev + 1);
      });

      // Listen for new comments
      socket.on('comment-added', (data) => {
        setNotifications(prev => [{
          id: Date.now(),
          type: 'comment',
          message: `${data.commentBy} commented on your post`,
          postId: data.postId,
          read: false,
          timestamp: new Date()
        }, ...prev]);
        
        setUnreadCount(prev => prev + 1);
      });
    }

    return () => {
      if (socket) {
        socket.off('new-like');
        socket.off('comment-added');
      }
    };
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => prev - 1);
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  return (
    <div className="notification-container">
      <div className="notification-bell" onClick={() => setIsOpen(!isOpen)}>
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </div>
      
      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead}>Mark all as read</button>
            )}
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="no-notifications">No notifications yet</p>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <p>{notif.message}</p>
                  <span className="notification-time">
                    {new Date(notif.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;