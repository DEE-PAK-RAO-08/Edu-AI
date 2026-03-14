import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationPopup({ notifications, removeNotification }) {
  return (
    <div style={{
      position: 'fixed',
      top: 24,
      right: 24,
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      pointerEvents: 'none',
      maxWidth: '400px',
      width: 'calc(100% - 48px)'
    }}>
      <AnimatePresence>
        {notifications.map(notif => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 100, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: 200, transition: { duration: 0.2 } }}
            whileHover={{ scale: 1.02 }}
            style={{
              background: 'rgba(26, 31, 53, 0.95)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${notif.type === 'error' ? 'var(--accent-danger)' : notif.type === 'success' ? 'var(--accent-success)' : 'var(--accent-primary)'}`,
              borderRadius: '20px',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 20px rgba(108, 92, 231, 0.1)',
              pointerEvents: 'auto',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ 
              fontSize: 32, 
              background: 'rgba(255,255,255,0.05)', 
              width: 50, 
              height: 50, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              borderRadius: '14px' 
            }}>
              {notif.icon || (notif.type === 'error' ? '❌' : '✅')}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 2, color: '#fff' }}>
                {notif.title || (notif.type === 'error' ? 'Error' : 'Notification')}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{notif.message}</div>
            </div>
            <button 
              onClick={() => removeNotification(notif.id)}
              style={{ 
                background: 'rgba(255,255,255,0.05)', 
                border: 'none', 
                color: '#fff', 
                cursor: 'pointer', 
                width: 28, 
                height: 28, 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10
              }}
            >
              ✕
            </button>
            
            {/* Countdown progress bar */}
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 4, ease: 'linear' }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '3px',
                background: notif.type === 'error' ? 'var(--accent-danger)' : notif.type === 'success' ? 'var(--accent-success)' : 'var(--accent-primary)',
                opacity: 0.6
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
