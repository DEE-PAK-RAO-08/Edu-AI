import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import API from '../api';
import { motion } from 'framer-motion';

// Import New Games
import CountingStarsGame from '../components/games/CountingStars';
import ShapeBuilderGame from '../components/games/ShapeBuilder';
import CodeBreakerGame from '../components/games/CodeBreaker';
import SpeedQuizGame from '../components/games/SpeedQuiz';
import WordPuzzleGame from '../components/games/WordPuzzle';
import MemoryMatrixGame from '../components/games/MemoryMatrix';

// ============================================
// ORIGINAL GAMES
// ============================================
function MathPuzzleGame({ onComplete }) {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [problem, setProblem] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const totalRounds = 10;

  const generateProblem = useCallback(() => {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, correct;
    switch (op) {
      case '+': a = Math.floor(Math.random() * 50) + 10; b = Math.floor(Math.random() * 50) + 10; correct = a + b; break;
      case '-': a = Math.floor(Math.random() * 50) + 30; b = Math.floor(Math.random() * 30) + 1; correct = a - b; break;
      case '×': a = Math.floor(Math.random() * 12) + 2; b = Math.floor(Math.random() * 12) + 2; correct = a * b; break;
      default: a = 1; b = 1; correct = 2;
    }
    setProblem({ a, b, op, correct });
  }, []);

  useEffect(() => { generateProblem(); }, [generateProblem]);

  useEffect(() => {
    if (timeLeft <= 0 || round >= totalRounds) {
      onComplete(score);
      return;
    }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, round, score, onComplete]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!problem) return;
    const num = parseInt(answer);
    if (num === problem.correct) {
      setScore(s => s + 10);
      setFeedback('✅ Correct! +10 XP');
    } else {
      setFeedback(`❌ Wrong! Answer: ${problem.correct}`);
    }
    setAnswer('');
    setRound(r => r + 1);
    setTimeout(() => { setFeedback(''); generateProblem(); }, 800);
  };

  if (round >= totalRounds) return null;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <span className="badge badge-primary">Round {round + 1}/{totalRounds}</span>
        <span className="badge badge-gold">⚡ {score} XP</span>
        <span className={`badge ${timeLeft < 15 ? 'badge-danger' : 'badge-primary'}`}>⏱️ {timeLeft}s</span>
      </div>
      <div className="progress-bar" style={{ marginBottom: 24 }}>
        <div className="progress-fill" style={{ width: `${(round / totalRounds) * 100}%` }}></div>
      </div>
      {problem && (
        <div>
          <div style={{ fontSize: 48, fontWeight: 800, marginBottom: 24, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {problem.a} {problem.op} {problem.b} = ?
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <input type="number" className="form-input" style={{ width: 150, textAlign: 'center', fontSize: 20 }} value={answer} onChange={e => setAnswer(e.target.value)} autoFocus placeholder="?" />
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
          {feedback && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 16, fontSize: 18, fontWeight: 600 }}>{feedback}</motion.div>}
        </div>
      )}
    </div>
  );
}

function LogicMazeGame({ onComplete }) {
  const [score, setScore] = useState(0);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');
  
  const questions = [
    { q: 'What comes next: 2, 4, 8, 16, ?', options: ['24', '32', '30', '28'], answer: '32' },
    { q: 'A is taller than B, B is taller than C. Who is shortest?', options: ['A', 'B', 'C', 'Cannot tell'], answer: 'C' }
  ];

  const handleAnswer = (opt) => {
    setSelected(opt);
    if (opt === questions[step].answer) {
      setScore(s => s + 15);
      setFeedback('✅ Correct! +15 XP');
    } else {
      setFeedback(`❌ Answer: ${questions[step].answer}`);
    }
    setTimeout(() => {
      setFeedback('');
      setSelected(null);
      if (step < questions.length - 1) {
        setStep(s => s + 1);
      } else {
        onComplete(score + (opt === questions[step].answer ? 15 : 0));
      }
    }, 1000);
  };

  if (step >= questions.length) return null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <span className="badge badge-primary">🧩 Puzzle {step + 1}/{questions.length}</span>
        <span className="badge badge-gold">⚡ {score} XP</span>
      </div>
      <div className="progress-bar" style={{ marginBottom: 24 }}>
        <div className="progress-fill" style={{ width: `${(step / questions.length) * 100}%` }}></div>
      </div>
      <div className="question-card">
        <div className="question-text">{questions[step].q}</div>
        <div className="options-grid">
          {questions[step].options.map((opt, i) => (
            <button key={i} className={`option-btn ${selected === opt ? (opt === questions[step].answer ? 'correct' : 'incorrect') : ''}`} onClick={() => !selected && handleAnswer(opt)} disabled={!!selected}>{opt}</button>
          ))}
        </div>
        {feedback && <div style={{ marginTop: 16, fontSize: 16, fontWeight: 600, textAlign: 'center' }}>{feedback}</div>}
      </div>
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
    ];
    setCards(pairs.sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setTimeout(() => onComplete(score), 500);
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
        setTimeout(() => setFlipped([]), 300);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <span className="badge badge-primary">🃏 Match</span>
        <span className="badge badge-gold">⚡ {score} XP</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, maxWidth: 300, margin: '0 auto' }}>
        {cards.map(card => {
          const isFlipped = flipped.find(f => f.id === card.id);
          const isMatched = matched.includes(card.id);
          return (
            <motion.div key={card.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleFlip(card)} style={{
              aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isMatched ? 'rgba(0,230,118,0.2)' : isFlipped ? 'rgba(108,92,231,0.2)' : 'var(--bg-input)',
              border: `2px solid ${isMatched ? 'var(--accent-success)' : isFlipped ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-md)', cursor: isMatched ? 'default' : 'pointer', fontSize: 20, fontWeight: 700
            }}>
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
      
      <div className="grid-3 stagger-children">
        {filteredGames.map(game => (
          <motion.div key={game.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <div className="game-card" onClick={() => setActiveGame(game.id)}>
              <div className="game-icon" style={{ background: game.color }}>{game.icon}</div>
              <h3>{game.name}</h3>
              <p>{game.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <span className="reward" style={{ marginTop: 0 }}>{game.reward}</span>
                <span className={`badge ${game.age === 'children' ? 'badge-success' : game.age === 'adults' ? 'badge-danger' : 'badge-primary'}`}>
                  {game.age === 'children' ? '👶 Kids' : game.age === 'adults' ? '🧑 Adults' : '👨‍👩‍👧‍👦 All'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
        {filteredGames.length === 0 && <p>No games found for this age group.</p>}
      </div>
    </div>
  );
}
