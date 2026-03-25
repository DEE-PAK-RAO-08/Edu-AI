import { useState, useEffect, useCallback } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';

const EVENTS = [
  { id: 1, event: 'First Moon Landing', year: 1969, icon: '🚀' },
  { id: 2, event: 'World War II Ends', year: 1945, icon: '🌍' },
  { id: 3, event: 'French Revolution Begins', year: 1789, icon: '⚔️' },
  { id: 4, event: 'Columbus Reaches Americas', year: 1492, icon: '⛵' },
  { id: 5, event: 'Magna Carta Signed', year: 1215, icon: '📜' },
  { id: 6, event: 'Fall of Roman Empire', year: 476, icon: '🏛️' },
  { id: 7, event: 'Gutenberg Bible Printed', year: 1455, icon: '📖' },
  { id: 8, event: 'Industrial Revolution Starts', year: 1760, icon: '⚙️' },
  { id: 9, event: 'First Airplane Flight', year: 1903, icon: '✈️' },
  { id: 10, event: 'Berlin Wall Falls', year: 1989, icon: '🧱' }
];

export default function TimelineSort({ onComplete }) {
  const [items, setItems] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const shuffled = [...EVENTS]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .sort(() => Math.random() - 0.5);
    setItems(shuffled);
  }, []);

  const handleCheck = () => {
    const isCorrect = items.every((item, index) => {
      if (index === 0) return true;
      return item.year >= items[index - 1].year;
    });

    setIsChecked(true);
    setResult(isCorrect);
    
    if (isCorrect) {
      setTimeout(() => onComplete(100), 2500);
    }
  };

  return (
    <div className="card" style={{ 
      textAlign: 'center', 
      padding: '30px',
      background: 'rgba(15, 23, 42, 0.9)',
      border: '1px solid rgba(251, 191, 36, 0.2)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background element */}
      <div style={{ position: 'absolute', top: -40, left: -40, fontSize: 130, opacity: 0.05, filter: 'grayscale(1)' }}>⏳</div>
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h3 style={{ fontSize: 24, fontWeight: 800, color: '#fbbf24', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span>📜</span> TIMELINE HISTORIAN
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 30, maxWidth: 350, margin: '0 auto 30px' }}>
          Drag the markers to arrange events in history from <b>earliest to latest</b>.
        </p>

        <Reorder.Group 
          axis="y" 
          values={items} 
          onReorder={setItems} 
          style={{ listStyle: 'none', padding: 0, margin: '0 auto 30px', maxWidth: 450 }}
        >
          {items.map((item) => (
            <Reorder.Item
              key={item.id}
              value={item}
              whileDrag={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 10 }}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '18px 24px',
                marginBottom: 12,
                cursor: isChecked ? 'default' : 'grab',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'border-color 0.3s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                <span style={{ fontSize: 24 }}>{item.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>{item.event}</span>
              </div>
              <AnimatePresence>
                {isChecked && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ 
                      fontSize: 14, 
                      color: '#fbbf24', 
                      fontWeight: 900,
                      background: 'rgba(251, 191, 36, 0.1)',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(251, 191, 36, 0.3)'
                    }}
                  >
                    {item.year}
                  </motion.div>
                )}
              </AnimatePresence>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        <AnimatePresence mode="wait">
          {!isChecked ? (
            <motion.button 
              key="check"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary" 
              onClick={handleCheck}
              style={{ padding: '14px 40px', fontSize: 16, fontWeight: 700, borderRadius: 12, border: 'none', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)' }}
            >
              VERIFY TIMELINE
            </motion.button>
          ) : (
            <motion.div 
              key="result"
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              style={{ padding: '10px' }}
            >
              {result ? (
                <div style={{ color: '#00e676', fontWeight: 900, fontSize: 22, letterSpacing: 1 }}>
                  ✨ CHRONOLOGY PERFECT +100 XP
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15 }}>
                  <div style={{ color: '#ef4444', fontWeight: 900, fontSize: 20 }}>
                     🏺 HISTORY IS OUT OF ORDER
                  </div>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => window.location.reload()}
                    style={{ padding: '10px 24px', fontWeight: 700, borderRadius: 10 }}
                  >
                    RETRY CHRONICLE
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

