import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getProjects } from '../api/projects';
import { getMembers } from '../api/auth';
import { createTask, updateTask } from '../api/tasks';

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

export default function TaskModal({ task, onClose, onSave, defaultProjectId }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'PENDING',
    dueDate: task?.dueDate ? task.dueDate.substring(0, 10) : '',
    projectId: task?.projectId?._id || task?.projectId || defaultProjectId || '',
    assigneeId: task?.assigneeId?._id || task?.assigneeId || '',
  });
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getProjects(), getMembers()]).then(([p, m]) => {
      setProjects(p.data);
      setMembers(m.data);
    });
  }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.projectId) {
      setError('Title and project are required.');
      return;
    }
    setLoading(true);
    try {
      let result;
      const payload = { ...form, assigneeId: form.assigneeId || null };
      if (task) {
        result = await updateTask(task._id, payload);
      } else {
        result = await createTask(payload);
      }
      onSave(result.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong.');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{task ? 'Edit Task' : 'Create Task'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: 16, fontSize: 13 }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Title *</label>
            <input name="title" value={form.title} onChange={handleChange} className="form-control" placeholder="Task title" />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="form-control" placeholder="Optional details..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Project *</label>
              <select name="projectId" value={form.projectId} onChange={handleChange} className="form-control">
                <option value="">Select project</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="form-control">
                {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select name="assigneeId" value={form.assigneeId} onChange={handleChange} className="form-control">
                <option value="">Unassigned</option>
                {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className="form-control" />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
