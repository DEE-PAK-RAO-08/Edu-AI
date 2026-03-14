import { useState, useEffect } from 'react';

export default function SpeedQuizGame({ onComplete }) {
  const [score, setScore] = useState(0);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  
  const questions = [
    { q: 'What is 5 × 7?', a: '35' },
    { q: 'Capital of France?', a: 'Paris' },
    { q: 'H2O stands for?', a: 'Water' },
    { q: '8 + 15?', a: '23' },
    { q: 'Square root of 81?', a: '9' }
  ];

  useEffect(() => {
    if (timeLeft <= 0) {
      if (current < questions.length - 1) setCurrent(c => c + 1);
      else onComplete(score);
    }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, current, score, onComplete, questions.length]);

  const handleAnswer = (e) => {
    e.preventDefault();
    const ans = e.target.elements.ans.value;
    if (ans.toLowerCase() === questions[current].a.toLowerCase()) setScore(s => s + 20);
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
      setTimeLeft(15);
      e.target.reset();
    } else {
      onComplete(score + (ans.toLowerCase() === questions[current].a.toLowerCase() ? 20 : 0));
    }
  };

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="badge badge-primary">Q{current + 1}/5</span>
        <span className="badge badge-danger">⏱️ {timeLeft}s</span>
      </div>
      <h2 style={{ margin: '30px 0', fontSize: 24 }}>{questions[current].q}</h2>
      <form onSubmit={handleAnswer}>
        <input type="text" name="ans" autoFocus className="form-input" style={{ width: 200, textAlign: 'center' }} />
        <button type="submit" className="btn btn-primary" style={{ marginLeft: 10 }}>Skip / Next</button>
      </form>
    </div>
  );
}
