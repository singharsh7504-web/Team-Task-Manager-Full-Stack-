import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { getDeletionHistory } from '../api/tasks';

function formatDateTime(d) {
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDeletionHistory()
      .then(({ data }) => setHistory(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Deletion History</h1>
          <p className="page-subtitle">A log of all deleted tasks</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--danger-light)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: 13, fontWeight: 500 }}>
          <Trash2 size={15} />
          {history.length} deleted task{history.length !== 1 ? 's' : ''}
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : history.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🗑️</div>
            <div className="empty-title">No deletion history</div>
            <div className="empty-desc">Deleted tasks will appear here for your records.</div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>All Deleted Tasks</h3>
          </div>
          {history.map((h, i) => (
            <div key={h._id || i} className="history-item">
              <div className="history-dot" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{h.taskTitle}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Deleted by <strong>{h.deletedBy?.name || 'Unknown'}</strong>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right', flexShrink: 0 }}>
                {formatDateTime(h.deletedAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
