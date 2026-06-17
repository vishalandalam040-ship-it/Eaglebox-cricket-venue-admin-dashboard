import { useState, useEffect } from 'react';
import api from '../api';
import { MessageCircle, Plus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newBooking, setNewBooking] = useState({ customerName: '', phone: '', date: '', time: '', endTime: '', amount: '', status: 'Confirmed' });
  const [hourlyRate, setHourlyRate] = useState(1000);
  const [isSavingRate, setIsSavingRate] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchSettings();
  }, []);

  const fetchSettings = () => {
    api.get('/settings')
      .then(res => {
        if (res.data.hourlyRate) {
          setHourlyRate(Number(res.data.hourlyRate));
        }
      })
      .catch(err => console.error("Error fetching settings", err));
  };

  const fetchBookings = () => {
    setLoading(true);
    api.get('/bookings')
      .then(res => {
        setBookings(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching bookings", err);
        setLoading(false);
      });
  };

  const sendWhatsApp = (booking) => {
    const text = encodeURIComponent(`Hi ${booking.customerName}, your Box Cricket booking for ${booking.date} at ${booking.time} is confirmed!`);
    window.open(`https://wa.me/${booking.phone}?text=${text}`, '_blank');
  };

  const handleEditClick = (booking) => {
    setNewBooking({
      customerName: booking.customerName,
      phone: booking.phone,
      date: booking.date,
      time: booking.time,
      endTime: booking.endTime || '',
      amount: booking.amount,
      status: booking.status
    });
    setEditingId(booking.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleCreateBooking = (e) => {
    e.preventDefault();
    
    // Validate phone number format (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(newBooking.phone)) {
      alert("Invalid WhatsApp number and the slot couldnot be booked . Give a valid WhatsApp number");
      return;
    }

    if (!newBooking.endTime) {
      alert("Please select an End Time.");
      return;
    }

    const startParts = newBooking.time.split(':');
    const endParts = newBooking.endTime.split(':');
    const durationHours = (parseInt(endParts[0]) + parseInt(endParts[1])/60) - (parseInt(startParts[0]) + parseInt(startParts[1])/60);
    
    if (durationHours < 1) {
      alert("A minimum of one-hour slot should be booked.");
      return;
    }

    let discount = 0;
    if (user?.membership?.includes('Silver')) discount = 0.10;
    else if (user?.membership?.includes('Gold')) discount = 0.15;
    else if (user?.membership?.includes('Platinum')) discount = 0.20;

    const minimumAmount = durationHours * hourlyRate * (1 - discount);
    if (Number(newBooking.amount) < minimumAmount) {
      alert(`The minimum price for a ${durationHours}-hour slot is ₹${minimumAmount} ${discount > 0 ? '(Member Discount Applied)' : ''}.`);
      return;
    }
    
    if (isEditMode) {
      api.put(`/bookings/${editingId}`, newBooking)
        .then(res => {
          setBookings(bookings.map(b => b.id === editingId ? { id: editingId, ...newBooking } : b));
          setIsModalOpen(false);
          setIsEditMode(false);
          setEditingId(null);
          setNewBooking({ customerName: '', phone: '', date: '', time: '', amount: '', status: 'Confirmed' });
        })
        .catch(err => {
          console.error("Error updating booking", err);
          alert(err.response?.data?.error || "Failed to update booking.");
        });
    } else {
      const id = 'b' + Date.now();
      const bookingToCreate = { id, ...newBooking, status: 'Confirmed' };
      
      api.post('/bookings', bookingToCreate)
        .then(res => {
          setBookings([...bookings, bookingToCreate]);
          setIsModalOpen(false);
          setNewBooking({ customerName: '', phone: '', date: '', time: '', amount: '', status: 'Confirmed' });
          sendWhatsApp(bookingToCreate);
        })
        .catch(err => {
          console.error("Error creating booking", err);
          alert(err.response?.data?.error || "Failed to create booking.");
        });
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setNewBooking({ customerName: '', phone: '', date: '', time: '', endTime: '', amount: '', status: 'Confirmed' });
    setIsModalOpen(true);
  };

  const handleCancelBooking = (id) => {
    if(window.confirm('Are you sure you want to cancel this booking?')) {
      api.put(`/bookings/${id}/cancel`)
        .then(res => {
          setBookings(bookings.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b));
        })
        .catch(err => {
          console.error("Error cancelling booking", err);
          alert("Failed to cancel booking.");
        });
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Bookings Management</h1>
          <p className="text-sm text-[var(--text-secondary)]">Schedule and manage court reservations.</p>
        </div>
        <div className="flex items-center gap-3">
          {user?.role !== 'Viewer' ? (
            <div className="flex items-center gap-2 bg-[#151C2C] border border-[#1E293B] px-4 py-2.5 rounded-xl">
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Rate: ₹</span>
              <input 
                type="number" 
                value={hourlyRate}
                onChange={e => setHourlyRate(e.target.value)}
                className="w-16 bg-transparent border-none outline-none text-white font-bold text-sm"
              />
              <button 
                onClick={() => {
                  setIsSavingRate(true);
                  api.put('/settings/hourlyRate', { hourlyRate })
                    .then(() => {
                      alert("Hourly rate saved successfully!");
                      setIsSavingRate(false);
                    })
                    .catch(err => {
                      console.error(err);
                      alert("Failed to save hourly rate.");
                      setIsSavingRate(false);
                    });
                }}
                disabled={isSavingRate}
                className="ml-2 px-3 py-1 bg-[#1E293B] hover:bg-white/10 text-cyan-400 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {isSavingRate ? '...' : 'Save'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#151C2C] border border-[#1E293B] px-4 py-2.5 rounded-xl">
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Rate:</span>
              <span className="text-white font-bold text-sm">₹ {hourlyRate} / hr</span>
            </div>
          )}
          <button 
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-black px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(0,242,254,0.3)] active:scale-95"
          >
            <Plus size={18} /> New Booking
          </button>
        </div>
      </div>



      <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[#1E293B] flex justify-between items-center bg-[#0B1120]">
          <h2 className="text-sm font-bold text-white tracking-wider">UPCOMING BOOKINGS</h2>
          <span className="bg-[#1E293B] text-white text-xs font-bold px-2 py-1 rounded-md">{bookings.length}</span>
        </div>
        
        {loading ? (
          <div className="text-center p-12 text-[var(--text-secondary)] animate-pulse">Loading bookings...</div>
        ) : (
          <div className="divide-y divide-[#1E293B]">
            {bookings.map(booking => (
              <div key={booking.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-white/5 transition-colors group">
                <div className="flex items-start md:items-center gap-4">
                   <div className="relative hidden md:block">
                      <img src={`https://ui-avatars.com/api/?name=${booking.customerName}&background=1E293B&color=fff&rounded=true`} alt={booking.customerName} className="w-12 h-12 rounded-full border border-purple-500/50" />
                   </div>
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                         <p className="font-bold text-white text-base">{booking.customerName}</p>
                         <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${booking.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                           {booking.status}
                         </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] font-medium">ID: {booking.id} {user?.role !== 'Viewer' && `• ${booking.phone}`}</p>
                   </div>
                </div>

                <div className="flex flex-wrap md:flex-nowrap items-center gap-4 lg:gap-8 justify-end">
                  <div className="flex items-center gap-2 mt-2 lg:mt-0">
                    {user?.role !== 'Viewer' && (
                      <button 
                        onClick={() => sendWhatsApp(booking)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 transition-all font-bold text-xs"
                        title="Send WhatsApp Message"
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </button>
                    )}
                    {user?.role !== 'Viewer' && (
                      <button onClick={() => handleEditClick(booking)} className="px-4 py-2 rounded-lg bg-[#1E293B] hover:bg-white/10 text-white font-bold text-xs transition-colors">Edit</button>
                    )}
                    {user?.role !== 'Viewer' && (
                      <button onClick={() => handleCancelBooking(booking.id)} className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold text-xs transition-colors" title="Cancel Booking">
                         <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap md:flex-nowrap items-center gap-4 lg:gap-8 bg-[#0B1120] lg:bg-transparent p-3 lg:p-0 rounded-xl border border-[#1E293B] lg:border-none">
                     {user?.role !== 'Viewer' && (
                       <div className="flex flex-col pr-4 border-r border-[#1E293B] text-right">
                          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Amount</span>
                          <p className="text-sm font-bold text-emerald-400 whitespace-nowrap">₹ {booking.amount}</p>
                       </div>
                     )}
                     <div className="flex flex-col text-right">
                        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Date & Time</span>
                        <p className="text-sm font-bold text-white whitespace-nowrap">{booking.date}</p>
                        <p className="text-xs text-cyan-400 font-medium whitespace-nowrap">{booking.time}{booking.endTime ? ` - ${booking.endTime}` : ''}</p>
                     </div>
                  </div>
                </div>
              </div>
            ))}
            {bookings.length === 0 && (
               <div className="p-12 text-center text-[var(--text-secondary)]">No bookings found.</div>
            )}
            <div className="p-6 text-center">
              <span className="text-[var(--text-secondary)] text-xs font-medium uppercase tracking-widest">End of list</span>
            </div>
          </div>
        )}
      </div>

      {/* Create Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#151C2C] border border-[#1E293B] rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{isEditMode ? 'Edit Booking' : 'New Booking'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-[var(--text-secondary)]">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateBooking} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Customer Name</label>
                <input required type="text" value={newBooking.customerName} onChange={e => setNewBooking({...newBooking, customerName: e.target.value})} className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 text-white" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Phone Number</label>
                <input required type="tel" value={newBooking.phone} onChange={e => setNewBooking({...newBooking, phone: e.target.value})} className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 text-white" placeholder="919876543210" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Date</label>
                  <input required type="date" value={newBooking.date} onChange={e => setNewBooking({...newBooking, date: e.target.value})} className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 text-white [&::-webkit-calendar-picker-indicator]:invert" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Start Time</label>
                  <input required type="time" value={newBooking.time} onChange={e => setNewBooking({...newBooking, time: e.target.value})} className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 text-white [&::-webkit-calendar-picker-indicator]:invert" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">End Time</label>
                  <input required type="time" value={newBooking.endTime} onChange={e => setNewBooking({...newBooking, endTime: e.target.value})} className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 text-white [&::-webkit-calendar-picker-indicator]:invert" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Amount (₹) 
                  {user?.membership && <span className="text-emerald-400 ml-2 text-[10px]">({user.membership.split(' ')[0]} Discount Active)</span>}
                </label>
                <input required type="number" value={newBooking.amount} onChange={e => setNewBooking({...newBooking, amount: e.target.value})} className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 text-white" placeholder="1500" />
              </div>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl border border-[#1E293B] text-white font-bold hover:bg-white/5 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-cyan-400 text-black font-bold hover:bg-cyan-300 shadow-[0_0_15px_rgba(0,242,254,0.3)] transition-all active:scale-95">
                  {isEditMode ? 'Save Changes' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
