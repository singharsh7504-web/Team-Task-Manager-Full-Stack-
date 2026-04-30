import { useState } from 'react';
import { X } from 'lucide-react';
import { createProject, updateProject } from '../api/projects';

export default function ProjectModal({ project, onClose, onSave }) {
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Project name is required.'); return; }
    setLoading(true);
    try {
      let result;
      if (project) {
        result = await updateProject(project._id, form);
      } else {
        result = await createProject(form);
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
          <h3 className="modal-title">{project ? 'Edit Project' : 'New Project'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: 16, fontSize: 13 }}>
              {error}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input name="name" value={form.name} onChange={handleChange} className="form-control" placeholder="e.g. Website Redesign" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="form-control" placeholder="What's this project about?" />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : project ? 'Update' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
