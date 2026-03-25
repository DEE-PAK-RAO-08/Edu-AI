import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QUESTION_POOL = [
  { q: 'What is 5 × 7?', a: '35', subject: 'Math' },
  { q: 'Capital of France?', a: 'Paris', subject: 'Geography' },
  { q: 'H2O stands for?', a: 'Water', subject: 'Science' },
  { q: '8 + 15?', a: '23', subject: 'Math' },
  { q: 'Square root of 81?', a: '9', subject: 'Math' },
  { q: 'Largest planet?', a: 'Jupiter', subject: 'Science' },
  { q: 'Color of emerald?', a: 'Green', subject: 'General' },
  { q: 'What is 12 × 11?', a: '132', subject: 'Math' }
];

export default function SpeedQuizGame({ onComplete }) {
  const [questions] = useState(() => QUESTION_POOL.sort(() => Math.random() - 0.5).slice(0, 5));
  const [score, setScore] = useState(0);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [feedback, setFeedback] = useState(null);
  const [ansValue, setAnsValue] = useState('');
  const inputRef = useRef(null);
  const totalRounds = 5;

  useEffect(() => {
    if (feedback) return;

    if (timeLeft <= 0) {
      nextQuestion(false);
      return;
    }
    const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, feedback]);

  const nextQuestion = (isCorrect) => {
    if (isCorrect) setScore(s => s + 20);
    setFeedback(isCorrect ? '✅ Correct!' : '⏱️ Out of time!');

    setTimeout(() => {
      setFeedback(null);
      if (current < totalRounds - 1) {
        setCurrent(c => c + 1);
        setTimeLeft(10);
        setAnsValue('');
      } else {
        onComplete(score + (isCorrect ? 20 : 0));
      }
    }, 1000);
  };

  const handleAnswer = (e) => {
    e.preventDefault();
    if (feedback) return;
    const isCorrect = ansValue.trim().toLowerCase() === questions[current].a.toLowerCase();
    nextQuestion(isCorrect);
  };

  return (
    <div className="card" style={{ 
      textAlign: 'center',
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.1)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <span className="badge badge-primary" style={{ padding: '6px 12px' }}>QUESTION {current + 1}</span>
        <div style={{ display: 'flex', gap: 10 }}>
          <span className="badge badge-gold">⚡ {score} XP</span>
        </div>
      </div>

      {/* Timer Bar */}
      <div style={{ 
        width: '100%', 
        height: 8, 
        background: 'rgba(255,255,255,0.05)', 
        borderRadius: 4, 
        marginBottom: 30,
        overflow: 'hidden'
      }}>
        <motion.div 
          initial={{ width: '100%' }}
          animate={{ 
            width: `${(timeLeft / 10) * 100}%`,
            background: timeLeft <= 3 ? '#ef4444' : '#3498db'
          }}
          transition={{ duration: 1, ease: 'linear' }}
          style={{ height: '100%' }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={current}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          style={{ minHeight: 120 }}
        >
          <span style={{ 
            fontSize: 12, 
            textTransform: 'uppercase', 
            letterSpacing: 2, 
            color: 'var(--accent-primary)',
            fontWeight: 800
          }}>
            {questions[current].subject}
          </span>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginTop: 10, marginBottom: 30 }}>
            {questions[current].q}
          </h2>

          <form onSubmit={handleAnswer}>
            <div style={{ position: 'relative', maxWidth: 300, margin: '0 auto' }}>
              <input 
                ref={inputRef}
                type="text" 
                autoFocus 
                className="form-input" 
                value={ansValue}
                onChange={e => setAnsValue(e.target.value)}
                placeholder="Type your answer..."
                disabled={!!feedback}
                style={{ 
                  width: '100%', 
                  textAlign: 'center', 
                  fontSize: 20, 
                  height: 55, 
                  background: 'rgba(0,0,0,0.2)',
                  borderColor: feedback === '✅ Correct!' ? '#00e676' : feedback ? '#ef4444' : 'var(--border-color)',
                  transition: 'all 0.3s ease'
                }} 
              />
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                      position: 'absolute',
                      top: -40,
                      left: 0,
                      right: 0,
                      fontWeight: 800,
                      color: feedback.includes('✅') ? '#00e676' : '#ef4444',
                      fontSize: 18
                    }}
                  >
                    {feedback}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div style={{ marginTop: 24 }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={!!feedback}
                style={{ padding: '12px 30px', fontWeight: 700 }}
              >
                SUBMIT ANSWER
              </button>
            </div>
          </form>
        </motion.div>
      </AnimatePresence>

      {/* Decorative timer count */}
      <div style={{ 
        position: 'absolute', 
        top: 15, 
        left: '50%', 
        transform: 'translateX(-50%)',
        fontSize: 14,
        fontWeight: 800,
        color: timeLeft <= 3 ? '#ef4444' : 'var(--text-secondary)'
      }}>
        ⏱️ {timeLeft}s
      </div>
    </div>
  );
}

