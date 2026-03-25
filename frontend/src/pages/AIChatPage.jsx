import { useState, useRef, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('General');
  const messagesEndRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const subjects = ['General', 'mathematics', 'physics', 'computer-science', 'chemistry', 'english', 'tamil', 'moralscience'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    setMessages([{
      role: 'ai',
      id: Date.now(),
      content: `👋 Hi ${user?.displayName || 'there'}! I'm your **Universal EDU AI**. I can teach you **ANY subject** from scratch.\n\n- 📚 **Academic Topics**: History, Science, Literature...\n- 💻 **Tech & Coding**: Python, Web Dev, AI Algorithms...\n- ❓ **Exam Prep**: Practice questions and step-by-step logic\n- 🌍 **General Knowledge**: Ask me anything about the world!\n\nSimply select a subject or type a custom topic above to begin!`,
      timestamp: new Date()
    }]);
  }, [user]);

  const [selectedTier, setSelectedTier] = useState('auto');
  const [showTierSelector, setShowTierSelector] = useState(false);

  const tiers = [
    { id: 'auto', name: 'Auto (Resilient)', icon: '🛡️' },
    { id: 'gemini', name: 'Gemini 2.0', icon: '🤖' },
    { id: 'groq', name: 'Groq (Llama 3)', icon: '⚡' },
    { id: 'openrouter', name: 'OpenRouter', icon: '🔒' }
  ];

  const handleSend = async () => {
    if ((!input.trim() && !selectedFile) || loading) return;
    const userMsg = {
      role: 'user',
      id: Date.now(),
      content: input.trim(),
      timestamp: new Date(),
      attachment: selectedFile ? selectedFile.name : null
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSelectedFile(null);
    setLoading(true);

    try {
      const res = await API.post('/ai-chat', { 
        message: userMsg.content, // Use the trimmed message from userMsg
        subject, 
        hasAttachment: !!userMsg.attachment,
        modelTier: selectedTier
      });
      const aiMsg = {
        role: 'ai',
        id: Date.now() + 1,
        content: res.data.reply,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Connection lost. Please check if the server is running.';
      setMessages(prev => [...prev, { role: 'ai', id: Date.now() + 2, content: `❌ ${errorMsg}`, timestamp: new Date() }]);
    }
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const quickQuestions = [
    'Explain this concept simply',
    'Give me practice problems',
    'How does this work in real life?',
    'Show me a code example'
  ];

  // Subject Selection UI
  const [showSubjectInput, setShowSubjectInput] = useState(false);

  return (
    <div className="main-content-inner" style={{ 
      height: 'calc(100vh - 120px)', 
      display: 'flex', 
      flexDirection: 'column', 
      maxWidth: '1000px', // Rebalanced for readability & "Big" feel
      margin: '0 auto', 
      width: '100%',
      padding: '0 20px'
    }}>
      <header style={{ marginBottom: 20, textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '1.6rem', // Slightly smaller for elegance
          fontWeight: 800, 
          background: 'var(--gradient-primary)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent', 
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12
        }}>
          <div style={{ 
            width: 32, height: 32, borderRadius: '8px', 
            background: 'var(--gradient-primary)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', fontSize: 18,
            boxShadow: 'var(--shadow-sm)'
          }}>🤖</div>
          EDU AI Tutor
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 4, letterSpacing: '0.02em' }}>Universal learning mentor for all subjects</p>
      </header>

      {/* Subject Chips + Custom Input */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
        {subjects.map(s => (
          <motion.button 
            key={s} 
            whileHover={{ scale: 1.02, translateY: -1 }}
            whileTap={{ scale: 0.98 }}
            className={`btn ${subject === s ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setSubject(s); setShowSubjectInput(false); }} 
            style={{ 
              textTransform: 'capitalize', 
              borderRadius: 30, 
              padding: '6px 14px',
              fontSize: '11px',
              height: 'auto',
              minHeight: '32px',
              border: subject === s ? 'none' : '1px solid var(--border-color)',
              background: subject === s ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.03)'
            }}
          >
            {s === 'General' ? '🌐' : s === 'mathematics' ? '🧮' : s === 'physics' ? '🌌' : s === 'computer-science' ? '💻' : s === 'chemistry' ? '🧪' : s === 'english' ? '📖' : s === 'tamil' ? '🪔' : '⚖️'} {s.replace('-', ' ')}
          </motion.button>
        ))}
        <button 
          className={`btn ${showSubjectInput ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setShowSubjectInput(!showSubjectInput)}
          style={{ borderRadius: 30, padding: '6px 14px', fontSize: '11px', minHeight: '32px' }}
        >
          🔍 Other Topic
        </button>
      </div>

      {showSubjectInput && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20, textAlign: 'center' }}>
          <input 
            className="form-input" 
            placeholder="Type any subject (e.g., Biology, Philosophy)..." 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)}
            style={{ maxWidth: 350, margin: '0 auto', borderRadius: 20, fontSize: 13, padding: '10px 20px' }}
          />
        </motion.div>
      )}

      {/* Seamless Chat Window (Centered & Well-Padded) */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '30px 0', // Centered padding
        marginBottom: 24, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 36,
        scrollbarWidth: 'none'
      }}>
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                width: '100%'
              }}
            >
              <div style={{ 
                display: 'flex', 
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                gap: 20, // Increased icon gap
                maxWidth: '100%' // Full width of centered container
              }}>
                <div style={{ 
                  width: 38, 
                  height: 38, 
                  borderRadius: '12px', 
                  background: msg.role === 'user' ? 'var(--accent-secondary)' : 'var(--gradient-primary)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: msg.role === 'user' ? 14 : 18, 
                  flexShrink: 0,
                  boxShadow: 'var(--shadow-sm)',
                  marginTop: 6
                }}>
                  {msg.role === 'ai' ? '🤖' : (user?.displayName?.charAt(0)?.toUpperCase() || 'U')}
                </div>
                
                <div style={{
                  padding: '20px 28px', // Perfect luxurious padding
                  borderRadius: '24px',
                  background: msg.role === 'user' ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.06)',
                  color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                  boxShadow: msg.role === 'user' ? '0 4px 14px rgba(108, 92, 231, 0.25)' : 'none',
                  border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  lineHeight: 1.8,
                  fontSize: '15px', // Balanced font size
                  position: 'relative',
                  flex: 1
                }}>
                  {msg.role === 'ai' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ children }) => <div style={{ margin: '16px 0', overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}>{children}</table></div>,
                        th: ({ children }) => <th style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontSize: '12px' }}>{children}</th>,
                        td: ({ children }) => <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', fontSize: '13px' }}>{children}</td>,
                        code: ({ children, className }) => className
                          ? <pre style={{ background: '#1e1e2e', padding: 16, borderRadius: 12, overflowX: 'auto', fontSize: 13, border: '1px solid rgba(255,255,255,0.1)', margin: '12px 0' }}><code style={{ color: '#cdd6f4' }}>{children}</code></pre>
                          : <code style={{ background: 'rgba(108, 92, 231, 0.15)', padding: '2px 6px', borderRadius: 4, fontSize: 13, color: 'var(--accent-primary-light)' }}>{children}</code>,
                        p: ({ children }) => <p style={{ marginBottom: 12 }}>{children}</p>,
                        h3: ({ children }) => <h3 style={{ margin: '16px 0 8px', color: 'var(--accent-primary-light)', fontSize: '1rem' }}>{children}</h3>,
                        ul: ({ children }) => <ul style={{ marginLeft: 20, marginBottom: 12 }}>{children}</ul>,
                        li: ({ children }) => <li style={{ marginBottom: 6 }}>{children}</li>
                      }}>{msg.content}</ReactMarkdown>
                  ) : (
                    <div>
                      {msg.content}
                      {msg.attachment && (
                        <div style={{ marginTop: 8, fontSize: '12px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: 6 }}>
                          📎 {msg.attachment}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '10px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
            <div style={{ padding: '12px 18px', background: 'rgba(255,255,255,0.04)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="typing-indicator"><span></span><span></span><span></span></div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview */}
      {selectedFile && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{
          marginBottom: 12, padding: '8px 16px', background: 'rgba(108, 92, 231, 0.1)',
          borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 10, alignSelf: 'center',
          border: '1px dashed var(--accent-primary)'
        }}>
          <span style={{ fontSize: '12px' }}>📎 {selectedFile.name}</span>
          <button onClick={() => setSelectedFile(null)} style={{ background: 'none', border: 'none', color: '#ff5252', cursor: 'pointer', fontSize: 16 }}>×</button>
        </motion.div>
      )}

      {/* Suggested Actions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {quickQuestions.map((q, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.06)' }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-ghost"
            onClick={() => setInput(q)}
            style={{ fontSize: 11, borderRadius: 20, padding: '6px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}
          >
            {q}
          </motion.button>
        ))}
      </div>

      {/* Clean Input Bar with Media (+) and Tier Selector */}
      <div style={{ position: 'relative' }}>
        {/* Tier Selector Dropdown */}
        <AnimatePresence>
          {showTierSelector && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              style={{
                position: 'absolute',
                bottom: '100%',
                right: '50px',
                marginBottom: 12,
                background: 'var(--bg-card)',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                padding: '8px',
                minWidth: '180px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}
            >
              {tiers.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setSelectedTier(t.id); setShowTierSelector(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: 'none',
                    background: selectedTier === t.id ? 'var(--gradient-primary)' : 'transparent',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '13px',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: 16 }}>{t.icon}</span>
                  <span>{t.name}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{
          background: 'var(--bg-card)',
          padding: '8px',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <input
            type="file"
            ref={fileInputRef}
            hidden
            onChange={handleFileChange}
          />
          <motion.button
            whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => fileInputRef.current.click()}
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-primary)',
              border: 'none',
              borderRadius: '12px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </motion.button>

          <input className="form-input" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={`Message EDU AI (${subject})...`}
            style={{ flex: 1, border: 'none', background: 'transparent', boxShadow: 'none', paddingLeft: 8, fontSize: '14px' }} />

          {/* Model Selection Pill */}
          <motion.button
            whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTierSelector(!showTierSelector)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 500
            }}
          >
            <span>{tiers.find(t => t.id === selectedTier)?.icon}</span>
            <span>{tiers.find(t => t.id === selectedTier)?.name.split(' (')[0]}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={loading || (!input.trim() && !selectedFile)}
            style={{
              background: (input.trim() || selectedFile) ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.1)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: (input.trim() || selectedFile) ? 'pointer' : 'default',
              transition: 'background 0.3s'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </motion.button>
        </div>
      </div>
      <p style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)', marginTop: 8 }}>
        EDU AI can make mistakes. Verify important information.
      </p>
    </div>
  );
}

