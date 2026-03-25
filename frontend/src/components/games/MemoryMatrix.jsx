import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MemoryMatrixGame({ onComplete }) {
  const [pattern, setPattern] = useState([]);
  const [userPattern, setUserPattern] = useState([]);
  const [showing, setShowing] = useState(true);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(3);
  const [gridSize] = useState(3); // 3x3 grid
  const [feedback, setFeedback] = useState(null);

  const generatePattern = useCallback(() => {
    const newPattern = [];
    while (newPattern.length < level) {
      const r = Math.floor(Math.random() * (gridSize * gridSize));
      if (!newPattern.includes(r)) newPattern.push(r);
    }
    setPattern(newPattern);
    setUserPattern([]);
    setShowing(true);
    setFeedback(null);

    setTimeout(() => {
      setShowing(false);
    }, 1500 + (level * 300));
  }, [level, gridSize]);

  useEffect(() => {
    generatePattern();
  }, [generatePattern]);

  const handleTileClick = (index) => {
    if (showing || feedback || userPattern.includes(index)) return;
    
    const newUserPattern = [...userPattern, index];
    setUserPattern(newUserPattern);

    if (!pattern.includes(index)) {
      setFeedback('❌ WRONG TILE');
      setTimeout(() => onComplete(score), 1000);
    } else if (newUserPattern.length === pattern.length) {
      setScore(s => s + 20);
      setFeedback('✨ LEVEL COMPLETE');
      setTimeout(() => {
        if (level < 7) {
          setLevel(l => l + 1);
        } else {
          onComplete(score + 20);
        }
      }, 1000);
    }
  };

  return (
    <div className="card" style={{ 
      textAlign: 'center',
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(108, 92, 231, 0.3)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <span className="badge badge-primary">LEVEL {level - 2}</span>
        <span className="badge badge-gold">⚡ {score} XP</span>
      </div>

      <div style={{ marginBottom: 25 }}>
        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          {showing ? "Memorize the Matrix!" : "Recall the Pattern"}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {showing ? "Highlighted tiles will disappear soon..." : "Select all the tiles that were lit up."}
        </p>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`, 
        gap: 12, 
        maxWidth: 320, 
        margin: '0 auto',
        padding: '10px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
      }}>
        {Array.from({ length: gridSize * gridSize }).map((_, i) => {
          const isHighlighted = showing && pattern.includes(i);
          const isSelectedCorrect = !showing && userPattern.includes(i) && pattern.includes(i);
          const isSelectedWrong = !showing && userPattern.includes(i) && !pattern.includes(i);

          return (
            <motion.div
              key={i}
              whileHover={!showing && !feedback ? { scale: 1.05 } : {}}
              whileTap={!showing && !feedback ? { scale: 0.95 } : {}}
              onClick={() => handleTileClick(i)}
              style={{
                aspectRatio: '1',
                background: isHighlighted ? 'var(--accent-primary)' : isSelectedCorrect ? '#00e676' : isSelectedWrong ? '#ef4444' : 'rgba(255,255,255,0.08)',
                borderRadius: 12,
                cursor: showing || feedback ? 'default' : 'pointer',
                boxShadow: isHighlighted ? '0 0 20px var(--accent-primary)' : isSelectedCorrect ? '0 0 20px #00e676' : 'none',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
            >
              <AnimatePresence>
                {isSelectedCorrect && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}
                  >
                    ✓
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              marginTop: 24, 
              fontSize: 20, 
              fontWeight: 800,
              color: feedback.includes('✨') ? '#00e676' : '#ef4444',
              textTransform: 'uppercase',
              letterSpacing: 2
            }}
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

