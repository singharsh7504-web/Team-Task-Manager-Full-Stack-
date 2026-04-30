import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import NotificationsPanel from './components/NotificationsPanel';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import History from './pages/History';
import Login from './pages/Login';
import Register from './pages/Register';
import { getNotifications } from './api/notifications';

function ProtectedLayout() {
  const { user } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [unread, setUnread] = useState(0);

  const loadUnread = useCallback(async () => {
    if (user?.role !== 'TEAM_LEAD') return;
    try {
      const { data } = await getNotifications();
      setUnread(data.filter(n => !n.isRead).length);
    } catch (e) {}
  }, [user]);

  useEffect(() => {
    loadUnread();
    const interval = setInterval(loadUnread, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [loadUnread]);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-layout">
      <Sidebar
        unreadCount={unread}
        onNotifClick={() => setShowNotifs(true)}
      />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />
          {user.role === 'TEAM_LEAD' && (
            <Route path="/history" element={<History />} />
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showNotifs && (
        <NotificationsPanel
          onClose={() => setShowNotifs(false)}
          onRead={loadUnread}
        />
      )}
    </div>
  );
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
