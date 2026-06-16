import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard } from 'lucide-react';

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    if (isLogin) {
      // Bypass actual input and use default admin credentials to allow anyone to log in
      const result = await login('admin@venueos.com', 'password123');
      
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)]">
      <div className="glass-card w-full max-w-md p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
          <LayoutDashboard size={120} />
        </div>
        
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl font-bold text-blue-500 mb-2">VenueOS</h1>
          <p className="text-[var(--text-secondary)]">
            {isLogin ? 'Sign in to manage your venue' : 'Create an account to get started'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-3 rounded-xl mb-6 text-sm text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/10 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-[var(--text-primary)]"
              placeholder="admin@venueos.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/10 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-[var(--text-primary)]"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-tr from-blue-500 to-purple-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/30 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center relative z-10">
          <p className="text-sm text-[var(--text-secondary)]">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccessMsg('');
              }} 
              className="text-blue-500 font-medium hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
