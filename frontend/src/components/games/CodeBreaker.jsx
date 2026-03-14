import { useState } from 'react';

export default function CodeBreakerGame({ onComplete }) {
  const [guess, setGuess] = useState('');
  const [logs, setLogs] = useState([]);
  const [secret] = useState('427');

  const handleGuess = (e) => {
    e.preventDefault();
    if (guess === secret) {
      onComplete(50);
    } else {
      let correctPos = 0;
      let correctNum = 0;
      for (let i = 0; i < 3; i++) {
        if (guess[i] === secret[i]) correctPos++;
        else if (secret.includes(guess[i])) correctNum++;
      }
      setLogs([...logs, { g: guess, msg: `${correctPos} proper, ${correctNum} wrong pos` }]);
      setGuess('');
      if (logs.length >= 4) onComplete(0);
    }
  };

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <h3>Code Breaker</h3>
      <p>Guess the 3-digit code (You have 5 tries)</p>
      <form onSubmit={handleGuess} style={{ margin: '20px 0' }}>
        <input type="text" maxLength={3} value={guess} onChange={e => setGuess(e.target.value)} className="form-input" style={{ width: 100, textAlign: 'center', fontSize: 24, letterSpacing: 5 }} />
        <button type="submit" className="btn btn-primary" style={{ marginLeft: 10 }}>Guess</button>
      </form>
      <div style={{ textAlign: 'left', maxWidth: 200, margin: '0 auto' }}>
        {logs.map((l, i) => <div key={i}><strong>{l.g}</strong>: {l.msg}</div>)}
      </div>
    </div>
  );
}
