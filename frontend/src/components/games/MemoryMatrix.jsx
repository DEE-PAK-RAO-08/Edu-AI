import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function MemoryMatrixGame({ onComplete }) {
  const [pattern, setPattern] = useState([]);
  const [userPattern, setUserPattern] = useState([]);
  const [showing, setShowing] = useState(true);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(3); // Number of active tiles

  useEffect(() => {
    generatePattern();
  }, [level]);

  const generatePattern = () => {
    const newPattern = [];
    while (newPattern.length < level) {
      const r = Math.floor(Math.random() * 9);
      if (!newPattern.includes(r)) newPattern.push(r);
    }
    setPattern(newPattern);
    setUserPattern([]);
    setShowing(true);

    setTimeout(() => {
      setShowing(false);
    }, 2000 + (level * 200));
  };

  const handleTileClick = (index) => {
    if (showing) return;
    
    const newUserPattern = [...userPattern, index];
    setUserPattern(newUserPattern);

    // Check if correct so far
    const isCorrect = newUserPattern.every((val, i) => pattern.includes(val));
    
    if (!isCorrect) {
      // Failed
      onComplete(score);
    } else if (newUserPattern.length === pattern.length) {
      // Success next level
      setScore(s => s + 20);
      if (level < 6) {
        setLevel(l => l + 1);
      } else {
        onComplete(score + 20);
      }
    }
  };

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <h3>Memory Matrix (Level {level - 2})</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
        {showing ? "Memorize the highlighted tiles!" : "Click the tiles you remember in any order!"}
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, maxWidth: 300, margin: '0 auto' }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => {
          const isHighlighted = showing && pattern.includes(i);
          const isSelectedCorrect = !showing && userPattern.includes(i) && pattern.includes(i);
          const isSelectedWrong = !showing && userPattern.includes(i) && !pattern.includes(i);

          return (
            <motion.div
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleTileClick(i)}
              style={{
                aspectRatio: '1',
                background: isHighlighted ? 'var(--accent-primary)' : isSelectedCorrect ? 'var(--accent-success)' : isSelectedWrong ? 'var(--accent-danger)' : 'var(--bg-input)',
                borderRadius: 8,
                cursor: showing ? 'default' : 'pointer',
                transition: 'background 0.3s'
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
