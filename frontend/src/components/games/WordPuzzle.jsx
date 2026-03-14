import { useState } from 'react';

export default function WordPuzzleGame({ onComplete }) {
  const [words] = useState(['SCIENCE', 'PHYSICS', 'GRAVITY']);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState('');

  const scramble = (word) => word.split('').sort(() => 0.5 - Math.random()).join('');
  const [scrambled, setScrambled] = useState(scramble(words[0]));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (guess.toUpperCase() === words[current]) {
      setScore(s => s + 25);
    }
    
    if (current < words.length - 1) {
      setCurrent(c => c + 1);
      setScrambled(scramble(words[current + 1]));
      setGuess('');
    } else {
      onComplete(score + (guess.toUpperCase() === words[current] ? 25 : 0));
    }
  };

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <h3>Unscramble the Science Word!</h3>
      <h1 style={{ letterSpacing: 8, fontSize: 40, margin: '30px 0', color: 'var(--accent-primary-light)' }}>{scrambled}</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" value={guess} onChange={e => setGuess(e.target.value)} autoFocus className="form-input" style={{ width: 250, textAlign: 'center', textTransform: 'uppercase', fontSize: 20 }} />
        <button type="submit" className="btn btn-primary" style={{ marginTop: 16, display: 'block', margin: '16px auto 0' }}>Submit</button>
      </form>
    </div>
  );
}
