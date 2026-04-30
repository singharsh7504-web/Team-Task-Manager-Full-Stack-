import { useState, useEffect } from 'react';
import { X, CheckCheck } from 'lucide-react';
import { getNotifications, markRead, markAllRead } from '../api/notifications';

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationsPanel({ onClose, onRead }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await getNotifications();
      setNotifs(data);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id) => {
    await markRead(id);
    setNotifs(n => n.map(x => x._id === id ? { ...x, isRead: true } : x));
    onRead();
  };

  const handleMarkAll = async () => {
    await markAllRead();
    setNotifs(n => n.map(x => ({ ...x, isRead: true })));
    onRead();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 440, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">Notifications</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn btn-ghost btn-sm" onClick={handleMarkAll}>
              <CheckCheck size={15} /> Mark all read
            </button>
            <button className="btn btn-ghost btn-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : notifs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <div className="empty-title">No notifications yet</div>
              <div className="empty-desc">You'll be notified when team members complete tasks.</div>
            </div>
          ) : (
            <div className="notif-list">
              {notifs.map(n => (
                <div
                  key={n._id}
                  className={`notif-item ${n.isRead ? 'read' : 'unread'}`}
                  onClick={() => !n.isRead && handleMarkRead(n._id)}
                  style={{ cursor: n.isRead ? 'default' : 'pointer' }}
                >
                  <div className="notif-dot" />
                  <div>
                    <div className="notif-message">{n.message}</div>
                    <div className="notif-time">{timeAgo(n.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
