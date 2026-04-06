import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../api';
import NotificationPopup from '../components/NotificationPopup';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notif) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, ...notif }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000); // auto dismiss after 4s
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('eduai_token');
    const savedUser = localStorage.getItem('eduai_user');
    
    if (token && savedUser && savedUser !== 'undefined') {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Refresh profile from server
        API.get('/profile').then(res => {
          setUser(res.data);
          localStorage.setItem('eduai_user', JSON.stringify(res.data));
        }).catch(() => {
          // If profile fetch fails, token might be invalid
          localStorage.removeItem('eduai_token');
          localStorage.removeItem('eduai_user');
          setUser(null);
        }).finally(() => setLoading(false));
      } catch (err) {
        console.error('Safe parsing error (AuthContext):', err);
        localStorage.removeItem('eduai_token');
        localStorage.removeItem('eduai_user');
        setUser(null);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/login', { email, password });
    localStorage.setItem('eduai_token', res.data.token);
    localStorage.setItem('eduai_user', JSON.stringify(res.data.student));
    setUser(res.data.student);
    return res.data;
  };

  const register = async (username, email, password, displayName) => {
    const res = await API.post('/register', { username, email, password, displayName });
    // Do not set token or user state here, so user must login manually
    return res.data;
  };

  const registerWithGoogle = async (displayName, email, uid) => {
    // Attempt to login using google auth endpoint
    const res = await API.post('/google-auth', { displayName, email, uid });
    localStorage.setItem('eduai_token', res.data.token);
    localStorage.setItem('eduai_user', JSON.stringify(res.data.student));
    setUser(res.data.student);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('eduai_token');
    localStorage.removeItem('eduai_user');
    setUser(null);
  };

  const updateUser = (data) => {
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('eduai_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, registerWithGoogle, logout, updateUser, addNotification }}>
      {children}
      <NotificationPopup notifications={notifications} removeNotification={removeNotification} />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
