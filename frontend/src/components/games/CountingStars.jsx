import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CountingStarsGame({ onComplete }) {
  const [stars, setStars] = useState([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);

  useEffect(() => {
    generateStars();
  }, [round]);

  const generateStars = () => {
    const count = Math.floor(Math.random() * 5) + 3;
    setStars(Array.from({ length: count }).map((_, i) => ({ id: i, x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 })));
  };

  const handleAnswer = (ans) => {
    if (ans === stars.length) {
      setScore(s => s + 10);
      if (round < 4) setRound(r => r + 1);
      else onComplete(score + 10);
    } else {
      if (round < 4) setRound(r => r + 1);
      else onComplete(score);
    }
  };

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <h3>How many stars do you see?</h3>
      <div style={{ position: 'relative', height: 200, background: '#1a1a2e', borderRadius: 8, margin: '20px 0' }}>
        {stars.map(star => (
          <motion.div key={star.id} initial={{ scale: 0 }} animate={{ scale: 1 }} style={{
            position: 'absolute', left: `${star.x}%`, top: `${star.y}%`, fontSize: 30
          }}>⭐</motion.div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        {[3, 4, 5, 6, 7].map(num => (
          <button key={num} className="btn btn-secondary" onClick={() => handleAnswer(num)}>{num}</button>
        ))}
      </div>
    </div>
  );
}
