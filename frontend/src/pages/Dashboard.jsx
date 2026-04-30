import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStats } from '../api/tasks';
import { getProjects } from '../api/projects';
import { getTasks } from '../api/tasks';
import {
  LayoutDashboard, CheckSquare, Clock, AlertCircle, TrendingUp, Calendar
} from 'lucide-react';

function isOverdue(task) {
  return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getTasks(), getProjects()]).then(([s, t, p]) => {
      setStats(s.data);
      setRecentTasks(t.data.slice(0, 6));
      setProjects(p.data);
    }).finally(() => setLoading(false));
  }, []);

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">
            {user?.role === 'TEAM_LEAD'
              ? `You have ${stats.overdue} overdue task${stats.overdue !== 1 ? 's' : ''} across your team`
              : `You have ${stats.pending} pending task${stats.pending !== 1 ? 's' : ''} assigned to you`}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Today</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><CheckSquare size={20} /></div>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><Clock size={20} /></div>
          <div>
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><TrendingUp size={20} /></div>
          <div>
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><CheckSquare size={20} /></div>
          <div>
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><AlertCircle size={20} /></div>
          <div>
            <div className="stat-value">{stats.overdue}</div>
            <div className="stat-label">Overdue</div>
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Recent Tasks */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Recent Tasks</h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{recentTasks.length} tasks</span>
          </div>
          {recentTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-title">No tasks yet</div>
              <div className="empty-desc">Tasks will appear here once created.</div>
            </div>
          ) : (
            <div>
              {recentTasks.map(task => (
                <div key={task._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {task.projectId?.name}
                      {task.assigneeId && ` · ${task.assigneeId.name}`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {isOverdue(task) && <span className="badge badge-overdue">Overdue</span>}
                    <StatusBadge status={task.status} />
                    {task.dueDate && (
                      <span style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Calendar size={11} />{formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: completion + projects */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Completion */}
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Completion Rate</h3>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent)' }}>{completionRate}%</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
              {stats.completed} of {stats.total} tasks done
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${completionRate}%` }} />
            </div>
          </div>

          {/* Projects */}
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Projects</h3>
            {projects.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No projects yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {projects.slice(0, 4).map(p => (
                  <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                    <div style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.teamLeadId?.name}</div>
                  </div>
                ))}
                {projects.length > 4 && (
                  <div style={{ fontSize: 12, color: 'var(--accent)', cursor: 'pointer' }}>+{projects.length - 4} more</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { PENDING: 'badge-pending', IN_PROGRESS: 'badge-progress', COMPLETED: 'badge-completed' };
  const labels = { PENDING: 'Pending', IN_PROGRESS: 'In Progress', COMPLETED: 'Done' };
  return <span className={`badge ${map[status]}`}>{labels[status]}</span>;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
