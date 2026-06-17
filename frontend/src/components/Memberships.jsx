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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Membership Portal</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage premium subscriptions and perks.</p>
        </div>
        {user?.role !== 'Viewer' && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-black px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(0,242,254,0.3)] active:scale-95"
          >
            <Plus size={18} /> New Member
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl p-5 flex items-center gap-4">
          <div className="bg-[#1E293B] p-3 rounded-xl border border-[#1E293B]">
            <Crown size={24} className="text-purple-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Total Members</p>
            <p className="text-2xl font-bold text-white">{memberships.length}</p>
          </div>
        </div>
        <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl p-5 flex items-center gap-4">
          <div className="bg-[#1E293B] p-3 rounded-xl border border-[#1E293B]">
            <ShieldCheck size={24} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Active Members</p>
            <p className="text-2xl font-bold text-white">{memberships.filter(m => m.status === 'Active').length}</p>
          </div>
        </div>
        {user?.role !== 'Viewer' && (
          <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl p-5 flex items-center gap-4">
            <div className="bg-[#1E293B] p-3 rounded-xl border border-[#1E293B]">
              <ShieldAlert size={24} className="text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Expiring Soon</p>
              <p className="text-2xl font-bold text-white">
                {memberships.filter(m => {
                  const daysLeft = (new Date(m.endDate) - new Date()) / (1000 * 60 * 60 * 24);
                  return m.status === 'Active' && daysLeft < 7 && daysLeft >= 0;
                }).length}
              </p>
            </div>
          </div>
        )}
      </div>

      {user?.role === 'Viewer' ? (
        <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl overflow-hidden p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Membership Pricing</h2>
          <p className="text-[var(--text-secondary)] text-center text-sm mb-8">Choose a plan that fits your needs to unlock exclusive discounts.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0B1120] border border-[#1E293B] rounded-2xl p-6 text-center shadow-lg">
               <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest text-slate-300">Silver</h3>
               <p className="text-slate-300 font-bold text-3xl mb-4">₹1,000 <span className="text-sm text-[var(--text-secondary)] font-normal">/ 1 Month</span></p>
               <p className="text-sm text-[var(--text-secondary)] bg-slate-300/10 py-2 rounded-lg border border-slate-300/20 text-slate-300 font-medium">10% Discount on Bookings</p>
            </div>
            <div className="bg-[#0B1120] border-2 border-amber-500/50 rounded-2xl p-6 text-center shadow-[0_0_20px_rgba(245,158,11,0.15)] relative transform md:-translate-y-2">
               <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">Most Popular</div>
               <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest text-amber-400">Gold</h3>
               <p className="text-amber-400 font-bold text-3xl mb-4">₹2,500 <span className="text-sm text-[var(--text-secondary)] font-normal">/ 3 Months</span></p>
               <p className="text-sm text-[var(--text-secondary)] bg-amber-500/10 py-2 rounded-lg border border-amber-500/20 text-amber-400 font-medium">15% Discount on Bookings</p>
            </div>
            <div className="bg-[#0B1120] border border-[#1E293B] rounded-2xl p-6 text-center shadow-lg">
               <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest text-purple-400">Platinum</h3>
               <p className="text-purple-400 font-bold text-3xl mb-4">₹8,000 <span className="text-sm text-[var(--text-secondary)] font-normal">/ 1 Year</span></p>
               <p className="text-sm text-[var(--text-secondary)] bg-purple-500/10 py-2 rounded-lg border border-purple-500/20 text-purple-400 font-medium">20% Discount on Bookings</p>
            </div>
          </div>
        </div>
      ) : (
      <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[#1E293B] flex justify-between items-center bg-[#0B1120]">
          <h2 className="text-sm font-bold text-white tracking-wider">ACTIVE MEMBERSHIPS</h2>
        </div>
        
        {loading ? (
          <div className="text-center p-12 text-[var(--text-secondary)] animate-pulse">Loading memberships...</div>
        ) : (
          <div className="divide-y divide-[#1E293B]">
            {memberships.map(member => (
              <div key={member.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                   <div className="relative hidden md:block">
                      <img src={`https://ui-avatars.com/api/?name=${member.customerName}&background=1E293B&color=fff&rounded=true`} alt={member.customerName} className="w-12 h-12 rounded-full border border-purple-500/50" />
                   </div>
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                         <p className="font-bold text-white text-base">{member.customerName}</p>
                         <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${member.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                           {member.status}
                         </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] font-medium">{member.email} • {member.phone}</p>
                   </div>
                </div>

                <div className="flex flex-wrap md:flex-nowrap items-center gap-4 lg:gap-8 bg-[#0B1120] lg:bg-transparent p-3 lg:p-0 rounded-xl border border-[#1E293B] lg:border-none">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Plan</span>
                      <p className="text-sm font-bold text-purple-400 whitespace-nowrap">{member.planType}</p>
                   </div>

                   <div className="flex flex-col pl-4 border-l border-[#1E293B]">
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Validity</span>
                      <p className="text-sm font-bold text-white whitespace-nowrap">{new Date(member.endDate).toLocaleDateString()}</p>
                      <p className="text-[10px] text-[var(--text-secondary)]">From: {new Date(member.startDate).toLocaleDateString()}</p>
                   </div>
                </div>

                {user?.role !== 'Viewer' && (
                  <div className="flex items-center mt-2 lg:mt-0">
                    <button onClick={() => handleDelete(member.id)} className="w-full lg:w-auto px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-2" title="Delete Membership">
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
            {memberships.length === 0 && (
               <div className="p-12 text-center text-[var(--text-secondary)]">No memberships found.</div>
            )}
            <div className="p-6 text-center">
              <span className="text-[var(--text-secondary)] text-xs font-medium uppercase tracking-widest">End of list</span>
            </div>
          </div>
        )}
      </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#151C2C] border border-[#1E293B] rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 p-6">
            <h2 className="text-xl font-bold mb-6 text-white">Register Member</h2>
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
                  <option value="Silver (1 Month)" className="bg-[#151C2C] text-white">Silver (1 Month) - ₹1,000</option>
                  <option value="Gold (3 Months)" className="bg-[#151C2C] text-white">Gold (3 Months) - ₹2,500</option>
                  <option value="Platinum (1 Year)" className="bg-[#151C2C] text-white">Platinum (1 Year) - ₹8,000</option>
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
