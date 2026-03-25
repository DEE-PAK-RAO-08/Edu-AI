import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SHAPES = [
  { name: 'Circle', icon: '🔴', color: '#ff5252' },
  { name: 'Square', icon: '🟦', color: '#3498db' },
  { name: 'Triangle', icon: '🔺', color: '#00e676' },
  { name: 'Star', icon: '⭐', color: '#ffd700' },
  { name: 'Diamond', icon: '💎', color: '#9c27b0' }
];

export default function ShapeBuilderGame({ onComplete }) {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState(SHAPES[0]);
  const [options, setOptions] = useState(SHAPES.slice(0, 3).sort(() => Math.random() - 0.5));
  const [feedback, setFeedback] = useState(null);
  const totalRounds = 5;

  const generateNext = useCallback((currentRound) => {
    const nextTarget = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const otherOptions = SHAPES.filter(s => s.name !== nextTarget.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const allOptions = [...otherOptions, nextTarget].sort(() => Math.random() - 0.5);
    
    setTarget(nextTarget);
    setOptions(allOptions);
    setFeedback(null);
  }, []);

  const handleSelect = (shape) => {
    if (feedback) return;

    if (shape.name === target.name) {
      setScore(s => s + 15);
      setFeedback('✨ Brilliant!');
    } else {
      setFeedback('❌ Try again!');
    }

    setTimeout(() => {
      if (round < totalRounds - 1) {
        setRound(r => r + 1);
        generateNext(round + 1);
      } else {
        onComplete(score + (shape.name === target.name ? 15 : 0));
      }
    }, 1000);
  };

  return (
    <div className="card" style={{ 
      textAlign: 'center',
      background: 'rgba(30, 41, 59, 0.7)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <span className="badge badge-success">Match the Shape</span>
        <div style={{ display: 'flex', gap: 10 }}>
          <span className="badge badge-primary">Round {round + 1}/{totalRounds}</span>
          <span className="badge badge-gold">⚡ {score} XP</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={round}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Find the <span style={{ color: target.color }}>{target.name}</span></h2>
          <div style={{ 
            fontSize: 80, 
            margin: '20px 0', 
            filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.2))'
          }}>
            {target.icon}
          </div>
        </motion.div>
      </AnimatePresence>

      <div style={{ display: 'flex', gap: 15, justifyContent: 'center', marginTop: 30 }}>
        {options.map((shape, i) => (
          <motion.button 
            key={i} 
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="btn btn-ghost" 
            onClick={() => handleSelect(shape)}
            style={{ 
              fontSize: 60, 
              padding: 10,
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 16,
              border: feedback && shape.name === target.name ? '2px solid #00e676' : '1px solid transparent'
            }}
          >
            {shape.icon}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ 
              marginTop: 20, 
              fontSize: 20, 
              fontWeight: 800,
              color: feedback.includes('✨') ? '#00e676' : '#ff5252'
            }}
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

