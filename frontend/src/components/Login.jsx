import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Mail, Lock, ArrowRight, ShieldCheck, Activity, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20,
        y: (e.clientY / window.innerHeight) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    if (isLogin) {
      const result = await login(email, password);
      
      if (result.success) {
        if (result.user.role === 'Viewer') {
          navigate('/bookings');
        } else {
          navigate('/');
        }
      } else {
        setError(result.error);
      }
    } else {
      const result = await register(email, password);
      
      if (result.success) {
        setSuccessMsg('Registration successful! Please sign in.');
        setIsLogin(true);
        setPassword('');
      } else {
        setError(result.error);
      }
    }
    
    setLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.8, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-[var(--bg-base)]">
      
      {/* Left Branding Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-black text-white">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 z-0">
          <motion.div 
            animate={{ 
              x: mousePosition.x * -1, 
              y: mousePosition.y * -1,
            }}
            transition={{ type: 'spring', damping: 50, stiffness: 200 }}
            className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-emerald-500/30 rounded-full blur-[120px]"
          />
          <motion.div 
            animate={{ 
              x: mousePosition.x * 1.5, 
              y: mousePosition.y * 1.5,
            }}
            transition={{ type: 'spring', damping: 50, stiffness: 200 }}
            className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/30 rounded-full blur-[120px]"
          />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>

        {/* Top Logo */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
            <Trophy size={24} className="text-black" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            Venue<span className="text-emerald-400">OS</span>
          </span>
        </motion.div>

        {/* Center Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="relative z-10 max-w-lg"
        >
          <h1 className="text-5xl lg:text-6xl font-light tracking-tight leading-tight mb-6">
            Intelligent <br />
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              Venue Control.
            </span>
          </h1>
          <p className="text-lg text-slate-300 font-medium leading-relaxed mb-8">
            The next-generation operating system for premium sports venues and esports arenas. Manage bookings, tournaments, and real-time telemetry from a single command center.
          </p>

          <div className="flex gap-6">
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Secure Access</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <Activity size={16} className="text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Live Telemetry</span>
            </div>
          </div>
        </motion.div>

        {/* Bottom Footer */}
        <div className="relative z-10 flex items-center justify-between text-sm font-medium text-slate-400">
          <p>&copy; {new Date().getFullYear()} VenueOS Systems</p>
          <p>System Version 2.4.0</p>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Mobile Logo (Visible only on small screens) */}
          <motion.div variants={itemVariants} className="flex lg:hidden items-center justify-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-[var(--icon-glow)]">
              <Trophy size={24} className="text-white" />
            </div>
            <span className="text-3xl font-black tracking-tight text-[var(--text-primary)]">
              Venue<span className="text-emerald-500">OS</span>
            </span>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight mb-3">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-[var(--text-secondary)] font-medium text-lg">
              {isLogin ? 'Enter your credentials to access the dashboard.' : 'Register a new administrator profile.'}
            </p>
          </motion.div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-500/10 border border-rose-500/20 text-rose-500 font-bold p-4 rounded-xl mb-6 text-sm flex items-center gap-3">
              <ShieldCheck size={18} /> {error}
            </motion.div>
          )}

          {successMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold p-4 rounded-xl mb-6 text-sm flex items-center gap-3">
              <ShieldCheck size={18} /> {successMsg}
            </motion.div>
          )}

          <motion.form variants={itemVariants} onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Mail size={18} className="text-[var(--text-secondary)] group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--overlay-bg)] hover:bg-[var(--overlay-hover)] focus:bg-[var(--overlay-bg)] border border-[var(--border-subtle)] focus:border-emerald-500/50 rounded-2xl pl-12 pr-4 py-4 outline-none transition-all text-[var(--text-primary)] font-medium text-lg focus:shadow-[var(--icon-glow-subtle)]"
                placeholder="Email Address"
              />
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Lock size={18} className="text-[var(--text-secondary)] group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--overlay-bg)] hover:bg-[var(--overlay-hover)] focus:bg-[var(--overlay-bg)] border border-[var(--border-subtle)] focus:border-emerald-500/50 rounded-2xl pl-12 pr-4 py-4 outline-none transition-all text-[var(--text-primary)] font-medium text-lg focus:shadow-[var(--icon-glow-subtle)]"
                placeholder="Password"
              />
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-[var(--button-gradient-from)] to-[var(--button-gradient-to)] text-[var(--button-text)] font-extrabold py-4 px-6 rounded-2xl shadow-[var(--button-shadow)] hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {isLogin ? 'Authenticate' : 'Initialize Profile'} <ArrowRight size={20} />
                </>
              )}
            </motion.button>
          </motion.form>

          <motion.div variants={itemVariants} className="mt-8 text-center">
            <p className="text-[var(--text-secondary)] font-medium">
              {isLogin ? "System Access Required? " : "Returning Administrator? "}
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccessMsg('');
                }} 
                className="text-[var(--accent-emerald)] font-bold hover:underline transition-all relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-500 hover:after:w-full after:transition-all after:duration-300"
              >
                {isLogin ? 'Request Access' : 'Sign In Now'}
              </button>
            </p>
          </motion.div>
          
        </motion.div>
      </div>
    </div>
  );
};
