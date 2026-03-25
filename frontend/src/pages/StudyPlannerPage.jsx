import { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function StudyPlannerPage() {
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [completedTasks, setCompletedTasks] = useState(() => {
    const saved = localStorage.getItem('eduai_completed_tasks');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const res = await API.get('/ai-study-plan');
      setPlan(res.data.plan);
      if (res.data.plan.plan?.length > 0) {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const todayPlan = res.data.plan.plan.find(d => d.day === today);
        setSelectedDay(todayPlan || res.data.plan.plan[0]);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const toggleTask = (dayName, taskIdx) => {
    const key = `${dayName}_${taskIdx}`;
    setCompletedTasks(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('eduai_completed_tasks', JSON.stringify(updated));
      return updated;
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'learn': return '📖';
      case 'review': return '🔄';
      case 'practice': return '✏️';
      case 'quiz': return '📝';
      case 'game': return '🎮';
      default: return '📌';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'var(--accent-danger)';
      case 'medium': return 'var(--accent-gold)';
      case 'low': return 'var(--accent-success)';
      default: return 'var(--text-secondary)';
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div><p>AI is creating your study plan...</p></div>;

  const completedCount = selectedDay?.tasks?.filter((_, i) => completedTasks[`${selectedDay.day}_${i}`])?.length || 0;
  const totalTasks = selectedDay?.tasks?.length || 0;
  const progress = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h1>📅 AI Study Planner</h1>
        <p>{plan?.weeklyGoal || 'Your personalized study schedule'}</p>
      </div>

      {/* Weekly Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon gold">⏱️</div>
          <div className="stat-info"><h3>{plan?.dailyMinutes || 30} min</h3><p>Daily Goal</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">📊</div>
          <div className="stat-info"><h3>{Math.round(progress)}%</h3><p>Today's Progress</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info"><h3>{completedCount}/{totalTasks}</h3><p>Tasks Done</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon fire">🔥</div>
          <div className="stat-info"><h3>{user?.streak || 0}</h3><p>Day Streak</p></div>
        </div>
      </div>

      {/* Day Selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
        {plan?.plan?.map(day => {
          const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          const isToday = day.day === today;
          const dayComplete = day.tasks?.every((_, i) => completedTasks[`${day.day}_${i}`]);
          return (
            <button key={day.day} className={`btn ${selectedDay?.day === day.day ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setSelectedDay(day)} style={{ borderRadius: 16, whiteSpace: 'nowrap', position: 'relative' }}>
              {dayComplete && <span style={{ position: 'absolute', top: -4, right: -4, fontSize: 12 }}>✅</span>}
              {isToday ? `📍 ${day.day}` : day.day}
            </button>
          );
        })}
      </div>

      {/* Today's Progress Bar */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontWeight: 700 }}>{selectedDay?.day}'s Progress</span>
          <span className="badge badge-gold">{completedCount}/{totalTasks} completed</span>
        </div>
        <div className="progress-bar progress-bar-lg progress-bar-gold">
          <div className="progress-fill" style={{ width: `${progress}%`, transition: 'width 0.5s ease' }}></div>
        </div>
      </div>

      {/* Tasks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        {selectedDay?.tasks?.map((task, i) => {
          const isComplete = completedTasks[`${selectedDay.day}_${i}`];
          return (
            <div key={i} className="card" onClick={() => toggleTask(selectedDay.day, i)}
              style={{ cursor: 'pointer', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, opacity: isComplete ? 0.6 : 1, transition: 'all 0.3s ease', border: `1px solid ${isComplete ? 'var(--accent-success)' : 'var(--border-color)'}` }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, border: `2px solid ${isComplete ? 'var(--accent-success)' : 'var(--border-color)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isComplete ? 'var(--accent-success)' : 'transparent', color: '#fff', fontSize: 14, flexShrink: 0, transition: 'all 0.3s ease' }}>
                {isComplete && '✓'}
              </div>
              <div style={{ fontSize: 28 }}>{getTypeIcon(task.type)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, textTransform: 'capitalize', textDecoration: isComplete ? 'line-through' : 'none' }}>
                  {task.topic.replace(/-/g, ' ')}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                  <span style={{ textTransform: 'capitalize' }}>{task.subject}</span> • {task.type} • {task.duration} min
                </div>
              </div>
              <div className="badge" style={{ background: `${getPriorityColor(task.priority)}22`, color: getPriorityColor(task.priority), fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>
                {task.priority}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Tips */}
      {plan?.tips && (
        <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--accent-primary)', borderRadius: 16 }}>
          <h3 style={{ marginBottom: 16, fontWeight: 800 }}>💡 AI Tips For You</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {plan.tips.map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>•</span>
                <span style={{ fontSize: 14, lineHeight: 1.5 }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regenerate Button */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button className="btn btn-secondary" onClick={fetchPlan} style={{ borderRadius: 24 }}>
          🔄 Generate New Plan
        </button>
      </div>
    </div>
  );
}
