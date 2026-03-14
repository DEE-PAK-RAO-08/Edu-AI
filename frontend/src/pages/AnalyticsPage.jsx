import { useState, useEffect, useRef } from 'react';
import API from '../api';
import { useLanguage } from '../context/LanguageContext';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const accuracyChartRef = useRef(null);
  const subjectChartRef = useRef(null);
  const chartInstances = useRef([]);
  const { t } = useLanguage();

  useEffect(() => {
    API.get('/performance-report')
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!data) return;
    // Cleanup old charts
    chartInstances.current.forEach(c => c.destroy());
    chartInstances.current = [];

    // Accuracy over time chart
    if (accuracyChartRef.current && data?.logs?.length > 0) {
      try {
        const ctx = accuracyChartRef.current.getContext('2d');
        const sorted = [...data.logs].reverse().slice(-10);
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(108, 92, 231, 0.4)');
        gradient.addColorStop(1, 'rgba(108, 92, 231, 0.0)');

        const chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: sorted.map((l, i) => `Test ${i + 1}`),
            datasets: [{
              label: t('analytics.accuracy') || 'Accuracy %',
              data: sorted.map(l => l.accuracy),
              borderColor: '#6c5ce7',
              backgroundColor: gradient,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#6c5ce7',
              pointBorderColor: '#fff',
              pointHoverRadius: 8,
              pointRadius: 6,
              borderWidth: 3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { top: 20, bottom: 20, left: 10, right: 30 } },
            plugins: { 
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(26, 31, 53, 0.9)',
                titleColor: '#fff',
                bodyColor: '#94a3c8',
                padding: 12,
                displayColors: false
              }
            },
            scales: {
              y: { 
                min: 0, 
                max: 100, 
                ticks: { color: '#5a6687', stepSize: 20 }, 
                grid: { color: 'rgba(108, 92, 231, 0.05)' } 
              },
              x: { 
                ticks: { color: '#5a6687' }, 
                grid: { display: false } 
              }
            }
          }
        });
        chartInstances.current.push(chart);
      } catch (err) { console.error('Error creating accuracy chart:', err); }
    }

    // Subject performance chart
    if (subjectChartRef.current && data?.subjectStats && Object.keys(data.subjectStats).length > 0) {
      try {
        const ctx = subjectChartRef.current.getContext('2d');
        const subjects = Object.keys(data.subjectStats);
        
        // Create premium gradients for bars
        const getGradient = (color1, color2) => {
          const g = ctx.createLinearGradient(0, 300, 0, 0);
          g.addColorStop(0, color1);
          g.addColorStop(1, color2);
          return g;
        };

        const chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: subjects.map(s => s.replace('-', ' ').toUpperCase()),
            datasets: [{
              label: t('analytics.avgAccuracy') || 'Avg Accuracy %',
              data: subjects.map(s => data.subjectStats[s].avgAccuracy),
              backgroundColor: [
                getGradient('rgba(108, 92, 231, 0.2)', 'rgba(108, 92, 231, 0.8)'),
                getGradient('rgba(0, 210, 255, 0.2)', 'rgba(0, 210, 255, 0.8)'),
                getGradient('rgba(0, 230, 118, 0.2)', 'rgba(0, 230, 118, 0.8)'),
                getGradient('rgba(255, 167, 38, 0.2)', 'rgba(255, 167, 38, 0.8)')
              ],
              borderColor: ['#6c5ce7', '#00d2ff', '#00e676', '#ffa726'],
              borderWidth: 1.5,
              borderRadius: { topLeft: 12, topRight: 12, bottomLeft: 4, bottomRight: 4 },
              borderSkipped: false,
              hoverBackgroundColor: ['#6c5ce7', '#00d2ff', '#00e676', '#ffa726'],
              barPercentage: 0.6,
              categoryPercentage: 0.7
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { top: 30, bottom: 40, left: 10, right: 20 } },
            plugins: { 
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(26, 31, 53, 0.95)',
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                padding: 12,
                cornerRadius: 10,
                displayColors: true,
                callbacks: {
                  label: (context) => ` ${context.parsed.y}% Alignment`
                }
              }
            },
            animations: {
              y: { duration: 2000, easing: 'easeOutElastic' }
            },
            scales: {
              y: { 
                min: 0, 
                max: 100, 
                ticks: { 
                  color: '#94a3c8',
                  font: { size: 11, weight: '600' },
                  callback: (value) => value + '%'
                }, 
                grid: { 
                  color: 'rgba(148, 163, 200, 0.05)',
                  drawBorder: false
                } 
              },
              x: { 
                ticks: { 
                  color: '#94a3c8',
                  font: { size: 9, weight: '700' },
                  maxRotation: 45,
                  minRotation: 45,
                  autoSkip: false
                }, 
                grid: { display: false } 
              }
            }
          }
        });
        chartInstances.current.push(chart);
      } catch (err) { console.error('Error creating subject chart:', err); }
    }

    return () => {
      chartInstances.current.forEach(c => c.destroy());
      chartInstances.current = [];
    };
  }, [data]);

  if (loading) return <div className="loading-page"><div className="spinner"></div><p>{t('analytics.loadingAnalytics') || 'Loading analytics...'}</p></div>;

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>📊 {t('analytics.title') || 'Performance Analytics'}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>{t('analytics.subtitle') || 'Track your progress and identify areas for improvement.'}</p>
      </div>

      {/* Summary Stats */}
      {data && (
        <div className="stats-grid" style={{ marginBottom: 40, gap: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <div className="stat-card" style={{ padding: 28, background: 'var(--bg-card)', borderRadius: 20, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
            <div className="stat-icon purple" style={{ width: 50, height: 50, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(108, 92, 231, 0.1)', borderRadius: 12, marginBottom: 16 }}>📝</div>
            <div className="stat-info">
              <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{data.logs?.length || 0}</h3>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('analytics.testsTaken') || 'Tests Taken'}</p>
            </div>
          </div>
          <div className="stat-card" style={{ padding: 24, background: 'var(--bg-card)', borderRadius: 16 }}>
            <div className="stat-icon blue" style={{ width: 50, height: 50, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 210, 255, 0.1)', borderRadius: 12, marginBottom: 16 }}>🎯</div>
            <div className="stat-info">
              <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{data.logs?.length > 0 ? Math.round(data.logs.reduce((s, l) => s + l.accuracy, 0) / data.logs.length) : 0}%</h3>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('analytics.avgAccuracy') || 'Avg Accuracy'}</p>
            </div>
          </div>
          <div className="stat-card" style={{ padding: 24, background: 'var(--bg-card)', borderRadius: 16 }}>
            <div className="stat-icon gold" style={{ width: 50, height: 50, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 215, 0, 0.1)', borderRadius: 12, marginBottom: 16 }}>⚡</div>
            <div className="stat-info">
              <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{(data.student?.xp || 0).toLocaleString()}</h3>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('analytics.totalXP') || 'Total XP'}</p>
            </div>
          </div>
          <div className="stat-card" style={{ padding: 24, background: 'var(--bg-card)', borderRadius: 16 }}>
            <div className="stat-icon green" style={{ width: 50, height: 50, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 230, 118, 0.1)', borderRadius: 12, marginBottom: 16 }}>📚</div>
            <div className="stat-info">
              <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{Object.keys(data.subjectStats || {}).length}</h3>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('analytics.subjectsStudied') || 'Subjects Studied'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Insights */}
      {data?.subjectStats && Object.keys(data.subjectStats).length > 0 && (
        <div className="grid-3" style={{ marginBottom: 40, gap: 24 }}>
          {(() => {
            const subjects = Object.entries(data.subjectStats);
            const strongest = subjects.reduce((a, b) => a[1].avgAccuracy > b[1].avgAccuracy ? a : b);
            const weakest = subjects.reduce((a, b) => a[1].avgAccuracy < b[1].avgAccuracy ? a : b);
            
            const sortedLogs = [...(data.logs || [])].sort((a,b) => new Date(a.completedAt) - new Date(b.completedAt));
            const firstAcc = sortedLogs[0]?.accuracy || 0;
            const lastAcc = sortedLogs[sortedLogs.length-1]?.accuracy || 0;
            const improvement = lastAcc - firstAcc;

            return (
              <>
                <div className="card" style={{ borderLeft: '6px solid var(--accent-success)', padding: 28, borderRadius: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Strongest Area</div>
                  <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 6 }}>{strongest[0].toUpperCase()}</div>
                  <div style={{ fontSize: 16, color: 'var(--accent-success)', fontWeight: 800 }}>{strongest[1].avgAccuracy}% Mastery</div>
                </div>
                <div className="card" style={{ borderLeft: '6px solid var(--accent-danger)', padding: 28, borderRadius: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Focus Needed</div>
                  <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 6 }}>{weakest[0].toUpperCase()}</div>
                  <div style={{ fontSize: 16, color: 'var(--accent-danger)', fontWeight: 800 }}>{weakest[1].avgAccuracy}% Accuracy</div>
                </div>
                <div className="card" style={{ borderLeft: '6px solid var(--accent-secondary)', padding: 28, borderRadius: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Progress Rate</div>
                  <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 6 }}>{improvement > 0 ? '+' : ''}{improvement}%</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>Performance Growth</div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: 32, gap: 24 }}>
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontWeight: 800, fontSize: 18 }}>📈 {t('analytics.accuracyOverTime') || 'Accuracy Trend'}</h3>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.1em' }}>LAST 10 TESTS</span>
          </div>
          <div style={{ height: 320, position: 'relative' }}>
            <canvas ref={accuracyChartRef}></canvas>
          </div>
        </div>
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontWeight: 800, fontSize: 18 }}>📊 {t('analytics.subjectPerformance') || 'Subject Mastery'}</h3>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.1em' }}>OVERALL AVG</span>
          </div>
          <div style={{ height: 320, position: 'relative' }}>
            <canvas ref={subjectChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Recent Tests Table */}
      <div className="card" style={{ padding: 24, overflow: 'hidden' }}>
        <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 24 }}>🕐 {t('analytics.recentTests') || 'Recent Activity'}</h3>
        {data?.logs?.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="leaderboard-table" style={{ width: '100%', borderSpacing: '0 8px', borderCollapse: 'separate' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: 12, fontWeight: 800, letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0 16px 12px' }}>SUBJECT</th>
                  <th style={{ padding: '0 16px 12px' }}>DATE</th>
                  <th style={{ padding: '0 16px 12px' }}>SCORE</th>
                  <th style={{ padding: '0 16px 12px' }}>ACCURACY</th>
                  <th style={{ padding: '0 16px 12px' }}>REWARD</th>
                </tr>
              </thead>
              <tbody>
                {data.logs.slice(0, 8).map((log, i) => (
                  <tr key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
                    <td style={{ padding: 16, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 20 }}>{log.testType === 'assessment' ? '📝' : log.testType === 'challenge' ? '⚡' : '🎮'}</span>
                        <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{log.subject?.replace('-', ' ')}</div>
                      </div>
                    </td>
                    <td style={{ padding: 16, fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>{new Date(log.completedAt).toLocaleDateString()}</td>
                    <td style={{ padding: 16, fontWeight: 700, fontSize: 15 }}>{log.correctAnswers}/{log.totalQuestions}</td>
                    <td style={{ padding: 16 }}>
                      <span className={`badge ${log.accuracy >= 70 ? 'badge-success' : log.accuracy >= 50 ? 'badge-warning' : 'badge-danger'}`} style={{ minWidth: 60, textAlign: 'center', padding: '4px 10px', fontSize: 12 }}>
                        {log.accuracy}%
                      </span>
                    </td>
                    <td style={{ padding: 16, fontWeight: 800, color: 'var(--accent-gold)', borderTopRightRadius: 12, borderBottomRightRadius: 12 }}>+{log.xpEarned} XP</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '60px 0' }}>
            <div className="empty-icon" style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
              <h3>{t('analytics.noDataYet') || 'No data yet'}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{t('analytics.completeTests') || 'Complete your first test to see your analytics.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
