import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'MEMBER' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const setRole = (role) => setForm(f => ({ ...f, role }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) { setError('All fields are required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const { data } = await registerApi(form);
      login(data);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">✓</div>
          <span>TaskFlow</span>
        </div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join your team on TaskFlow</p>

        {error && (
          <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 16, fontSize: 13, borderLeft: '3px solid var(--danger)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Your role</label>
            <div className="role-selector">
              {[
                { value: 'TEAM_LEAD', icon: '👑', label: 'Team Lead' },
                { value: 'MEMBER', icon: '👤', label: 'Member' },
              ].map(r => (
                <button
                  key={r.value} type="button"
                  className={`role-option ${form.role === r.value ? 'selected' : ''}`}
                  onClick={() => setRole(r.value)}
                >
                  <div className="role-box">
                    <div className="role-icon">{r.icon}</div>
                    <div className="role-label">{r.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full name</label>
            <input name="name" value={form.name} onChange={handleChange} className="form-control" placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="form-control" placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} className="form-control" placeholder="Min. 6 characters" />
          </div>

          <button
            type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '10px', marginTop: 8 }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
