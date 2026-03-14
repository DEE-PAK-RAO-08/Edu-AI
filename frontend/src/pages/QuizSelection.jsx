import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const subjects = [
  { id: 'mathematics', name: 'Mathematics', icon: '🧮', color: 'rgba(108, 92, 231, 0.15)', description: 'Algebra, Geometry, Calculus, Statistics' },
  { id: 'physics', name: 'Physics', icon: '🌌', color: 'rgba(0, 210, 255, 0.15)', description: 'Mechanics, Thermodynamics, Optics, Quantum' },
  { id: 'computer-science', name: 'Computer Science', icon: '💻', color: 'rgba(0, 230, 118, 0.15)', description: 'Programming, Algorithms, Databases, Networking' },
  { id: 'chemistry', name: 'Chemistry', icon: '🧪', color: 'rgba(253, 203, 110, 0.15)', description: 'Organic, Inorganic, Physical, Analytical' },
  { id: 'moralscience', name: 'Moral Science', icon: '⚖️', color: 'rgba(232, 67, 147, 0.15)', description: 'Ethics, Values, Empathy, Integrity' },
  { id: 'english', name: 'English', icon: '📖', color: 'rgba(214, 48, 49, 0.15)', description: 'Grammar, Vocabulary, Reading, Writing' },
  { id: 'tamil', name: 'Tamil', icon: '🪔', color: 'rgba(230, 126, 34, 0.15)', description: 'Grammar, Literature, Poetry, Prose' }
];

export default function QuizSelection() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedSubject, setSelectedSubject] = useState(null);

  const startQuiz = (level) => {
    navigate(`/test/${selectedSubject.id}?level=${level}`);
  };

  return (
    <div className="animate-fade" style={{ paddingBottom: 64 }}>
      <div className="page-header">
        <h1>📝 {t('quizzes.title')}</h1>
        <p>{t('quizzes.subtitle')}</p>
      </div>

      <div className="grid-3 stagger-children">
        {subjects.map((subject) => (
          <motion.div
            key={subject.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`subject-card ${selectedSubject?.id === subject.id ? 'selected' : ''}`} onClick={() => setSelectedSubject(subject)}>
              <div className="subject-icon" style={{ background: subject.color }}>
                {subject.icon}
              </div>
              <h3>{subject.name}</h3>
              <p>{subject.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedSubject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setSelectedSubject(null)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-content card"
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: 520, width: '100%', padding: '36px', borderRadius: '24px', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{t('quizzes.configureAssessment')}</h2>
                  <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)', fontSize: 14 }}>{t('quizzes.selectDifficulty')}</p>
                </div>
                <button className="btn-icon" onClick={() => setSelectedSubject(null)} style={{ background: 'rgba(255,255,255,0.05)', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>✕</button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, padding: '20px', background: selectedSubject.color, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 36 }}>{selectedSubject.icon}</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{selectedSubject.name}</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: 13, opacity: 0.85 }}>{selectedSubject.description}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <button className="difficulty-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'rgba(46, 204, 113, 0.05)', border: '1px solid rgba(46, 204, 113, 0.2)', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }} onClick={() => startQuiz('easy')} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(46, 204, 113, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(46, 204, 113, 0.05)'}>
                  <div>
                    <strong style={{ fontSize: 18, color: '#2ecc71', display: 'block', marginBottom: 4 }}>{t('quizzes.easy')}</strong>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('quizzes.easyDesc')}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 15 }}>15 {t('quizzes.questions')}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>15 {t('quizzes.mins')}</div>
                  </div>
                </button>

                <button className="difficulty-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'rgba(241, 196, 15, 0.05)', border: '1px solid rgba(241, 196, 15, 0.2)', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }} onClick={() => startQuiz('medium')} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(241, 196, 15, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(241, 196, 15, 0.05)'}>
                  <div>
                    <strong style={{ fontSize: 18, color: '#f1c40f', display: 'block', marginBottom: 4 }}>{t('quizzes.medium')}</strong>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('quizzes.mediumDesc')}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 15 }}>30 {t('quizzes.questions')}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>40 {t('quizzes.mins')}</div>
                  </div>
                </button>

                <button className="difficulty-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'rgba(231, 76, 60, 0.05)', border: '1px solid rgba(231, 76, 60, 0.2)', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }} onClick={() => startQuiz('hard')} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(231, 76, 60, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(231, 76, 60, 0.05)'}>
                  <div>
                    <strong style={{ fontSize: 18, color: '#e74c3c', display: 'block', marginBottom: 4 }}>{t('quizzes.hard')}</strong>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('quizzes.hardDesc')}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 15 }}>50 {t('quizzes.questions')}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>60 {t('quizzes.mins')}</div>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
