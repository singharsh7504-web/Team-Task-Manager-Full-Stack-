import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('All fields are required.'); return; }
    setLoading(true);
    try {
      const { data } = await loginApi(form);
      login(data);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid credentials.');
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
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your workspace</p>

        {error && (
          <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 16, fontSize: 13, borderLeft: '3px solid var(--danger)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              name="email" type="email" value={form.email}
              onChange={handleChange} className="form-control"
              placeholder="you@example.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              name="password" type="password" value={form.password}
              onChange={handleChange} className="form-control"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '10px', marginTop: 8 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}
