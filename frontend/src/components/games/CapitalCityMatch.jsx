import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COUNTRIES = [
  { name: 'France', capital: 'Paris', emoji: '🇫🇷' },
  { name: 'Japan', capital: 'Tokyo', emoji: '🇯🇵' },
  { name: 'Brazil', capital: 'Brasília', emoji: '🇧🇷' },
  { name: 'Egypt', capital: 'Cairo', emoji: '🇪🇬' },
  { name: 'Australia', capital: 'Canberra', emoji: '🇦🇺' },
  { name: 'Canada', capital: 'Ottawa', emoji: '🇨🇦' },
  { name: 'Germany', capital: 'Berlin', emoji: '🇩🇪' },
  { name: 'India', capital: 'New Delhi', emoji: '🇮🇳' },
  { name: 'Italy', capital: 'Rome', emoji: '🇮🇹' },
  { name: 'South Korea', capital: 'Seoul', emoji: '🇰🇷' }
];

export default function CapitalCityMatch({ onComplete }) {
  const [score, setScore] = useState(0);
  const [current, setCurrent] = useState(null);
  const [options, setOptions] = useState([]);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selected, setSelected] = useState(null);
  const totalRounds = 8;

  const generateRound = useCallback(() => {
    const correct = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    let opts = [correct.capital];
    while (opts.length < 4) {
      const random = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)].capital;
      if (!opts.includes(random)) opts.push(random);
    }
    setCurrent(correct);
    setOptions(opts.sort(() => Math.random() - 0.5));
    setSelected(null);
    setFeedback(null);
  }, []);

  useEffect(() => {
    generateRound();
  }, [generateRound]);

  const handleSelect = (option) => {
    if (selected) return;
    setSelected(option);

    if (option === current.capital) {
      setScore(s => s + 20);
      setFeedback('✈️ JETSETTER! CORRECT!');
    } else {
      setFeedback(`📍 GUIDED TO ${current.capital.toUpperCase()}`);
    }

    setTimeout(() => {
      if (round < totalRounds - 1) {
        setRound(r => r + 1);
        generateRound();
      } else {
        onComplete(score + (option === current.capital ? 20 : 0));
      }
    }, 1500);
  };

  if (!current) return null;

  return (
    <div className="card" style={{ 
      textAlign: 'center',
      background: 'rgba(15, 25, 45, 0.9)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 167, 38, 0.2)',
      boxShadow: '0 25px 60px -15px rgba(0,0,0,0.6)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Compass */}
      <div style={{ position: 'absolute', bottom: -50, left: -50, fontSize: 160, opacity: 0.05, transform: 'rotate(-15deg)' }}>🧭</div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <span className="badge" style={{ background: 'rgba(255, 167, 38, 0.1)', color: '#ffa726' }}>DESTINATION {round + 1}/{totalRounds}</span>
        <span className="badge badge-gold">⚡ {score} XP</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={current.name}
          initial={{ y: 30, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -30, opacity: 0, scale: 1.1 }}
          style={{ marginBottom: 40 }}
        >
          <div style={{ fontSize: 64, marginBottom: 15 }}>{current.emoji}</div>
          <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 4, color: 'var(--text-secondary)' }}>Identify the Capital</span>
          <h2 style={{ 
            fontSize: 48, 
            fontWeight: 900, 
            margin: '10px 0', 
            background: 'linear-gradient(to bottom, #fff, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {current.name}
          </h2>
        </motion.div>
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
        {options.map((opt, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.03, background: 'rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSelect(opt)}
            disabled={!!selected}
            style={{
              padding: '18px',
              background: selected === opt ? (opt === current.capital ? '#ea580c' : '#b91c1c') : 'rgba(255,255,255,0.04)',
              border: `1px solid ${selected === opt ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 16,
              color: '#fff',
              fontSize: 17,
              fontWeight: 700,
              cursor: selected ? 'default' : 'pointer',
              transition: 'all 0.3s'
            }}
          >
            {opt}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              marginTop: 24, 
              fontSize: 15, 
              fontWeight: 800, 
              color: feedback.includes('JETSETTER') ? '#fbbf24' : '#ef4444'
            }}
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
