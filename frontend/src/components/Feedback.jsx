import { useState, useEffect } from 'react';
import api from '../api';
import { MessageSquare, Send, CheckCircle, Mail, Clock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Feedback = () => {
  const { user } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newFeedback, setNewFeedback] = useState({ customerEmail: user?.email || '', details: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.get('/feedback')
      .then(res => {
        setFeedbackList(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching feedback", err);
        setLoading(false);
      });
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const id = 'f' + Date.now();
    api.post('/feedback', { id, ...newFeedback })
      .then(res => {
        setIsSubmitting(false);
        setSubmitted(true);
        setNewFeedback({ customerEmail: user?.email || '', details: '' });
        api.get('/feedback').then(res => setFeedbackList(res.data));
        setTimeout(() => setSubmitted(false), 5000);
      })
      .catch(err => {
        setIsSubmitting(false);
        alert(err.response?.data?.error || "Failed to submit feedback.");
      });
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
    out: { opacity: 0, y: -20 }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 }
  };

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} className="pb-24 md:pb-0 pt-6">
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-light text-[var(--text-primary)] mb-2 tracking-tight">Customer <span className="font-extrabold text-emerald-400 drop-shadow-[var(--text-glow-emerald)]">Feedback</span></h1>
        <p className="text-sm font-medium text-[var(--text-secondary)]">{user?.role === 'Viewer' ? 'Share your experience with us.' : 'Monitor customer satisfaction and reviews.'}</p>
      </motion.div>

      {user?.role === 'Viewer' ? (
        <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
          <div className="glass-panel border border-[var(--border-subtle)] rounded-3xl p-8 relative overflow-hidden shadow-[var(--modal-shadow)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                <MessageSquare size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">We value your opinion</h2>
                <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1">Help us improve VenueOS</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/30 shadow-[var(--icon-glow)]">
                    <CheckCircle size={40} />
                  </div>
                  <h3 className="text-2xl font-extrabold text-[var(--text-primary)] mb-2">Thank You!</h3>
                  <p className="text-[var(--text-secondary)] font-medium">Your feedback has been successfully submitted.</p>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit} 
                  className="flex flex-col gap-5"
                >
                  <div>
                    <label className="block text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Email Address</label>
                    <input 
                      required 
                      type="email" 
                      value={newFeedback.customerEmail} 
                      onChange={e => setNewFeedback({...newFeedback, customerEmail: e.target.value})} 
                      className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 focus:shadow-[var(--icon-glow-subtle)] text-[var(--text-primary)] font-medium transition-all" 
                      placeholder="your@email.com" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Feedback Details</label>
                    <textarea 
                      required 
                      rows="5"
                      value={newFeedback.details} 
                      onChange={e => setNewFeedback({...newFeedback, details: e.target.value})} 
                      className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 focus:shadow-[var(--icon-glow-subtle)] text-[var(--text-primary)] font-medium transition-all resize-none custom-scrollbar" 
                      placeholder="Tell us what you liked or how we can improve..." 
                    ></textarea>
                  </div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                    type="submit" 
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-blue-500 text-black font-extrabold shadow-[var(--button-glow)] transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : <><Send size={18} /> Submit Feedback</>}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-12">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 tracking-tight">Your Feedback History</h3>
            {loading ? (
              <div className="glass-panel border border-[var(--border-subtle)] rounded-2xl p-6 h-32 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-emerald-400 animate-spin"></div>
              </div>
            ) : feedbackList.length === 0 ? (
              <div className="glass-panel border border-[var(--border-subtle)] rounded-2xl p-8 text-center text-[var(--text-secondary)] font-medium text-sm">
                You haven't submitted any feedback yet.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <AnimatePresence>
                  {feedbackList.map((fb, idx) => (
                    <motion.div 
                      key={fb.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-xl p-5 hover:border-emerald-500/30 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-xs font-extrabold text-[var(--text-primary)]">{fb.customerEmail || 'Anonymous'}</p>
                        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase flex items-center gap-1">
                          <Clock size={10} /> {new Date(fb.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
                        {fb.details}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6">
          {loading ? (
             <div className="glass-panel rounded-3xl p-6 h-64 flex flex-col justify-center items-center">
               <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-emerald-400 animate-spin mb-4"></div>
               <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em]">Loading Feedback...</p>
             </div>
          ) : feedbackList.length === 0 ? (
             <div className="glass-panel rounded-3xl p-16 text-center text-[var(--text-secondary)] font-medium">No feedback received yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {feedbackList.map((fb, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={fb.id} 
                    className="glass-panel-interactive rounded-2xl overflow-hidden p-6 relative flex flex-col h-full"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400 shadow-[var(--bar-glow-emerald)]"></div>
                    
                    <div className="flex items-center gap-3 mb-4 border-b border-[var(--border-subtle)] pb-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shrink-0">
                        <User size={18} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-extrabold text-[var(--text-primary)] text-sm truncate">{fb.customerEmail || 'Anonymous'}</p>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mt-0.5">
                          <Clock size={10} />
                          {new Date(fb.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-[var(--bg-base)]/50 rounded-xl p-4 border border-[var(--border-subtle)] text-sm font-medium text-[var(--text-primary)] leading-relaxed">
                      {fb.details}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};
