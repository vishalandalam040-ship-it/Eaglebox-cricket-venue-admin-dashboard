import { useState, useEffect } from 'react';
import api from '../api';
import { Crown, Plus, Trash2, ShieldCheck, User, Calendar, X, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';

export const Memberships = () => {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    planType: 'Silver (1 Month)',
    amountPaid: 1000,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
  });

  const fetchMemberships = () => {
    setLoading(true);
    api.get('/memberships')
      .then(res => {
        setMemberships(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching memberships", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newMembership = {
        id: 'MEM-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        ...formData,
        status: 'Active'
      };
      await api.post('/memberships', newMembership);

      // Send confirmation email
      if (formData.email) {
        emailjs.send(
          'service_jjrbdlf', 
          'template_48wbbl9', 
          {
            customerName: formData.customerName,
            email: formData.email,
            date: `Membership: ${formData.planType}`,
            time: 'Start: ' + formData.startDate,
            endTime: 'End: ' + formData.endDate,
            amount: formData.amountPaid,
            message: `Your ${formData.planType} membership is active!`
          }, 
          'FwnHDTuxpHD_Hsv8l'
        ).catch(err => console.error("EmailJS error:", err));
      }

      setShowModal(false);
      fetchMemberships();
    } catch (err) {
      alert(err.response?.data?.error || "Error creating membership");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this membership?')) {
      try {
        await api.delete(`/memberships/${id}`);
        fetchMemberships();
      } catch (err) {
        alert("Error deleting membership");
      }
    }
  };

  const handlePlanChange = (e) => {
    const plan = e.target.value;
    const start = new Date(formData.startDate);
    let amount = 1000;
    let end = new Date(start);

    if (plan.includes('1 Month')) {
      end.setMonth(start.getMonth() + 1);
      amount = 1000;
    } else if (plan.includes('3 Months')) {
      end.setMonth(start.getMonth() + 3);
      amount = 2500;
    } else if (plan.includes('1 Year')) {
      end.setFullYear(start.getFullYear() + 1);
      amount = 8000;
    }

    setFormData({
      ...formData,
      planType: plan,
      amountPaid: amount,
      endDate: end.toISOString().split('T')[0]
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
      
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] mb-2 tracking-tight">Access & <span className="font-bold text-[var(--accent-emerald)] drop-">Tiers</span></h1>
          <p className="text-sm font-medium text-[var(--text-secondary)]">Manage and monitor venue access and subscriber lifecycle.</p>
        </div>
        {user?.role !== 'Viewer' && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2    hover: hover: text-black px-6 py-2.5 rounded-sm font-bold transition-all "
          >
            <Crown size={18} /> Grant Membership
          </motion.button>
        )}
      </motion.div>

      {user?.role !== 'Viewer' && (
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* TOTAL MEMBERS */}
        <div className="glass-panel rounded-sm p-6 relative overflow-hidden group">
          <div className="absolute right-[-20px] top-4 opacity-5">
            <Crown size={120} />
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--overlay-bg)] rounded-sm blur-[40px] -z-10 group-hover:bg-[var(--overlay-bg)] transition-all duration-700"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between gap-4">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">TOTAL NETWORK</p>
            <div>
              {loading ? (
                 <div className="w-24 h-10 skeleton-shimmer rounded"></div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">{memberships.length}</p>
                  <span className="text-[10px] font-bold text-[var(--accent-emerald)] uppercase tracking-widest bg-[var(--overlay-bg)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">+12%</span>
                </div>
              )}
            </div>
            <div className="w-full h-1.5 rounded-sm bg-[var(--overlay-bg)] overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: "80%" }} className="bg-[var(--accent-emerald)] h-full w-full "></motion.div>
            </div>
          </div>
        </div>

        {/* ACTIVE SUBSCRIPTIONS */}
        <div className="glass-panel rounded-sm p-6 relative overflow-hidden group">
          <div className="absolute right-[-10px] top-4 opacity-5">
            <ShieldCheck size={100} />
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--overlay-bg)] rounded-sm blur-[40px] -z-10 group-hover:bg-[var(--overlay-bg)] transition-all duration-700"></div>

          <div className="relative z-10 flex flex-col h-full justify-between gap-4">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">ACTIVE SUBSCRIPTIONS</p>
            <div>
              {loading ? (
                 <div className="w-32 h-10 skeleton-shimmer rounded"></div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-[var(--accent-primary)] tracking-tight">{memberships.filter(m => m.status === 'Active').length}</p>
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{memberships.length ? Math.round((memberships.filter(m => m.status === 'Active').length / memberships.length) * 100) : 0}% RETAINED</span>
                </div>
              )}
            </div>
            <div className="w-full h-1.5 rounded-sm bg-[var(--overlay-bg)] overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: "75%" }} className="bg-[var(--accent-primary)] h-full "></motion.div>
            </div>
          </div>
        </div>

        {/* EXPIRING SOON */}
        <div className="glass-panel rounded-sm p-6 relative overflow-hidden group">
          <div className="absolute right-4 top-4 opacity-5">
            <Activity size={80} />
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--overlay-bg)] rounded-sm blur-[40px] -z-10 group-hover:bg-[var(--overlay-bg)] transition-all duration-700"></div>

          <div className="relative z-10 flex flex-col h-full justify-between gap-4">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">EXPIRING SOON</p>
            <div>
              {loading ? (
                 <div className="w-24 h-10 skeleton-shimmer rounded"></div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-[var(--accent-primary)] tracking-tight">
                    {memberships.filter(m => {
                      const daysLeft = (new Date(m.endDate) - new Date()) / (1000 * 60 * 60 * 24);
                      return m.status === 'Active' && daysLeft < 7 && daysLeft >= 0;
                    }).length}
                  </p>
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest bg-[var(--overlay-bg)] text-[var(--accent-primary)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">NEXT 7 DAYS</span>
                </div>
              )}
            </div>
            <div className="w-full h-1.5 rounded-sm bg-[var(--overlay-bg)] overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: "30%" }} className="bg-[var(--accent-primary)] h-full "></motion.div>
            </div>
          </div>
        </div>
      </motion.div>
      )}

      {user?.role === 'Viewer' ? (
        <motion.div variants={itemVariants} className="glass-panel rounded-sm overflow-hidden p-8 lg:p-12 mb-8 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-full    z-0 blur-[100px]"></div>
          
          <div className="relative z-10 text-center mb-12">
            <h2 className="text-3xl font-light text-[var(--text-primary)] mb-2 tracking-tight">Tier <span className="font-bold text-[var(--accent-emerald)]">Pricing</span></h2>
            <p className="text-[var(--text-secondary)] font-medium text-sm">Choose a plan that fits your needs to unlock exclusive discounts.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            {/* Silver */}
            <motion.div whileHover={{ y: -8 }} className="bg-[var(--bg-base)]/80 border border-[var(--border-subtle)] rounded-sm p-8 text-center  relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-1 bg-slate-300"></div>
               <h3 className="text-xl font-bold text-slate-300 mb-2 uppercase tracking-[0.2em]">Silver</h3>
               <p className="text-[var(--text-primary)] font-bold text-4xl mb-6 tracking-tight">₹1,000 <span className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-widest block mt-2">/ 1 Month</span></p>
               <div className="bg-slate-300/10 py-3 rounded-sm border border-slate-300/20 text-slate-300 font-bold text-xs uppercase tracking-wider">10% Off Bookings</div>
            </motion.div>
            
            {/* Gold */}
            <motion.div whileHover={{ y: -8 }} className="bg-[var(--bg-base)] border-2 border-[var(--border-subtle)] rounded-sm p-8 text-center  relative transform md:-translate-y-4">
               <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent-primary)]"></div>
               <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--accent-primary)] text-black text-[9px] font-bold px-4 py-1 rounded-sm uppercase tracking-widest ">Most Popular</div>
               <h3 className="text-xl font-bold text-[var(--accent-primary)] mb-2 uppercase tracking-[0.2em] mt-2">Gold</h3>
               <p className="text-[var(--text-primary)] font-bold text-4xl mb-6 tracking-tight">₹2,500 <span className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-widest block mt-2">/ 3 Months</span></p>
               <div className="bg-[var(--overlay-bg)] py-3 rounded-sm border border-[var(--border-subtle)] text-[var(--accent-primary)] font-bold text-xs uppercase tracking-wider">15% Off Bookings</div>
            </motion.div>
            
            {/* Platinum */}
            <motion.div whileHover={{ y: -8 }} className="bg-[var(--bg-base)]/80 border border-[var(--border-subtle)] rounded-sm p-8 text-center  relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent-primary)]"></div>
               <h3 className="text-xl font-bold text-[var(--accent-primary)] mb-2 uppercase tracking-[0.2em]">Platinum</h3>
               <p className="text-[var(--text-primary)] font-bold text-4xl mb-6 tracking-tight">₹8,000 <span className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-widest block mt-2">/ 1 Year</span></p>
               <div className="bg-[var(--overlay-bg)] py-3 rounded-sm border border-[var(--border-subtle)] text-[var(--accent-primary)] font-bold text-xs uppercase tracking-wider">20% Off Bookings</div>
            </motion.div>
          </div>
        </motion.div>
      ) : (
      <motion.div variants={itemVariants} className="glass-panel rounded-sm overflow-hidden  relative">
        <div className="absolute top-0 right-0 w-full h-full    z-0 opacity-50 pointer-events-none"></div>

        <div className="p-5 border-b border-[var(--border-subtle)] flex justify-between items-center relative z-10 bg-[var(--overlay-bg)] ">
           <h2 className="text-xs font-bold text-[var(--text-secondary)] tracking-[0.2em] uppercase">MEMBER DIRECTORY</h2>
        </div>
        
        <div className="relative z-10 overflow-x-auto custom-scrollbar">
          {loading ? (
             <div className="divide-y divide-[var(--border-subtle)]">
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className="p-6 flex items-center justify-between gap-4">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-sm skeleton-shimmer"></div>
                     <div className="w-32 h-4 skeleton-shimmer rounded"></div>
                   </div>
                   <div className="w-24 h-6 skeleton-shimmer rounded-sm"></div>
                 </div>
               ))}
             </div>
          ) : (
            <table className="w-full min-w-[800px] text-left border-collapse whitespace-nowrap">
               <thead>
                 <tr className="border-b border-[var(--border-subtle)]">
                    <th className="px-8 py-5 text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">Member Details</th>
                    <th className="px-8 py-5 text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">Tier</th>
                    <th className="px-8 py-5 text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">Validity Cycle</th>
                    <th className="px-8 py-5 text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-[var(--border-subtle)]">
                 <AnimatePresence>
                   {memberships.map((member, index) => {
                     const daysLeft = Math.ceil((new Date(member.endDate) - new Date()) / (1000 * 60 * 60 * 24));
                     const isExpiringSoon = daysLeft < 7 && daysLeft >= 0;
                     const isExpired = daysLeft < 0;
                     
                     let planBadgeStyle = "bg-slate-500/10 text-slate-300 border border-slate-500/20 ";
                     let planLabel = member.planType;
                     
                     if (member.planType.includes('Platinum') || member.planType.includes('1 Year')) {
                       planBadgeStyle = "bg-[var(--overlay-bg)] text-[var(--accent-primary)] border border-[var(--border-subtle)] ";
                       planLabel = "PLATINUM ELITE";
                     } else if (member.planType.includes('Gold') || member.planType.includes('3 Months')) {
                       planBadgeStyle = "bg-[var(--overlay-bg)] text-[var(--accent-primary)] border border-[var(--border-subtle)] ";
                       planLabel = "GOLD PRO";
                     } else {
                       planBadgeStyle = "bg-slate-300/10 text-slate-300 border border-slate-300/20 ";
                       planLabel = "SILVER CORE";
                     }

                     return (
                       <motion.tr 
                         initial={{ opacity: 0, x: -10 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: index * 0.05 }}
                         key={member.id} 
                         className="hover:bg-[var(--overlay-bg)] transition-colors group"
                       >
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-4">
                                <img src={`https://ui-avatars.com/api/?name=${member.customerName}&background=0B1120&color=fff&rounded=true&bold=true`} alt={member.customerName} className="w-12 h-12 rounded-sm border border-[var(--border-subtle)]" />
                                <div>
                                   <p className="font-bold text-[var(--text-primary)] text-base tracking-tight">{member.customerName}</p>
                                   <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1"><User size={10}/> #{member.id}</span>
                                      <span className="w-1 h-1 rounded-sm bg-[var(--border-subtle)]"></span>
                                      <span className="text-xs font-medium text-[var(--text-secondary)]">{member.email || 'customer@example.com'}</span>
                                   </div>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <span className={`px-3 py-1.5 rounded-sm text-[9px] font-bold uppercase tracking-widest ${planBadgeStyle}`}>
                               {planLabel}
                             </span>
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-2 mb-1.5">
                               <Calendar size={14} className="text-[var(--text-secondary)]" />
                               <p className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                                 {new Date(member.startDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} <span className="text-[var(--text-secondary)] font-normal mx-1">→</span> {new Date(member.endDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                               </p>
                             </div>
                             {isExpired ? (
                               <p className="text-[10px] text-[var(--accent-primary)] font-bold uppercase tracking-widest">EXPIRED</p>
                             ) : isExpiringSoon ? (
                               <p className="text-[10px] text-[var(--accent-primary)] font-bold uppercase tracking-widest animate-pulse">EXPIRING IN {daysLeft} DAYS</p>
                             ) : (
                               <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">
                                 ACTIVE ({Math.ceil(daysLeft / 30)} MONTHS LEFT)
                               </p>
                             )}
                          </td>
                          <td className="px-8 py-5 text-right">
                             {user?.role !== 'Viewer' ? (
                               <button onClick={() => handleDelete(member.id)} className="w-10 h-10 rounded-sm flex items-center justify-center ml-auto border border-transparent hover:border-[var(--border-subtle)] hover:bg-[var(--overlay-bg)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors" title="Revoke Access">
                                 <Trash2 size={16} />
                               </button>
                             ) : (
                               <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest border border-[var(--border-subtle)] px-3 py-1.5 rounded-sm">Read Only</span>
                             )}
                          </td>
                       </motion.tr>
                     );
                   })}
                 </AnimatePresence>
                 {memberships.length === 0 && !loading && (
                   <tr>
                      <td colSpan="4" className="px-8 py-16 text-center text-[var(--text-secondary)] font-medium">No active memberships found in the system.</td>
                   </tr>
                 )}
               </tbody>
            </table>
          )}
        </div>
      </motion.div>
      )}

      {/* Premium Grant Membership Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 ">
            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="glass-panel border border-[var(--border-subtle)] rounded-sm w-full max-w-md  p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1   "></div>
              
              <div className="flex justify-between items-center mb-8">
                 <div>
                   <h2 className="text-2xl font-light text-[var(--text-primary)] tracking-tight">Grant <span className="font-bold text-[var(--accent-primary)]">Membership</span></h2>
                   <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1">Activate Subscription</p>
                 </div>
                 <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-sm flex items-center justify-center bg-[var(--overlay-bg)] hover:bg-[var(--overlay-hover)] transition-colors border border-[var(--border-subtle)]">
                   <X size={18} className="text-[var(--text-secondary)]" />
                 </button>
              </div>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Customer Name</label>
                  <input required type="text" className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-sm px-4 py-3 outline-none focus:border-[var(--border-subtle)] text-[var(--text-primary)] font-medium transition-colors" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} placeholder="Enter full name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Email</label>
                    <input required type="email" className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-sm px-4 py-3 outline-none focus:border-[var(--border-subtle)] text-[var(--text-primary)] font-medium" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="abc@xyz.com" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Phone</label>
                    <input required type="text" className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-sm px-4 py-3 outline-none focus:border-[var(--border-subtle)] text-[var(--text-primary)] font-medium" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Phone number" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Tier Assignment</label>
                  <div className="relative">
                    <select className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-sm px-4 py-3.5 outline-none focus:border-[var(--border-subtle)] text-[var(--text-primary)] font-bold appearance-none " value={formData.planType} onChange={handlePlanChange}>
                      <option value="Silver (1 Month)" className="bg-[var(--bg-base)]">Silver Core (₹1,000 / mo)</option>
                      <option value="Gold (3 Months)" className="bg-[var(--bg-base)] text-[var(--accent-primary)]">Gold Pro (₹2,500 / 3 mo)</option>
                      <option value="Platinum (1 Year)" className="bg-[var(--bg-base)] text-[var(--accent-primary)]">Platinum Elite (₹8,000 / yr)</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-secondary)]"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex gap-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3.5 rounded-sm border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold hover:bg-[var(--overlay-bg)] transition-colors">Cancel</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="flex-1 px-4 py-3.5 rounded-sm    text-black font-bold  transition-all flex items-center justify-center gap-2">
                    <ShieldCheck size={18} /> Confirm & Pay
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
