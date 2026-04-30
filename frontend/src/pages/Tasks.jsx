import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, User, Calendar, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTasks, deleteTask, updateTask } from '../api/tasks';
import { getProjects } from '../api/projects';
import TaskModal from '../components/TaskModal';

const STATUS_COLS = [
  { key: 'PENDING', label: 'Pending', cls: 'pending' },
  { key: 'IN_PROGRESS', label: 'In Progress', cls: 'progress' },
  { key: 'COMPLETED', label: 'Completed', cls: 'completed' },
];

function isOverdue(task) {
  return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Tasks() {
  const { user } = useAuth();
  const isLead = user?.role === 'TEAM_LEAD';
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterProject, setFilterProject] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [view, setView] = useState('kanban'); // 'kanban' | 'list'

  const load = async () => {
    setLoading(true);
    try {
      const [t, p] = await Promise.all([getTasks(filterProject || undefined), getProjects()]);
      setTasks(t.data);
      setProjects(p.data);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterProject]);

  const handleSave = (saved) => {
    setTasks(prev => {
      const idx = prev.findIndex(t => t._id === saved._id);
      if (idx >= 0) { const n = [...prev]; n[idx] = saved; return n; }
      return [saved, ...prev];
    });
    setShowModal(false);
    setEditTask(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task? It will be logged in deletion history.')) return;
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (e) { alert(e?.response?.data?.message || 'Error'); }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const { data } = await updateTask(task._id, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === data._id ? data : t));
    } catch (e) { alert(e?.response?.data?.message || 'Error updating status'); }
  };

  const byStatus = (status) => tasks.filter(t => t.status === status);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''} total</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            className="form-control" style={{ width: 180 }}
            value={filterProject} onChange={e => setFilterProject(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          {isLead && (
            <button className="btn btn-primary" onClick={() => { setEditTask(null); setShowModal(true); }}>
              <Plus size={16} /> New Task
            </button>
          )}
        </div>
      </div>

      {/* View toggle */}
      <div className="tabs">
        <button className={`tab ${view === 'kanban' ? 'active' : ''}`} onClick={() => setView('kanban')}>Kanban</button>
        <button className={`tab ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>List</button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : tasks.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <div className="empty-title">No tasks found</div>
            <div className="empty-desc">{isLead ? 'Create a task and assign it to a team member.' : 'No tasks assigned to you yet.'}</div>
            {isLead && (
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>
                <Plus size={15} /> Create Task
              </button>
            )}
          </div>
        </div>
      ) : view === 'kanban' ? (
        <div className="tasks-grid">
          {STATUS_COLS.map(col => (
            <div key={col.key} className="kanban-col">
              <div className={`kanban-col-header ${col.cls}`}>
                {col.label}
                <span className="count-pill">{byStatus(col.key).length}</span>
              </div>
              {byStatus(col.key).length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>No tasks</div>
              ) : (
                byStatus(col.key).map(task => (
                  <TaskCard
                    key={task._id} task={task} isLead={isLead}
                    onEdit={() => { setEditTask(task); setShowModal(true); }}
                    onDelete={() => handleDelete(task._id)}
                    onStatusChange={handleStatusChange}
                    currentUser={user}
                  />
                ))
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Assignee</th>
                <th>Status</th>
                <th>Due Date</th>
                {isLead && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task._id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{task.title}</div>
                    {task.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{task.description.substring(0, 60)}{task.description.length > 60 ? '…' : ''}</div>}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{task.projectId?.name}</td>
                  <td>
                    {task.assigneeId ? (
                      <div className="assignee-tag">
                        <div className="assignee-dot">{task.assigneeId.name?.charAt(0).toUpperCase()}</div>
                        {task.assigneeId.name}
                      </div>
                    ) : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}
                  </td>
                  <td>
                    {!isLead && task.assigneeId?._id === user?._id && task.status !== 'COMPLETED' ? (
                      <StatusSelector task={task} onChange={handleStatusChange} />
                    ) : (
                      <StatusBadge status={task.status} />
                    )}
                  </td>
                  <td>
                    {task.dueDate ? (
                      <span style={{ fontSize: 12.5, color: isOverdue(task) ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: isOverdue(task) ? 600 : 400 }}>
                        {formatDate(task.dueDate)}{isOverdue(task) ? ' ⚠' : ''}
                      </span>
                    ) : '—'}
                  </td>
                  {isLead && (
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditTask(task); setShowModal(true); }}><Edit2 size={14} /></button>
                        <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(task._id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <TaskModal
          task={editTask}
          defaultProjectId={filterProject}
          onClose={() => { setShowModal(false); setEditTask(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function TaskCard({ task, isLead, onEdit, onDelete, onStatusChange, currentUser }) {
  const canChangeStatus = !isLead && task.assigneeId?._id === currentUser?._id;
  return (
    <div className="task-card">
      <div className="task-card-title">{task.title}</div>
      {task.description && (
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.4 }}>
          {task.description.substring(0, 80)}{task.description.length > 80 ? '…' : ''}
        </div>
      )}
      <div className="task-card-meta">
        {task.projectId?.name && <span>{task.projectId.name}</span>}
        {task.dueDate && (
          <span style={{ color: isOverdue(task) ? 'var(--danger)' : 'inherit', fontWeight: isOverdue(task) ? 600 : 400, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Calendar size={11} />{formatDate(task.dueDate)}{isOverdue(task) ? ' ⚠' : ''}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        {task.assigneeId ? (
          <div className="assignee-tag">
            <div className="assignee-dot">{task.assigneeId.name?.charAt(0).toUpperCase()}</div>
            <span style={{ fontSize: 12 }}>{task.assigneeId.name}</span>
          </div>
        ) : <div />}
        <div style={{ display: 'flex', gap: 4 }}>
          {canChangeStatus && task.status !== 'COMPLETED' && (
            <button className="btn btn-sm" style={{ background: 'var(--success-light)', color: 'var(--success)', border: 'none', fontSize: 11.5 }}
              onClick={() => onStatusChange(task, task.status === 'PENDING' ? 'IN_PROGRESS' : 'COMPLETED')}>
              {task.status === 'PENDING' ? 'Start' : 'Complete'}
            </button>
          )}
          {isLead && (
            <>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={onEdit}><Edit2 size={13} /></button>
              <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={onDelete}><Trash2 size={13} /></button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { PENDING: 'badge-pending', IN_PROGRESS: 'badge-progress', COMPLETED: 'badge-completed' };
  const labels = { PENDING: 'Pending', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed' };
  return <span className={`badge ${map[status]}`}>{labels[status]}</span>;
}

function StatusSelector({ task, onChange }) {
  const options = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
  ];
  return (
    <select
      className="form-control" style={{ padding: '4px 8px', fontSize: 12, width: 'auto' }}
      value={task.status}
      onChange={e => onChange(task, e.target.value)}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
