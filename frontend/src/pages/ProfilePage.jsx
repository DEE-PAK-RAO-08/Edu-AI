import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function ProfilePage() {
  const { user, logout, updateUser, addNotification } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ username: user?.username || '', displayName: user?.displayName || '', profilePicture: user?.profilePicture || '', bio: user?.bio || '' });
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showViewPhoto, setShowViewPhoto] = useState(false);
  const [phoneNum, setPhoneNum] = useState(user?.phone || '');
  const [otpStep, setOtpStep] = useState(0); 
  const [otpToken, setOtpToken] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Sync language from user profile on mount
  useEffect(() => {
    if (user?.preferredLanguage && user.preferredLanguage !== language) {
      setLanguage(user.preferredLanguage);
    }
  }, [user?.preferredLanguage]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSetLanguage = async (lang) => {
    try {
      // Update app language immediately
      setLanguage(lang);
      // Save to backend
      await API.post('/set-language', { language: lang });
      updateUser({ preferredLanguage: lang }); // Update local user state on success
      addNotification({ 
        title: 'Success', 
        message: `Language updated to ${lang.toUpperCase()}`,
        type: 'success',
        icon: '🌐'
      });
    } catch (err) {
      // Still update locally even if backend fails
      updateUser({ preferredLanguage: lang });
      addNotification({ 
        title: 'Error', 
        message: 'Failed to update language',
        type: 'error',
        icon: '⚠️'
      });
    }
  };

  const getLevelTitle = (l) => {
    if (l <= 5) return 'Novice';
    if (l <= 12) return 'Apprentice';
    if (l <= 20) return 'Explorer';
    if (l <= 30) return 'Scholar';
    if (l <= 45) return 'Specialist';
    if (l <= 60) return 'Elite';
    if (l <= 80) return 'Master';
    if (l <= 100) return 'Legend';
    return 'Grandmaster';
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      console.log('Updating profile with data:', editData);
      const res = await API.post('/update-profile', editData);
      updateUser({ ...user, ...res.data });
      setIsEditing(false);
      addNotification({ title: 'Profile Updated', message: 'Your changes have been saved successfully.', type: 'success', icon: '👤' });
    } catch (err) {
      console.error('Profile update error:', err);
      addNotification({ title: 'Error', message: err.response?.data?.error || 'Failed to update profile. Please check your connection.', type: 'error' });
    }
    setLoadingAction(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData({ ...editData, profilePicture: reader.result });
        setShowPhotoMenu(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setEditData({ ...editData, profilePicture: '' });
    setShowPhotoMenu(false);
  };

  const startCamera = async () => {
    setShowPhotoMenu(false);
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 400, height: 400 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      addNotification({ title: 'Camera Error', message: 'Could not access camera. Please check permissions.', type: 'error', icon: '📸' });
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg');
      setEditData({ ...editData, profilePicture: dataUrl });
      stopCamera();
    }
  };

  const handleSendOTP = async () => {
    if (!phoneNum || resendTimer > 0) return;
    setLoadingAction(true);
    try {
      console.log('Sending OTP to:', phoneNum);
      const res = await API.post('/send-otp', { phone: phoneNum });
      setOtpStep(1);
      addNotification({ title: 'OTP Sent', message: 'A verification code has been sent to your phone.', type: 'success', icon: '📱' });
      
      // Start 60s cooldown
      setResendTimer(60);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // For development convenience: auto-fill the mock OTP
      if (res.data._mockOtp) {
        setOtpToken(res.data._mockOtp);
      }
    } catch(err) {
      console.error('Send OTP error:', err);
      addNotification({ title: 'Error Sending OTP', message: err.response?.data?.error || 'Failed to send OTP. Ensure your backend is running.', type: 'error', icon: '⚠️' });
    }
    setLoadingAction(false);
  };

  const handleVerifyOTP = async () => {
    if (!otpToken) return;
    setLoadingAction(true);
    try {
      const res = await API.post('/verify-otp', { otp: otpToken });
      updateUser({ ...user, isPhoneVerified: true, phone: res.data.phone });
      setOtpStep(0);
      if (timerRef.current) clearInterval(timerRef.current);
      setResendTimer(0);
      addNotification({ title: 'Phone Verified', message: 'Your phone number has been successfully verified!', type: 'success', icon: '✅' });
    } catch(err) {
      addNotification({ title: 'OTP Verification Failed', message: err.response?.data?.error || 'Invalid or expired OTP', type: 'error', icon: '❌' });
    }
    setLoadingAction(false);
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  ];

  const learningStyleLabels = {
    visual: { icon: '👁️', label: t('profile.visual') },
    reading: { icon: '📖', label: t('profile.reading') },
    practice: { icon: '🔧', label: t('profile.practice') },
  };

  return (
    <div className="animate-fade" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="page-header">
        <h1>{t('profile.title')}</h1>
        <p>{t('profile.subtitle')}</p>
      </div>

      {/* Profile Card */}
      <div className="card" style={{ marginBottom: 24, textAlign: 'center', position: 'relative' }}>
        {!isEditing ? (
          <button className="btn btn-ghost btn-sm" style={{ position: 'absolute', top: 16, right: 16 }} onClick={() => {
            setEditData({ username: user?.username || '', displayName: user?.displayName || '', profilePicture: user?.profilePicture || '', bio: user?.bio || '' });
            setIsEditing(true);
          }}>✏️ Edit</button>
        ) : (
          <button className="btn btn-ghost btn-sm" style={{ position: 'absolute', top: 16, right: 16 }} onClick={() => setIsEditing(false)}>✕ Cancel</button>
        )}

        <div 
          className="profile-avatar" 
          style={{ 
            width: 140, height: 140, fontSize: 50, margin: '20px auto 24px', 
            position: 'relative', overflow: 'hidden', borderRadius: '50%', 
            background: 'var(--bg-secondary)', border: '4px solid var(--border-color)', 
            boxShadow: 'var(--shadow-lg)', cursor: (!isEditing && (editData.profilePicture || user?.profilePicture)) ? 'pointer' : 'default'
          }}
          onClick={(!isEditing && (editData.profilePicture || user?.profilePicture)) ? () => setShowViewPhoto(true) : undefined}
        >
          {(isEditing ? editData.profilePicture : user?.profilePicture) ? (
             <img src={isEditing ? editData.profilePicture : user?.profilePicture} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gradient-primary)', color: 'white' }}>
              {user?.displayName?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
          
          {isEditing && (
            <div 
              className="avatar-overlay"
              style={{ 
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', 
                color: 'white', display: 'flex', flexDirection: 'column', 
                alignItems: 'center', justifyContent: 'center', 
                cursor: 'pointer', transition: 'all 0.3s ease',
                gap: 8, opacity: 1
              }}
              onClick={(e) => { e.stopPropagation(); setShowPhotoMenu(!showPhotoMenu); }}
            >
              <span style={{ fontSize: 24 }}>📷</span>
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Change Profile Picture</span>
            </div>
          )}
        </div>

        {/* Photo Action Menu (WhatsApp Style) */}
        {showPhotoMenu && isEditing && (
          <div style={{
            position: 'absolute', top: '220px', left: '50%', transform: 'translateX(-50%)',
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)',
            zIndex: 100, width: '220px', padding: '8px', textAlign: 'left',
            animation: 'fadeIn 0.2s ease forwards'
          }}>
            {[
              { label: 'View photo', icon: '👁️', onClick: () => { setShowViewPhoto(true); setShowPhotoMenu(false); } },
              { label: 'Take photo', icon: '📷', onClick: startCamera },
              { label: 'Upload photo', icon: '📂', onClick: () => { fileInputRef.current?.click(); } },
              { label: 'Remove photo', icon: '🗑️', onClick: handleRemovePhoto, danger: true }
            ].map((item, idx) => (
              <button 
                key={idx}
                style={{
                  width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
                  background: 'none', border: 'none', borderRadius: 'var(--radius-md)',
                  color: item.danger ? 'var(--accent-danger)' : 'var(--text-primary)',
                  cursor: 'pointer', fontSize: 14, fontWeight: 500,
                  transition: 'background 0.2s ease'
                }}
                disabled={item.label === 'View photo' && !editData.profilePicture && !user?.profilePicture}
                onClick={item.onClick}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <span style={{ fontSize: 18, opacity: (item.label === 'View photo' && !editData.profilePicture && !user?.profilePicture) ? 0.3 : 1 }}>{item.icon}</span>
                <span style={{ opacity: (item.label === 'View photo' && !editData.profilePicture && !user?.profilePicture) ? 0.3 : 1 }}>{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Camera UI Overlay */}
        {showCamera && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20
          }}>
            <h2 style={{ color: 'white', marginBottom: 20 }}>Take Profile Picture</h2>
            <div style={{ width: '100%', maxWidth: 400, aspectRatio: '1/1', background: '#000', borderRadius: 20, overflow: 'hidden', position: 'relative', border: '2px solid var(--accent-primary)' }}>
              <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
              <button className="btn btn-secondary" onClick={stopCamera} style={{ padding: '12px 24px' }}>Cancel</button>
              <button className="btn btn-primary" onClick={capturePhoto} style={{ padding: '12px 32px', fontSize: 18, fontWeight: 700 }}>📸 Capture</button>
            </div>
          </div>
        )}

        {/* View Photo Lightbox */}
        {showViewPhoto && (
          <div 
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 2000,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
            }}
            onClick={() => setShowViewPhoto(false)}
          >
            <button 
              style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 44, height: 44, borderRadius: '50%', fontSize: 24, cursor: 'pointer' }}
              onClick={() => setShowViewPhoto(false)}
            >✕</button>
            <img 
              src={isEditing ? editData.profilePicture : user?.profilePicture} 
              alt="Profile" 
              style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: 12, boxShadow: '0 0 40px rgba(0,0,0,0.5)' }} 
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}

        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
        
        {isEditing ? (
          <form onSubmit={handleProfileSubmit} style={{ maxWidth: 400, margin: '0 auto 24px', textAlign: 'left' }}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-primary-light)', marginBottom: 8, display: 'block' }}>Name</label>
              <input type="text" className="form-input" style={{ width: '100%', padding: '12px 16px', borderRadius: 12 }} value={editData.displayName} onChange={e => setEditData({...editData, displayName: e.target.value})} required placeholder="Enter your name" />
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-primary-light)', marginBottom: 8, display: 'block' }}>Username</label>
              <input type="text" className="form-input" style={{ width: '100%', padding: '12px 16px', borderRadius: 12 }} value={editData.username} onChange={e => setEditData({...editData, username: e.target.value})} required placeholder="username" />
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-primary-light)', marginBottom: 8, display: 'block' }}>Bio / About</label>
              <textarea 
                className="form-input" 
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, minHeight: 80, resize: 'none' }} 
                value={editData.bio} 
                onChange={e => setEditData({...editData, bio: e.target.value})} 
                placeholder="Tell us about yourself..."
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: 12, fontWeight: 700 }} disabled={loadingAction}>
              {loadingAction ? 'Updating...' : 'Save Profile'}
            </button>
          </form>
        ) : (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{user?.displayName || user?.username}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 15 }}>@{user?.username}</p>
            
            <div style={{ maxWidth: 400, margin: '0 auto 20px', padding: '16px', background: 'var(--bg-input)', borderRadius: 16, textAlign: 'left', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-primary-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>About</div>
              <p style={{ color: 'var(--text-primary)', margin: 0, fontSize: 15, lineHeight: 1.5 }}>
                {user?.bio || "No bio yet. Click edit to add one!"}
              </p>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{user?.email}</p>
          </div>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16, marginTop: isEditing ? 16 : 0, borderTop: isEditing ? '1px solid var(--border-color)' : 'none', paddingTop: isEditing ? 16 : 0 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-gold)' }}>{user?.xp || 0}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('profile.totalXP')}</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-primary-light)' }}>Lv. {user?.level || 1}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{getLevelTitle(user?.level || 1)}</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-warning)' }}>🔥 {user?.streak || 0}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('profile.dayStreak')}</div>
          </div>
        </div>
      </div>
      
      <div className="card" style={{ marginBottom: 24, padding: '24px' }}>
        <h3 style={{ fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, fontSize: '18px' }}>
          <span>📱</span> Phone & Streak Notifications
          {user?.isPhoneVerified && <span className="badge badge-success" style={{ fontSize: 10, marginLeft: 'auto' }}>Verified</span>}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginBottom: 20, lineHeight: '1.6' }}>
          Secure your streak! We'll notify you via SMS so you never miss a learning day and keep your streak alive.
        </p>
        
        {user?.isPhoneVerified ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(0, 230, 118, 0.08)', borderRadius: '16px', border: '1px solid rgba(0, 230, 118, 0.2)' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 700, color: 'var(--accent-success)', fontSize: '16px' }}>{user.phone}</span>
              <span style={{ fontSize: '11px', color: 'rgba(0, 230, 118, 0.8)', fontWeight: 600, textTransform: 'uppercase', marginTop: 2 }}>Enabled</span>
            </div>
            <button 
              className="btn btn-ghost btn-sm" 
              style={{ fontSize: 12, border: '1px solid var(--border-color)', borderRadius: '8px' }}
              onClick={async () => {
                setLoadingAction(true);
                try {
                  const res = await API.post('/test-streak-notification');
                  addNotification({ title: 'Alert Test', message: res.data.message, type: 'success', icon: '🔔' });
                } catch (err) {
                  addNotification({ title: 'Test Failed', message: err.response?.data?.error || err.message, type: 'error' });
                }
                setLoadingAction(false);
              }}
              disabled={loadingAction}
            >
              🔔 Test Alert
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {otpStep === 0 ? (
              <div style={{ display: 'flex', gap: 12 }}>
                <input 
                  type="tel" 
                  className="form-input" 
                  style={{ flex: 1, letterSpacing: '0.05em' }} 
                  placeholder="+1234567890" 
                  value={phoneNum} 
                  onChange={e => setPhoneNum(e.target.value)} 
                />
                <button 
                  className="btn btn-primary" 
                  onClick={handleSendOTP} 
                  disabled={!phoneNum || loadingAction || resendTimer > 0} 
                  style={{ minWidth: '100px' }}
                >
                  {loadingAction ? '...' : (resendTimer > 0 ? `${resendTimer}s` : 'Verify')}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ flex: 1, letterSpacing: '0.3em', textAlign: 'center', fontWeight: 'bold' }} 
                    placeholder="------" 
                    value={otpToken} 
                    onChange={e => setOtpToken(e.target.value.replace(/\D/g, ''))} 
                    maxLength={6} 
                  />
                  <button className="btn btn-primary" onClick={handleVerifyOTP} disabled={otpToken.length < 6 || loadingAction} style={{ minWidth: '120px' }}>
                    {loadingAction ? '...' : 'Confirm'}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    onClick={handleSendOTP} 
                    disabled={resendTimer > 0 || loadingAction}
                    style={{ fontSize: 13, color: resendTimer > 0 ? 'var(--text-secondary)' : 'var(--accent-primary-light)' }}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : '↺ Resend Code'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setOtpStep(0)} style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    Change Number
                  </button>
                </div>
              </div>
            )}
            {otpStep === 1 && (
              <div className="animate-fade" style={{ fontSize: 13, color: 'var(--accent-primary-light)', background: 'rgba(108, 92, 231, 0.1)', padding: '8px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🛡️</span> Security code sent to <b>{phoneNum}</b>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Subjects */}
      {user?.subjects?.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>{t('profile.subjects')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {user.subjects.map((sub, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{sub.name?.replace('-', ' ')}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {t('profile.strong')}: {sub.strongAreas?.join(', ') || 'N/A'} • {t('profile.weak')}: {sub.weakAreas?.join(', ') || 'N/A'}
                  </div>
                </div>
                <span className={`badge ${sub.accuracy >= 70 ? 'badge-success' : sub.accuracy >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                  {sub.accuracy}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Language Preference */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>{t('profile.languagePreference')}</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {languages.map(lang => (
            <button
              key={lang.code}
              className={`btn ${language === lang.code ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleSetLanguage(lang.code)}
              style={{
                position: 'relative',
                transition: 'all 0.3s ease'
              }}
            >
              {lang.flag} {lang.name}
              {language === lang.code && (
                <span style={{
                  marginLeft: 8, fontSize: 11, background: 'rgba(255,255,255,0.2)',
                  borderRadius: 6, padding: '2px 8px'
                }}>✓</span>
              )}
            </button>
          ))}
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
          {language === 'en' ? 'The entire app interface will change to the selected language.' :
           language === 'ta' ? 'முழு செயலி இடைமுகமும் தேர்ந்தெடுக்கப்பட்ட மொழிக்கு மாறும்.' :
           'संपूर्ण ऐप इंटरफ़ेस चयनित भाषा में बदल जाएगा।'}
        </p>
      </div>

      {/* Learning Style */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>{t('profile.learningStyle')}</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {['visual', 'reading', 'practice'].map(style => {
            const ls = learningStyleLabels[style];
            return (
              <div key={style} style={{
                padding: '12px 20px',
                background: user?.learningStyle === style ? 'rgba(108,92,231,0.15)' : 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${user?.learningStyle === style ? 'var(--border-glow)' : 'var(--border-color)'}`,
                fontWeight: 500,
                fontSize: 14
              }}>
                {ls.icon} {ls.label}
                {user?.learningStyle === style && <span className="badge badge-primary" style={{ marginLeft: 8 }}>{t('profile.active')}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      {user?.badges?.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>{t('profile.badges')} ({user.badges.length})</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {user.badges.map((badge, i) => (
              <span key={i} className="badge badge-gold" style={{ padding: '8px 16px' }}>
                {badge.icon} {badge.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Logout */}
      <button className="btn btn-danger" style={{ width: '100%' }} onClick={handleLogout}>
        {t('profile.signOut')}
      </button>
    </div>
  );
}

