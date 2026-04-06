import { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    API.get('/leaderboard')
      .then(res => { setLeaderboard(res.data.leaderboard); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner"></div><p>{t('leaderboard.loadingLeaderboard')}</p></div>;

  const getRankStyle = (rank) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return '';
  };

  const getRankEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <div className="animate-fade leaderboard-page" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 900, marginBottom: 8 }}>{t('leaderboard.title')}</h1>
        <p style={{ fontSize: 'clamp(14px, 2.5vw, 18px)', opacity: 0.8 }}>{t('leaderboard.subtitle')}</p>
      </div>

      {/* Top 3 Podium Overhaul */}
      {leaderboard.length >= 3 && (
        <div className="leaderboard-podium">
          {[1, 0, 2].map((idx) => {
            const player = leaderboard[idx];
            if (!player) return null;
            const rank = player.rank;
            const rankClass = `rank-${rank}`;
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.15, ease: "easeOut" }}
                className={`podium-item ${rankClass}`}
              >
                <div className="podium-avatar-wrapper">
                  <div className="podium-avatar">
                    {player.profilePicture ? (
                      <img src={player.profilePicture} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', fontWeight: 800, fontSize: rank === 1 ? 40 : 30 }}>
                        {player.displayName?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className={`podium-badge ${rankClass}`}>{getRankEmoji(rank)}</div>
                </div>
                
                <div style={{ fontWeight: 800, fontSize: rank === 1 ? 22 : 18, marginBottom: 4, color: 'var(--text-primary)' }}>{player.displayName}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{player.levelTitle}</div>
                <div className="podium-xp">{player.xp} XP</div>
                
                {rank === 1 && (
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', fontSize: 32 }}
                  >👑</motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="leaderboard-scroll-wrapper">
      <div className="card" style={{ padding: 0, overflow: 'hidden', border: 'none', background: 'transparent' }}>
        <table className="leaderboard-table" style={{ borderSpacing: '0 8px', width: '100%', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'transparent' }}>
              <th style={{ paddingLeft: 16 }}>RANK</th>
              <th>PLAYER</th>
              <th>LEVEL</th>
              <th style={{ paddingRight: 16 }}>XP</th>
              <th className="hide-on-mobile">BADGES</th>
              <th className="hide-on-mobile" style={{ paddingRight: 24 }}>STREAK</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((player) => {
              const isMe = player.username === user?.username;
              const rank = player.rank;
              
              return (
                <motion.tr 
                  key={player.rank} 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`${isMe ? 'table-row-me' : ''} ${rank <= 3 ? 'hide-on-mobile' : ''}`}
                  style={{ background: 'var(--bg-card)', transition: 'transform 0.2s', cursor: 'default' }}
                >
                  <td style={{ paddingLeft: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className={`rank-badge sm ${rank <= 3 ? `rank-${rank}` : ''}`} style={{ fontWeight: 800 }}>
                        {rank <= 3 ? getRankEmoji(rank) : rank}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="profile-avatar" style={{ width: 40, height: 40, fontSize: 16, overflow: 'hidden', border: '2px solid var(--border-color)' }}>
                        {player.profilePicture ? (
                          <img src={player.profilePicture} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          player.displayName?.charAt(0)?.toUpperCase() || '?'
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                          {player.displayName} 
                          {isMe && <span className="badge badge-primary" style={{ marginLeft: 8, fontSize: 10, padding: '2px 6px' }}>{t('leaderboard.you')}</span>}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>@{player.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>Lv. {player.level}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>{player.levelTitle}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, color: 'var(--accent-gold)', fontSize: 16 }}>{player.xp.toLocaleString()}</div>
                  </td>
                  <td className="hide-on-mobile">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                      {player.badges} <span style={{ opacity: 0.7 }}>🏅</span>
                    </div>
                  </td>
                  <td className="hide-on-mobile" style={{ paddingRight: 24 }}>
                    {player.streak > 0 ? (
                      <span className="streak-display" style={{ display: 'inline-flex', padding: '4px 12px', borderRadius: 20 }}>
                        <span className="flame" style={{ marginRight: 6 }}>🔥</span>
                        <span className="streak-count">{player.streak}</span>
                      </span>
                    ) : <span style={{ opacity: 0.3 }}>-</span>}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        
        {leaderboard.length === 0 && (
          <div className="empty-state" style={{ padding: '80px 0' }}>
            <div className="empty-icon" style={{ fontSize: 64 }}>🏆</div>
            <h3 style={{ fontSize: 24, fontWeight: 700 }}>{t('leaderboard.noPlayersYet')}</h3>
            <p style={{ opacity: 0.7 }}>{t('leaderboard.beTheFirst')}</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
