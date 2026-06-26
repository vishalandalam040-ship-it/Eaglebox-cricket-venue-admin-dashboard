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
          <h1 className="text-3xl font-semibold text-[var(--text-primary)] mb-2 tracking-tight">Access & Tiers</h1>
          <p className="text-sm font-medium text-[var(--text-secondary)]">Manage and monitor venue access and subscriber lifecycle.</p>
        </div>
        {user?.role !== 'Viewer' && (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Crown size={18} /> Grant Membership
          </motion.button>
        )}
      </motion.div>

      {user?.role !== 'Viewer' && (
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* TOTAL MEMBERS */}
        <div className="glass-panel-interactive p-6 relative overflow-hidden group">
          <div className="absolute right-[-20px] top-4 opacity-5">
            <Crown size={120} />
          </div>
          
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
        <div className="glass-panel-interactive p-6 relative overflow-hidden group">
          <div className="absolute right-[-10px] top-4 opacity-5">
            <ShieldCheck size={100} />
          </div>

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
        <div className="glass-panel-interactive p-6 relative overflow-hidden group">
          <div className="absolute right-4 top-4 opacity-5">
            <Activity size={80} />
          </div>

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
        <motion.div variants={itemVariants} className="mb-8 mt-12">
          <div className="text-center mb-16 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[var(--accent-primary)] blur-[120px] opacity-20 pointer-events-none"></div>
            <h2 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-4 tracking-tight">Level Up Your Game.</h2>
            <p className="text-[var(--text-secondary)] font-medium text-lg max-w-xl mx-auto">Join the elite. Unlock priority bookings, exclusive tournament access, and premium venue discounts.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 max-w-6xl mx-auto px-4 md:px-0">
            {/* Silver */}
            <motion.div whileHover={{ y: -8, scale: 1.02 }} className="glass-panel border border-[var(--border-subtle)] rounded-2xl p-8 flex flex-col relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-1 bg-slate-400"></div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-slate-400/10 blur-[50px] -z-10 group-hover:bg-slate-400/20 transition-all duration-500"></div>
               
               <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">Silver Core</h3>
               <p className="text-sm text-[var(--text-secondary)] font-medium h-10 mb-6">Perfect for casual players looking for occasional access.</p>
               
               <div className="mb-8">
                 <p className="text-[var(--text-primary)] font-black text-5xl tracking-tighter">₹1k <span className="text-sm text-[var(--text-secondary)] font-bold uppercase tracking-widest block mt-2">/ month</span></p>
               </div>
               
               <div className="flex-1 flex flex-col gap-4 mb-8">
                 <div className="flex items-start gap-3"><ShieldCheck size={18} className="text-slate-400 mt-0.5 shrink-0"/><span className="text-sm text-[var(--text-secondary)] font-medium">10% Off all bookings</span></div>
                 <div className="flex items-start gap-3"><ShieldCheck size={18} className="text-slate-400 mt-0.5 shrink-0"/><span className="text-sm text-[var(--text-secondary)] font-medium">Standard tournament entry</span></div>
               </div>
               
               <button className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--overlay-bg)] transition-colors">Select Plan</button>
            </motion.div>
            
            {/* Gold (Glowing) */}
            <motion.div whileHover={{ y: -8, scale: 1.02 }} className="bg-[var(--bg-base)] border border-[var(--accent-primary)] shadow-[0_0_30px_rgba(0,0,0,0.2)] md:shadow-[0_0_40px_rgba(0,0,0,0.3)] rounded-2xl p-8 flex flex-col relative overflow-hidden group transform md:-translate-y-4">
               <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-primary)]/10 to-transparent opacity-50"></div>
               <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[var(--accent-primary)] text-black text-[10px] font-black px-6 py-1.5 rounded-b-lg uppercase tracking-widest z-20">Most Popular</div>
               
               <div className="relative z-10">
                 <h3 className="text-2xl font-bold text-[var(--accent-primary)] mb-2 tracking-tight mt-4">Gold Pro</h3>
                 <p className="text-sm text-[var(--text-secondary)] font-medium h-10 mb-6">For dedicated athletes demanding regular premium access.</p>
                 
                 <div className="mb-8">
                   <p className="text-[var(--text-primary)] font-black text-5xl tracking-tighter">₹2.5k <span className="text-sm text-[var(--text-secondary)] font-bold uppercase tracking-widest block mt-2">/ 3 months</span></p>
                 </div>
                 
                 <div className="flex-1 flex flex-col gap-4 mb-8">
                   <div className="flex items-start gap-3"><ShieldCheck size={18} className="text-[var(--accent-primary)] mt-0.5 shrink-0"/><span className="text-sm text-[var(--text-primary)] font-medium">15% Off all bookings</span></div>
                   <div className="flex items-start gap-3"><ShieldCheck size={18} className="text-[var(--accent-primary)] mt-0.5 shrink-0"/><span className="text-sm text-[var(--text-primary)] font-medium">Priority tournament entry</span></div>
                   <div className="flex items-start gap-3"><ShieldCheck size={18} className="text-[var(--accent-primary)] mt-0.5 shrink-0"/><span className="text-sm text-[var(--text-primary)] font-medium">Free equipment rental</span></div>
                 </div>
                 
                 <button className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider bg-[var(--accent-primary)] text-black transition-all hover:scale-[1.02]">Go Pro</button>
               </div>
            </motion.div>
            
            {/* Platinum */}
            <motion.div whileHover={{ y: -8, scale: 1.02 }} className="glass-panel border border-[var(--border-subtle)] rounded-2xl p-8 flex flex-col relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent-emerald)]"></div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-emerald)]/10 blur-[50px] -z-10 group-hover:bg-[var(--accent-emerald)]/20 transition-all duration-500"></div>
               
               <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">Platinum Elite</h3>
               <p className="text-sm text-[var(--text-secondary)] font-medium h-10 mb-6">Ultimate flexibility and savings for teams and pros.</p>
               
               <div className="mb-8">
                 <p className="text-[var(--text-primary)] font-black text-5xl tracking-tighter">₹8k <span className="text-sm text-[var(--text-secondary)] font-bold uppercase tracking-widest block mt-2">/ year</span></p>
               </div>
               
               <div className="flex-1 flex flex-col gap-4 mb-8">
                 <div className="flex items-start gap-3"><ShieldCheck size={18} className="text-[var(--accent-emerald)] mt-0.5 shrink-0"/><span className="text-sm text-[var(--text-secondary)] font-medium">20% Off all bookings</span></div>
                 <div className="flex items-start gap-3"><ShieldCheck size={18} className="text-[var(--accent-emerald)] mt-0.5 shrink-0"/><span className="text-sm text-[var(--text-secondary)] font-medium">VIP tournament seeding</span></div>
                 <div className="flex items-start gap-3"><ShieldCheck size={18} className="text-[var(--accent-emerald)] mt-0.5 shrink-0"/><span className="text-sm text-[var(--text-secondary)] font-medium">Free guest passes (2/mo)</span></div>
               </div>
               
               <button className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--overlay-bg)] transition-colors">Select Plan</button>
            </motion.div>
          </div>
        </motion.div>
      ) : (
      <motion.div variants={itemVariants} className="glass-panel overflow-hidden relative">

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
                         layout
                         initial={{ opacity: 0, x: -10 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         transition={{ delay: index * 0.05 }}
                         key={member.id} 
                         className="hover:bg-[var(--bg-surface-hover)] transition-colors group cursor-default"
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
            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="glass-panel border border-[var(--border-subtle)] rounded-md w-[95%] sm:w-full max-w-md p-6 md:p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="flex-1 btn-primary flex items-center justify-center gap-2">
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
