import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function LearningStyleQuiz() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [scores, setScores] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const questions = [
    {
      q: "When learning something new, which approach feels most natural?",
      options: [
        { text: "Watching a demo or looking at infographics.", value: "visual", icon: "🎬" },
        { text: "Reading a detailed guide or taking notes.", value: "reading", icon: "📝" },
        { text: "Getting hands-on with a project immediately.", value: "practice", icon: "🛠️" }
      ]
    },
    {
      q: "If you're explaining a concept to a friend, you would:",
      options: [
        { text: "Sketch it out on a piece of paper.", value: "visual", icon: "✍️" },
        { text: "Write down the key bullet points.", value: "reading", icon: "📋" },
        { text: "Use physical objects or gestures to demonstrate.", value: "practice", icon: "🤝" }
      ]
    },
    {
      q: "What distracts you most when you are trying to study?",
      options: [
        { text: "Cluttered spaces or visual movements.", value: "visual", icon: "🧹" },
        { text: "Noise, talking, or loud music.", value: "reading", icon: "🔇" },
        { text: "An uncomfortable chair or being too still.", value: "practice", icon: "🪑" }
      ]
    },
    {
      q: "When you use a new app, how do you learn its features?",
      options: [
        { text: "I look for a 'tour' or video tutorial.", value: "visual", icon: "📽️" },
        { text: "I read the 'Help' or 'FAQ' documentation.", value: "reading", icon: "🔍" },
        { text: "I click on everything to see what happens.", value: "practice", icon: "🖱️" }
      ]
    },
    {
      q: "Which type of content stays in your memory longer?",
      options: [
        { text: "A colorful map or a striking image.", value: "visual", icon: "🗺️" },
        { text: "A powerful quote or a well-explained paragraph.", value: "reading", icon: "💡" },
        { text: "The feeling of successfully completing a task.", value: "practice", icon: "🏆" }
      ]
    },
    {
      q: "Your ideal classroom environment would have:",
      options: [
        { text: "Many posters, monitors, and visual aids.", value: "visual", icon: "📽️" },
        { text: "Quiet desks and a large library of books.", value: "reading", icon: "📚" },
        { text: "Work benches, labs, and interactive stations.", value: "practice", icon: "🧪" }
      ]
    },
    {
      q: "When you solve a puzzle, you tend to:",
      options: [
        { text: "Look for patterns and colors that match.", value: "visual", icon: "🧩" },
        { text: "Sort pieces by shape or logic in your mind.", value: "reading", icon: "🧠" },
        { text: "Just keep trying pieces until they fit.", value: "practice", icon: "🤚" }
      ]
    },
    {
      q: "How do you prefer to receive feedback?",
      options: [
        { text: "A chart or graph of my progress.", value: "visual", icon: "📊" },
        { text: "Written comments and suggestions.", value: "reading", icon: "🖋️" },
        { text: "A quick session to show me the corrections.", value: "practice", icon: "✨" }
      ]
    }
  ];

  const handleAnswer = async (value) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      setProcessing(true);
      // Artificial delay for "processing" feel
      setTimeout(async () => {
        try {
          const res = await API.post('/detect-learning-style', { answers: newAnswers });
          setScores(res.data.scores);
          setResult(res.data.learningStyle);
          updateUser({ learningStyle: res.data.learningStyle });
          setProcessing(false);
        } catch (err) {
          console.error(err);
          setProcessing(false);
        }
      }, 2000);
    }
  };

  if (processing) {
    return (
      <div className="animate-fade" style={{ maxWidth: 600, margin: '100px auto', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 24px', width: 60, height: 60, borderWidth: 6 }}></div>
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>Analyzing your profile...</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Our AI is calculating your personalized learning style.</p>
      </div>
    );
  }

  if (result) {
    const styleInfo = {
      visual: { icon: '👁️', title: 'Visual Learner', theme: 'var(--accent-secondary)', desc: 'You learn best by seeing. Diagrams, charts, and videos are your best friends. We will prioritize visual elements in your learning path.' },
      reading: { icon: '📖', title: 'Reading/Writing Learner', theme: 'var(--accent-primary)', desc: 'You absorb information best through text. We will provide detailed notes, articles, and written explanations for you.' },
      practice: { icon: '🔧', title: 'Kinesthetic/Practice Learner', theme: 'var(--accent-success)', desc: 'You learn by doing. Hands-on practice, interactive exercises, and real-world scenarios are the best way for you to grasp concepts.' }
    };

    const info = styleInfo[result];

    return (
      <div className="animate-fade" style={{ maxWidth: 700, margin: '40px auto' }}>
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="card"
          style={{ textAlign: 'center', padding: '48px 32px' }}
        >
          <div style={{ fontSize: 80, marginBottom: 24, filter: 'drop-shadow(0 0 20px rgba(108, 92, 231, 0.3))' }}>{info.icon}</div>
          <h2 style={{ fontSize: 36, fontWeight: 900, marginBottom: 16 }}>The results are in!</h2>
          <div style={{ display: 'inline-block', padding: '8px 24px', background: info.theme, color: 'white', borderRadius: 30, fontWeight: 800, fontSize: 18, marginBottom: 24 }}>
            {info.title.toUpperCase()}
          </div>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: 18, lineHeight: 1.7, marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
            {info.desc}
          </p>

          {/* Breakdown Chart */}
          {scores && (
            <div style={{ marginBottom: 48 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24 }}>Style Breakdown</h4>
              <div style={{ display: 'flex', gap: 12, height: 40, background: 'var(--bg-input)', borderRadius: 20, overflow: 'hidden', padding: 4 }}>
                <div style={{ width: `${scores.visual}%`, background: 'var(--accent-secondary)', height: '100%', transition: 'width 1s ease' }} className="tooltip" data-tooltip={`Visual: ${scores.visual}%`}></div>
                <div style={{ width: `${scores.reading}%`, background: 'var(--accent-primary)', height: '100%', transition: 'width 1s ease' }} className="tooltip" data-tooltip={`Reading: ${scores.reading}%`}></div>
                <div style={{ width: `${scores.practice}%`, background: 'var(--accent-success)', height: '100%', transition: 'width 1s ease' }} className="tooltip" data-tooltip={`Practice: ${scores.practice}%`}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, padding: '0 8px' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-secondary)' }}>👁️ {scores.visual}%</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-primary)' }}>📖 {scores.reading}%</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-success)' }}>🔧 {scores.practice}%</span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <button className="btn btn-primary" style={{ padding: '14px 28px' }} onClick={() => navigate('/dashboard')}>🎯 Start Learning</button>
            <button className="btn btn-secondary" style={{ padding: '14px 28px' }} onClick={() => { setResult(null); setCurrent(0); setAnswers([]); }}>🔄 Retake Quiz</button>
          </div>
        </motion.div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="animate-fade" style={{ maxWidth: 650, margin: '40px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Discover Your Learning Style
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Our personalized engines adapt to how YOU learn best.</p>
        
        <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="progress-bar" style={{ flex: 1, height: 8, background: 'var(--bg-input)', borderRadius: 4 }}>
            <motion.div 
              className="progress-fill" 
              initial={{ width: 0 }}
              animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
              style={{ height: '100%', background: 'var(--gradient-primary)', borderRadius: 4 }}
            ></motion.div>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-primary)', minWidth: 100 }}>
            Question {current + 1} of {questions.length}
          </span>
        </div>
      </div>

      <motion.div
        key={current}
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -30, opacity: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="card"
        style={{ padding: '40px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)' }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 40, textAlign: 'center', lineHeight: 1.4 }}>{q.q}</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {q.options.map((opt, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-secondary"
              style={{ 
                padding: '24px', fontSize: 17, textAlign: 'left', 
                fontWeight: 600, justifyContent: 'flex-start',
                background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', gap: 20
              }}
              onClick={() => handleAnswer(opt.value)}
            >
              <span style={{ fontSize: 24, padding: 12, background: 'var(--bg-secondary)', borderRadius: 12 }}>{opt.icon}</span>
              {opt.text}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
