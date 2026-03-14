import { useState } from 'react';

export default function ShapeBuilderGame({ onComplete }) {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const targetShape = ['Circle', 'Square', 'Triangle'][round % 3];

  const handleSelect = (shape) => {
    if (shape === targetShape) {
      setScore(s => s + 15);
    }
    if (round < 2) setRound(r => r + 1);
    else onComplete(score + (shape === targetShape ? 15 : 0));
  };

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <h3>Find the {targetShape}!</h3>
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', margin: '30px 0' }}>
        <button className="btn btn-ghost" onClick={() => handleSelect('Circle')} style={{ fontSize: 50 }}>🔴</button>
        <button className="btn btn-ghost" onClick={() => handleSelect('Square')} style={{ fontSize: 50 }}>🟦</button>
        <button className="btn btn-ghost" onClick={() => handleSelect('Triangle')} style={{ fontSize: 46 }}>🔺</button>
      </div>
    </div>
  );
}
