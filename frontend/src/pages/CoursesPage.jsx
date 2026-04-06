import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function CoursesPage() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [completedActions, setCompletedActions] = useState([]);
  const [stickyNote, setStickyNote] = useState('');
  const [canRetryTime, setCanRetryTime] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Load sticky note from local storage when topic changes
  useEffect(() => {
    if (selectedTopic && user) {
      const savedNote = localStorage.getItem(`sticky_note_${user.id}_${selectedTopic}`);
      if (savedNote) setStickyNote(savedNote);
      else setStickyNote('');
    }
  }, [selectedTopic, user]);

  const handleNoteSave = (e) => {
    const text = e.target.value;
    setStickyNote(text);
    if (user && selectedTopic) {
      localStorage.setItem(`sticky_note_${user.id}_${selectedTopic}`, text);
    }
  };

  // Mock list of subjects and topics since we don't have an endpoint for it
  const curriculum = {
    mathematics: ['algebra', 'geometry', 'calculus', 'trigonometry', 'statistics', 'probability', 'arithmetic', 'fractions', 'decimals', 'percentages', 'ratios', 'proportions', 'logarithms', 'matrices', 'vectors', 'complex-numbers', 'set-theory', 'logic', 'combinatorics', 'graph-theory', 'topology', 'number-theory', 'diff-eq', 'linear-prog', 'game-theory', 'cryptography', 'boolean', 'functions', 'polynomials', 'limits'],
    physics: ['kinematics', 'dynamics', 'thermodynamics', 'astrophysics', 'optics', 'electromagnetism', 'quantum', 'relativity', 'mechanics', 'acoustics', 'fluid', 'nuclear', 'plasma', 'solid-state', 'particle', 'atomic', 'molecular', 'biophysics', 'geophysics', 'atmospheric', 'string-theory', 'statistical', 'classical', 'modern', 'waves', 'electricity', 'magnetism', 'circuits', 'relativity-special', 'gravitation'],
    'computer-science': ['data-structures', 'algorithms', 'databases', 'networking', 'os', 'architecture', 'compilers', 'pl', 'se', 'ai', 'ml', 'dl', 'cv', 'nlp', 'graphics', 'hci', 'security', 'crypto', 'distributed', 'cloud', 'web', 'mobile', 'iot', 'robotics', 'quantum-comp', 'bioinformatics', 'theoretical', 'automata', 'complexity', 'data-science'],
    chemistry: ['organic', 'inorganic', 'physical', 'analytical', 'biochemistry', 'polymer', 'environmental', 'industrial', 'nuclear', 'materials', 'theoretical', 'computational', 'thermo', 'electro', 'kinetics', 'quantum-chem', 'spectroscopy', 'chromatography', 'lab', 'safety', 'periodic', 'bonding', 'states', 'stoicho', 'acids', 'bases', 'redox', 'equilibrium', 'crystals', 'polymers'],
    moralscience: ['ethics', 'values', 'empathy', 'honesty', 'integrity', 'respect', 'responsibility', 'fairness', 'citizenship', 'courage', 'compassion', 'discipline', 'gratitude', 'forgiveness', 'humility', 'tolerance', 'peace', 'justice', 'loyalty', 'perseverance', 'self-control', 'cooperation', 'charity', 'kindness', 'sharing', 'moderation', 'truth', 'wisdom', 'patience', 'modesty'],
    english: ['grammar', 'syntax', 'vocabulary', 'reading', 'writing', 'listening', 'speaking', 'phonics', 'essays', 'poetry', 'drama', 'prose', 'literature', 'idioms', 'proverbs', 'spelling', 'punctuation', 'composition', 'comprehension', 'analysis', 'rhetoric', 'debate', 'journalism', 'linguistics', 'semantics', 'pragmatics', 'history', 'dialects', 'styles', 'editing'],
    tamil: ['grammar-ilakkanam', 'literature', 'poetry', 'prose', 'sangam', 'thirukkural', 'epics', 'modern', 'semantics', 'syntax', 'vocabulary', 'writing', 'reading', 'speaking', 'listening', 'idioms', 'proverbs', 'history-tamil', 'dialects', 'translation', 'essay', 'letter', 'journalism', 'drama', 'linguistics', 'phonetics', 'inscriptions', 'authors', 'novels', 'short-stories']
  };

  const activeCurriculum = [
    { id: 'mathematics', label: 'Mathematics', icon: '🧮' },
    { id: 'physics', label: 'Physics', icon: '🌌' },
    { id: 'computer-science', label: 'Computer Science', icon: '💻' },
    { id: 'chemistry', label: 'Chemistry', icon: '🧪' },
    { id: 'moralscience', label: 'Moral Science', icon: '⚖️' },
    { id: 'english', label: 'English', icon: '📖' },
    { id: 'tamil', label: 'Tamil', icon: '🪔' },
  ];

  useEffect(() => {
    if (selectedSubject && selectedTopic) {
      setLoading(true);
      setCourseData(null);
      setFeedback(null);
      setPracticeAnswer('');
      setCompletedActions([]);
      setCanRetryTime(null);
      setCountdown(0);
      setSubmitting(false);

      API.get(`/courses/${selectedSubject}/${selectedTopic}`)
        .then(res => {
          setCourseData(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [selectedSubject, selectedTopic]);

  const handleAction = async (action, isCorrect = false) => {
    // Optimistic feedback for practice
    if (action === 'practice') {
       if (isCorrect) {
          setFeedback(`🚀 You are one step ahead!\nXP Rewards: +20 XP`);
          setCanRetryTime(null);
       } else {
          const cooldownMs = 120000; // 2 minutes
          const retryAt = Date.now() + cooldownMs;
          setCanRetryTime(retryAt);
          setFeedback('❌ Incorrect. Please review the notes and try again in 2 minutes!');
       }
    }

    try {
      setSubmitting(true);
      const res = await API.post('/complete-course-practice', {
        subject: selectedSubject,
        topic: selectedTopic,
        action,
        isCorrect
      });

      if (res.data.xpEarned > 0) {
        updateUser({ xp: res.data.totalXP, level: res.data.level });
        if (!completedActions.includes(action)) {
          setCompletedActions(prev => [...prev, action]);
        }
      }
    } catch (err) {
      console.error(err);
      if (action === 'practice') {
        // If API fails, we still keep the optimistic feedback but log error
        console.warn('XP might not have been saved');
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!canRetryTime) return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((canRetryTime - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining === 0) {
        setCanRetryTime(null);
        setFeedback(null);
        setPracticeAnswer('');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [canRetryTime]);

  const handlePracticeSubmit = (e) => {
    e.preventDefault();
    if (!courseData || countdown > 0) return;

    const isCorrect = practiceAnswer.trim().toLowerCase() === courseData.practiceAnswer.toLowerCase();
    handleAction('practice', isCorrect);
  };

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ marginBottom: 40 }}>
        <h1>📚 {t('courses.title')}</h1>
        <p>{t('courses.subtitle')}</p>
      </div>

      {!selectedSubject ? (
        <div className="grid-3 stagger-children">
          {activeCurriculum.map(sub => (
            <div key={sub.id} className="game-card" onClick={() => setSelectedSubject(sub.id)} style={{ padding: '32px 24px', textAlign: 'center' }}>
              <div className="game-icon" style={{ 
                background: 'var(--gradient-primary)', 
                width: 80, 
                height: 80, 
                fontSize: 40,
                margin: '0 auto 20px',
                boxShadow: 'var(--shadow-glow)'
              }}>
                {sub.icon}
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{sub.label}</h3>
              <p style={{ marginTop: 8, opacity: 0.7 }}>Explore topics and courses</p>
            </div>
          ))}
        </div>
      ) : !selectedTopic ? (
        <div className="animate-fade">
          <button className="btn btn-ghost btn-sm" onClick={() => setSelectedSubject(null)} style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>←</span> {t('common.back')} to Subjects
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <div style={{ fontSize: 32 }}>{activeCurriculum.find(s => s.id === selectedSubject)?.icon}</div>
            <h2 style={{ fontSize: 'clamp(20px, 5vw, 32px)', fontWeight: 900 }}>{selectedSubject.replace('-', ' ').toUpperCase()} Topics</h2>
          </div>
          <div className="grid-3 stagger-children">
            {curriculum[selectedSubject].map(topic => (
              <div key={topic} className="card" style={{ cursor: 'pointer', padding: 24, border: '1px solid var(--border-color)', transition: 'all 0.3s ease' }} 
                   onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                   onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                   onClick={() => setSelectedTopic(topic)}>
                <h3 style={{ textTransform: 'capitalize', textAlign: 'center', fontSize: 18 }}>
                  {selectedSubject === 'tamil' ? t(`tamilTopics.${topic}`) : topic.replace('-', ' ')}
                </h3>
              </div>
            ))}
          </div>
        </div>
      ) : loading ? (
        <div className="loading-page"><div className="spinner"></div><p>Loading course content...</p></div>
      ) : courseData ? (
        <div className="animate-fade">
          <button className="btn btn-ghost btn-sm" onClick={() => setSelectedTopic(null)} style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>←</span> Back to {selectedSubject.replace('-', ' ')}
          </button>

          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 32, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ padding: '24px 32px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <h2 style={{ fontSize: 28, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{courseData.title}</h2>
                {courseData.isPlaceholder && <span className="badge badge-warning" style={{ fontSize: 12 }}>🚧 Content Finalizing</span>}
              </div>
              {completedActions.includes('watch') && <div className="badge badge-success">✅ Completed</div>}
            </div>

            {/* Premium YouTube Embed Container */}
            <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', background: '#000' }}>
              <iframe
                src={courseData.videoUrl}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allowFullScreen
                onLoad={() => setTimeout(() => handleAction('watch'), 5000)}
                title={courseData.title}
              ></iframe>
            </div>
          </div>

          <div className="grid-3" style={{ gap: 24 }}>
            {/* Lesson Notes */}
            <div className="card" style={{ height: '100%', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }} onMouseEnter={() => setTimeout(() => handleAction('read'), 3000)}>
              <h3 style={{ fontSize: 20, fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>📑</span> Lesson Notes
              </h3>
              <p style={{ lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: 16 }}>{courseData.notes}</p>
              {completedActions.includes('read') && <div style={{ marginTop: 20, color: 'var(--accent-success)', fontSize: 14, fontWeight: 600 }}>✅ Notes read (+10 XP)</div>}
            </div>

            {/* Practice Sum */}
            <div className="card" style={{ height: '100%', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>🖋️</span> Practice Sum
              </h3>
              <p style={{ fontWeight: 700, marginBottom: 24, fontSize: 18, lineHeight: 1.4 }}>{courseData.practiceSum}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 24 }}>
                {courseData.practiceOptions.map((opt, i) => (
                  <button
                    key={i}
                    className={`btn ${practiceAnswer === opt ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'flex-start', padding: '12px 20px', textAlign: 'left', borderRadius: 12, width: '100%', marginBottom: 8 }}
                    onClick={() => setPracticeAnswer(opt)}
                  >
                    <span style={{ opacity: 0.6, marginRight: 12 }}>{String.fromCharCode(65 + i)}.</span> {opt}
                  </button>
                ))}
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', borderRadius: 12, fontWeight: 800, opacity: (countdown > 0 || !practiceAnswer || submitting) ? 0.6 : 1, marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={handlePracticeSubmit}
                disabled={!practiceAnswer || countdown > 0 || submitting}
              >
                {submitting ? (
                   <div className="spinner sm" style={{ borderTopColor: '#fff', marginRight: 10 }}></div>
                ) : null}
                {countdown > 0 ? `Wait ${countdown}s to Retry` : submitting ? 'Checking...' : 'Submit Answer'}
              </button>

              {feedback && (
                <div className="animate-fade" style={{ 
                  marginTop: 20, 
                  padding: 14, 
                  borderRadius: 12, 
                  textAlign: 'center', 
                  fontWeight: 600, 
                  whiteSpace: 'pre-line',
                  background: feedback.includes('🚀') ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 71, 87, 0.1)', 
                  color: feedback.includes('🚀') ? 'var(--accent-success)' : 'var(--accent-danger)', 
                  border: `1px solid ${feedback.includes('🚀') ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 71, 87, 0.2)'}` 
                }}>
                  {feedback}
                </div>
              )}
            </div>

            {/* Premium Sticky Note */}
            <div className="card" style={{ height: '100%', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 50, height: 18, background: 'rgba(255,255,255,0.15)', borderRadius: 4, zIndex: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
              <h3 style={{ fontSize: 20, fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>📌</span> My Sticky Notes
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16, fontStyle: 'italic' }}>Capture your key takeaways here...</p>
              <textarea
                className="form-input"
                style={{ width: '100%', height: '240px', resize: 'none', background: 'rgba(255, 234, 167, 0.05)', color: 'var(--text-primary)', border: '1px solid rgba(255, 234, 167, 0.15)', fontSize: 16, padding: 16, borderRadius: 12, lineHeight: 1.6 }}
                placeholder="Type your notes here..."
                value={stickyNote}
                onChange={handleNoteSave}
              />
              <div style={{ textAlign: 'right', marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>✨ Auto-saved to cloud</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div style={{ fontSize: 64, marginBottom: 20 }}>🚧</div>
          <h3 style={{ fontSize: 24, fontWeight: 800 }}>Topic Content Coming Soon!</h3>
          <p style={{ fontSize: 16, opacity: 0.7, maxWidth: 400, margin: '0 auto 32px' }}>We are currently crafting high-quality educational content for this topic. Check back soon!</p>
          <button className="btn btn-secondary" onClick={() => setSelectedTopic(null)}>Go Back to Topics</button>
        </div>
      )}
    </div>
  );
}
