import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function ChallengePage() {
  const { subject } = useParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [difficulty, setDifficulty] = useState(1);
  const [showHints, setShowHints] = useState(false);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    fetchChallenge();
  }, [subject]);

  useEffect(() => {
    if (loading || result || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleSubmitAll(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, result]);

  const fetchChallenge = () => {
    API.post('/adaptive-challenge', { subject })
      .then(res => {
        setQuestions(res.data.questions);
        setDifficulty(res.data.difficulty);
        setShowHints(res.data.showHints);
        setTimeLeft(res.data.timeLimit);
        setLoading(false);
      })
      .catch(err => { console.error(err); navigate('/subjects'); });
  };

  const handleNext = () => {
    if (!selected) return;
    const newAnswers = [...answers, { questionId: questions[current].id, answer: selected, responseTime: 0 }];
    setAnswers(newAnswers);
    setSelected(null);
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      submitChallenge(newAnswers);
    }
  };

  const handleSubmitAll = () => {
    const finalAnswers = [...answers];
    if (selected) finalAnswers.push({ questionId: questions[current]?.id, answer: selected, responseTime: 0 });
    submitChallenge(finalAnswers);
  };

  const submitChallenge = async (finalAnswers) => {
    try {
      const res = await API.post('/submit-challenge', { subject, answers: finalAnswers, difficulty });
      updateUser({ xp: res.data.totalXP, level: res.data.level });
      setResult(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getDifficultyLabel = (d) => {
    if (d === 1) return { text: 'Easy', color: 'badge-success', emoji: '🟢' };
    if (d === 2) return { text: 'Medium', color: 'badge-warning', emoji: '🟡' };
    return { text: 'Hard', color: 'badge-danger', emoji: '🔴' };
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div><p>Generating adaptive challenge...</p></div>;

  if (result) {
    return (
      <div className="animate-fade" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <div className="results-hero">
          <div style={{ fontSize: 64, marginBottom: 16 }}>⚡</div>
          <h2 style={{ fontSize: 28, fontWeight: 800 }}>Challenge Complete!</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, margin: '24px 0' }}>
            <div>
              <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--accent-primary-light)' }}>{result.accuracy}%</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Accuracy</div>
            </div>
            <div>
              <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--accent-gold)' }}>+{result.xpEarned}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>XP Earned</div>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{result.correct}/{result.total} correct • Level {result.level} ({result.levelTitle})</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => { setResult(null); setCurrent(0); setAnswers([]); setLoading(true); fetchChallenge(); }}>Next Challenge</button>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const diffInfo = getDifficultyLabel(difficulty);

  return (
    <div className="quiz-container animate-fade">
      <div className="quiz-header">
        <div className="quiz-progress-info">
          <span className={`badge ${diffInfo.color}`}>{diffInfo.emoji} {diffInfo.text} Difficulty</span>
          <span>Q{current + 1}/{questions.length}</span>
        </div>
        <div className={`quiz-timer ${timeLeft < 60 ? 'danger' : ''}`}>
          ⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {showHints && (
        <div style={{ padding: '12px 16px', background: 'rgba(255, 167, 38, 0.1)', border: '1px solid rgba(255, 167, 38, 0.3)', borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: 13 }}>
          💡 <strong>Hint:</strong> Take your time! Read each question carefully and eliminate wrong answers.
        </div>
      )}

      <div className="progress-bar" style={{ marginBottom: 24 }}>
        <div className="progress-fill" style={{ width: `${(current / questions.length) * 100}%` }}></div>
      </div>

      {q && (
        <div className="question-card">
          <div className="question-topic">{q.topic}</div>
          <div className="question-text">{q.question}</div>
          <div className="options-grid">
            {q.options.map((opt, i) => (
              <button key={i} className={`option-btn ${selected === opt ? 'selected' : ''}`} onClick={() => setSelected(opt)}>
                {String.fromCharCode(65 + i)}. {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={handleNext} disabled={!selected}>
          {current < questions.length - 1 ? 'Next →' : 'Submit ✓'}
        </button>
      </div>
    </div>
  );
}
