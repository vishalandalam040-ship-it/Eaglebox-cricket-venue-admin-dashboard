import { useState, useEffect } from 'react';
import api from '../api';
import { Users, TrendingUp, ChevronRight, User, X, Mail, Phone, Calendar as CalendarIcon, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Customers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    api.get('/customers')
      .then(res => {
        setCustomers(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching customers", err);
        setLoading(false);
      });
  }, []);

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
        <h1 className="text-3xl font-light text-white mb-2 tracking-tight">Client <span className="font-extrabold neon-text-cyan">Intelligence</span></h1>
        <p className="text-sm font-medium text-[var(--text-secondary)]">Manage your venue community and loyalty data.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] -z-10 group-hover:bg-purple-500/20 transition-all duration-700"></div>
          <div className="flex justify-between items-start mb-4 z-10">
            <div className="bg-[var(--bg-base)] p-3 rounded-2xl border border-purple-500/20 shadow-[0_0_15px_rgba(192,132,252,0.1)]">
              <Users size={22} className="text-purple-400" />
            </div>
            <div className="flex items-center text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              <TrendingUp size={12} className="mr-1.5" /> +12% Growth
            </div>
          </div>
          <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-1">Total Customers</p>
          {loading ? (
             <div className="w-24 h-10 skeleton-shimmer rounded"></div>
          ) : (
             <p className="text-4xl font-extrabold text-white tracking-tight">{customers.length}</p>
          )}
        </div>

        {user?.role !== 'Viewer' && (
          <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -z-10 group-hover:bg-emerald-500/20 transition-all duration-700"></div>
            <div className="flex justify-between items-start mb-4 z-10">
              <div className="bg-[var(--bg-base)] p-3 rounded-2xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <TrendingUp size={22} className="text-emerald-400" />
              </div>
              <div className="flex items-center text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                <Activity size={12} className="mr-1.5" /> High Retention
              </div>
            </div>
            <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-1">Avg. Lifetime Value</p>
            {loading ? (
               <div className="w-32 h-10 skeleton-shimmer rounded"></div>
            ) : (
               <p className="text-4xl font-extrabold text-white tracking-tight">
                 ₹ {customers.length > 0 
                   ? Math.round(customers.reduce((sum, c) => sum + c.lifetimeRevenue, 0) / customers.length).toLocaleString() 
                   : 0}
               </p>
            )}
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="glass-panel rounded-3xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-purple-500/5 to-transparent z-0 opacity-50 pointer-events-none"></div>
        
        <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center relative z-10 bg-white/5 backdrop-blur-md">
          <h2 className="text-xs font-extrabold text-[var(--text-secondary)] tracking-[0.2em] uppercase">MEMBER DATABASE</h2>
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-extrabold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(192,132,252,0.2)] uppercase tracking-wider">
              {customers.length} Profiles
            </span>
          </div>
        </div>
        
        <div className="relative z-10">
          {loading ? (
            <div className="divide-y divide-[var(--border-subtle)]">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full skeleton-shimmer"></div>
                    <div>
                      <div className="w-32 h-5 skeleton-shimmer mb-2 rounded"></div>
                      <div className="w-24 h-3 skeleton-shimmer rounded"></div>
                    </div>
                  </div>
                  <div className="w-24 h-8 skeleton-shimmer rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : customers.length === 0 ? (
             <div className="p-16 text-center text-[var(--text-secondary)] font-medium">No customers found.</div>
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              <AnimatePresence>
                {customers.map((customer, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={customer.id} 
                    className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => user?.role !== 'Viewer' && setSelectedCustomer(customer)}
                  >
                    <div className="flex items-center gap-5">
                       <div className="relative shrink-0">
                          <img src={`https://ui-avatars.com/api/?name=${customer.name}&background=0B1120&color=C084FC&rounded=true&bold=true`} alt={customer.name} className="w-14 h-14 rounded-full border-2 border-purple-500/30 group-hover:border-purple-400 transition-colors shadow-[0_0_15px_rgba(192,132,252,0.1)]" />
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-[var(--bg-base)] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                       </div>
                       <div>
                          <p className="font-extrabold text-white text-lg tracking-tight group-hover:text-purple-400 transition-colors">{customer.name}</p>
                          <p className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1.5 mt-0.5"><User size={12}/> ID: {customer.id}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-6 md:gap-10">
                      <div className="flex items-center bg-white/5 rounded-full pr-5 pl-1.5 py-1.5 border border-[var(--border-subtle)]">
                        <div className="bg-[var(--bg-base)] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold mr-3 border border-purple-500/20">
                           {customer.totalBookings}
                        </div>
                        <span className="text-[10px] text-[var(--text-secondary)] font-extrabold uppercase tracking-widest">Sessions</span>
                      </div>

                      {user?.role !== 'Viewer' && (
                        <div className="flex items-center gap-6">
                          <div className="flex flex-col text-right">
                             <span className="text-[9px] font-extrabold text-[var(--text-secondary)] uppercase tracking-widest mb-0.5">Lifetime Value</span>
                             <p className="font-extrabold text-emerald-400 text-lg tracking-tight">₹ {customer.lifetimeRevenue.toLocaleString()}</p>
                          </div>
                          <motion.div 
                            whileHover={{ x: 4 }}
                            className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/30 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(192,132,252,0.2)] hidden md:flex"
                          >
                            <ChevronRight size={18} />
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* Premium Customer Profile Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-[100] px-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="glass-panel border border-[var(--border-subtle)] p-8 rounded-3xl w-full max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-cyan-500"></div>
              
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em]">Profile Overview</span>
                <button onClick={() => setSelectedCustomer(null)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors border border-[var(--border-subtle)]">
                  <X size={16} className="text-[var(--text-secondary)]" />
                </button>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"></div>
                  <img src={`https://ui-avatars.com/api/?name=${selectedCustomer.name}&background=0B1120&color=C084FC&rounded=true&bold=true&size=100`} alt={selectedCustomer.name} className="w-24 h-24 rounded-full border-2 border-purple-400 shadow-[0_0_20px_rgba(192,132,252,0.4)] relative z-10" />
                </div>
                
                <div className="text-center w-full">
                  <p className="text-2xl font-light text-white tracking-tight">{selectedCustomer.name}</p>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">ID: {selectedCustomer.id}</p>
                  
                  <div className="mt-8 space-y-4 bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] p-6 rounded-2xl text-left relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-400 to-cyan-500"></div>
                    
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-[var(--text-secondary)]" />
                      <div>
                        <span className="block text-[9px] font-extrabold text-[var(--text-secondary)] uppercase tracking-widest">Email Address</span>
                        <p className="text-sm font-medium text-white">{selectedCustomer.email || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-[var(--text-secondary)]" />
                      <div>
                        <span className="block text-[9px] font-extrabold text-[var(--text-secondary)] uppercase tracking-widest">Phone Number</span>
                        <p className="text-sm font-medium text-white">{selectedCustomer.phone || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between pt-5 mt-3 border-t border-[var(--border-subtle)]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                           <CalendarIcon size={16} />
                        </div>
                        <div>
                          <span className="block text-[9px] font-extrabold text-[var(--text-secondary)] uppercase tracking-widest mb-0.5">Sessions</span>
                          <p className="font-extrabold text-white text-lg leading-none">{selectedCustomer.totalBookings}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <span className="block text-[9px] font-extrabold text-[var(--text-secondary)] uppercase tracking-widest mb-0.5">Value</span>
                          <p className="font-extrabold neon-text-cyan text-lg leading-none">₹ {selectedCustomer.lifetimeRevenue.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCustomer(null)}
                className="mt-6 w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white py-3.5 rounded-xl font-extrabold transition-all shadow-[0_0_20px_rgba(192,132,252,0.3)] tracking-wide"
              >
                Close Profile
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
