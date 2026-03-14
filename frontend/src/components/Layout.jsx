import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Layout() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', icon: '🏠', label: t('nav.dashboard') },
    { path: '/quizzes', icon: '📝', label: t('nav.quizzes') },
    { path: '/courses', icon: '📓', label: t('nav.courses') },
    { path: '/games', icon: '🎮', label: t('nav.games') },
    { path: '/simulations', icon: '🔬', label: t('nav.simulations') },
    { path: '/xp-rewards', icon: '⚡', label: t('nav.xpRewards') },
    { path: '/analytics', icon: '📊', label: t('nav.analytics') },
    { path: '/leaderboard', icon: '🏆', label: t('nav.leaderboard') },
    { path: '/learning-style', icon: '🧠', label: t('nav.learningStyle') },
    { path: '/profile', icon: '👤', label: t('nav.profile') },
  ];

  const getLevelTitle = (l) => {
    if (l <= 5) return t('dashboard.beginner');
    if (l <= 15) return t('dashboard.explorer');
    if (l <= 30) return t('dashboard.challenger');
    return t('dashboard.master');
  };

  return (
    <div className="app-layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div className="logo-container" style={{ width: 60, height: 48, borderRadius: 8 }}>
            <img src="/BRAND_ICON_TRANSPARENT.png" alt="EduAI" className="logo-animated" />
          </div>
          <span style={{ fontWeight: 950, fontSize: 12, letterSpacing: '0.15em', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EDU AI</span>
        </div>
        </div>
        <div className="badge badge-gold" style={{ fontSize: 11 }}>⚡ {user?.xp || 0}</div>
      </div>

      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo" style={{ borderBottom: 'none', marginBottom: 20 }}>
           <div className="logo-container" style={{ width: 110, height: 88 }}>
             <img src="/BRAND_ICON_TRANSPARENT.png" alt="EDU AI" className="logo-animated" />
           </div>
           <h1 style={{ fontSize: 20, fontWeight: 950, letterSpacing: '0.2em', marginTop: 10, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EDU AI</h1>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-profile">
          <div className="profile-card" onClick={() => { navigate('/profile'); setSidebarOpen(false); }} style={{ cursor: 'pointer' }}>
            <div className="profile-avatar" style={{ overflow: 'hidden' }}>
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.displayName?.charAt(0)?.toUpperCase() || '?'
              )}
            </div>
            <div className="profile-info">
              <div className="name">{user?.displayName || user?.username}</div>
              <div className="level-badge">{t('dashboard.level')} {user?.level || 1} • {getLevelTitle(user?.level || 1)}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

