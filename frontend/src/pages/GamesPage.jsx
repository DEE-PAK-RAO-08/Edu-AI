import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import API from '../api';
import { motion, AnimatePresence } from 'framer-motion';

// Import New Games
import CountingStarsGame from '../components/games/CountingStars';
import ShapeBuilderGame from '../components/games/ShapeBuilder';
import CodeBreakerGame from '../components/games/CodeBreaker';
import SpeedQuizGame from '../components/games/SpeedQuiz';
import WordPuzzleGame from '../components/games/WordPuzzle';
import MemoryMatrixGame from '../components/games/MemoryMatrix';
import PeriodicTableMatch from '../components/games/PeriodicTableMatch';
import CapitalCityMatch from '../components/games/CapitalCityMatch';
import AnatomyMatch from '../components/games/AnatomyMatch';
import TimelineSort from '../components/games/TimelineSort';



// ============================================
// ORIGINAL GAMES
// ============================================
// ============================================
// ORIGINAL GAMES (ENHANCED)
// ============================================
function MathPuzzleGame({ onComplete }) {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [problem, setProblem] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const totalRounds = 10;

  const generateProblem = useCallback(() => {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, correct;
    switch (op) {
      case '+': 
        a = Math.floor(Math.random() * 50) + 10; 
        b = Math.floor(Math.random() * 50) + 10; 
        correct = a + b; 
        break;
      case '-': 
        a = Math.floor(Math.random() * 50) + 30; 
        b = Math.floor(Math.random() * 30) + 1; 
        correct = a - b; 
        break;
      case '×': 
        a = Math.floor(Math.random() * 12) + 2; 
        b = Math.floor(Math.random() * 12) + 2; 
        correct = a * b; 
        break;
      default: a = 1; b = 1; correct = 2;
    }
    setProblem({ a, b, op, correct });
  }, []);

  useEffect(() => { generateProblem(); }, [generateProblem]);

  useEffect(() => {
    if (feedback) return;
    if (timeLeft <= 0) {
      onComplete(score);
      return;
    }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, score, onComplete, feedback]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!problem || feedback) return;
    const num = parseInt(answer);
    const isCorrect = num === problem.correct;
    
    if (isCorrect) {
      setScore(s => s + 10);
      setFeedback('✨ CORRECT!');
    } else {
      setFeedback(`❌ WRONG: ${problem.correct}`);
    }

    setTimeout(() => {
      setFeedback(null);
      setAnswer('');
      if (round < totalRounds - 1) {
        setRound(r => r + 1);
        setTimeLeft(30);
        generateProblem();
      } else {
        onComplete(score + (isCorrect ? 10 : 0));
      }
    }, 1000);
  };

  return (
    <div className="card" style={{ 
      textAlign: 'center', 
      background: 'rgba(15, 23, 42, 0.9)', 
      border: '1px solid rgba(139, 92, 246, 0.3)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, position: 'relative', zIndex: 1 }}>
        <span className="badge badge-primary">NUMBERS {round + 1}/{totalRounds}</span>
        <span className="badge badge-gold">⚡ {score} XP</span>
      </div>

      <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginBottom: 40 }}>
        <motion.div 
          animate={{ width: `${(timeLeft / 30) * 100}%` }}
          style={{ height: '100%', background: timeLeft < 10 ? '#ef4444' : '#3498db' }} 
        />
      </div>

      <AnimatePresence mode="wait">
        {problem && (
          <motion.div 
            key={round}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
          >
            <div style={{ 
              fontSize: 64, 
              fontWeight: 900, 
              marginBottom: 40, 
              letterSpacing: -2,
              background: 'linear-gradient(to bottom, #fff, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {problem.a} <span style={{ color: 'var(--accent-primary)', fontSize: 40 }}>{problem.op}</span> {problem.b}
            </div>

            <form onSubmit={handleSubmit} style={{ position: 'relative', maxWidth: 300, margin: '0 auto' }}>
              <input 
                type="number" 
                className="form-input" 
                style={{ width: '100%', textAlign: 'center', fontSize: 32, height: 70, borderRadius: 20, background: 'rgba(0,0,0,0.2)' }} 
                value={answer} 
                onChange={e => setAnswer(e.target.value)} 
                autoFocus 
                placeholder="?" 
                disabled={!!feedback}
              />
              <AnimatePresence>
                {feedback && (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ 
                      position: 'absolute', 
                      top: -40, 
                      left: 0, 
                      right: 0, 
                      fontWeight: 900, 
                      color: feedback.includes('✨') ? '#00e676' : '#ef4444' 
                    }}
                  >
                    {feedback}
                  </motion.div>
                )}
              </AnimatePresence>
              <button type="submit" className="btn btn-primary" style={{ marginTop: 20, width: '100%', height: 50, fontWeight: 700 }}>
                SUBMIT ANSWER
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LogicMazeGame({ onComplete }) {
  const [score, setScore] = useState(0);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  
  const questions = [
    { q: 'What comes next in the sequence: 2, 4, 8, 16, ?', options: ['24', '32', '30', '28'], answer: '32' },
    { q: 'A is taller than B, B is taller than C. Who is the shortest individual?', options: ['A', 'B', 'C', 'Cannot tell'], answer: 'C' },
    { q: 'If all bloops are blips, and all blips are blaps, are all bloops blaps?', options: ['Yes', 'No', 'Sometimes', 'Unknown'], answer: 'Yes' },
    { q: 'Which number is missing: 1, 4, 9, ?, 25', options: ['12', '16', '18', '20'], answer: '16' }
  ];

  const handleAnswer = (opt) => {
    setSelected(opt);
    const isCorrect = opt === questions[step].answer;
    if (isCorrect) setScore(s => s + 15);
    setFeedback(isCorrect ? '✅ LOGIC VERIFIED' : '❌ LOGIC ERROR');

    setTimeout(() => {
      setFeedback(null);
      setSelected(null);
      if (step < questions.length - 1) {
        setStep(s => s + 1);
      } else {
        onComplete(score + (isCorrect ? 15 : 0));
      }
    }, 1200);
  };

  return (
    <div className="card" style={{ 
      background: 'rgba(15, 23, 42, 0.9)', 
      border: '1px solid rgba(0, 210, 255, 0.2)',
      boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <span className="badge badge-primary">LOGIC {step + 1}/{questions.length}</span>
        <span className="badge badge-gold">⚡ {score} XP</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={step}
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -30, opacity: 0 }}
        >
          <div style={{ 
            fontSize: 22, 
            fontWeight: 700, 
            marginBottom: 30, 
            textAlign: 'center',
            lineHeight: 1.4,
            minHeight: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {questions[step].q}
          </div>

          <div className="options-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {questions[step].options.map((opt, i) => (
              <motion.button 
                key={i} 
                whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.08)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => !selected && handleAnswer(opt)} 
                disabled={!!selected}
                style={{
                  padding: '16px',
                  borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: selected === opt ? (opt === questions[step].answer ? '#059669' : '#b91c1c') : 'rgba(255,255,255,0.03)',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: selected ? 'default' : 'pointer',
                  transition: 'background 0.3s'
                }}
              >
                {opt}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 24, textAlign: 'center', fontWeight: 900, fontSize: 13, letterSpacing: 1.5, color: feedback.includes('✅') ? '#00e676' : '#ef4444' }}
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FractionMatchGame({ onComplete }) {
  const [score, setScore] = useState(0);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);

  useEffect(() => {
    const pairs = [
      { id: 1, text: '1/2', match: 1 }, { id: 2, text: '0.5', match: 1 },
      { id: 3, text: '1/4', match: 2 }, { id: 4, text: '0.25', match: 2 },
      { id: 5, text: '3/4', match: 3 }, { id: 6, text: '0.75', match: 3 },
      { id: 7, text: '1/5', match: 4 }, { id: 8, text: '0.2', match: 4 },
    ];
    setCards(pairs.sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setTimeout(() => onComplete(score), 800);
    }
  }, [matched, cards, score, onComplete]);

  const handleFlip = (card) => {
    if (flipped.length >= 2 || flipped.find(f => f.id === card.id) || matched.includes(card.id)) return;
    const newFlipped = [...flipped, card];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      if (newFlipped[0].match === newFlipped[1].match) {
        setMatched(p => [...p, newFlipped[0].id, newFlipped[1].id]);
        setScore(s => s + 20);
        setTimeout(() => setFlipped([]), 400);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div className="card" style={{ 
      background: 'rgba(15, 23, 42, 0.9)', 
      border: '1px solid rgba(0, 230, 118, 0.2)',
      boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <span className="badge badge-primary">EQUIVALENCE</span>
        <span className="badge badge-gold">⚡ {score} XP</span>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, maxWidth: 450, margin: '0 auto' }}>
        {cards.map(card => {
          const isFlipped = flipped.find(f => f.id === card.id);
          const isMatched = matched.includes(card.id);
          return (
            <motion.div 
              key={card.id} 
              whileHover={{ scale: isMatched ? 1 : 1.05 }} 
              whileTap={{ scale: isMatched ? 1 : 0.95 }} 
              onClick={() => handleFlip(card)} 
              style={{
                aspectRatio: '1', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: isMatched ? 'linear-gradient(135deg, #10b981, #059669)' : isFlipped ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isMatched ? 'transparent' : isFlipped ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 16, 
                cursor: isMatched ? 'default' : 'pointer', 
                fontSize: 18, 
                fontWeight: 800,
                color: (isFlipped || isMatched) ? '#fff' : 'transparent',
                boxShadow: (isFlipped || isMatched) ? '0 8px 15px rgba(0,0,0,0.3)' : 'none',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
            >
              {(isFlipped || isMatched) ? card.text : '?'}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}


// ============================================
// MAIN GAMES PAGE
// ============================================
export default function GamesPage() {
  const navigate = useNavigate();
  const { updateUser, addNotification } = useAuth();
  const { t } = useLanguage();
  const [activeGame, setActiveGame] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [ageFilter, setAgeFilter] = useState('all');

  const games = [
    { id: 'counting-stars', name: 'Counting Stars', icon: '⭐', color: 'rgba(255, 167, 38, 0.15)', description: 'Count the stars correctly.', reward: '+10 XP per round', subject: 'mathematics', age: 'children' },
    { id: 'shape-builder', name: 'Shape Match', icon: '🔺', color: 'rgba(0, 210, 255, 0.15)', description: 'Match the correct shapes.', reward: '+15 XP per match', subject: 'mathematics', age: 'children' },
    
    { id: 'code-breaker', name: 'Code Breaker', icon: '🔢', color: 'rgba(232, 67, 147, 0.15)', description: 'Crack the secret 3-digit code.', reward: '+50 XP per win', subject: 'computer-science', age: 'adults' },
    { id: 'speed-quiz', name: 'Speed Quiz', icon: '⏱️', color: 'rgba(255, 71, 87, 0.15)', description: 'Rapid fire questions.', reward: '+20 XP per correct', subject: 'general', age: 'adults' },
    
    { id: 'word-puzzle', name: 'Word Puzzle', icon: '🔠', color: 'rgba(0, 230, 118, 0.15)', description: 'Unscramble the science words.', reward: '+25 XP per word', subject: 'physics', age: 'all' },
    { id: 'memory-matrix', name: 'Memory Matrix', icon: '🔲', color: 'rgba(108, 92, 231, 0.15)', description: 'Memorize the pattern.', reward: '+20 XP per level', subject: 'general', age: 'all' },
    { id: 'periodic-table', name: 'Periodic Table Match', icon: '🧪', color: 'rgba(52, 152, 219, 0.15)', description: 'Identify elements by symbols.', reward: '+20 XP per match', subject: 'chemistry', age: 'all' },
    { id: 'capital-city', name: 'Capital City Match', icon: '🌍', color: 'rgba(255, 167, 38, 0.15)', description: 'Match countries to their capitals.', reward: '+20 XP per match', subject: 'geography', age: 'all' },
    { id: 'anatomy-match', name: 'Anatomy Match', icon: '🫁', color: 'rgba(232, 67, 147, 0.15)', description: 'Match organs to body systems.', reward: '+25 XP per match', subject: 'biology', age: 'all' },
    { id: 'timeline-sort', name: 'Timeline Historian', icon: '📜', color: 'rgba(108, 92, 231, 0.15)', description: 'Sort historical events by year.', reward: '+100 XP per win', subject: 'history', age: 'all' },


    { id: 'math-puzzle', name: 'Math Puzzle Rush', icon: '🧮', color: 'rgba(108, 92, 231, 0.15)', description: 'Solve math puzzles against the clock to earn XP!', reward: '+10 XP per answer', subject: 'mathematics', age: 'all' },

    { id: 'logic-maze', name: 'Logic Maze', icon: '🧩', color: 'rgba(0, 210, 255, 0.15)', description: 'Navigate through logic puzzles and brain teasers.', reward: '+15 XP per answer', subject: 'mathematics', age: 'adults' },
    { id: 'fraction-match', name: 'Fraction Match', icon: '🃏', color: 'rgba(0, 230, 118, 0.15)', description: 'Match fractions with their decimal equivalents.', reward: '+20 XP per match', subject: 'mathematics', age: 'all' }
  ];

  const handleGameComplete = async (score) => {
    const game = games.find(g => g.id === activeGame);
    try {
      const res = await API.post('/complete-game', {
        gameType: activeGame,
        subject: game.subject,
        score,
        timeTaken: 60
      });
      updateUser({ xp: res.data.totalXP, level: res.data.level });
      setGameResult({ score, ...res.data });

      addNotification({
        type: 'xp',
        icon: '🎮',
        title: 'Game Finished',
        message: `You earned +${res.data.xpEarned} XP from ${game.name}!`
      });
    } catch (err) {
      console.error(err);
      setGameResult({ score, xpEarned: 0 });
    }
  };

  const filteredGames = games.filter(g => ageFilter === 'all' ? true : g.age === ageFilter || g.age === 'all');

  if (gameResult) {
    return (
      <div className="animate-fade" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <motion.div
          className="results-hero"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div style={{ fontSize: 72, marginBottom: 16 }}>🎮</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Game Complete!</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-gold)' }}>{gameResult.score}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Score</div>
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-success)' }}>+{gameResult.xpEarned}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>XP Earned</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => { setGameResult(null); setActiveGame(null); }}>Play Again</button>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Dashboard</button>
          </div>
        </motion.div>
      </div>
    );
  }

  const renderActiveGame = () => {
    switch (activeGame) {
      case 'math-puzzle': return <div className="card"><MathPuzzleGame onComplete={handleGameComplete} /></div>;
      case 'logic-maze': return <LogicMazeGame onComplete={handleGameComplete} />;
      case 'fraction-match': return <div className="card"><FractionMatchGame onComplete={handleGameComplete} /></div>;
      case 'counting-stars': return <CountingStarsGame onComplete={handleGameComplete} />;
      case 'shape-builder': return <ShapeBuilderGame onComplete={handleGameComplete} />;
      case 'code-breaker': return <CodeBreakerGame onComplete={handleGameComplete} />;
      case 'speed-quiz': return <SpeedQuizGame onComplete={handleGameComplete} />;
      case 'word-puzzle': return <WordPuzzleGame onComplete={handleGameComplete} />;
      case 'memory-matrix': return <MemoryMatrixGame onComplete={handleGameComplete} />;
      case 'periodic-table': return <PeriodicTableMatch onComplete={handleGameComplete} />;
      case 'capital-city': return <CapitalCityMatch onComplete={handleGameComplete} />;
      case 'anatomy-match': return <AnatomyMatch onComplete={handleGameComplete} />;
      case 'timeline-sort': return <TimelineSort onComplete={handleGameComplete} />;
      default: return null;



    }
  };

  if (activeGame) {
    return (
      <div className="animate-fade" style={{ maxWidth: 700, margin: '0 auto' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setActiveGame(null)} style={{ marginBottom: 16 }}>← Back to Games</button>
        {renderActiveGame()}
      </div>
    )
  }

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>🎮 {t('games.title')}</h1>
          <p>{t('games.subtitle')}</p>
        </div>
        <select className="form-input" style={{ width: 150 }} value={ageFilter} onChange={e => setAgeFilter(e.target.value)}>
          <option value="all">All Ages</option>
          <option value="children">Children (Kids)</option>
          <option value="adults">Teens & Adults</option>
        </select>
      </div>
      
      <div className="grid-3" style={{ gap: '25px', padding: '10px' }}>
        {filteredGames.map((game, idx) => (
          <motion.div 
            key={game.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -8, scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
          >
            <div 
              className="game-card" 
              onClick={() => setActiveGame(game.id)}
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '24px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Highlight background */}
              <div style={{ 
                position: 'absolute', 
                top: '-20%', 
                left: '-20%', 
                width: '60%', 
                height: '60%', 
                background: game.color, 
                filter: 'blur(40px)', 
                opacity: 0.2,
                pointerEvents: 'none'
              }} />

              <div style={{ 
                width: 64, 
                height: 64, 
                background: game.color, 
                borderRadius: 18, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: 32, 
                marginBottom: 20,
                boxShadow: `0 8px 16px -4px ${game.color.replace('0.15', '0.4')}`
              }}>
                {game.icon}
              </div>

              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 10 }}>{game.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5, marginBottom: 20, flexGrow: 1 }}>{game.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-gold)' }}>🎁 {game.reward.split(' ')[0]} XP</span>
                <span className={`badge ${game.age === 'children' ? 'badge-success' : game.age === 'adults' ? 'badge-danger' : 'badge-primary'}`} style={{ fontSize: 10, padding: '4px 10px' }}>
                  {game.age === 'children' ? '👶 KIDS' : game.age === 'adults' ? '🧑 ADULTS' : '👨‍👩‍👧‍👦 ALL'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {filteredGames.length === 0 && <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No games found for this category.</p>}

    </div>
  );
}
