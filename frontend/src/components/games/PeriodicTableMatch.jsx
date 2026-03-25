import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ELEMENTS = [
  { symbol: 'H', name: 'Hydrogen', atomicNumber: 1, category: 'nonmetal' },
  { symbol: 'He', name: 'Helium', atomicNumber: 2, category: 'noble' },
  { symbol: 'Li', name: 'Lithium', atomicNumber: 3, category: 'alkali' },
  { symbol: 'Be', name: 'Beryllium', atomicNumber: 4, category: 'alkaline' },
  { symbol: 'B', name: 'Boron', atomicNumber: 5, category: 'metalloid' },
  { symbol: 'C', name: 'Carbon', atomicNumber: 6, category: 'nonmetal' },
  { symbol: 'N', name: 'Nitrogen', atomicNumber: 7, category: 'nonmetal' },
  { symbol: 'O', name: 'Oxygen', atomicNumber: 8, category: 'nonmetal' },
  { symbol: 'F', name: 'Fluorine', atomicNumber: 9, category: 'halogen' },
  { symbol: 'Ne', name: 'Neon', atomicNumber: 10, category: 'noble' },
  { symbol: 'Au', name: 'Gold', atomicNumber: 79, category: 'transition' },
  { symbol: 'Ag', name: 'Silver', atomicNumber: 47, category: 'transition' },
  { symbol: 'Cu', name: 'Copper', atomicNumber: 29, category: 'transition' },
  { symbol: 'Fe', name: 'Iron', atomicNumber: 26, category: 'transition' },
  { symbol: 'U', name: 'Uranium', atomicNumber: 92, category: 'actinide' }
];

const CATEGORY_COLORS = {
  nonmetal: '#4ade80',
  noble: '#c084fc',
  alkali: '#fbbf24',
  alkaline: '#f87171',
  metalloid: '#60a5fa',
  transition: '#fb923c',
  halogen: '#2dd4bf',
  actinide: '#f472b6'
};

export default function PeriodicTableMatch({ onComplete }) {
  const [current, setCurrent] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selected, setSelected] = useState(null);
  const totalRounds = 8;

  const generateRound = useCallback(() => {
    const correct = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
    let opts = [correct];
    while (opts.length < 4) {
      const random = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
      if (!opts.find(o => o.symbol === random.symbol)) opts.push(random);
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
    setSelected(option.name);

    if (option.name === current.name) {
      setScore(s => s + 25);
      setFeedback('🧪 REACTION SUCCESSFUL!');
    } else {
      setFeedback(`⚠️ UNSTABLE: IT'S ${current.name.toUpperCase()}`);
    }

    setTimeout(() => {
      if (round < totalRounds - 1) {
        setRound(r => r + 1);
        generateRound();
      } else {
        onComplete(score + (option.name === current.name ? 25 : 0));
      }
    }, 1500);
  };

  if (!current) return null;

  return (
    <div className="card" style={{ 
      textAlign: 'center',
      background: 'rgba(15, 23, 42, 0.95)',
      border: '1px solid rgba(255,255,255,0.05)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'radial-gradient(circle, rgba(52, 152, 219, 0.1) 0%, transparent 70%)' }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <span className="badge badge-primary">ATOM {round + 1}/{totalRounds}</span>
        <span className="badge badge-gold">⚡ {score} XP</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={current.symbol}
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: -90, opacity: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          style={{
            width: 150,
            height: 150,
            margin: '0 auto 40px',
            background: '#09090b',
            border: `3px solid ${CATEGORY_COLORS[current.category]}`,
            borderRadius: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 30px ${CATEGORY_COLORS[current.category]}44`,
            position: 'relative'
          }}
        >
          <div style={{ position: 'absolute', top: 12, left: 15, fontSize: 16, fontWeight: 900, color: 'var(--text-secondary)', opacity: 0.6 }}>
            {current.atomicNumber}
          </div>
          <div style={{ fontSize: 64, fontWeight: 900, color: CATEGORY_COLORS[current.category] }}>
            {current.symbol}
          </div>
          <div style={{ position: 'absolute', bottom: 12, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.5 }}>
            {current.category}
          </div>
        </motion.div>
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, position: 'relative', zIndex: 1 }}>
        {options.map((opt, i) => (
          <motion.button
            key={i}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(opt)}
            disabled={!!selected}
            style={{
              padding: '16px',
              background: selected === opt.name ? (opt.name === current.name ? '#059669' : '#b91c1c') : 'rgba(255,255,255,0.03)',
              border: `1px solid ${selected === opt.name ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 14,
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              cursor: selected ? 'default' : 'pointer',
              transition: 'background 0.3s'
            }}
          >
            {opt.name}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              marginTop: 24, 
              fontSize: 14, 
              fontWeight: 900, 
              letterSpacing: 1.5,
              color: feedback.includes('SUCCESSFUL') ? '#4ade80' : '#f87171'
            }}
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

