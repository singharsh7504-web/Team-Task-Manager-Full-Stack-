import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Trash2, Bell, LogOut, Users
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: FolderKanban, label: 'Projects', path: '/projects' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
];

const leadItems = [
  { icon: Trash2, label: 'Deletion History', path: '/history' },
];

export default function Sidebar({ unreadCount, onNotifClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allItems = user?.role === 'TEAM_LEAD' ? [...navItems, ...leadItems] : navItems;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">✓</div>
        <span>TaskFlow</span>
      </div>

      <nav className="sidebar-nav">
        {allItems.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className={`nav-item ${location.pathname === path ? 'active' : ''}`}
          >
            <Icon className="nav-icon" size={17} />
            {label}
          </Link>
        ))}

        {user?.role === 'TEAM_LEAD' && (
          <button className="nav-item" onClick={onNotifClick} style={{ marginTop: '4px' }}>
            <Bell className="nav-icon" size={17} />
            Notifications
            {unreadCount > 0 && (
              <span className="notif-badge" style={{ position: 'static', marginLeft: 'auto' }}>
                {unreadCount}
              </span>
            )}
          </button>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role === 'TEAM_LEAD' ? 'Team Lead' : 'Member'}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
