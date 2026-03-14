import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { app } from '../firebase'; // Initialize Firebase App

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, registerWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
    }
    if (location.state?.message || location.state?.error) {
      // Clear history so message doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleGoogleLogin = async () => {
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Auto register/login in backend
      await registerWithGoogle(user.displayName, user.email, user.uid);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Google login failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container animate-slide">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo">
              <div className="logo-container" style={{ width: 140, height: 112, borderRadius: 20 }}>
                <img src="/BRAND_ICON_TRANSPARENT.png" alt="EduAI" className="logo-animated" />
              </div>
            </div>
            <h1>Welcome back!</h1>
            <p>Sign in to continue your learning journey</p>
          </div>
          {location.state?.message && <div style={{ background: 'rgba(0,230,118,0.1)', color: 'var(--accent-success)', padding: 12, borderRadius: 8, textAlign: 'center', marginBottom: 20 }}>{location.state.message}</div>}
          
          {error && !(error.toLowerCase().includes('unauthorized') || error.toLowerCase().includes('login again')) && (
            <div className="auth-error">{error}</div>
          )}
          
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ width: '100%', marginBottom: 20, display: 'flex', gap: 10, justifyContent: 'center' }}
            onClick={handleGoogleLogin}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/>
              <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 01-6.723-4.806L1.24 17.35A11.99 11.99 0 0012 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/>
              <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/>
              <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 014.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 000 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/>
            </svg>
            Sign in with Google
          </button>

          <div style={{ textAlign: 'center', margin: '20px 0', color: 'var(--text-secondary)', position: 'relative' }}>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0, position: 'absolute', top: '50%', width: '100%', zIndex: 1 }} />
            <span style={{ background: 'var(--bg-card)', padding: '0 10px', position: 'relative', zIndex: 2 }}>OR</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: '45px', transition: 'type 0.3s ease' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px',
                    opacity: 0.7,
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error && (error.toLowerCase().includes('unauthorized') || error.toLowerCase().includes('login again')) && (
                <div className="animate-fade" style={{ 
                  color: 'var(--accent-danger)', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  marginTop: '10px',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ fontSize: '16px' }}>⚠️</span> Unauthorized access. Please login again.
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="auth-footer">
            Don't have an account? <Link to="/register">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
