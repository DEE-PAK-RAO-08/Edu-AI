import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CodeBreakerGame({ onComplete }) {
  const [guess, setGuess] = useState('');
  const [logs, setLogs] = useState([]);
  const [secret, setSecret] = useState('');
  const [attempts, setAttempts] = useState(6);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    // Generate random 3-digit secret
    const nums = '0123456789'.split('').sort(() => Math.random() - 0.5).slice(0, 3).join('');
    setSecret(nums);
  }, []);

  const handleBackspace = () => setGuess(prev => prev.slice(0, -1));
  const handleNumClick = (num) => {
    if (guess.length < 3) setGuess(prev => prev + num);
  };

  const checkGuess = (e) => {
    if (e) e.preventDefault();
    if (guess.length < 3) return;

    if (guess === secret) {
      setFeedback('🔓 SYSTEM CRACKED!');
      setTimeout(() => onComplete(100), 1500);
    } else {
      let correctPos = 0;
      let correctNum = 0;
      const secretArr = secret.split('');
      const guessArr = guess.split('');

      guessArr.forEach((char, i) => {
        if (char === secretArr[i]) {
          correctPos++;
        } else if (secretArr.includes(char)) {
          correctNum++;
        }
      });

      const newLog = { 
        g: guess, 
        pos: correctPos, 
        num: correctNum,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
      };
      
      setLogs([newLog, ...logs]);
      setAttempts(prev => prev - 1);
      setGuess('');

      if (attempts <= 1) {
        setFeedback(`🔒 LOCKOUT! CODE: ${secret}`);
        setTimeout(() => onComplete(0), 2000);
      }
    }
  };

  return (
    <div className="card" style={{ 
      textAlign: 'center',
      background: '#09090b',
      color: '#10b981',
      border: '1px solid #065f46',
      fontFamily: 'monospace',
      boxShadow: '0 0 40px rgba(16, 185, 129, 0.1) inset'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
        <span style={{ fontSize: 12, opacity: 0.7 }}>[ENCRYPTED_SIGNAL_DETECTED]</span>
        <span style={{ color: attempts <= 2 ? '#ef4444' : '#10b981', fontWeight: 800 }}>ATTEMPTS: {attempts}</span>
      </div>

      <h2 style={{ fontSize: 28, letterSpacing: 4, textShadow: '0 0 10px #10b981', marginBottom: 20 }}>BREAKER_v2.0</h2>

      <div style={{ 
        background: '#18181b', 
        padding: '24px', 
        borderRadius: '12px', 
        border: '1px solid #27272a',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 15 }}>
          {[0, 1, 2].map(i => (
            <motion.div 
              key={i}
              initial={{ scale: 0.9 }}
              animate={{ scale: guess[i] ? 1.1 : 1 }}
              style={{
                width: 50, height: 65,
                background: '#09090b',
                border: '1px solid #10b981',
                borderRadius: 8,
                fontSize: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: guess[i] ? '0 0 15px rgba(16, 185, 129, 0.4)' : 'none'
              }}
            >
              {guess[i] || '_'}
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, maxWidth: 220, margin: '0 auto 24px' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '✓'].map((val, i) => (
          <motion.button
            key={i}
            whileHover={{ background: '#064e3b', scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (val === 'C') handleBackspace();
              else if (val === '✓') checkGuess();
              else handleNumClick(val.toString());
            }}
            style={{
              height: 45,
              background: '#09090b',
              border: '1px solid #065f46',
              borderRadius: 6,
              color: val === '✓' ? '#10b981' : val === 'C' ? '#ef4444' : '#fff',
              fontSize: 18,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {val}
          </motion.button>
        ))}
      </div>

      <div style={{ textAlign: 'left', maxHeight: 150, overflowY: 'auto', paddingRight: 8 }} className="custom-scrollbar">
        <AnimatePresence>
          {feedback && <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ color: feedback.includes('🔓') ? '#10b981' : '#ef4444', fontWeight: 800, marginBottom: 10 }}>{feedback}</motion.div>}
          {logs.map((l, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ fontSize: 13, marginBottom: 4, display: 'flex', justifyContent: 'space-between', opacity: 1 - (i * 0.2) }}
            >
              <span>{l.time} &gt; TRY {l.g}</span>
              <span style={{ color: '#fbbf24' }}>[{l.pos} OK | {l.num} POS]</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

