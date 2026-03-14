import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../api';

export default function TestPage() {
  const { subject } = useParams();
  const [searchParams] = useSearchParams();
  const level = searchParams.get('level') || 'easy';
  const navigate = useNavigate();

  const [phase, setPhase] = useState('disclaimer'); // 'disclaimer', 'loading', 'active', 'submitting', 'terminated'
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600);

  const questionStartRef = useRef(Date.now());
  const timePerQuestionRef = useRef([]);
  const terminatedRef = useRef(false);

  // Anti-cheat Listeners
  useEffect(() => {
    if (phase !== 'active') return;

    const handleVisibilityChange = () => {
      if (document.hidden && !terminatedRef.current) {
        terminateExam('You switched tabs or minimized the browser.');
      }
    };

    const handleContextMenu = (e) => e.preventDefault();
    const handleCopyPaste = (e) => {
      e.preventDefault();
      // Optionally warn or terminate immediately. Let's terminate for strictly copying.
      if (!terminatedRef.current) {
        terminateExam('Copying/pasting is not allowed during the exam.');
      }
    };

    const handleBeforeUnload = (e) => {
      if (!terminatedRef.current) {
        const msg = 'Are you sure you want to leave? Your exam will be terminated.';
        e.returnValue = msg;
        return msg;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [phase]);

  const terminateExam = (reason) => {
    terminatedRef.current = true;
    setPhase('terminated');
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.log(err));
    }
  };

  const startExam = async () => {
    try {
      // Enter Fullscreen
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setPhase('loading');

      const res = await API.post('/start-test', { subject, level });
      setQuestions(res.data.questions);
      setTimeLeft(res.data.timeLimit);
      setPhase('active');
      questionStartRef.current = Date.now();
    } catch (err) {
      console.error(err);
      alert('Failed to start exam. Please try again.');
      navigate('/quizzes');
    }
  };

  useEffect(() => {
    if (phase !== 'active' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const submitTest = async (finalAnswers) => {
    setPhase('submitting');
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      const res = await API.post('/submit-test', {
        subject,
        answers: finalAnswers,
        timePerQuestion: timePerQuestionRef.current
      });
      navigate('/results', { state: { results: res.data, subject } });
    } catch (err) {
      console.error(err);
      alert('Error submitting test');
      navigate('/quizzes');
    }
  };

  const handleSubmit = useCallback(() => {
    const finalAnswers = [...answers];
    if (selected && questions[current]) {
      finalAnswers.push({
        questionId: questions[current].id,
        answer: selected,
        responseTime: Math.round((Date.now() - questionStartRef.current) / 1000)
      });
    }
    submitTest(finalAnswers);
  }, [answers, selected, current, questions]);

  const handleSelect = (option) => {
    setSelected(option);
  };

  const handleNext = () => {
    if (selected === null) return;
    const responseTime = Math.round((Date.now() - questionStartRef.current) / 1000);
    timePerQuestionRef.current.push(responseTime);

    const newAnswers = [...answers, {
      questionId: questions[current].id,
      answer: selected,
      responseTime
    }];
    setAnswers(newAnswers);
    setSelected(null);
    questionStartRef.current = Date.now();

    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      submitTest(newAnswers);
    }
  };

  if (phase === 'disclaimer') {
    return (
      <div className="quiz-container animate-fade" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="card" style={{ maxWidth: 650, width: '100%', padding: '48px 40px', borderRadius: '24px', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 80, height: 80, background: 'rgba(231, 76, 60, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <span style={{ fontSize: 40 }}>⚠️</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Important Exam Rules</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 12, fontSize: 16 }}>Please read the following rules before starting your assessment.</p>
          </div>
          <div style={{ background: 'rgba(231, 76, 60, 0.05)', border: '1px solid rgba(231, 76, 60, 0.2)', padding: '24px 32px', borderRadius: '16px', marginBottom: 40 }}>
            <h3 style={{ color: '#e74c3c', marginBottom: 20, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🛑</span> Strict Validation Active
            </h3>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16, lineHeight: 1.6 }}>
              <li style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: '#e74c3c', marginTop: 2 }}>•</span>
                <div><strong>Do NOT switch tabs or minimize the browser window.</strong> Doing so will immediately terminate your exam.</div>
              </li>
              <li style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: '#e74c3c', marginTop: 2 }}>•</span>
                <div><strong>Do NOT use any extensions or external materials.</strong> Coping/pasting is disabled and will terminate the exam.</div>
              </li>
              <li style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: '#e74c3c', marginTop: 2 }}>•</span>
                <div><strong>Do NOT refresh the page.</strong> Your progress will be lost and the exam will be terminated.</div>
              </li>
              <li style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: '#e74c3c', marginTop: 2 }}>•</span>
                <div>The exam will launch in <strong>Fullscreen Mode</strong> to prevent distractions.</div>
              </li>
            </ul>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 14, padding: '0 20px' }}>
              By clicking "Start Exam", you agree to abide by these rules. Violations will result in an immediate score of 0.
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
              <button className="btn btn-outline" style={{ flex: 1, padding: '16px' }} onClick={() => navigate('/quizzes')}>
                Go Back
              </button>
              <button className="btn btn-primary" style={{ flex: 2, padding: '16px', background: 'linear-gradient(135deg, #e74c3c, #c0392b)', border: 'none' }} onClick={startExam}>
                I Understand, Start Exam
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'terminated') {
    return (
      <div className="quiz-container animate-fade" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="card" style={{ maxWidth: 500, width: '100%', padding: '56px 40px', textAlign: 'center', borderRadius: '24px', background: 'var(--bg-secondary)', border: '1px solid rgba(231, 76, 60, 0.2)', boxShadow: '0 25px 50px -12px rgba(231, 76, 60, 0.15)' }}>
          <div style={{ width: 100, height: 100, background: 'rgba(231, 76, 60, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <span style={{ fontSize: 56 }}>🛑</span>
          </div>
          <h1 style={{ margin: '0 0 16px 0', color: '#e74c3c', fontSize: 32, fontWeight: 700 }}>Exam Terminated</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 40, lineHeight: 1.6, fontSize: 16 }}>
            A violation of the exam rules was detected (e.g. tab switching, losing focus, or refreshing). Your exam has been securely terminated and a score of 0 will be recorded.
          </p>
          <button className="btn btn-primary" style={{ padding: '16px 32px', fontSize: 16, background: 'linear-gradient(135deg, #e74c3c, #c0392b)', border: 'none', width: '100%' }} onClick={() => navigate('/quizzes')}>
            Return to Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'loading' || phase === 'submitting') {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>{phase === 'loading' ? 'Setting up secure environment...' : 'Analyzing your performance...'}</p>
      </div>
    );
  }

  const q = questions[current];
  const timerClass = timeLeft < 60 ? 'danger' : timeLeft < 180 ? 'warning' : '';

  return (
    <div className="quiz-container animate-fade" style={{ userSelect: 'none', maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
      <div className="quiz-header" style={{ background: 'var(--bg-secondary)', padding: '24px 32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}>
        <div className="quiz-progress-info" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ textTransform: 'capitalize', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>{subject.replace(/-/g, ' ')} <span style={{ opacity: 0.5, fontWeight: 400 }}>({level})</span></span>
          <span style={{ color: 'var(--text-secondary)' }}>•</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: 15, fontWeight: 500 }}>Question {current + 1} of {questions.length}</span>
        </div>
        <div className={`quiz-timer ${timerClass}`} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: 12, fontWeight: 600, fontSize: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
          ⏱️ {formatTime(timeLeft)}
        </div>
      </div>

      <div className="progress-bar" style={{ marginBottom: 40, height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
        <div className="progress-fill" style={{ width: `${((current) / questions.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', transition: 'width 0.3s ease' }}></div>
      </div>

      <div className="question-card" key={current} style={{ background: 'var(--bg-secondary)', padding: '48px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div className="question-number" style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Question {current + 1}</div>
          <div className="question-topic" style={{ background: 'rgba(52, 152, 219, 0.1)', color: '#3498db', padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{q.topic}</div>
        </div>

        <div className="question-text" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.5, marginBottom: 40, color: 'var(--text-primary)' }}>{q.question}</div>

        <div className="options-grid" style={{ display: 'grid', gap: 16 }}>
          {q.options.map((opt, i) => (
            <button
              key={i}
              className={`option-btn ${selected === opt ? 'selected' : ''}`}
              onClick={() => handleSelect(opt)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '20px 24px',
                background: selected === opt ? 'rgba(52, 152, 219, 0.1)' : 'rgba(255,255,255,0.03)',
                border: selected === opt ? '2px solid #3498db' : '2px solid rgba(255,255,255,0.05)',
                borderRadius: 16,
                fontSize: 16,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => { if (selected !== opt) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; } }}
              onMouseLeave={(e) => { if (selected !== opt) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; } }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: selected === opt ? '#3498db' : 'rgba(255,255,255,0.1)', color: selected === opt ? '#fff' : 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 16, fontWeight: 600, fontSize: 14 }}>
                {String.fromCharCode(65 + i)}
              </div>
              <span style={{ fontWeight: 500 }}>{opt}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={selected === null}
          style={{ padding: '16px 32px', fontSize: 16, borderRadius: 16, opacity: selected === null ? 0.5 : 1, transition: 'all 0.2s' }}
        >
          {current < questions.length - 1 ? 'Next Question →' : 'Submit Exam ✓'}
        </button>
      </div>
    </div>
  );
}
