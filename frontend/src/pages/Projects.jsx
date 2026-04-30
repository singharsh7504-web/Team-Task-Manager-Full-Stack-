import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderKanban } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProjects, deleteProject } from '../api/projects';
import ProjectModal from '../components/ProjectModal';

export default function Projects() {
  const { user } = useAuth();
  const isLead = user?.role === 'TEAM_LEAD';
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const { data } = await getProjects(); setProjects(data); } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = (saved) => {
    if (editProject) {
      setProjects(p => p.map(x => x._id === saved._id ? saved : x));
    } else {
      setProjects(p => [saved, ...p]);
    }
    setShowModal(false);
    setEditProject(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await deleteProject(id);
      setProjects(p => p.filter(x => x._id !== id));
    } catch (e) { alert(e?.response?.data?.message || 'Error deleting project'); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace</p>
        </div>
        {isLead && (
          <button className="btn btn-primary" onClick={() => { setEditProject(null); setShowModal(true); }}>
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : projects.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <div className="empty-title">No projects yet</div>
            <div className="empty-desc">
              {isLead ? 'Create your first project to get started.' : 'No projects have been created yet.'}
            </div>
            {isLead && (
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>
                <Plus size={15} /> Create Project
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {projects.map(p => (
            <div key={p._id} className="card" style={{ transition: 'all 0.2s', cursor: 'default' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: 'var(--accent-light)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                  <FolderKanban size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{p.name}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Lead: {p.teamLeadId?.name || 'Unknown'}
                  </p>
                </div>
                {isLead && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-icon" title="Edit"
                      onClick={() => { setEditProject(p); setShowModal(true); }}>
                      <Edit2 size={15} />
                    </button>
                    <button className="btn btn-ghost btn-icon" title="Delete"
                      style={{ color: 'var(--danger)' }}
                      onClick={() => handleDelete(p._id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>

              {p.description && (
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
                  {p.description}
                </p>
              )}

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                  {p.teamLeadId?.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Created {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ProjectModal
          project={editProject}
          onClose={() => { setShowModal(false); setEditProject(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
