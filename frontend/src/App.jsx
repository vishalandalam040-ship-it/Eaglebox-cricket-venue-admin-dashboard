import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Trophy, Menu, Bell, Search, Sun, Moon, FileText, LogOut, Crown, BrainCircuit } from 'lucide-react';
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
      <div className={`hidden md:flex flex-col bg-[#0A0F1C] h-full transition-all duration-300 border-r border-[#1E293B] ${isOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center gap-3 h-24">
          <div className="bg-cyan-400 p-2 rounded-xl text-black shrink-0 shadow-[0_0_15px_rgba(0,242,254,0.3)] cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
            <div className="w-6 h-6 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
            </div>
          </div>
          {isOpen && (
            <div className="flex flex-col overflow-hidden">
               <h2 className="font-bold text-xl leading-tight text-white m-0">VenueOS</h2>
               <span className="text-[8px] font-bold tracking-widest text-[var(--text-secondary)] uppercase">Sleek Intelligence</span>
            </div>
          )}
        </div>
        <div className="flex-1 py-4 flex flex-col gap-1 px-4">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-[#102A30] border border-cyan-500/20' : 'hover:bg-white/5 border border-transparent'}`}>
                <Icon size={20} className={isActive ? 'text-cyan-400' : 'text-[var(--text-secondary)]'} />
                {isOpen && <span className={`font-bold text-sm ${isActive ? 'text-cyan-400' : 'text-[var(--text-secondary)]'}`}>{item.name}</span>}
              </Link>
            );
          })}
        </div>
        {user && (
          <div className="p-6 border-t border-[#1E293B]">
            <button onClick={logout} className="flex items-center gap-4 text-[var(--text-secondary)] hover:text-white transition-colors w-full">
              <LogOut size={20} />
              {isOpen && <span className="font-bold text-sm">Logout</span>}
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
    <div className="flex items-center justify-between p-6 sticky top-0 z-10 bg-[#0B1120]/80 backdrop-blur-md border-b border-[#1E293B]">
      <div className="flex items-center md:hidden">
        <Menu size={24} className="text-white mr-4" />
        <h2 className="font-bold text-xl m-0 text-cyan-400">VenueOS</h2>
      </div>
      
      <div className="hidden md:flex items-center gap-3 bg-[#151C2C] border border-[#1E293B] rounded-xl px-4 py-2 w-full max-w-md">
         <Search size={16} className="text-[var(--text-secondary)]" />
         <input type="text" placeholder="Search insights, bookings..." className="bg-transparent outline-none flex-1 text-sm text-white placeholder-[var(--text-secondary)]" />
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="hidden md:flex flex-col items-end">
             <span className="text-sm font-bold leading-tight text-white group-hover:text-cyan-400 transition-colors">{user?.role === 'Viewer' ? 'Viewer Account' : 'Super Admin'}</span>
             <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{user?.role === 'Viewer' ? 'READ ONLY' : 'SYSTEM ADMIN'}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-white font-bold text-lg shadow-lg border border-white/10">
            {user?.email?.[0]?.toUpperCase() || 'S'}
          </div>
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-0 px-2 md:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-normal text-white mb-1">Dashboard <span className="font-bold text-cyan-400">Overview</span></h1>
        <p className="text-sm text-[var(--text-secondary)]">Intelligent system status for Elite Sports Arena.</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 mb-8">
        <div className="xl:w-2/3 flex flex-col gap-6">
          <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl p-6 relative overflow-hidden h-[300px] flex flex-col">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">TOTAL REVENUE</h3>
                  <div className="flex items-center gap-3">
                    <p className="text-3xl font-bold text-white">₹ {stats.revenue.toLocaleString()}</p>
                    <span className="text-[9px] font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-500/20 px-2 py-0.5 rounded text-center leading-none flex items-center">TODAY</span>
                  </div>
               </div>
               <div className="flex items-center gap-2 bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-1.5 cursor-pointer hover:bg-white/5 transition-colors">
                 <Calendar size={14} className="text-cyan-400" />
                 <select 
                   value={timeframe} 
                   onChange={(e) => setTimeframe(e.target.value)}
                   className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer appearance-none pr-4"
                 >
                   <option value="7" className="bg-[#151C2C] text-white">Last 7 Days</option>
                   <option value="30" className="bg-[#151C2C] text-white">Last 30 Days</option>
                 </select>
               </div>
            </div>
            
            <div className="flex-1 -mx-6 -mb-6 mt-4 relative">
               <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent"></div>
               {loading ? null : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevCyan" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                           <feGaussianBlur stdDeviation="4" result="blur" />
                           <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>
                      <XAxis dataKey="date" hide />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-[#151C2C] border border-[#1E293B] p-3 rounded-xl shadow-xl">
                                <p className="text-white text-xs font-bold mb-1">{`Date: ${label}`}</p>
                                <p className="text-cyan-400 text-sm font-bold">{`Revenue: ₹${Number(payload[0].value).toLocaleString()}`}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#22d3ee" strokeWidth={4} fillOpacity={1} fill="url(#colorRevCyan)" filter="url(#glow)" />
                    </AreaChart>
                  </ResponsiveContainer>
               )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl p-6 flex items-center justify-between">
               <div>
                 <div className="flex items-center gap-2 mb-2">
                    <Calendar size={14} className="text-cyan-400" />
                    <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">TOTAL BOOKINGS</h3>
                 </div>
                 <p className="text-3xl font-bold text-white">{stats.bookings}</p>
               </div>
            </div>

            <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl p-6 flex items-center justify-between">
               <div>
                 <div className="flex items-center gap-2 mb-2">
                    <Users size={14} className="text-purple-400" />
                    <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">CUSTOMERS <span className="bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded text-[8px] ml-1">LIVE</span></h3>
                 </div>
                 <p className="text-3xl font-bold text-white">{stats.customers}</p>
               </div>
            </div>

            <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl p-6 flex items-center justify-between">
               <div>
                 <div className="flex items-center gap-2 mb-2">
                    <Trophy size={14} className="text-emerald-400" />
                    <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">TOURNAMENTS</h3>
                 </div>
                 <p className="text-3xl font-bold text-white">{stats.tournaments}</p>
               </div>
            </div>
          </div>
        </div>

        <div className="xl:w-1/3">
          <div className="bg-[#1E253A] border border-[#2D3748] rounded-2xl p-6 h-full shadow-[0_0_30px_rgba(34,211,238,0.05)] bg-gradient-to-b from-[#1E253A] to-[#151C2C]">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-cyan-400 p-2 rounded-xl text-black shadow-[0_0_15px_rgba(0,242,254,0.3)]">
                <BrainCircuit size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">AI Analysis</h3>
                <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest">SYSTEM THINKING...</p>
              </div>
            </div>

            <div className="bg-[#0B1120]/50 border border-[#1E293B] rounded-xl p-5 mb-4 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400"></div>
               <p className="text-xs text-white leading-relaxed mb-4">
                 Peak utilization detected between <br/><span className="text-cyan-400 font-bold text-sm">18:00 - 21:00</span>.
               </p>
               <div className="w-full h-1 bg-[#1E293B] rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 w-3/4 rounded-full shadow-[0_0_10px_rgba(0,242,254,0.8)]"></div>
               </div>
            </div>

            <div className="bg-[#0B1120]/50 border border-[#1E293B] rounded-xl p-5 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
               <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Recommendation:</p>
               <p className="text-xs text-white leading-relaxed">
                 Implement "Early Bird" tiered pricing for 08:00 - 11:00 slots to increase morning conversion by <span className="font-bold text-purple-400">~14%</span>.
               </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-bold text-white">Venue Intelligence Feed</h2>
        <button className="text-cyan-400 text-xs font-bold hover:text-cyan-300 transition-colors flex items-center gap-1">
          View Facility Gallery <span className="text-lg leading-none">›</span>
        </button>
      </div>

      <div className="relative rounded-2xl overflow-hidden h-40 md:h-64 group border border-[#1E293B]">
         <img src={boxCricketImg} alt="Box Cricket Venue" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
         <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/90 via-[#0B1120]/40 to-transparent"></div>
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-cyan-400/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-cyan-400/40 shadow-[0_0_20px_rgba(0,242,254,0.2)]">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-400 flex items-center justify-center">
              <div className="w-3 h-3 bg-cyan-400 rounded-sm rotate-45"></div>
            </div>
         </div>
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
