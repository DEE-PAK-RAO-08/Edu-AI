import { useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function CertificatePage() {
  const { user } = useAuth();
  const certRef = useRef(null);

  const certificates = (user?.subjects || []).filter(s => s.assessmentCompleted && s.accuracy >= 50).map(s => ({
    subject: s.name,
    accuracy: s.accuracy,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    grade: s.accuracy >= 90 ? 'A+' : s.accuracy >= 80 ? 'A' : s.accuracy >= 70 ? 'B' : s.accuracy >= 60 ? 'C' : 'D',
    honor: s.accuracy >= 90 ? 'With Distinction' : s.accuracy >= 80 ? 'With Merit' : 'Certified'
  }));

  const downloadCert = (cert) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext('2d');

    // Background
    const grad = ctx.createLinearGradient(0, 0, 1200, 850);
    grad.addColorStop(0, '#0f0f23');
    grad.addColorStop(0.5, '#1a1a3e');
    grad.addColorStop(1, '#0f0f23');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 850);

    // Border
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, 1140, 790);
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, 1110, 760);

    // Corner decorations
    const corners = [[50, 50], [1150, 50], [50, 800], [1150, 800]];
    corners.forEach(([x, y]) => {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    // Brand Label
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('EDU AI', 600, 100);

    // Title
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 48px Georgia, serif';
    ctx.fillText('Certificate of Achievement', 600, 170);

    // Decorative line
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(250, 195);
    ctx.lineTo(950, 195);
    ctx.stroke();

    // Subtitle
    ctx.fillStyle = '#aaa';
    ctx.font = '18px Arial';
    ctx.fillText('This is to certify that', 600, 260);

    // Student Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px Georgia, serif';
    ctx.fillText(user?.displayName || user?.username || 'Student', 600, 320);

    // Decorative line under name
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.beginPath();
    ctx.moveTo(350, 340);
    ctx.lineTo(850, 340);
    ctx.stroke();

    // Description
    ctx.fillStyle = '#cccccc';
    ctx.font = '18px Arial';
    ctx.fillText('has successfully completed the assessment in', 600, 390);

    // Subject
    ctx.fillStyle = '#7B68EE';
    ctx.font = 'bold 38px Georgia, serif';
    ctx.fillText(cert.subject.charAt(0).toUpperCase() + cert.subject.slice(1).replace('-', ' '), 600, 445);

    // Score
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText(`with a score of ${cert.accuracy}% — Grade: ${cert.grade}`, 600, 500);

    // Honor
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(cert.honor, 600, 545);

    // Date
    ctx.fillStyle = '#888888';
    ctx.font = '16px Arial';
    ctx.fillText(`Awarded on ${cert.date}`, 600, 620);

    // Signature line
    ctx.strokeStyle = '#666666';
    ctx.beginPath();
    ctx.moveTo(400, 720);
    ctx.lineTo(800, 720);
    ctx.stroke();

    ctx.fillStyle = '#888888';
    ctx.font = '14px Arial';
    ctx.fillText('EDU AI Platform — AI-Driven Personalized Learning', 600, 750);

    // Certificate ID
    ctx.fillStyle = '#555555';
    ctx.font = '12px Arial';
    ctx.fillText(`Certificate ID: EDU-${Date.now().toString(36).toUpperCase()}`, 600, 785);

    // Download
    const link = document.createElement('a');
    link.download = `EduAI_Certificate_${cert.subject}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h1>🎓 Certificates</h1>
        <p>Download your achievement certificates</p>
      </div>

      {certificates.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎓</div>
          <h3>No Certificates Yet</h3>
          <p>Complete assessments with 50%+ accuracy to earn certificates!</p>
        </div>
      ) : (
        <div className="grid-3 stagger-children">
          {certificates.map((cert, i) => (
            <div key={i} className="card" style={{ textAlign: 'center', padding: 32, border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: cert.accuracy >= 90 ? 'linear-gradient(90deg, #FFD700, #FFA500)' : cert.accuracy >= 70 ? 'var(--gradient-primary)' : 'var(--accent-secondary)' }} />
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, textTransform: 'capitalize', marginBottom: 8 }}>{cert.subject.replace('-', ' ')}</h3>
              <div className="badge badge-gold" style={{ marginBottom: 8 }}>Grade: {cert.grade}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>{cert.accuracy}% Score</div>
              <div style={{ fontSize: 13, color: 'var(--accent-primary)', fontWeight: 600, marginBottom: 16 }}>{cert.honor}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>{cert.date}</div>
              <button className="btn btn-primary btn-sm" onClick={() => downloadCert(cert)} style={{ borderRadius: 16, width: '100%' }}>
                📥 Download Certificate
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
