import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WORD_LIST = [
  'QUANTUM', 'GALAXY', 'NEUTRINO', 'PHOTON', 'ELEMENT', 'CELLULAR', 'GENETICS', 'ROBOTIC'
];

export default function WordPuzzleGame({ onComplete }) {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState(null);
  const totalRounds = 4;

  const scramble = (word) => word.split('').sort(() => 0.5 - Math.random()).join('');
  
  const [words] = useState(() => [...WORD_LIST].sort(() => Math.random() - 0.5).slice(0, totalRounds));
  const [scrambled, setScrambled] = useState(() => scramble(words[0]));

  const nextWord = useCallback((isCorrect) => {
    if (isCorrect) setScore(s => s + 25);
    setFeedback(isCorrect ? '🌟 Spot on!' : '❌ Not quite!');

    setTimeout(() => {
      setFeedback(null);
      if (current < totalRounds - 1) {
        const nextIdx = current + 1;
        setCurrent(nextIdx);
        setScrambled(scramble(words[nextIdx]));
        setGuess('');
      } else {
        onComplete(score + (isCorrect ? 25 : 0));
      }
    }, 1200);
  }, [current, score, words, onComplete]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (feedback) return;
    const isCorrect = guess.trim().toUpperCase() === words[current];
    nextWord(isCorrect);
  };

  return (
    <div className="card" style={{ 
      textAlign: 'center',
      background: 'rgba(15, 23, 42, 0.9)',
      border: '1px solid rgba(139, 92, 246, 0.2)',
      boxShadow: '0 0 30px rgba(139, 92, 246, 0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa' }}>Round {current + 1}/{totalRounds}</span>
        <span className="badge badge-gold">⚡ {score} XP</span>
      </div>

      <h3 style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 10 }}>Unscramble the science word!</h3>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '40px 0' }}>
        <AnimatePresence mode="popLayout">
          {scrambled.split('').map((char, i) => (
            <motion.div
              key={`${current}-${i}-${char}`}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: i * 0.05, type: 'spring' }}
              style={{
                width: 50,
                height: 60,
                background: 'var(--gradient-primary)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 800,
                color: '#fff',
                boxShadow: '0 8px 15px rgba(0,0,0,0.3)',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              {char}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <input 
          type="text" 
          value={guess} 
          onChange={e => setGuess(e.target.value)} 
          autoFocus 
          placeholder="Solve the puzzle..."
          disabled={!!feedback}
          className="form-input" 
          style={{ 
            width: '100%', 
            maxWidth: 300, 
            textAlign: 'center', 
            textTransform: 'uppercase', 
            fontSize: 22,
            height: 60,
            borderRadius: 16,
            background: 'rgba(255,255,255,0.03)',
            border: `2px solid ${feedback === '🌟 Spot on!' ? '#00e676' : feedback ? '#ef4444' : 'var(--border-color)'}`
          }} 
        />
        
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ 
                marginTop: 15, 
                fontSize: 18, 
                fontWeight: 800,
                color: feedback.includes('🌟') ? '#00e676' : '#ef4444'
              }}
            >
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit" 
          className="btn btn-primary" 
          style={{ 
            marginTop: 24, 
            padding: '14px 40px',
            fontSize: 16,
            fontWeight: 700,
            borderRadius: 12,
            boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)'
          }}
        >
          {current === totalRounds - 1 ? 'COMPELTE GAME' : 'NEXT PUZZLE'}
        </motion.button>
      </form>
    </div>
  );
}

