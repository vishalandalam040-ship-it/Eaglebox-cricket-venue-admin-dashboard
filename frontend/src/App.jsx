import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Trophy, Menu, Bell, Search, Sun, Moon, FileText, LogOut, Crown } from 'lucide-react';
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
import api from './api';
import boxCricketImg from './assets/box-cricket.png';
import './index.css';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  let navItems = [
    { path: '/', name: 'Dashboard', icon: LayoutDashboard },
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
      <div className={`hidden md:flex flex-col bg-[var(--surface-color)] h-full transition-all duration-300 border-r border-[var(--border-color)] ${isOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 flex items-center justify-between border-b border-[var(--border-color)] h-20">
          {isOpen && <h2 className="font-bold text-xl m-0 text-cyan-400">VenueOS</h2>}
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-white/5 transition-colors">
            <Menu size={20} className="text-white" />
          </button>
        </div>
        <div className="flex-1 py-6 flex flex-col gap-2 px-3">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-[#1E293B] shadow-sm' : 'hover:bg-white/5'}`}>
                <Icon size={22} className={isActive ? 'text-cyan-400' : 'text-[var(--text-secondary)]'} />
                {isOpen && <span className={`font-medium ${isActive ? 'text-white' : 'text-[var(--text-secondary)]'}`}>{item.name}</span>}
              </Link>
            );
          })}
        </div>
        {user && (
          <div className="p-4 border-t border-[var(--border-color)]">
            <button onClick={logout} className="flex items-center gap-4 px-4 py-3 w-full rounded-xl hover:bg-red-500/10 text-red-500 transition-colors">
              <LogOut size={22} />
              {isOpen && <span className="font-medium">Logout</span>}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--surface-color)] border-t border-[var(--border-color)] pb-safe z-50">
        <div className="flex justify-around items-center p-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className="flex flex-col items-center p-2 flex-1">
                <Icon size={24} className={isActive ? 'text-cyan-400' : 'text-[var(--text-secondary)]'} />
                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-cyan-400' : 'text-[var(--text-secondary)]'}`}>{item.name}</span>
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
    <div className="flex items-center justify-between p-4 md:mb-8 sticky top-0 z-10 bg-[var(--bg-color)]">
      <div className="flex items-center md:hidden">
        <Menu size={24} className="text-white mr-4" />
        <h2 className="font-bold text-xl m-0 text-cyan-400">VenueOS</h2>
      </div>
      <div className="flex items-center gap-4 ml-auto">
        {user?.membership && (
          <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border ${user.membership.includes('Gold') ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : user.membership.includes('Platinum') ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-slate-300/10 border-slate-300/30 text-slate-300'}`}>
             <Crown size={14} />
             <span className="text-xs font-bold tracking-wider uppercase">{user.membership.split(' ')[0]}</span>
          </div>
        )}
        <div className="flex items-center gap-3 bg-[var(--surface-color)] border border-[var(--border-color)] px-2 md:px-4 py-1.5 md:py-2 rounded-full cursor-pointer hover:bg-white/10 transition-colors">
          <div className="hidden md:flex flex-col items-end">
             <span className="text-xs font-bold leading-tight text-white">{user?.role || 'Guest'}</span>
          </div>
          <img src={`https://ui-avatars.com/api/?name=${user?.email?.[0] || 'U'}&background=C084FC&color=fff&rounded=true`} alt="User Avatar" className="w-8 h-8 rounded-full shadow-lg" />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('7');
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, bookings: 0, customers: 0, tournaments: 0 });
  const [loading, setLoading] = useState(true);

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
        
        // Generate last N days
        const days = parseInt(timeframe, 10);
        const data = [];
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          // format YYYY-MM-DD
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

        // Fetch other stats
        const resCustomers = await api.get('/customers');
        const resTournaments = await api.get('/tournaments');
        
        const todayStr = new Date().toISOString().split('T')[0];
        let todayRev = 0;
        bookings.forEach(b => {
           if (b.date === todayStr && b.status !== 'Cancelled') todayRev += Number(b.amount || 0);
        });

        setStats({
          revenue: todayRev,
          bookings: bookings.length,
          customers: resCustomers.data.length,
          tournaments: resTournaments.data.filter(t => t.status === 'Upcoming').length || resTournaments.data.length
        });

      } catch (err) {
        console.error("Failed to fetch bookings for chart", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAndProcessData();
  }, [timeframe]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-sm text-[var(--text-secondary)]">Welcome back, Super Admin. Here's your venue status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl p-6 relative overflow-hidden group min-h-[180px] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-xs font-bold text-cyan-400 tracking-wider">TOTAL REVENUE</h3>
             <select 
               value={timeframe} 
               onChange={(e) => setTimeframe(e.target.value)}
               className="bg-[#0B1120] border border-[#1E293B] text-[10px] font-bold text-[var(--text-secondary)] rounded-lg px-2 py-1 outline-none cursor-pointer hover:text-white transition-colors"
             >
               <option value="7">Last 7 Days</option>
               <option value="30">Last 30 Days</option>
             </select>
          </div>
          <div className="flex items-baseline gap-3 mb-2">
            <p className="text-3xl font-bold text-white">₹ {stats.revenue.toLocaleString()}</p>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">TODAY</span>
          </div>
          <div className="h-24 -mx-6 -mb-6 mt-4">
             {loading ? null : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C084FC" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#C084FC" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[#151C2C] border border-[#1E293B] p-3 rounded-xl shadow-xl">
                              <p className="text-white text-xs font-bold mb-1">{`Date: ${label}`}</p>
                              <p className="text-[#C084FC] text-sm font-bold">{`Revenue: ₹${Number(payload[0].value).toLocaleString()}`}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#C084FC" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
             )}
          </div>
        </div>

        <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl p-6 flex items-center justify-between min-h-[180px]">
           <div className="flex items-center gap-4">
             <div className="bg-[#1E293B] p-3 rounded-xl">
               <Calendar size={20} className="text-purple-400" />
             </div>
             <div>
               <h3 className="text-xs font-medium text-[var(--text-secondary)] mb-1">Total Bookings</h3>
               <p className="text-2xl font-bold text-white">{stats.bookings}</p>
             </div>
           </div>
           <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">All Time</span>
        </div>

        <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl p-6 flex items-center justify-between min-h-[180px]">
           <div className="flex items-center gap-4">
             <div className="bg-[#1E293B] p-3 rounded-xl">
               <Users size={20} className="text-cyan-400" />
             </div>
             <div>
               <h3 className="text-xs font-medium text-[var(--text-secondary)] mb-1">Total Customers</h3>
               <p className="text-2xl font-bold text-white">{stats.customers}</p>
             </div>
           </div>
           <span className="text-[10px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">Verified</span>
        </div>

        <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl p-6 flex items-center justify-between min-h-[180px]">
           <div className="flex items-center gap-4">
             <div className="bg-[#1E293B] p-3 rounded-xl">
               <Trophy size={20} className="text-emerald-400" />
             </div>
             <div>
               <h3 className="text-xs font-medium text-[var(--text-secondary)] mb-1">Tournaments</h3>
               <p className="text-2xl font-bold text-white">{stats.tournaments}</p>
             </div>
           </div>
           <span className="text-[10px] font-bold text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full">New</span>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">AI Insights</h2>
        <div className="border border-cyan-500/30 rounded-2xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(21, 28, 44, 0) 0%, rgba(0, 242, 254, 0.05) 100%), #151C2C' }}>
           <div className="flex gap-4 relative z-10">
             <div className="bg-cyan-400 text-black p-3 rounded-full h-12 w-12 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,242,254,0.5)]">
                <Sun size={24} />
             </div>
             <div>
                <p className="text-sm text-white leading-relaxed mb-4">
                  Based on current trends, your peak revenue occurs between <span className="text-cyan-400 font-bold">6 PM - 9 PM</span>. Consider offering early-bird memberships to boost morning traffic.
                </p>
                <button className="text-cyan-400 text-sm font-bold flex items-center hover:text-cyan-300 transition-colors">
                  Explore Strategy <span className="ml-1">›</span>
                </button>
             </div>
           </div>
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden h-32 md:h-48 group border border-[#1E293B]">
         <img src={boxCricketImg} alt="Box Cricket Venue" className="w-full h-full object-cover opacity-90 transition-opacity" />
         <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/60 to-transparent"></div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-color)]">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not logged in, only allow access to login page
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If logged in and trying to access login page, redirect to appropriate default page
  if (location.pathname === '/login') {
    return <Navigate to={user.role === 'Viewer' ? '/bookings' : '/'} replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-color)] text-[var(--text-primary)] font-sans selection:bg-cyan-500/30">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main className="flex-1 overflow-y-auto relative">
        <Topbar />
        <div className="px-4 md:px-8 pb-6 max-w-7xl mx-auto">
          <Routes>
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
