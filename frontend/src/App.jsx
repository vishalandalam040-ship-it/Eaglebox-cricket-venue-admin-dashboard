import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Trophy, Menu, Bell, Search, Sun, Moon, FileText, LogOut, Crown, BrainCircuit, ChevronRight, MessageSquare } from 'lucide-react';
import { Bookings } from './components/Bookings';
import { Customers } from './components/Customers';
import { Tournaments } from './components/Tournaments';
import { Memberships } from './components/Memberships';
import { Feedback } from './components/Feedback';
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
    { path: '/feedback', name: 'Feedback', icon: MessageSquare },
    { path: '/reports', name: 'Reports', icon: FileText },
  ];

  if (user?.role === 'Viewer') {
    navItems = navItems.filter(item => item.path !== '/' && item.path !== '/reports' && item.path !== '/customers');
  } else if (user?.role === 'Staff') {
    navItems = navItems.filter(item => item.path !== '/reports');
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
            className="w-10 h-10 rounded-sm bg-[var(--accent-primary)] flex items-center justify-center cursor-pointer shrink-0" 
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
                 <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)] m-0">VenueOS</h2>
                 <span className="text-[10px] font-medium tracking-wide text-[var(--text-secondary)]">Premium Edition</span>
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
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-4 px-4 py-2.5 rounded-lg transition-all duration-200 relative group ${isActive ? 'bg-[var(--overlay-bg)] text-[var(--text-primary)]' : 'hover:bg-[var(--overlay-hover)] text-[var(--text-secondary)]'}`}
                >
                  {isActive && <motion.div layoutId="sidebar-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--text-primary)] rounded-r-full" />}
                  <Icon size={18} className={`shrink-0 transition-colors duration-200 ${isActive ? 'text-[var(--text-primary)]' : 'group-hover:text-[var(--text-primary)]'}`} />
                  
                  <AnimatePresence>
                    {isOpen && (
                      <motion.span 
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className={`font-semibold text-sm whitespace-nowrap ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}
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
            <button onClick={logout} className="flex items-center gap-4 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors w-full group overflow-hidden whitespace-nowrap">
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
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="glass-panel rounded-sm flex items-center p-2  border border-[var(--border-subtle)]/50 bg-[var(--bg-surface)]/90  overflow-x-auto gap-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className="flex flex-col items-center justify-center p-2 min-w-[72px] relative group shrink-0 rounded-lg hover:bg-[var(--overlay-hover)] transition-colors">
                {isActive && <motion.div layoutId="mobile-active" className="absolute top-0 w-8 h-1 bg-[var(--text-primary)] rounded-b-full" />}
                <Icon size={20} className={isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors'} />
                <span className={`text-[10px] mt-1 font-medium tracking-wide ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

const Topbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setIsDark(savedTheme === 'dark');
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.body.style.colorScheme = 'light';
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      document.body.style.colorScheme = 'dark';
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.body.style.colorScheme = 'light';
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const bookingsRes = await api.get('/bookings');
        const tournamentsRes = await api.get('/tournaments');
        
        let notifs = [];
        
        // Latest Bookings
        const sortedBookings = [...bookingsRes.data].sort((a, b) => b.id.localeCompare(a.id));
        sortedBookings.slice(0, 3).forEach(booking => {
          notifs.push({
            id: `booking-${booking.id}`,
            type: 'booking',
            title: user?.role === 'Viewer' ? 'Booking Confirmed' : 'New Booking',
            desc: user?.role === 'Viewer' ? `Your booking is confirmed on ${booking.date}` : `${booking.customerName} booked for ${booking.date}`,
            time: parseInt(booking.id.replace('b', '')) || new Date().getTime(),
            path: '/bookings'
          });
        });

        // Latest Tournament Teams
        const teamPromises = tournamentsRes.data.map(t => api.get(`/tournaments/${t.id}/teams`));
        const allTeamsRes = await Promise.all(teamPromises);
        
        allTeamsRes.forEach((res, index) => {
          const t = tournamentsRes.data[index];
          const sortedTeams = [...res.data].sort((a, b) => b.id.localeCompare(a.id));
          sortedTeams.slice(0, 2).forEach(team => {
            notifs.push({
              id: `team-${team.id}`,
              type: 'team',
              title: user?.role === 'Viewer' ? 'Tournament Registration' : 'New Team Registration',
              desc: user?.role === 'Viewer' ? `You registered to ${t.name}` : `${team.teamName} joined ${t.name}`,
              time: parseInt(team.id.replace('t', '')) || new Date().getTime(),
              path: '/tournaments'
            });
          });
        });

        // Sort all notifications by time descending
        notifs.sort((a, b) => b.time - a.time);

        setNotifications(notifs);
        
        let seenIds = [];
        try {
          const lastSeen = localStorage.getItem('lastSeenNotifications');
          if (lastSeen) {
            if (lastSeen.startsWith('[')) {
              seenIds = JSON.parse(lastSeen);
            } else {
              seenIds = [lastSeen];
            }
          }
        } catch (e) {
          seenIds = [];
        }
        
        if (notifs.length > 0 && notifs.some(n => !seenIds.includes(n.id))) {
          setHasUnread(true);
        } else {
          setHasUnread(false);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [user]);

  const handleNotificationClick = (path, id) => {
    if (notifications.length > 0) {
      localStorage.setItem('lastSeenNotifications', JSON.stringify(notifications.map(n => n.id)));
    }
    setHasUnread(false);
    setShowNotifications(false);
    navigate(path);
  };

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between p-4 md:p-6 sticky top-0 z-40 glass-panel border-b border-[var(--border-subtle)]"
    >
      <div className="flex items-center md:hidden">
        <Menu size={24} className="text-[var(--text-primary)] mr-4" />
        <h2 className="font-semibold text-xl m-0 text-[var(--text-primary)] tracking-tight">VenueOS</h2>
      </div>
      
      <div className="hidden md:flex items-center gap-3 bg-[var(--overlay-bg)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 w-full max-w-md focus-within:border-[var(--text-primary)] transition-colors">
         <Search size={16} className="text-[var(--text-secondary)]" />
         <input type="text" placeholder="Search..." className="bg-transparent outline-none flex-1 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] font-medium" />
      </div>

      <div className="flex items-center gap-2 md:gap-5 ml-auto relative">
        <button onClick={toggleTheme} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (hasUnread) {
                  setHasUnread(false);
                  if (notifications.length > 0) {
                    localStorage.setItem('lastSeenNotifications', JSON.stringify(notifications.map(n => n.id)));
                  }
                }
              }}
              className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Bell size={20} />
              {hasUnread && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--accent-primary)] rounded-sm"></span>}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50  z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="fixed top-20 right-4 left-4 md:absolute md:top-full md:mt-4 md:right-0 md:left-auto md:w-80 glass-panel border border-[var(--border-subtle)] rounded-sm  overflow-hidden z-50 bg-[var(--bg-surface)]"
                  >
                    <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-black/10">
                      <h3 className="font-bold text-[var(--text-primary)]">Notifications</h3>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">{hasUnread ? notifications.length : 0} New</span>
                    </div>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm font-medium text-[var(--text-secondary)]">No new alerts.</div>
                    ) : (
                      notifications.map((n, idx) => (
                        <div 
                          key={idx}
                          onClick={() => handleNotificationClick(n.path, n.id)}
                          className="p-4 border-b border-[var(--border-subtle)] hover:bg-[var(--overlay-bg)] cursor-pointer transition-colors"
                        >
                          <p className="text-xs font-bold text-[var(--accent-emerald)] mb-1">{n.title}</p>
                          <p className="text-sm font-medium text-[var(--text-primary)]">{n.desc}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

        <div className="w-px h-8 bg-[var(--border-subtle)] hidden md:block"></div>

        <button onClick={logout} className="md:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors flex items-center justify-center">
          <LogOut size={20} />
        </button>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="hidden md:flex flex-col items-end mr-2 md:mr-0">
             <span className="text-xs md:text-sm font-bold leading-tight text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">{user?.role === 'Super Admin' ? 'System Architect' : user?.role + ' Account'}</span>
             <span className={`text-[8px] md:text-[9px] font-bold uppercase tracking-widest ${user?.membership?.includes('Expired') ? 'text-[var(--accent-rose)]' : 'text-[var(--accent-emerald)]'}`}>
               {user?.role === 'Viewer' 
                 ? (user?.membership ? `${user.membership} | READ ONLY` : 'READ ONLY') 
                 : user?.role?.toUpperCase()}
             </span>
          </div>
          <div className="relative flex flex-col items-center">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] font-bold text-sm md:text-lg group-hover:border-[var(--accent-primary)] transition-colors">
              {user?.email?.[0]?.toUpperCase() || 'S'}
            </div>
            {user?.role === 'Viewer' && user?.membership && (
              <span className={`md:hidden absolute -bottom-3.5 text-[7px] font-bold uppercase tracking-widest whitespace-nowrap ${user?.membership?.includes('Expired') ? 'text-[var(--accent-rose)]' : 'text-[var(--accent-emerald)]'}`}>
                {user.membership}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Skeleton Loader for Dashboard Cards
const StatCardSkeleton = () => (
  <div className="glass-panel rounded-sm p-6 h-32 flex flex-col justify-between">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-4 h-4 rounded bg-[var(--overlay-hover)] skeleton-shimmer"></div>
      <div className="h-3 w-24 rounded bg-[var(--overlay-hover)] skeleton-shimmer"></div>
    </div>
    <div className="h-8 w-20 rounded bg-[var(--overlay-hover)] skeleton-shimmer mt-auto"></div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('7');
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, totalRevenue: 0, bookings: 0, customers: 0, tournaments: 0 });
  const [loading, setLoading] = useState(true);
  const [revenueView, setRevenueView] = useState('today');
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setAiLoading(true);
        const res = await api.post('/ai/chat', {
          message: `Analyze the provided venue data and provide exactly two short, actionable insights for the dashboard. Output strictly valid JSON in this exact array format: [{"title": "Observation", "desc": "Peak utilization detected between", "highlight": "18:00 - 21:00", "type": "observation"}, {"title": "Actionable Recommendation", "desc": "Implement early bird pricing to increase conversion by", "highlight": "~14%", "type": "recommendation"}]`
        });
        
        let jsonStr = res.data.response;
        if (jsonStr.includes('```json')) {
           jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
           jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }
        
        const parsed = JSON.parse(jsonStr);
        setAiInsights(parsed);
      } catch (err) {
        console.error("Failed to fetch AI insights", err);
        setAiInsights([
          { title: "System Status", desc: "AI Insights currently unavailable.", highlight: "OFFLINE", type: "observation" },
          { title: "Actionable Recommendation", desc: "Please try refreshing the dashboard.", highlight: "REFRESH", type: "recommendation" }
        ]);
      } finally {
        setAiLoading(false);
      }
    };
    
    fetchInsights();
    const interval = setInterval(fetchInsights, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
        <h1 className="text-3xl font-semibold text-[var(--text-primary)] mb-1 tracking-tight">Overview</h1>
        <p className="text-sm font-medium text-[var(--text-secondary)]">Real-time telemetry and operational intelligence.</p>
      </motion.div>

      <div className="flex flex-col xl:flex-row gap-6 mb-8">
        <motion.div variants={itemVariants} className="xl:w-2/3 flex flex-col gap-6">
          <div className="glass-panel rounded-sm p-6 relative h-[380px] flex flex-col overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--overlay-bg)] rounded-sm blur-[80px] -z-10 group-hover:bg-[var(--overlay-bg)] transition-all duration-700"></div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 z-10">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">GROSS REVENUE</h3>
                    <div className="flex bg-[var(--overlay-bg)] border border-[var(--border-subtle)] rounded-sm p-0.5">
                      <button onClick={() => setRevenueView('today')} className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest transition-all ${revenueView === 'today' ? 'bg-[var(--accent-emerald)] text-[var(--bg-base)] ' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>Today</button>
                      <button onClick={() => setRevenueView('all')} className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest transition-all ${revenueView === 'all' ? 'bg-[var(--accent-emerald)] text-[var(--bg-base)] ' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>All Time</button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {loading ? (
                      <div className="h-10 w-40 rounded bg-[var(--overlay-hover)] skeleton-shimmer"></div>
                    ) : (
                      <motion.div layout className="flex items-center gap-3">
                        <p className="text-3xl font-semibold data-number text-[var(--text-primary)] tracking-tight">₹{revenueView === 'today' ? stats.revenue.toLocaleString() : stats.totalRevenue.toLocaleString()}</p>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-[var(--border-subtle)] text-[var(--text-secondary)] bg-[var(--bg-base)]">
                          {revenueView === 'today' ? 'Today' : 'All Time'}
                        </span>
                      </motion.div>
                    )}
                  </div>
               </div>
               <div className="flex items-center justify-between sm:justify-start gap-2 glass-panel border-[var(--border-subtle)] rounded-sm px-3 py-2 cursor-pointer hover:bg-[var(--overlay-bg)] transition-all z-20 w-full sm:w-auto">
                 <Calendar size={16} className="text-[var(--accent-emerald)] shrink-0" />
                 <select 
                   value={timeframe} 
                   onChange={(e) => setTimeframe(e.target.value)}
                   className="bg-transparent text-xs font-bold text-[var(--text-primary)] outline-none cursor-pointer appearance-none pr-4 w-full"
                 >
                   <option value="7" className="bg-[var(--bg-base)] text-[var(--text-primary)]">Last 7 Days</option>
                   <option value="30" className="bg-[var(--bg-base)] text-[var(--text-primary)]">Last 30 Days</option>
                 </select>
               </div>
            </div>
            
            <div className="flex-1 -mx-6 -mb-6 mt-4 relative z-0">
               <div className="absolute inset-0    z-10 pointer-events-none"></div>
               {loading ? (
                 <div className="w-full h-full bg-[var(--overlay-bg)] skeleton-shimmer opacity-50"></div>
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
                              <div className="glass-panel p-4 rounded-sm  border border-[var(--border-subtle)]">
                                <p className="text-[var(--text-secondary)] text-xs font-bold mb-1 uppercase tracking-wider">{label}</p>
                                <p className="text-[var(--accent-emerald)] text-lg font-bold">₹{Number(payload[0].value).toLocaleString()}</p>
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
                <motion.div whileHover={{ y: -4 }} className="glass-panel-interactive rounded-sm p-6 flex items-center justify-between">
                   <div>
                     <div className="flex items-center gap-2 mb-3">
                        <Calendar size={16} className="text-[var(--accent-emerald)]" />
                        <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">TOTAL BOOKINGS</h3>
                     </div>
                     <p className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">{stats.bookings}</p>
                   </div>
                   <div className="w-12 h-12 rounded-sm bg-[var(--overlay-bg)] flex items-center justify-center">
                     <ChevronRight size={20} className="text-[var(--accent-emerald)] opacity-50" />
                   </div>
                </motion.div>

                <motion.div whileHover={{ y: -4 }} className="glass-panel-interactive rounded-sm p-6 flex items-center justify-between">
                   <div>
                     <div className="flex items-center gap-2 mb-3">
                        <Users size={16} className="text-[var(--accent-primary)]" />
                        <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">CUSTOMERS <span className="bg-[var(--overlay-bg)] text-[var(--accent-primary)] px-2 py-0.5 rounded ml-2 ">LIVE</span></h3>
                     </div>
                     <p className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">{stats.customers}</p>
                   </div>
                </motion.div>

                <motion.div whileHover={{ y: -4 }} className="glass-panel-interactive rounded-sm p-6 flex items-center justify-between">
                   <div>
                     <div className="flex items-center gap-2 mb-3">
                        <Trophy size={16} className="text-[var(--accent-emerald)]" />
                        <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">TOURNAMENTS</h3>
                     </div>
                     <p className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">{stats.tournaments}</p>
                   </div>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="xl:w-1/3 flex flex-col h-full">
          <div className="glass-panel rounded-sm p-8 flex-1 relative overflow-hidden group border-t border-t-emerald-500/30">
            <div className="absolute top-0 right-0 w-full h-full     z-0 opacity-50"></div>
            
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="bg-[var(--bg-base)] p-3 rounded-sm border border-[var(--border-subtle)]  flex items-center justify-center"
              >
                <BrainCircuit size={24} className="text-[var(--accent-emerald)]" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] leading-tight">Neural Insights</h3>
                <p className="text-[9px] font-bold text-[var(--accent-emerald)] uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-sm bg-[var(--accent-emerald)] animate-pulse "></span>
                  SYSTEM THINKING
                </p>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              {aiLoading ? (
                <>
                  <div className="w-full h-24 bg-[var(--overlay-bg)] skeleton-shimmer rounded-sm"></div>
                  <div className="w-full h-24 bg-[var(--overlay-bg)] skeleton-shimmer rounded-sm"></div>
                </>
              ) : (
                aiInsights && aiInsights.map((insight, idx) => (
                  <motion.div key={idx} whileHover={{ scale: 1.02 }} className="bg-[var(--overlay-bg)] border border-[var(--border-subtle)] rounded-sm p-5 relative overflow-hidden ">
                     <div className={`absolute top-0 left-0 w-1 h-full ${insight.type === 'recommendation' ? 'bg-[var(--accent-primary)] ' : 'bg-[var(--accent-emerald)] '}`}></div>
                     {insight.type === 'recommendation' ? (
                       <p className="text-[10px] font-bold text-[var(--accent-primary)] uppercase tracking-widest mb-2 flex items-center gap-2">
                          {insight.title || "Actionable Recommendation"}
                       </p>
                     ) : null}
                     <p className={`text-sm ${insight.type === 'recommendation' ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)] mb-4'} leading-relaxed font-medium`}>
                       {insight.desc} {insight.highlight && <span className={`font-bold text-[var(--text-primary)] ${insight.type === 'recommendation' ? 'bg-[var(--overlay-bg)] px-1 rounded ml-1' : 'text-[var(--accent-emerald)] text-base ml-1'}`}>{insight.highlight}</span>}
                     </p>
                     {insight.type !== 'recommendation' && (
                       <div className="w-full h-1.5 bg-[var(--overlay-hover)] rounded-sm overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "75%" }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-[var(--accent-emerald)] rounded-sm "
                          ></motion.div>
                       </div>
                     )}
                  </motion.div>
                ))
              )}
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
          <div className="w-16 h-16 border-4 border-white/10 rounded-sm"></div>
          <div className="w-16 h-16 border-4 border-[var(--accent-emerald)] border-t-transparent rounded-sm animate-spin absolute top-0 left-0 "></div>
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
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)] selection:bg-[var(--overlay-bg)] font-sans">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        <Topbar />
        <div className="px-4 lg:px-10 pb-10 max-w-7xl mx-auto pt-4">
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
              <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
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
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.style.colorScheme = savedTheme;
    document.documentElement.classList.add(savedTheme);
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
