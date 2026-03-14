import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const subjects = [
  {
    id: 'mathematics',
    name: 'Mathematics',
    icon: '📐',
    color: 'rgba(108, 92, 231, 0.15)',
    description: 'Arithmetic, Algebra, Geometry, Statistics',
    topics: 4
  },
  {
    id: 'physics',
    name: 'Physics',
    icon: '⚛️',
    color: 'rgba(0, 210, 255, 0.15)',
    description: 'Mechanics, Thermodynamics, Optics, Electricity',
    topics: 4
  },
  {
    id: 'computer-science',
    name: 'Computer Science',
    icon: '💻',
    color: 'rgba(0, 230, 118, 0.15)',
    description: 'Programming, Algorithms, Databases, Networking',
    topics: 4
  }
];

export default function SubjectSelection() {
  const navigate = useNavigate();

  const handleSelect = (subjectId) => {
    navigate(`/test/${subjectId}`);
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1>📚 Choose Your Subject</h1>
        <p>Select a subject to take your initial assessment and generate a personalized learning path.</p>
      </div>

      <div className="grid-3 stagger-children">
        {subjects.map((subject) => (
          <motion.div
            key={subject.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="subject-card" onClick={() => handleSelect(subject.id)}>
              <div className="subject-icon" style={{ background: subject.color }}>
                {subject.icon}
              </div>
              <h3>{subject.name}</h3>
              <p>{subject.description}</p>
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 12 }}>
                <span className="badge badge-primary">{subject.topics} Topics</span>
                <span className="badge badge-success">12 Questions</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 32, textAlign: 'center' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>How it works</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
          Take a timed assessment test with 12 questions across multiple topics. 
          The AI analyzes your performance to identify strengths and weaknesses, 
          then creates a personalized learning path just for you.
        </p>
      </div>
    </div>
  );
}
