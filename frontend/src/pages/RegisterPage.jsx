import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { app } from '../firebase';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', displayName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, registerWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGoogleSignup = async () => {
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      await registerWithGoogle(user.displayName, user.email, user.uid);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Google signup failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.displayName || form.username);
      setTimeout(() => {
        navigate('/login', { state: { message: 'Account created successfully! Please log in.' } });
      }, 500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
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
                <img src="/favicon_final.png" alt="EduAI" className="logo-animated" />
              </div>
            </div>
            <h1>Join EDU AI</h1>
            <p>Create your account and start learning</p>
          </div>
          {error && <div className="auth-error">{error}</div>}

          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ width: '100%', marginBottom: 20, display: 'flex', gap: 10, justifyContent: 'center' }}
            onClick={handleGoogleSignup}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/>
              <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 01-6.723-4.806L1.24 17.35A11.99 11.99 0 0012 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/>
              <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/>
              <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 014.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 000 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/>
            </svg>
            Sign up with Google
          </button>

          <div style={{ textAlign: 'center', margin: '20px 0', color: 'var(--text-secondary)', position: 'relative' }}>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0, position: 'absolute', top: '50%', width: '100%', zIndex: 1 }} />
            <span style={{ background: 'var(--bg-card)', padding: '0 10px', position: 'relative', zIndex: 2 }}>OR</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input
                type="text"
                name="displayName"
                className="form-input"
                placeholder="Your Name"
                value={form.displayName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="username"
                className="form-input"
                placeholder="Choose a username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="your@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
