import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ORGANS = [
  { part: 'Heart', system: 'Circulatory', icon: '❤️' },
  { part: 'Lungs', system: 'Respiratory', icon: '🫁' },
  { part: 'Brain', system: 'Nervous', icon: '🧠' },
  { part: 'Stomach', system: 'Digestive', icon: '🥣' },
  { part: 'Kidneys', system: 'Excretory', icon: '💧' },
  { part: 'Liver', system: 'Digestive', icon: '🛡️' },
  { part: 'Intestines', system: 'Digestive', icon: '➰' },
  { part: 'Spinal Cord', system: 'Nervous', icon: '🦴' },
  { part: 'Arteries', system: 'Circulatory', icon: '🔴' },
  { part: 'Trachea', system: 'Respiratory', icon: '🌬️' }
];

const SYSTEM_GEMS = {
  Circulatory: '#ef4444',
  Respiratory: '#60a5fa',
  Nervous: '#fbbf24',
  Digestive: '#fb923c',
  Excretory: '#34d399'
};

export default function AnatomyMatch({ onComplete }) {
  const [current, setCurrent] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selected, setSelected] = useState(null);
  const totalRounds = 8;

  const generateRound = useCallback(() => {
    const correct = ORGANS[Math.floor(Math.random() * ORGANS.length)];
    const allSystems = [...new Set(ORGANS.map(o => o.system))];
    let opts = [correct.system];
    
    while (opts.length < 4) {
      const random = allSystems[Math.floor(Math.random() * allSystems.length)];
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

    if (option === current.system) {
      setScore(s => s + 25);
      setFeedback('🩺 DIAGNOSIS CORRECT!');
    } else {
      setFeedback(`🏥 PART OF THE ${current.system.toUpperCase()} SYSTEM`);
    }

    setTimeout(() => {
      if (round < totalRounds - 1) {
        setRound(r => r + 1);
        generateRound();
      } else {
        onComplete(score + (option === current.system ? 25 : 0));
      }
    }, 1500);
  };

  if (!current) return null;

  return (
    <div className="card" style={{ 
      textAlign: 'center',
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(232, 67, 147, 0.2)',
      boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.7)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pulse */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 200 }}
      >
        🧬
      </motion.div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, position: 'relative', zIndex: 1 }}>
        <span className="badge" style={{ background: 'rgba(232, 67, 147, 0.1)', color: '#e84393' }}>ORGAN {round + 1}/{totalRounds}</span>
        <span className="badge badge-gold">⚡ {score} XP</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={current.part}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.2, opacity: 0 }}
          style={{ marginBottom: 40, position: 'relative', zIndex: 1 }}
        >
          <div style={{ fontSize: 80, marginBottom: 15, filter: 'drop-shadow(0 0 20px rgba(232, 67, 147, 0.3))' }}>
            {current.icon}
          </div>
          <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 3, color: 'var(--text-secondary)' }}>Assign the System</span>
          <h2 style={{ fontSize: 42, fontWeight: 900, margin: '8px 0', color: '#fff' }}>
            {current.part}
          </h2>
        </motion.div>
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, position: 'relative', zIndex: 1 }}>
        {options.map((opt, i) => (
          <motion.button
            key={i}
            whileHover={{ y: -5, background: 'rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(opt)}
            disabled={!!selected}
            style={{
              padding: '16px',
              background: selected === opt ? (opt === current.system ? '#059669' : '#b91c1c') : 'rgba(255,255,255,0.03)',
              border: `1px solid ${selected === opt ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 16,
              color: '#fff',
              fontSize: 16,
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
              fontSize: 14, 
              fontWeight: 900, 
              color: feedback.includes('CORRECT') ? '#4ade80' : '#f87171'
            }}
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

