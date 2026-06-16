import { useState, useEffect } from 'react';
import api from '../api';
import { Users, TrendingUp, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Customers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    // Fetch mock data from backend
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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-0">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-1">Customer Management</h1>
        <p className="text-sm text-[var(--text-secondary)]">Manage your venue community and loyalty data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-[#1E293B] p-3 rounded-full">
              <Users size={20} className="text-purple-400" />
            </div>
            <div className="flex items-center text-emerald-400 text-xs font-bold">
              <TrendingUp size={14} className="mr-1" /> +12%
            </div>
          </div>
          <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">Total Customers</p>
          <p className="text-3xl font-bold text-white">{customers.length}</p>
        </div>

        {user?.role !== 'Viewer' && (
          <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <div className="bg-[#1E293B] p-3 rounded-full">
                <TrendingUp size={20} className="text-emerald-400" />
              </div>
              <div className="flex items-center text-emerald-400 text-xs font-bold">
                <TrendingUp size={14} className="mr-1" /> +8.4%
              </div>
            </div>
            <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">Avg. LTV</p>
            <p className="text-3xl font-bold text-white">
              ₹ {customers.length > 0 
                ? Math.round(customers.reduce((sum, c) => sum + c.lifetimeRevenue, 0) / customers.length).toLocaleString() 
                : 0}
            </p>
          </div>
        )}
      </div>

      <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[#1E293B] flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Active Customers</h2>
        </div>
        
        {loading ? (
          <div className="text-center p-12 text-[var(--text-secondary)] animate-pulse">Loading customers...</div>
        ) : (
          <div className="divide-y divide-[#1E293B]">
            {customers.map(customer => (
              <div key={customer.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                   <div className="relative">
                      <img src={`https://ui-avatars.com/api/?name=${customer.name}&background=1E293B&color=fff&rounded=true`} alt={customer.name} className="w-12 h-12 rounded-full border border-purple-500/50" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#151C2C] rounded-full"></div>
                   </div>
                   <div>
                      <p className="font-bold text-white text-base">{customer.name}</p>
                      <p className="text-xs text-[var(--text-secondary)] truncate w-40 md:w-auto">ID: {customer.id}</p>
                   </div>
                </div>

                <div className="flex items-center gap-4 md:gap-8 ml-16 md:ml-0">
                  <div className="flex items-center bg-[#1E293B] rounded-full pr-4 pl-1 py-1">
                    <div className="bg-[#151C2C] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2">
                       {customer.totalBookings}
                    </div>
                    <span className="text-xs text-[var(--text-secondary)] font-medium">Bookings</span>
                  </div>

                  {user?.role !== 'Viewer' && (
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-emerald-400 whitespace-nowrap">₹ {customer.lifetimeRevenue.toLocaleString()}</p>
                      <button 
                        onClick={() => setSelectedCustomer(customer)}
                        className="text-cyan-400 hover:text-white hover:bg-cyan-500/20 px-4 py-1.5 rounded-lg border border-cyan-500/30 transition-colors text-xs font-bold whitespace-nowrap"
                      >
                        View Profile
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {customers.length === 0 && (
               <div className="p-12 text-center text-[var(--text-secondary)]">No customers found.</div>
            )}
            <div className="p-6 text-center">
              <span className="text-[var(--text-secondary)] text-xs font-medium uppercase tracking-widest">End of list</span>
            </div>
          </div>
        )}
      </div>

      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in px-4">
          <div className="bg-[#151C2C] border border-[#1E293B] p-6 rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in-95">
            <h2 className="text-xl font-bold mb-6 text-center text-white">Customer Profile</h2>
            <div className="flex flex-col items-center gap-4">
              <img src={`https://ui-avatars.com/api/?name=${selectedCustomer.name}&background=1E293B&color=fff&rounded=true&size=80`} alt={selectedCustomer.name} className="w-20 h-20 rounded-full border-2 border-purple-500/50" />
              <div className="text-center w-full">
                <p className="text-xl font-bold text-white">{selectedCustomer.name}</p>
                <div className="mt-6 space-y-3 bg-[#0B1120] border border-[#1E293B] p-5 rounded-2xl text-left">
                  <div>
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Email ID</span>
                    <p className="text-sm font-medium text-white">{selectedCustomer.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Phone Number</span>
                    <p className="text-sm font-medium text-white">{selectedCustomer.phone || 'N/A'}</p>
                  </div>
                  <div className="flex justify-between pt-4 mt-2 border-t border-[#1E293B]">
                    <div>
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Bookings</span>
                      <p className="font-bold text-white text-lg">{selectedCustomer.totalBookings}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Lifetime Rev.</span>
                      <p className="font-bold text-emerald-400 text-lg">₹ {selectedCustomer.lifetimeRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setSelectedCustomer(null)}
              className="mt-6 w-full bg-[#1E293B] hover:bg-white/10 text-white py-3 rounded-xl font-bold transition-colors border border-[var(--border-color)]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
