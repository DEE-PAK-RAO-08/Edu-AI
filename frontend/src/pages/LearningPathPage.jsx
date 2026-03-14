import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function LearningPathPage() {
  const { subject } = useParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [pathData, setPathData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);

  useEffect(() => {
    fetchPath();
  }, [subject]);

  const fetchPath = () => {
    API.get(`/personalized-learning-path?subject=${subject}`)
      .then(res => { setPathData(res.data); setLoading(false); })
      .catch(err => {
        console.error(err);
        if (err.response?.status === 400) {
          navigate(`/test/${subject}`);
        }
        setLoading(false);
      });
  };

  const handleCompleteLesson = async (topic, level, lessonName) => {
    setCompleting(`${topic}-${level}-${lessonName}`);
    try {
      const res = await API.post('/complete-lesson', { subject, topic, level, lessonName });
      updateUser({ xp: res.data.totalXP, level: res.data.level });
      fetchPath();
    } catch (err) {
      console.error(err);
    }
    setCompleting(null);
  };

  if (loading) {
    return <div className="loading-page"><div className="spinner"></div><p>Loading learning path...</p></div>;
  }

  if (!pathData?.learningPath) {
    return (
      <div className="empty-state" style={{ marginTop: 80 }}>
        <div className="empty-icon">📚</div>
        <h3>No learning path yet</h3>
        <p>Complete an assessment first to generate your personalized path.</p>
        <button className="btn btn-primary" onClick={() => navigate(`/test/${subject}`)}>Take Assessment</button>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1>🗺️ Learning Path — <span style={{ textTransform: 'capitalize' }}>{subject?.replace('-', ' ')}</span></h1>
        <p>Complete lessons to unlock new levels and earn XP. Priority topics are highlighted in red.</p>
      </div>

      {pathData.learningPath.map((path, pathIdx) => (
        <div key={pathIdx} style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <h2 style={{ textTransform: 'capitalize', fontSize: 20, fontWeight: 700 }}>{path.topic}</h2>
            <span className={`badge ${path.priority === 'high' ? 'badge-danger' : 'badge-primary'}`}>
              {path.priority === 'high' ? '⚡ Priority' : '📘 Normal'}
            </span>
          </div>

          <div className="learning-path-timeline">
            {path.levels.map((level, levelIdx) => {
              const isLocked = levelIdx > 0 && !path.levels[levelIdx - 1].completed;
              return (
                <div key={levelIdx} className={`path-node ${level.completed ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <span className="badge badge-primary" style={{ marginRight: 8 }}>Level {level.level}</span>
                      <span style={{ fontWeight: 700, fontSize: 16 }}>{level.title}</span>
                    </div>
                    {level.completed ? (
                      <span className="badge badge-success">✅ Completed</span>
                    ) : isLocked ? (
                      <span className="badge badge-warning">🔒 Locked</span>
                    ) : (
                      <span className="badge badge-primary">📖 In Progress</span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>{level.description}</p>
                  
                  {/* Progress */}
                  <div className="progress-bar" style={{ marginBottom: 12 }}>
                    <div className="progress-fill" style={{ width: `${level.progress || 0}%` }}></div>
                  </div>

                  {/* Lessons */}
                  {!isLocked && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {level.lessons.map((lesson, lIdx) => {
                        const isCompleting = completing === `${path.topic}-${level.level}-${lesson}`;
                        return (
                          <button
                            key={lIdx}
                            className={`btn btn-sm ${level.completed ? 'btn-ghost' : 'btn-secondary'}`}
                            onClick={() => !level.completed && handleCompleteLesson(path.topic, level.level, lesson)}
                            disabled={level.completed || isCompleting}
                            style={{ fontSize: 12 }}
                          >
                            {isCompleting ? '⏳' : level.completed ? '✅' : '📖'} {lesson}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Bottom Actions */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button className="btn btn-primary" onClick={() => navigate(`/challenge/${subject}`)}>
          ⚡ Take Adaptive Challenge
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/games')}>
          🎮 Play Games
        </button>
      </div>
    </div>
  );
}
