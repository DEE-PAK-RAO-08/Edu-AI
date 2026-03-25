import { useState, useEffect, useRef } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function DiscussionPage() {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  
  const [newPost, setNewPost] = useState({ content: '', subject: 'General', topic: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [filter, setFilter] = useState('all');
  const fileInputRef = useRef(null);

  const subjects = [
    { id: 'all', label: 'Community', icon: '🌐' },
    { id: 'mathematics', label: 'Maths', icon: '🧮' },
    { id: 'physics', label: 'Physics', icon: '🌌' },
    { id: 'computer-science', label: 'Computer Science', icon: '💻' },
    { id: 'chemistry', label: 'Chemistry', icon: '🧪' },
    { id: 'english', label: 'English', icon: '📖' },
  ];

  useEffect(() => { fetchDiscussions(); }, [filter]);

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?subject=${filter}` : '';
      const res = await API.get(`/discussions${params}`);
      setDiscussions(res.data.discussions || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const createPost = async () => {
    if (!newPost.content) {
      alert('Please write something first!');
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', newPost.content);
      formData.append('subject', newPost.subject);
      formData.append('topic', newPost.topic || 'General');
      if (selectedFile) formData.append('image', selectedFile);

      await API.post('/discussions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setShowCreate(false);
      setNewPost({ content: '', subject: 'General', topic: '' });
      setSelectedFile(null);
      setImagePreview(null);
      fetchDiscussions();
    } catch (err) { 
      console.error(err);
      alert('Failed to share post.');
    } finally {
      setLoading(false);
    }
  };

  const addReply = async () => {
    if (!replyContent || !selectedPost) return;
    try {
      const res = await API.post(`/discussions/${selectedPost._id}/reply`, { content: replyContent });
      setSelectedPost(res.data.discussion);
      setReplyContent('');
      fetchDiscussions();
    } catch (err) { console.error(err); }
  };

  const likePost = async (e, id) => {
    e.stopPropagation();
    try {
      await API.post(`/discussions/${id}/like`);
      fetchDiscussions();
    } catch (err) { console.error(err); }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="animate-fade" style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Community Header */}
      <div className="page-header" style={{ marginBottom: 32, textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Edu Community
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Share your learning journey, photos, and questions!</p>
      </div>

      {/* Quick Post Box */}
      {!selectedPost && (
        <div className="card" onClick={() => setShowCreate(true)} style={{ marginBottom: 32, cursor: 'pointer', padding: '16px 24px', borderRadius: 24, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>
            {user?.displayName?.charAt(0) || 'U'}
          </div>
          <div style={{ flex: 1, color: 'var(--text-muted)', fontSize: 16 }}>What's on your mind, {user?.displayName?.split(' ')[0]}?</div>
          <div style={{ fontSize: 24 }}>🖼️</div>
        </div>
      )}

      {/* Category Filter */}
      {!selectedPost && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, overflowX: 'auto', paddingBottom: 12, scrollbarWidth: 'none' }}>
          {subjects.map(s => (
            <button key={s.id} className={`btn ${filter === s.id ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(s.id)} style={{ borderRadius: 24, whiteSpace: 'nowrap', padding: '10px 20px', fontSize: 14, border: '1px solid var(--border-color)' }}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div className="card" style={{ width: '100%', maxWidth: 550, borderRadius: 24, padding: 32, background: 'var(--bg-secondary)', border: '1px solid var(--accent-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 900 }}>Create Post</h2>
                <button className="btn btn-ghost" onClick={() => { setShowCreate(false); setImagePreview(null); setSelectedFile(null); }} style={{ minWidth: 'auto', padding: 8 }}>✕</button>
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <select className="form-input" value={newPost.subject} onChange={e => setNewPost({ ...newPost, subject: e.target.value })} style={{ borderRadius: 12, flex: 1 }}>
                  {subjects.filter(s => s.id !== 'all').map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <input className="form-input" placeholder="Topic (optional)" value={newPost.topic} onChange={e => setNewPost({ ...newPost, topic: e.target.value })} style={{ borderRadius: 12, flex: 1 }} />
              </div>

              <textarea className="form-input" placeholder="Share something with the community..." value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })} style={{ minHeight: 150, borderRadius: 16, marginBottom: 16, fontSize: 16, resize: 'none', background: 'transparent' }} />
              
              {imagePreview && (
                <div style={{ position: 'relative', marginBottom: 16, borderRadius: 16, overflow: 'hidden', height: 200 }}>
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => { setImagePreview(null); setSelectedFile(null); }} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '50%' }}>✕</button>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-ghost" onClick={() => fileInputRef.current.click()} style={{ borderRadius: 16, flex: 1 }}>🖼️ Add Photo</button>
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                <button className="btn btn-primary" onClick={createPost} style={{ borderRadius: 16, flex: 2 }} disabled={loading}>
                  {loading ? 'Sharing...' : 'Post to Community'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post Detail View */}
      {selectedPost ? (
        <div className="animate-fade">
          <button className="btn btn-ghost btn-sm" onClick={() => setSelectedPost(null)} style={{ marginBottom: 24, borderRadius: 12 }}>← Feed</button>
          
          <div className="card" style={{ marginBottom: 24, padding: 32, borderRadius: 24, border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 18 }}>
                {selectedPost.authorAvatar ? <img src={selectedPost.authorAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : selectedPost.authorName?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{selectedPost.authorName}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{timeAgo(selectedPost.createdAt)} • <span style={{ color: 'var(--accent-primary)' }}>{selectedPost.subject}</span></div>
              </div>
            </div>
            
            <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: 24, whiteSpace: 'pre-wrap' }}>{selectedPost.content}</p>
            
            {selectedPost.imageUrl && (
              <div onClick={() => setLightbox(selectedPost.imageUrl)} style={{ cursor: 'zoom-in', marginBottom: 24, borderRadius: 16, overflow: 'hidden', maxHeight: 500 }}>
                <img src={selectedPost.imageUrl} alt="post" style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} />
              </div>
            )}

            <div style={{ display: 'flex', gap: 24, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
              <button className="btn btn-ghost btn-sm" onClick={(e) => likePost(e, selectedPost._id)} style={{ padding: '8px 16px', borderRadius: 12, fontSize: 16 }}>
                {selectedPost.likes?.includes(user?.id) ? '❤️' : '🤍'} {selectedPost.likes?.length || 0}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 15 }}>
                💬 {selectedPost.replies?.length || 0} Comments
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginLeft: 8 }}>Comments ({selectedPost.replies?.length})</h3>
            {selectedPost.replies?.map((reply, i) => (
              <div key={i} className="card" style={{ padding: 20, borderRadius: 20, border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>
                    {reply.authorName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{reply.authorName}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{timeAgo(reply.createdAt)}</span>
                  </div>
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.5 }}>{reply.content}</p>
              </div>
            ))}
          </div>

          {/* Reply Floating Input */}
          <div className="card" style={{ position: 'sticky', bottom: 20, display: 'flex', gap: 12, alignItems: 'center', padding: '12px 20px', borderRadius: 24, border: '1px solid var(--accent-primary)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', background: 'rgba(20,20,30,0.95)', backdropFilter: 'blur(10px)' }}>
            <input className="form-input" placeholder="Type a comment..." value={replyContent} onChange={e => setReplyContent(e.target.value)} style={{ flex: 1, height: 44, borderRadius: 22, background: 'rgba(0,0,0,0.2)', border: 'none', padding: '0 20px' }} onKeyPress={e => e.key === 'Enter' && addReply()} />
            <button className="btn btn-primary" onClick={addReply} disabled={!replyContent} style={{ borderRadius: '50%', width: 44, height: 44, minWidth: 'auto', padding: 0 }}>➡️</button>
          </div>
        </div>
      ) : (
        /* Community Feed */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {loading && !discussions.length ? <div className="loading-page"><div className="spinner"></div></div> :
            discussions.length === 0 ? (
              <div className="empty-state card" style={{ padding: 60, borderRadius: 32 }}>
                <div style={{ fontSize: 80, marginBottom: 24 }}>🤝</div>
                <h3 style={{ fontSize: 24, fontWeight: 900 }}>Community is quiet...</h3>
                <p style={{ marginBottom: 32 }}>Start the conversation by sharing a photo or a thought!</p>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)} style={{ borderRadius: 20, padding: '12px 32px' }}>✏️ Start Post</button>
              </div>
            ) : discussions.map(post => (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={post._id} className="card" onClick={() => setSelectedPost(post)}
                style={{ cursor: 'pointer', padding: 0, borderRadius: 28, border: '1px solid var(--border-color)', overflow: 'hidden', background: 'rgba(255,255,255,0.02)', transition: 'transform 0.2s', position: 'relative' }}>
                
                {/* Post Header */}
                <div style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '15px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff' }}>
                    {post.authorAvatar ? <img src={post.authorAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : post.authorName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: 16 }}>{post.authorName}</span>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-muted)' }}></span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{timeAgo(post.createdAt)}</span>
                    </div>
                    {post.subject && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>{post.subject}</span>}
                  </div>
                  <div style={{ fontSize: 20, opacity: 0.5 }}>•••</div>
                </div>

                {/* Post Content */}
                <div style={{ padding: '0 28px 20px', fontSize: 16, lineHeight: 1.5, color: 'rgba(255,255,255,0.9)' }}>
                  {post.content.length > 200 ? post.content.substring(0, 200) + '... (see more)' : post.content}
                </div>

                {/* Post Image */}
                {post.imageUrl && (
                  <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', position: 'relative', overflow: 'hidden' }}>
                    <img src={post.imageUrl} alt="Post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                {/* Post Actions */}
                <div style={{ padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', gap: 20 }}>
                    <div onClick={(e) => likePost(e, post._id)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 16, fontWeight: 700 }}>
                      <span style={{ fontSize: 20 }}>{post.likes?.includes(user?.id) ? '❤️' : '🤍'}</span>
                      {post.likes?.length || 0}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 16, color: 'var(--text-secondary)' }}>
                      <span style={{ fontSize: 20 }}>💬</span>
                      {post.replies?.length || 0}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Share</div>
                </div>
              </motion.div>
            ))
          }
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
            <motion.img initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }} src={lightbox} alt="Full View" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 12 }} />
            <button style={{ position: 'absolute', top: 30, right: 30, background: 'transparent', border: 'none', color: '#fff', fontSize: 32 }}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .badge-gold { background: linear-gradient(135deg, #FFD700, #FFA500); color: #000; font-weight: 800; border-radius: 6px; padding: 2px 8px; }
        ::-webkit-scrollbar { display: none; }
        .form-input:focus { border-color: var(--accent-primary); box-shadow: 0 0 15px rgba(var(--accent-primary-rgb), 0.2); }
      `}} />
    </div>
  )
}
