import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';

const allBadges = [
  { name: 'First Test', icon: '📝', desc: 'Complete your first assessment' },
  { name: 'Perfect Score', icon: '🏆', desc: 'Score 90%+ on an assessment' },
  { name: 'Grand Master', icon: '👑', desc: 'Score 100% on a full assessment' },
  { name: 'Challenge Master', icon: '⚡', desc: 'Score 100% on a challenge' },
  { name: 'Quick Thinker', icon: '🔥', desc: 'Answer questions in record time' },
  { name: 'Game Champion', icon: '🎮', desc: 'Complete your first game' },
  { name: 'Subject Specialist', icon: '📚', desc: 'Test in 3+ different subjects' },
  { name: 'Week Warrior', icon: '🔥', desc: 'Maintain a 7-day streak' },
  { name: 'Month Master', icon: '💎', desc: 'Maintain a 30-day streak' },
  { name: 'Profile Pro', icon: '👤', desc: 'Complete all profile details' },
];

export default function XPRewardsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const currentXP = user?.xp || 0;
  const level = user?.level || 1;
  const xpInLevel = currentXP % 100;
  const earned = user?.badges?.map(b => b.name) || [];

  const getLevelTitle = (l) => {
    if (l <= 5) return 'Novice';
    if (l <= 12) return 'Apprentice';
    if (l <= 20) return 'Explorer';
    if (l <= 30) return 'Scholar';
    if (l <= 45) return 'Specialist';
    if (l <= 60) return 'Elite';
    if (l <= 80) return 'Master';
    if (l <= 100) return 'Legend';
    return 'Grandmaster';
  };

  const levelTiers = [
    { range: '1–5', title: 'Novice', icon: '🌱' },
    { range: '6–12', title: 'Apprentice', icon: '📜' },
    { range: '13–20', title: 'Explorer', icon: '🧭' },
    { range: '21–30', title: 'Scholar', icon: '🎓' },
    { range: '31–45', title: 'Specialist', icon: '🛡️' },
    { range: '46–60', title: 'Elite', icon: '💎' },
    { range: '61–80', title: 'Master', icon: '👑' },
    { range: '81–100', title: 'Legend', icon: '🌟' },
    { range: '101+', title: 'Grandmaster', icon: '🔱' },
  ];

  const xpActions = [
    { action: 'Complete a lesson', xp: '+20 XP', icon: '📖' },
    { action: 'Win a game', xp: '+30 XP', icon: '🎮' },
    { action: 'Complete a challenge', xp: '+50 XP', icon: '⚡' },
    { action: 'Assessment bonus', xp: 'Up to +70 XP', icon: '📝' },
  ];

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1>⚡ {t('xpRewards.title')}</h1>
        <p>{t('xpRewards.subtitle')}</p>
      </div>

      {/* XP Overview */}
      <div className="welcome-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 4 }}>{t('dashboard.level')} {level} — {getLevelTitle(level)}</h2>
            <p style={{ opacity: 0.8 }}>{t('xpRewards.keepEarning')}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, fontWeight: 900 }}>{currentXP}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{t('xpRewards.totalXP')}</div>
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <div className="xp-bar">
            <div className="xp-fill" style={{ width: `${xpInLevel}%` }}></div>
          </div>
          <div className="xp-label" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <span>{xpInLevel} / 100 XP</span>
            <span>{t('dashboard.level')} {level + 1}</span>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24, alignItems: 'start' }}>
        {/* Level Tiers */}
        <div className="card" style={{ height: '100%' }}>
          <h3 style={{ fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🎯</span> {t('xpRewards.levelProgression')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
            {levelTiers.map((tier, i) => {
              const isActive = getLevelTitle(level) === tier.title;
              return (
                <div key={i} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '16px 10px',
                  background: isActive ? 'rgba(108, 92, 231, 0.12)' : 'var(--bg-input)',
                  borderRadius: '16px',
                  border: isActive ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}>
                  <span style={{ fontSize: 32, marginBottom: 8, filter: isActive ? 'none' : 'grayscale(0.5) opacity(0.7)' }}>{tier.icon}</span>
                  <div style={{ fontWeight: isActive ? 800 : 600, fontSize: 13, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{tier.title}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2, opacity: 0.7 }}>Level {tier.range}</div>
                  {isActive && <span className="badge badge-primary" style={{ position: 'absolute', top: -8, right: -8, fontSize: 10, boxShadow: 'var(--shadow-sm)' }}>YOU</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* XP Actions */}
        <div className="card" style={{ height: '100%' }}>
          <h3 style={{ fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>💰</span> {t('xpRewards.earnXP')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {xpActions.map((item, i) => (
              <div key={i} style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                padding: '18px 20px', background: 'var(--bg-input)', 
                borderRadius: '18px', border: '1px solid var(--border-color)',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 26, width: 32, textAlign: 'center' }}>{item.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{item.action}</span>
                </div>
                <span className="badge badge-gold" style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700 }}>{item.xp}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, padding: 16, background: 'rgba(255,215,0,0.05)', borderRadius: 16, border: '1px dashed rgba(255,215,0,0.2)' }}>
             <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>
               💡 <b>Pro Tip:</b> Keep your streak active to earn daily multipliers and exclusive badges!
             </p>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🏅 {t('xpRewards.badgeCollection')}</h3>
        <div className="grid-3">
          {allBadges.map((badge, i) => {
            const isEarned = earned.includes(badge.name);
            return (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                style={{
                  textAlign: 'center',
                  padding: 20,
                  background: isEarned ? 'rgba(255,215,0,0.08)' : 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${isEarned ? 'rgba(255,215,0,0.3)' : 'var(--border-color)'}`,
                  opacity: isEarned ? 1 : 0.5
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>{badge.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{badge.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{badge.desc}</div>
                {isEarned && <span className="badge badge-success" style={{ marginTop: 8 }}>✅ {t('xpRewards.earned')}</span>}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
