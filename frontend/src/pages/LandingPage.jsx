import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="landing-page">
      <div className="landing-hero">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <div className="logo-container" style={{ width: 140, height: 105, borderRadius: 16 }}>
              <img src="/BRAND_ICON_TRANSPARENT.png" alt="EduAI Logo" className="logo-animated" style={{ animation: 'none' }} />
            </div>
          </div>
          <div className="hero-badge">
            <span>✨</span>
            <span>The All-In-One AI Learning Platform</span>
          </div>
          <h1>
            <span className="gradient-text" style={{ fontSize: '1.2em', fontWeight: 950, letterSpacing: '0.1em' }}>EDU AI</span><br />
            <span style={{ fontSize: '0.8em', opacity: 0.9 }}>Personalized Learning Platform</span>
          </h1>
          <p>
            Experience adaptive learning that evolves with you. Gamified challenges,
            interactive simulations, and AI-driven insights to accelerate your growth.
          </p>
          <div className="hero-buttons">
            {user ? (
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>
                Go to Dashboard →
              </button>
            ) : (
              <>
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
                  Get Started Free
                </button>
                <button className="btn btn-ghost btn-lg" onClick={() => navigate('/login')}>
                  Sign In
                </button>
              </>
            )}
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="number">3+</div>
              <div className="label">Subjects</div>
            </div>
            <div className="hero-stat">
              <div className="number">100+</div>
              <div className="label">Questions</div>
            </div>
            <div className="hero-stat">
              <div className="number">∞</div>
              <div className="label">Possibilities</div>
            </div>
            <div className="hero-stat">
              <div className="number">AI</div>
              <div className="label">Adaptive</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
