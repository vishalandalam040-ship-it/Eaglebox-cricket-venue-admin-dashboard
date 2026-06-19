import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Trophy, Menu, Bell, Search, Sun, Moon, FileText, LogOut, Crown, BrainCircuit, ChevronRight } from 'lucide-react';
import { Bookings } from './components/Bookings';
import { Customers } from './components/Customers';
import { Tournaments } from './components/Tournaments';
import { Memberships } from './components/Memberships';
import { AIAssistant } from './components/AIAssistant';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Reports } from './components/Reports';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import api from './api';
import boxCricketImg from './assets/box-cricket.png';
import './index.css';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  let navItems = [
    { path: '/', name: 'Overview', icon: LayoutDashboard },
    { path: '/bookings', name: 'Bookings', icon: Calendar },
    { path: '/customers', name: 'Customers', icon: Users },
    { path: '/tournaments', name: 'Tournaments', icon: Trophy },
    { path: '/memberships', name: 'Plans', icon: Crown },
    { path: '/reports', name: 'Reports', icon: FileText },
  ];

  if (user?.role === 'Viewer') {
    navItems = navItems.filter(item => item.path !== '/' && item.path !== '/reports');
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div 
        initial={false}
        animate={{ width: isOpen ? 280 : 88 }}
        className="hidden md:flex flex-col glass-panel h-full border-r border-[var(--border-subtle)] z-20 relative"
      >
        <div className="p-6 flex items-center gap-4 h-28 relative">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,254,0.4)] cursor-pointer shrink-0" 
            onClick={() => setIsOpen(!isOpen)}
          >
            <Trophy size={20} className="text-white" />
          </motion.div>
          
          <AnimatePresence>
            {isOpen && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col overflow-hidden whitespace-nowrap"
              >
                 <h2 className="font-extrabold text-2xl tracking-tight text-white m-0">VenueOS</h2>
                 <span className="text-[9px] font-bold tracking-[0.2em] text-emerald-400 uppercase">Premium Edition</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 py-6 flex flex-col gap-2 px-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <motion.div 
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden group ${isActive ? 'bg-emerald-500/10 border border-emerald-500/30 shadow-[inset_0_0_20px_rgba(0,242,254,0.05)]' : 'hover:bg-white/5 border border-transparent'}`}
                >
                  {isActive && <motion.div layoutId="sidebar-active" className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 rounded-r-full shadow-[0_0_10px_rgba(0,242,254,0.8)]" />}
                  <Icon size={22} className={`shrink-0 transition-colors duration-300 ${isActive ? 'text-emerald-400' : 'text-[var(--text-secondary)] group-hover:text-white'}`} />
                  
                  <AnimatePresence>
                    {isOpen && (
                      <motion.span 
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className={`font-semibold text-sm whitespace-nowrap ${isActive ? 'text-white' : 'text-[var(--text-secondary)] group-hover:text-white'}`}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {user && (
          <div className="p-6 border-t border-[var(--border-subtle)]">
            <button onClick={logout} className="flex items-center gap-4 text-[var(--text-secondary)] hover:text-rose-400 transition-colors w-full group overflow-hidden whitespace-nowrap">
              <LogOut size={22} className="shrink-0" />
              <AnimatePresence>
                {isOpen && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-semibold text-sm"
                  >
                    Disconnect
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        )}
      </motion.div>

      {/* Mobile Bottom Navigation (Floating Dock) */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
        <div className="glass-panel rounded-2xl flex justify-around items-center p-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-[var(--border-subtle)]/50 bg-[var(--bg-surface)]/80 backdrop-blur-xl">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className="flex flex-col items-center p-2 flex-1 relative group">
                {isActive && <div className="absolute -top-2 w-8 h-1 bg-emerald-400 rounded-b-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />}
                <Icon size={22} className={isActive ? 'text-emerald-400' : 'text-[var(--text-secondary)] group-hover:text-white transition-colors'} />
                <span className={`text-[9px] mt-1.5 font-bold uppercase tracking-wider ${isActive ? 'text-emerald-400' : 'text-[var(--text-secondary)]'}`}>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

const Topbar = () => {
  const { user } = useAuth();
  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between p-6 sticky top-0 z-10 glass-panel border-b border-[var(--border-subtle)]"
    >
      <div className="flex items-center md:hidden">
        <Menu size={24} className="text-white mr-4" />
        <h2 className="font-extrabold text-xl m-0 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">VenueOS</h2>
      </div>
      
      <div className="hidden md:flex items-center gap-3 bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-full px-5 py-2.5 w-full max-w-md focus-within:border-emerald-500/50 focus-within:shadow-[0_0_15px_rgba(0,242,254,0.1)] transition-all duration-300">
         <Search size={18} className="text-[var(--text-secondary)]" />
         <input type="text" placeholder="Search operations, bookings, users..." className="bg-transparent outline-none flex-1 text-sm text-white placeholder-[var(--text-secondary)] font-medium" />
      </div>

      <div className="flex items-center gap-5 ml-auto">
        <button className="relative p-2 text-[var(--text-secondary)] hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
        </button>

        <div className="w-px h-8 bg-[var(--border-subtle)] hidden md:block"></div>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="hidden md:flex flex-col items-end">
             <span className="text-sm font-bold leading-tight text-white group-hover:text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-colors">{user?.role === 'Viewer' ? 'Viewer Account' : 'System Architect'}</span>
             <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest">{user?.role === 'Viewer' ? 'READ ONLY' : 'SUPER ADMIN'}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(0,242,254,0.3)] ring-2 ring-white/10 group-hover:ring-emerald-400/50 transition-all">
            {user?.email?.[0]?.toUpperCase() || 'S'}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Skeleton Loader for Dashboard Cards
const StatCardSkeleton = () => (
  <div className="glass-panel rounded-2xl p-6 h-32 flex flex-col justify-between">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-4 h-4 rounded bg-white/10 skeleton-shimmer"></div>
      <div className="h-3 w-24 rounded bg-white/10 skeleton-shimmer"></div>
    </div>
    <div className="h-8 w-20 rounded bg-white/10 skeleton-shimmer mt-auto"></div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('7');
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, totalRevenue: 0, bookings: 0, customers: 0, tournaments: 0 });
  const [loading, setLoading] = useState(true);
  const [revenueView, setRevenueView] = useState('today');

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/bookings');
        const bookings = res.data;
        
        // Group by date
        const revenueByDate = {};
        bookings.forEach(b => {
          if (b.status !== 'Cancelled') {
            revenueByDate[b.date] = (revenueByDate[b.date] || 0) + Number(b.amount || 0);
          }
        });
        
        const days = parseInt(timeframe, 10);
        const data = [];
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;
          
          data.push({
            date: `${day}/${month}`,
            revenue: revenueByDate[dateStr] || 0
          });
        }
        
        setChartData(data);

        // Fetch other stats concurrently
        const [resCustomers, resTournaments] = await Promise.all([
          api.get('/customers'),
          api.get('/tournaments')
        ]);
        
        const todayStr = new Date().toISOString().split('T')[0];
        let todayRev = 0;
        let totalRev = 0;
        bookings.forEach(b => {
           if (b.status !== 'Cancelled') {
             totalRev += Number(b.amount || 0);
             if (b.date === todayStr) todayRev += Number(b.amount || 0);
           }
        });

        setStats({
          revenue: todayRev,
          totalRevenue: totalRev,
          bookings: bookings.length,
          customers: resCustomers.data.length,
          tournaments: resTournaments.data.filter(t => t.status === 'Upcoming').length || resTournaments.data.length
        });

      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAndProcessData();
  }, [timeframe]);

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
    <motion.div 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="pb-24 md:pb-0 px-2 md:px-0 pt-6"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-light text-white mb-2 tracking-tight">Executive <span className="font-extrabold text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">Overview</span></h1>
        <p className="text-sm font-medium text-[var(--text-secondary)]">Real-time telemetry and operational intelligence.</p>
      </motion.div>

      <div className="flex flex-col xl:flex-row gap-6 mb-8">
        <motion.div variants={itemVariants} className="xl:w-2/3 flex flex-col gap-6">
          <div className="glass-panel rounded-3xl p-6 relative h-[380px] flex flex-col overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -z-10 group-hover:bg-emerald-500/20 transition-all duration-700"></div>
            
            <div className="flex justify-between items-start mb-6 z-10">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-[11px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em]">GROSS REVENUE</h3>
                    <div className="flex bg-white/5 border border-[var(--border-subtle)] rounded-lg p-0.5">
                      <button onClick={() => setRevenueView('today')} className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-widest transition-all ${revenueView === 'today' ? 'bg-emerald-500 text-black shadow-md' : 'text-[var(--text-secondary)] hover:text-white'}`}>Today</button>
                      <button onClick={() => setRevenueView('all')} className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-widest transition-all ${revenueView === 'all' ? 'bg-emerald-500 text-black shadow-md' : 'text-[var(--text-secondary)] hover:text-white'}`}>All Time</button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {loading ? (
                      <div className="h-10 w-40 rounded bg-white/10 skeleton-shimmer"></div>
                    ) : (
                      <>
                        <p className="text-4xl font-extrabold text-white tracking-tight">₹ {revenueView === 'today' ? stats.revenue.toLocaleString() : stats.totalRevenue.toLocaleString()}</p>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider flex items-center border ${revenueView === 'today' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'text-amber-400 bg-amber-400/10 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]'}`}>
                          {revenueView === 'today' ? 'TODAY LIVE' : 'ALL TIME'}
                        </span>
                      </>
                    )}
                  </div>
               </div>
               <div className="flex items-center gap-2 glass-panel border-[var(--border-subtle)] rounded-xl px-3 py-2 cursor-pointer hover:bg-white/5 transition-all z-20">
                 <Calendar size={16} className="text-emerald-400" />
                 <select 
                   value={timeframe} 
                   onChange={(e) => setTimeframe(e.target.value)}
                   className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer appearance-none pr-4"
                 >
                   <option value="7" className="bg-[var(--bg-base)] text-white">Last 7 Days</option>
                   <option value="30" className="bg-[var(--bg-base)] text-white">Last 30 Days</option>
                 </select>
               </div>
            </div>
            
            <div className="flex-1 -mx-6 -mb-6 mt-4 relative z-0">
               <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent z-10 pointer-events-none"></div>
               {loading ? (
                 <div className="w-full h-full bg-white/5 skeleton-shimmer opacity-50"></div>
               ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevCyan" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00F2FE" stopOpacity={0.6}/>
                          <stop offset="100%" stopColor="#00F2FE" stopOpacity={0.01}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" hide />
                      <Tooltip 
                        cursor={{ stroke: 'rgba(0, 242, 254, 0.4)', strokeWidth: 1, strokeDasharray: '5 5' }}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="glass-panel p-4 rounded-xl shadow-2xl border border-emerald-500/30">
                                <p className="text-[var(--text-secondary)] text-xs font-bold mb-1 uppercase tracking-wider">{label}</p>
                                <p className="text-emerald-400 text-lg font-extrabold">₹{Number(payload[0].value).toLocaleString()}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#00F2FE" strokeWidth={3} fillOpacity={1} fill="url(#colorRevCyan)" activeDot={{ r: 6, fill: '#00F2FE', stroke: '#fff', strokeWidth: 2, shadow: '0 0 10px #00F2FE' }} />
                    </AreaChart>
                  </ResponsiveContainer>
               )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <motion.div whileHover={{ y: -4 }} className="glass-panel-interactive rounded-2xl p-6 flex items-center justify-between">
                   <div>
                     <div className="flex items-center gap-2 mb-3">
                        <Calendar size={16} className="text-emerald-400" />
                        <h3 className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-widest">TOTAL BOOKINGS</h3>
                     </div>
                     <p className="text-4xl font-extrabold text-white tracking-tight">{stats.bookings}</p>
                   </div>
                   <div className="w-12 h-12 rounded-full bg-emerald-400/10 flex items-center justify-center">
                     <ChevronRight size={20} className="text-emerald-400 opacity-50" />
                   </div>
                </motion.div>

                <motion.div whileHover={{ y: -4 }} className="glass-panel-interactive rounded-2xl p-6 flex items-center justify-between">
                   <div>
                     <div className="flex items-center gap-2 mb-3">
                        <Users size={16} className="text-amber-400" />
                        <h3 className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-widest">CUSTOMERS <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded ml-2 shadow-[0_0_8px_rgba(192,132,252,0.3)]">LIVE</span></h3>
                     </div>
                     <p className="text-4xl font-extrabold text-white tracking-tight">{stats.customers}</p>
                   </div>
                </motion.div>

                <motion.div whileHover={{ y: -4 }} className="glass-panel-interactive rounded-2xl p-6 flex items-center justify-between">
                   <div>
                     <div className="flex items-center gap-2 mb-3">
                        <Trophy size={16} className="text-emerald-400" />
                        <h3 className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-widest">TOURNAMENTS</h3>
                     </div>
                     <p className="text-4xl font-extrabold text-white tracking-tight">{stats.tournaments}</p>
                   </div>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="xl:w-1/3 flex flex-col h-full">
          <div className="glass-panel rounded-3xl p-8 flex-1 relative overflow-hidden group border-t border-t-emerald-500/30">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-emerald-500/5 via-amber-500/5 to-transparent z-0 opacity-50"></div>
            
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="bg-[var(--bg-base)] p-3 rounded-2xl border border-emerald-500/30 shadow-[0_0_20px_rgba(0,242,254,0.3)] flex items-center justify-center"
              >
                <BrainCircuit size={24} className="text-emerald-400" />
              </motion.div>
              <div>
                <h3 className="text-xl font-extrabold text-white leading-tight">Neural Insights</h3>
                <p className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_5px_#00F2FE]"></span>
                  SYSTEM THINKING
                </p>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <motion.div whileHover={{ scale: 1.02 }} className="bg-white/5 border border-[var(--border-subtle)] rounded-2xl p-5 relative overflow-hidden backdrop-blur-md">
                 <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400 shadow-[0_0_10px_#00F2FE]"></div>
                 <p className="text-sm text-white leading-relaxed mb-4 font-medium">
                   Peak utilization detected between <br/><span className="text-emerald-400 font-bold text-base">18:00 - 21:00</span>.
                 </p>
                 <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "75%" }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-emerald-400 rounded-full shadow-[0_0_10px_#00F2FE]"
                    ></motion.div>
                 </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} className="bg-white/5 border border-[var(--border-subtle)] rounded-2xl p-5 relative overflow-hidden backdrop-blur-md">
                 <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 shadow-[0_0_10px_#C084FC]"></div>
                 <p className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    Actionable Recommendation
                 </p>
                 <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                   Implement "Early Bird" tiered pricing for 08:00 - 11:00 slots to increase morning conversion by <span className="font-bold text-white bg-amber-500/20 px-1 rounded">~14%</span>.
                 </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>


    </motion.div>
  );
};

const AppContent = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/10 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin absolute top-0 left-0 shadow-[0_0_20px_rgba(0,242,254,0.5)]"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (location.pathname === '/login') {
    return <Navigate to={user.role === 'Viewer' ? '/bookings' : '/'} replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)] selection:bg-emerald-500/30 font-sans">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        <Topbar />
        <div className="px-4 md:px-10 pb-10 max-w-7xl mx-auto pt-4">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={
                user.role === 'Viewer' ? <Navigate to="/bookings" replace /> : 
                <ProtectedRoute allowedRoles={['Super Admin', 'Staff']}><Dashboard /></ProtectedRoute>
              } />
              <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
              <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
              <Route path="/tournaments" element={<ProtectedRoute><Tournaments /></ProtectedRoute>} />
              <Route path="/memberships" element={<ProtectedRoute><Memberships /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute allowedRoles={['Super Admin', 'Staff']}><Reports /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to={user.role === 'Viewer' ? '/bookings' : '/'} replace />} />
            </Routes>
          </AnimatePresence>
        </div>
        <AIAssistant />
      </main>
    </div>
  );
};

function App() {
  useEffect(() => {
    document.body.style.colorScheme = 'dark';
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
