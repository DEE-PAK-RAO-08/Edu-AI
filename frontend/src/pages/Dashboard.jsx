import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import API from '../api';

export default function Dashboard() {
  const { user, addNotification } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    API.get('/progress-overview').then(res => setOverview(res.data)).catch(console.error);
    
    // Check for streak notification
    if (user?.streak > 0 && !sessionStorage.getItem('streakShown')) {
      sessionStorage.setItem('streakShown', 'true');
      addNotification({
        type: 'streak',
        icon: '🔥',
        title: t('dashboard.streakKept'),
        message: t('dashboard.streakMessage').replace('{streak}', user.streak)
      });
    }
  }, [user]);

  const xpForNextLevel = ((user?.level || 1)) * 100;
  const currentXPInLevel = (user?.xp || 0) % 100;
  const xpProgress = (currentXPInLevel / 100) * 100;

  const getLevelTitle = (level) => {
    if (level <= 5) return t('dashboard.beginner');
    if (level <= 15) return t('dashboard.explorer');
    if (level <= 30) return t('dashboard.challenger');
    return t('dashboard.master');
  };

  return (
    <div className="animate-fade">
      {/* Welcome Card */}
      <div className="welcome-card" style={{ marginBottom: 24 }}>
        <h2>{t('dashboard.welcomeBack')}, {user?.displayName || user?.username || 'Learner'}! 👋</h2>
        <p>{t('dashboard.readyContinue')}</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/subjects')}>
            📚 {t('dashboard.startLearning')}
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/games')}>
            🎮 {t('dashboard.playGames')}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon gold">⚡</div>
          <div className="stat-info">
            <h3>{user?.xp || 0}</h3>
            <p>{t('dashboard.totalXP')}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">🎯</div>
          <div className="stat-info">
            <h3>{t('dashboard.level')} {user?.level || 1}</h3>
            <p>{getLevelTitle(user?.level || 1)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon fire">🔥</div>
          <div className="stat-info">
            <h3>{user?.streak || 0} {t('dashboard.days')}</h3>
            <p>{t('dashboard.learningStreak')}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon badge-primary">🧠</div>
          <div className="stat-info">
            <h3 style={{ textTransform: 'capitalize' }}>{user?.learningStyle || t('dashboard.unknown')}</h3>
            <p>{t('dashboard.learningStyle')}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">🏅</div>
          <div className="stat-info">
            <h3>{user?.badges?.length || 0}</h3>
            <p>{t('dashboard.badgesEarned')}</p>
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontWeight: 600 }}>{t('dashboard.level')} {user?.level || 1} → {t('dashboard.level')} {(user?.level || 1) + 1}</span>
          <span className="badge badge-gold">⚡ {currentXPInLevel} / 100 XP</span>
        </div>
        <div className="progress-bar progress-bar-lg progress-bar-gold">
          <div className="progress-fill" style={{ width: `${xpProgress}%` }}></div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Recent Activity */}
        <div className="card">
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>📊 {t('dashboard.recentActivity')}</h3>
          {overview?.performanceLogs?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {overview.performanceLogs.slice(0, 5).map((log, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 14 }}>
                      {log.subject} — {log.testType}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {new Date(log.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={`badge ${log.accuracy >= 70 ? 'badge-success' : log.accuracy >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                      {log.accuracy}%
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--accent-gold)', marginTop: 4 }}>+{log.xpEarned} XP</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>{t('dashboard.noActivityYet')}</h3>
              <p>{t('dashboard.takeFirstAssessment')}</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/subjects')}>{t('dashboard.startNow')}</button>
            </div>
          )}
        </div>

        {/* Quick Actions & Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <h3 style={{ marginBottom: 16, fontWeight: 700 }}>⚡ {t('dashboard.quickActions')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/subjects')}>📚 {t('dashboard.takeAssessment')}</button>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/games')}>🎮 {t('dashboard.playGames')}</button>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/simulations')}>🔬 {t('dashboard.simulations')}</button>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/leaderboard')}>🏆 {t('dashboard.leaderboard')}</button>
            </div>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 16, fontWeight: 700 }}>🏅 {t('dashboard.badges')}</h3>
            {user?.badges?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {user.badges.map((badge, i) => (
                  <div key={i} className="badge badge-gold" style={{ padding: '8px 14px' }}>
                    {badge.icon} {badge.name}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('dashboard.completeChallenges')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

