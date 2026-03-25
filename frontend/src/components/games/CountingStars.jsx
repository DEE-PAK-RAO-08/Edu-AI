import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CountingStarsGame({ onComplete }) {
  const [stars, setStars] = useState([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const totalRounds = 5;

  useEffect(() => {
    generateStars();
  }, [round]);

  const generateStars = () => {
    const count = Math.floor(Math.random() * 5) + 3;
    setStars(Array.from({ length: count }).map((_, i) => ({ 
      id: Math.random(), 
      x: Math.random() * 80 + 10, 
      y: Math.random() * 80 + 10,
      size: Math.random() * 20 + 20,
      rotate: Math.random() * 360
    })));
  };

  const handleAnswer = (ans) => {
    if (feedback) return;
    
    if (ans === stars.length) {
      setScore(s => s + 10);
      setFeedback('✅ Awesome!');
    } else {
      setFeedback(`❌ It was ${stars.length}`);
    }

    setTimeout(() => {
      setFeedback(null);
      if (round < totalRounds - 1) {
        setRound(r => r + 1);
      } else {
        onComplete(score + (ans === stars.length ? 10 : 0));
      }
    }, 1200);
  };

  return (
    <div className="card" style={{ 
      textAlign: 'center', 
      background: 'rgba(15, 23, 42, 0.8)', 
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 215, 0, 0.2)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <span className="badge badge-primary">Round {round + 1}/{totalRounds}</span>
        <span className="badge badge-gold">⚡ {score} XP</span>
      </div>

      <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>How many stars are shining?</h3>
      
      <div style={{ 
        position: 'relative', 
        height: 250, 
        background: 'radial-gradient(circle at center, #1e1e3f 0%, #0b0b1a 100%)', 
        borderRadius: 20, 
        margin: '20px 0',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)'
      }}>
        <AnimatePresence mode="wait">
          <motion.div 
            key={round}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
          >
            {stars.map(star => (
              <motion.div 
                key={star.id} 
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  rotate: star.rotate, 
                  opacity: 1,
                  y: [0, -5, 0]
                }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 260, 
                  damping: 20,
                  y: { repeat: Infinity, duration: 2 + Math.random(), ease: "easeInOut" }
                }}
                style={{
                  position: 'absolute', 
                  left: `${star.x}%`, 
                  top: `${star.y}%`, 
                  fontSize: star.size,
                  filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))',
                  cursor: 'default'
                }}
              >
                ⭐
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.5, opacity: 0 }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 32,
                fontWeight: 800,
                color: feedback.includes('✅') ? '#00e676' : '#ff5252',
                zIndex: 10,
                textShadow: '0 0 20px rgba(0,0,0,0.5)'
              }}
            >
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {[3, 4, 5, 6, 7, 8].map(num => (
          <motion.button 
            key={num} 
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.9 }}
            className="btn"
            style={{ 
              width: 50, 
              height: 50, 
              borderRadius: '50%', 
              background: 'var(--bg-input)',
              border: '2px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: 18,
              fontWeight: 700,
              cursor: feedback ? 'default' : 'pointer',
              opacity: feedback ? 0.5 : 1
            }}
            onClick={() => handleAnswer(num)}
          >
            {num}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

