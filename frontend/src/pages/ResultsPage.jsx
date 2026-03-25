import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { results, subject } = location.state || {};

  if (!results) {
    return (
      <div className="empty-state" style={{ marginTop: 80 }}>
        <div className="empty-icon">📊</div>
        <h3>No results found</h3>
        <p>Take a test first to see your results.</p>
        <button className="btn btn-primary" onClick={() => navigate('/subjects')}>Take a Test</button>
      </div>
    );
  }

  const getScoreColor = (acc) => {
    if (acc >= 80) return 'var(--accent-success)';
    if (acc >= 50) return 'var(--accent-warning)';
    return 'var(--accent-danger)';
  };

  return (
    <div className="animate-fade" style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Results Hero */}
      <motion.div 
        className="results-hero"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="score-circle" style={{ borderColor: getScoreColor(results.accuracy) }}>
          <div className="score-value">{results.accuracy}%</div>
          <div className="score-label">Accuracy</div>
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          {results.accuracy >= 80 ? '🎉 Excellent!' : results.accuracy >= 50 ? '👍 Good Job!' : '💪 Keep Practicing!'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          You answered {results.correct} out of {results.total} questions correctly
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-gold)' }}>+{results.xpEarned}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>XP Earned</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-primary-light)' }}>Lv. {results.level}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{results.levelTitle}</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-secondary)' }}>{results.avgResponseTime}s</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Avg. Time</div>
          </div>
        </div>
      </motion.div>

      {/* AI Analysis */}
      {results.aiAnalysis && (
        <motion.div 
          className="card animate-fade-in" 
          style={{ marginBottom: 24, padding: 32, border: '1px solid var(--accent-primary)', position: 'relative', overflow: 'hidden' }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div style={{ position: 'absolute', top: 0, right: 0, padding: '8px 16px', background: 'var(--accent-primary)', color: '#fff', fontSize: 12, fontWeight: 700, borderRadius: '0 0 0 12px' }}>
            ✨ AI ANALYST
          </div>
          
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 32 }}>🧠</div>
            <div>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Intelligent Performance Report</h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                <span className={`badge ${results.aiAnalysis.status === 'Exceptional' ? 'badge-success' : results.aiAnalysis.status === 'Steady' ? 'badge-primary' : 'badge-danger'}`} style={{ fontSize: 10 }}>
                  {results.aiAnalysis.status}
                </span>
              </div>
            </div>
          </div>

          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: 24, fontStyle: 'italic' }}>
            "{results.aiAnalysis.summary}"
          </p>

          <div className="grid-2" style={{ gap: 24 }}>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-primary-light)', marginBottom: 12, textTransform: 'uppercase' }}>🔍 Behavioral Insights</h4>
              <ul style={{ paddingLeft: 20, margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                {results.aiAnalysis.insights.map((insight, i) => (
                  <li key={i} style={{ marginBottom: 8 }}>{insight}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-success)', marginBottom: 12, textTransform: 'uppercase' }}>🚀 Next Steps</h4>
              <ul style={{ paddingLeft: 20, margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                {results.aiAnalysis.recommendations.map((rec, i) => (
                  <li key={i} style={{ marginBottom: 8 }}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Topic Analysis */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16, fontWeight: 700, color: 'var(--accent-success)' }}>✅ Strong Areas</h3>
          {results.strongTopics.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {results.strongTopics.map((topic, i) => (
                <div key={i} className="topic-item">
                  <span className="topic-name">{topic}</span>
                  <span className="badge badge-success">Strong</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No strong areas detected yet</p>
          )}
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16, fontWeight: 700, color: 'var(--accent-danger)' }}>📝 Needs Improvement</h3>
          {results.weakTopics.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {results.weakTopics.map((topic, i) => (
                <div key={i} className="topic-item">
                  <span className="topic-name">{topic}</span>
                  <span className="badge badge-danger">Weak</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Great job! No weak areas detected.</p>
          )}
        </div>
      </div>

      {/* Topic Scores */}
      {results.topicScores && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>📊 Topic Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(results.topicScores).map(([topic, scores]) => {
              const topicAcc = scores.total > 0 ? Math.round((scores.correct / scores.total) * 100) : 0;
              return (
                <div key={topic}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{topic}</span>
                    <span style={{ color: getScoreColor(topicAcc) }}>{scores.correct}/{scores.total} ({topicAcc}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${topicAcc}%`, background: topicAcc >= 70 ? 'var(--gradient-success)' : topicAcc >= 50 ? 'var(--gradient-gold)' : 'var(--gradient-fire)' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Learning Path Preview */}
      {results.learningPath && results.learningPath.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>🗺️ Your Personalized Learning Path</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {results.learningPath.map((path, i) => (
              <div key={i} style={{ padding: 16, background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${path.priority === 'high' ? 'var(--accent-danger)' : 'var(--accent-primary)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{path.topic}</span>
                  <span className={`badge ${path.priority === 'high' ? 'badge-danger' : 'badge-primary'}`}>
                    {path.priority === 'high' ? '⚡ Priority' : 'Normal'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {path.levels.map((level, j) => (
                    <span key={j} className="badge badge-primary" style={{ fontSize: 11 }}>
                      Lv.{level.level}: {level.title}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={() => navigate(`/learning/${subject}`)}>
          Start Learning Path →
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/subjects')}>
          Try Another Subject
        </button>
        <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
          Dashboard
        </button>
      </div>
    </div>
  );
}
