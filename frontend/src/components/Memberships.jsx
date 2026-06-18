import { useState, useEffect } from 'react';
import api from '../api';
import { Crown, Plus, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-0 px-2 md:px-0">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Membership Portal</h1>
          <p className="text-sm text-slate-300">Manage and monitor venue access and subscriber lifecycle.</p>
        </div>
        {user?.role !== 'Viewer' && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-black px-6 py-2.5 rounded-full font-bold transition-all shadow-[0_0_15px_rgba(0,242,254,0.3)] active:scale-95"
          >
            <Plus size={18} /> New Member
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* TOTAL MEMBERS */}
        <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl p-6 relative overflow-hidden h-32">
          <div className="absolute right-[-20px] top-4 opacity-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TOTAL MEMBERS</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-white">{memberships.length}</p>
              <span className="text-xs font-bold text-cyan-400 flex items-center mb-1"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-0.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg> +12%</span>
            </div>
            <div className="w-1/2 h-1 rounded-full bg-[#1E293B] overflow-hidden mt-1">
               <div className="bg-cyan-400 h-full w-full"></div>
            </div>
          </div>
        </div>

        {/* ACTIVE SUBSCRIPTIONS */}
        <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl p-6 relative overflow-hidden h-32">
          <div className="absolute right-[-10px] top-4 opacity-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ACTIVE SUBSCRIPTIONS</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-purple-400">{memberships.filter(m => m.status === 'Active').length}</p>
              <span className="text-xs text-slate-400 font-medium mb-1">{memberships.length ? Math.round((memberships.filter(m => m.status === 'Active').length / memberships.length) * 100) : 0}% of total</span>
            </div>
            <div className="w-2/3 h-1 rounded-full bg-[#1E293B] overflow-hidden mt-1">
               <div className="bg-purple-400 h-full w-3/4"></div>
            </div>
          </div>
        </div>

        {/* EXPIRING SOON */}
        <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl p-6 relative overflow-hidden h-32">
          <div className="absolute right-4 top-4 opacity-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">EXPIRING SOON</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-amber-500">
                {memberships.filter(m => {
                  const daysLeft = (new Date(m.endDate) - new Date()) / (1000 * 60 * 60 * 24);
                  return m.status === 'Active' && daysLeft < 7 && daysLeft >= 0;
                }).length}
              </p>
              <span className="text-xs text-slate-400 font-medium mb-1">Next 7 days</span>
            </div>
            <div className="w-1/4 h-1 rounded-full bg-[#1E293B] overflow-hidden mt-1">
               <div className="bg-amber-500 h-full w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-[#1E293B] flex justify-end">
           <div className="w-8 h-4 rounded-full bg-[#1E293B] flex items-center p-0.5">
             <div className="w-3 h-3 rounded-full bg-slate-500 translate-x-4"></div>
           </div>
        </div>
        
        {loading ? (
          <div className="text-center p-12 text-[var(--text-secondary)] animate-pulse">Loading memberships...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-[#1E293B]">
                    <th className="px-6 py-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Member Name</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Member ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Plan Type</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Validity Period</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-[#1E293B]">
                 {memberships.map(member => {
                   const isExpiringSoon = (new Date(member.endDate) - new Date()) / (1000 * 60 * 60 * 24) < 7;
                   let planBadgeStyle = "bg-slate-500/10 text-slate-400 border border-slate-500/20";
                   let planLabel = member.planType;
                   
                   if (member.planType.includes('Platinum') || member.planType.includes('1 Year')) {
                     planBadgeStyle = "bg-purple-500/10 text-purple-400 border border-purple-500/20";
                     planLabel = "PLATINUM ELITE";
                   } else if (member.planType.includes('Gold') || member.planType.includes('3 Months')) {
                     planBadgeStyle = "bg-amber-500/10 text-amber-500 border border-amber-500/20";
                     planLabel = "GOLD PRO";
                   } else {
                     planBadgeStyle = "bg-slate-400/10 text-slate-300 border border-slate-400/20";
                     planLabel = "SILVER CORE";
                   }

                   return (
                     <tr key={member.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-4">
                              <img src={`https://ui-avatars.com/api/?name=${member.customerName}&background=0B1120&color=fff&rounded=true`} alt={member.customerName} className="w-10 h-10 rounded-full border border-[#1E293B]" />
                              <div>
                                 <p className="font-bold text-white text-sm">{member.customerName}</p>
                                 <p className="text-xs text-[var(--text-secondary)]">{member.email || 'customer@example.com'}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-400">
                           #{member.id}
                        </td>
                        <td className="px-6 py-4">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${planBadgeStyle}`}>
                             {planLabel}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-xs font-bold text-white mb-0.5">
                             {new Date(member.startDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} - {new Date(member.endDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                           </p>
                           {isExpiringSoon ? (
                             <p className="text-[10px] text-amber-500 italic font-medium">Expiring in {Math.ceil((new Date(member.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days</p>
                           ) : (
                             <p className="text-[10px] text-[var(--text-secondary)] italic">
                               {Math.ceil((new Date(member.endDate) - new Date()) / (1000 * 60 * 60 * 24 * 30))} months remaining
                             </p>
                           )}
                        </td>
                        <td className="px-6 py-4 text-right">
                           {user?.role !== 'Viewer' ? (
                             <div className="relative inline-block text-left">
                                <button className="p-2 rounded-lg hover:bg-white/10 transition-colors text-[var(--text-secondary)]">
                                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                </button>
                                <div className="absolute right-0 mt-1 w-32 bg-[#0B1120] border border-[#1E293B] rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 flex flex-col p-1">
                                   <button onClick={() => handleDelete(member.id)} className="w-full text-left px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2">
                                     <Trash2 size={12} /> Delete
                                   </button>
                                </div>
                             </div>
                           ) : (
                             <span className="text-[10px] text-[var(--text-secondary)]">Read Only</span>
                           )}
                        </td>
                     </tr>
                   );
                 })}
                 {memberships.length === 0 && (
                   <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-[var(--text-secondary)]">No memberships found.</td>
                   </tr>
                 )}
               </tbody>
            </table>
          </div>
        )}
        
        <div className="p-6 border-t border-[#1E293B] flex flex-col md:flex-row items-center justify-between gap-4">
           <p className="text-xs text-[var(--text-secondary)]">Showing <span className="font-bold text-white">1</span> to <span className="font-bold text-white">{Math.min(4, memberships.length)}</span> of <span className="font-bold text-white">{memberships.length}</span> members</p>
           <div className="flex gap-1">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#1E293B] bg-[#0B1120] hover:bg-white/5 text-[var(--text-secondary)] transition-colors">‹</button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-cyan-500/30 bg-[#102A30] text-cyan-400 font-bold text-xs transition-colors">1</button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#1E293B] bg-[#0B1120] hover:bg-white/5 text-[var(--text-secondary)] font-bold text-xs transition-colors">2</button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#1E293B] bg-[#0B1120] hover:bg-white/5 text-[var(--text-secondary)] font-bold text-xs transition-colors">3</button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#1E293B] bg-[#0B1120] hover:bg-white/5 text-[var(--text-secondary)] transition-colors">›</button>
           </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#151C2C] border border-[#1E293B] rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 p-6">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold text-white">Register Member</h2>
               <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-[var(--text-secondary)]">
                 <Plus size={20} className="rotate-45" />
               </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Customer Name</label>
                <input required type="text" className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 text-white" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Email ID</label>
                <input required type="email" className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 text-white" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Phone Number</label>
                <input required type="text" className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 text-white" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Plan Type</label>
                <select className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 text-white" value={formData.planType} onChange={handlePlanChange}>
                  <option value="Silver (1 Month)" className="bg-[#151C2C] text-white">Silver Core - ₹1,000</option>
                  <option value="Gold (3 Months)" className="bg-[#151C2C] text-white">Gold Pro - ₹2,500</option>
                  <option value="Platinum (1 Year)" className="bg-[#151C2C] text-white">Platinum Elite - ₹8,000</option>
                </select>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 rounded-xl border border-[#1E293B] text-white font-bold hover:bg-white/5 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-cyan-400 text-black font-bold hover:bg-cyan-300 shadow-[0_0_15px_rgba(0,242,254,0.3)] transition-all active:scale-95">Confirm & Pay</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
