import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import api from '../api';
import { MessageCircle, Plus, X, Calendar as CalendarIcon, Clock, CreditCard, User, Edit2, Mail, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newBooking, setNewBooking] = useState({ customerName: '', email: '', phone: '', date: '', time: '', endTime: '', amount: '', status: 'Confirmed' });
  const [hourlyRate, setHourlyRate] = useState(1000);
  const [isSavingRate, setIsSavingRate] = useState(false);
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingLogs, setBookingLogs] = useState([]);

  useEffect(() => {
    fetchBookings();
    fetchSettings();
  }, []);

  const fetchSettings = () => {
    api.get('/settings')
      .then(res => {
        if (res.data.hourlyRate) setHourlyRate(Number(res.data.hourlyRate));
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

  useEffect(() => {
    if (newBooking.time && newBooking.endTime) {
      const startParts = newBooking.time.split(':');
      const endParts = newBooking.endTime.split(':');
      let endHour = parseInt(endParts[0]);
      if (endHour === 0 && parseInt(startParts[0]) > 0) endHour = 24;
      const durationHours = (endHour + parseInt(endParts[1])/60) - (parseInt(startParts[0]) + parseInt(startParts[1])/60);
      
      if (durationHours > 0) {
        let minimumAmount = durationHours * hourlyRate;
        if (isDiscountApplied && user?.membership) {
          let discount = 0;
          if (user.membership.includes('Silver')) discount = 0.10;
          else if (user.membership.includes('Gold')) discount = 0.15;
          else if (user.membership.includes('Platinum')) discount = 0.20;
          minimumAmount = minimumAmount * (1 - discount);
        }
        setNewBooking(prev => ({ ...prev, amount: minimumAmount }));
      } else {
        setNewBooking(prev => ({ ...prev, amount: '' }));
      }
    } else {
      setNewBooking(prev => ({ ...prev, amount: '' }));
    }
  }, [newBooking.time, newBooking.endTime, hourlyRate, isDiscountApplied, user?.membership]);

  const sendWhatsApp = (booking) => {
    const text = encodeURIComponent(`Hi ${booking.customerName}, your Box Cricket booking for ${booking.date} at ${booking.time} is confirmed!`);
    window.open(`https://wa.me/${booking.phone}?text=${text}`, '_blank');
  };

  const handleEditClick = (booking) => {
    setNewBooking({
      customerName: booking.customerName,
      email: booking.email || '',
      phone: booking.phone,
      date: booking.date,
      time: booking.time,
      endTime: booking.endTime || '',
      amount: booking.amount,
      status: booking.status
    });
    setEditingId(booking.id);
    setIsDiscountApplied(false);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleCreateBooking = (e) => {
    e.preventDefault();
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(newBooking.phone)) {
      alert("Invalid WhatsApp number. Give a valid 10-digit number.");
      return;
    }
    if (!newBooking.endTime) {
      alert("Please select an End Time.");
      return;
    }
    const startParts = newBooking.time.split(':');
    const endParts = newBooking.endTime.split(':');
    let endHour = parseInt(endParts[0]);
    if (endHour === 0 && parseInt(startParts[0]) > 0) endHour = 24;
    const durationHours = (endHour + parseInt(endParts[1])/60) - (parseInt(startParts[0]) + parseInt(startParts[1])/60);
    
    if (durationHours < 1) {
      alert("A minimum of one-hour slot should be booked.");
      return;
    }

    if ((durationHours * 60) % 30 !== 0) {
      alert("Bookings must be in exact 30-minute increments (e.g., 1.5 hours, 2.0 hours).");
      return;
    }
    
    if (isEditMode) {
      api.put(`/bookings/${editingId}`, newBooking)
        .then(res => {
          setBookings(bookings.map(b => b.id === editingId ? { id: editingId, ...newBooking } : b).sort((a, b) => {
            if (a.date !== b.date) return new Date(b.date) - new Date(a.date);
            return b.time.localeCompare(a.time);
          }));
          closeModal();
        })
        .catch(err => alert(err.response?.data?.error || "Failed to update booking."));
    } else {
      const id = 'b' + Date.now();
      const bookingToCreate = { id, ...newBooking, status: 'Confirmed' };
      api.post('/bookings', bookingToCreate)
        .then(res => {
          setBookings([bookingToCreate, ...bookings].sort((a, b) => {
            if (a.date !== b.date) return new Date(b.date) - new Date(a.date);
            return b.time.localeCompare(a.time);
          }));
          closeModal();

          // EmailJS integration
          if (newBooking.email) {
            const templateParams = {
              customerName: newBooking.customerName,
              email: newBooking.email,
              date: newBooking.date,
              time: newBooking.time,
              endTime: newBooking.endTime,
              amount: newBooking.amount,
            };

            emailjs.send(
              'service_jjrbdlf', 
              'template_48wbbl9', 
              templateParams, 
              'FwnHDTuxpHD_Hsv8l'
            ).then(
              () => {
                console.log('Confirmation email sent successfully!');
              },
              (error) => {
                console.error('Email sending failed...', error);
              }
            );
          }
        })
        .catch(err => alert(err.response?.data?.error || "Failed to create booking."));
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setIsDiscountApplied(false);
    setNewBooking({ customerName: '', email: '', phone: '', date: '', time: '', endTime: '', amount: '', status: 'Confirmed' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCancelBooking = (id) => {
    if(window.confirm('Are you sure you want to cancel this booking?')) {
      api.put(`/bookings/${id}/cancel`)
        .then(res => {
          setBookings(bookings.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b));
        })
        .catch(err => alert("Failed to cancel booking."));
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    api.get(`/bookings/${booking.id}/logs`)
      .then(res => setBookingLogs(res.data))
      .catch(err => console.error("Error fetching logs", err));
    setIsDetailsModalOpen(true);
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
          <h1 className="text-3xl font-light text-[var(--text-primary)] mb-2 tracking-tight">Active <span className="font-extrabold text-emerald-400 drop-shadow-[var(--text-glow-emerald)]">Bookings</span></h1>
          <p className="text-sm font-medium text-[var(--text-secondary)]">Manage court reservations and schedule.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {user?.role !== 'Viewer' ? (
            <div className="flex items-center gap-3 glass-panel px-5 py-2.5 rounded-full border border-[var(--border-subtle)] focus-within:border-emerald-500/50 focus-within:shadow-[var(--icon-glow-subtle)] transition-all duration-300">
              <CreditCard size={16} className="text-emerald-400" />
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Rate</span>
              <div className="w-px h-4 bg-[var(--border-subtle)]"></div>
              <span className="text-xs font-bold text-[var(--text-primary)]">₹</span>
              <input 
                type="number" 
                value={hourlyRate}
                onChange={e => setHourlyRate(e.target.value)}
                className="w-14 bg-transparent border-none outline-none text-[var(--text-primary)] font-extrabold text-sm"
              />
              <button 
                onClick={() => {
                  setIsSavingRate(true);
                  api.put('/settings/hourlyRate', { hourlyRate })
                    .then(() => setIsSavingRate(false))
                    .catch(() => setIsSavingRate(false));
                }}
                disabled={isSavingRate}
                className="ml-1 p-1 hover:bg-[var(--overlay-hover)] text-emerald-400 rounded-md transition-colors disabled:opacity-50"
              >
                {isSavingRate ? <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div> : <span className="text-xs font-bold">SAVE</span>}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 glass-panel px-5 py-2.5 rounded-full border border-[var(--border-subtle)]">
              <CreditCard size={16} className="text-emerald-400" />
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Rate</span>
              <div className="w-px h-4 bg-[var(--border-subtle)]"></div>
              <span className="text-[var(--text-primary)] font-extrabold text-sm">₹ {hourlyRate} / hr</span>
            </div>
          )}
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-blue-500 hover:from-emerald-300 hover:to-blue-400 text-black px-6 py-2.5 rounded-full font-extrabold transition-all shadow-[var(--button-glow)]"
          >
            <Plus size={18} /> New Booking
          </motion.button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-panel rounded-3xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-emerald-500/5 to-transparent z-0 opacity-50 pointer-events-none"></div>
        
        <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center relative z-10 bg-[var(--overlay-bg)] backdrop-blur-md">
          <h2 className="text-xs font-extrabold text-[var(--text-secondary)] tracking-[0.2em] uppercase">UPCOMING SCHEDULE</h2>
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(0,242,254,0.2)]">
            {bookings.length}
          </span>
        </div>
        
        <div className="relative z-10">
          {loading ? (
            <div className="divide-y divide-[var(--border-subtle)]">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full skeleton-shimmer"></div>
                    <div>
                      <div className="w-32 h-5 skeleton-shimmer mb-2 rounded"></div>
                      <div className="w-24 h-3 skeleton-shimmer rounded"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-10 skeleton-shimmer rounded-xl"></div>
                    <div className="w-20 h-10 skeleton-shimmer rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
             <div className="p-16 text-center text-[var(--text-secondary)] font-medium">No bookings found in the database.</div>
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              <AnimatePresence>
                {bookings.map(booking => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={booking.id} 
                    className="p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:bg-[var(--overlay-bg)] transition-colors group"
                  >
                    <div className="flex items-center gap-5">
                       <div className="relative shrink-0">
                          <img src={`https://ui-avatars.com/api/?name=${booking.customerName}&background=0B1120&color=00F2FE&rounded=true&bold=true`} alt={booking.customerName} className="w-14 h-14 rounded-full border-2 border-emerald-500/30 group-hover:border-emerald-400 transition-colors shadow-[var(--icon-glow-subtle)]" />
                          {booking.status === 'Confirmed' && <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-[#0B1120] rounded-full shadow-[var(--badge-glow-emerald)]"></div>}
                       </div>
                       <div>
                          <div className="flex items-center gap-3 mb-1">
                             <p className="font-extrabold text-[var(--text-primary)] text-lg tracking-tight">{booking.customerName}</p>
                             <span className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-widest ${booking.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[var(--badge-glow-emerald)]' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[var(--badge-glow-rose)]'}`}>
                               {booking.status}
                             </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] font-medium">
                            <span className="flex items-center gap-1"><User size={12}/> ID: {booking.id}</span>
                            {user?.role !== 'Viewer' && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                <span>{booking.phone}</span>
                              </>
                            )}
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-wrap xl:flex-nowrap items-center gap-4 xl:gap-8 justify-end">
                      <div className="flex flex-wrap xl:flex-nowrap items-center gap-6 bg-[var(--overlay-bg)] xl:bg-transparent p-4 xl:p-0 rounded-2xl border border-[var(--border-subtle)] xl:border-none w-full xl:w-auto">
                         <div className="flex items-center gap-4 pr-6 border-r border-[var(--border-subtle)]">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                              <CalendarIcon size={18} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-widest mb-0.5">Date</span>
                              <p className="text-sm font-bold text-[var(--text-primary)] whitespace-nowrap">{booking.date}</p>
                            </div>
                         </div>
                         
                         <div className="flex items-center gap-4 pr-6 border-r border-[var(--border-subtle)]">
                            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                              <Clock size={18} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-widest mb-0.5">Time</span>
                              <p className="text-sm font-bold text-[var(--text-primary)] whitespace-nowrap">{booking.time}{booking.endTime ? ` - ${booking.endTime}` : ''}</p>
                            </div>
                         </div>

                         {user?.role !== 'Viewer' && (
                           <div className="flex flex-col text-right ml-auto xl:ml-0">
                              <span className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-widest mb-0.5">Revenue</span>
                              <p className="text-xl font-extrabold text-emerald-400 drop-shadow-[var(--text-glow-emerald)] whitespace-nowrap">₹ {booking.amount}</p>
                           </div>
                         )}
                      </div>

                      <div className="flex items-center gap-2 mt-4 xl:mt-0 w-full xl:w-auto justify-end">
                        {user?.role !== 'Viewer' && (
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => sendWhatsApp(booking)}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-[var(--text-primary)] border border-emerald-500/30 transition-all font-bold text-xs shadow-[var(--badge-glow-emerald)]"
                          >
                            <MessageCircle size={16} /> WhatsApp
                          </motion.button>
                        )}
                        {user?.role === 'Super Admin' && (
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleViewDetails(booking)} className="p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-[var(--text-primary)] transition-colors border border-blue-500/20 shadow-[var(--badge-glow-blue)]">
                             <Info size={16} />
                          </motion.button>
                        )}
                        {user?.role !== 'Viewer' && (
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleEditClick(booking)} className="p-2.5 rounded-xl bg-[var(--overlay-bg)] hover:bg-[var(--overlay-hover)] text-[var(--text-primary)] transition-colors border border-[var(--border-subtle)]">
                            <Edit2 size={16} />
                          </motion.button>
                        )}
                        {user?.role !== 'Viewer' && booking.status !== 'Cancelled' && (
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleCancelBooking(booking.id)} className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-[var(--text-primary)] transition-colors border border-rose-500/20">
                             <X size={16} />
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* Premium Create Booking Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="glass-panel border border-[var(--border-subtle)] rounded-3xl w-full max-w-md shadow-[var(--modal-shadow)] p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
              
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-light text-[var(--text-primary)] tracking-tight">{isEditMode ? 'Edit' : 'New'} <span className="font-extrabold text-emerald-400 drop-shadow-[var(--text-glow-emerald)]">Booking</span></h2>
                  <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1">Schedule Court Time</p>
                </div>
                <button onClick={closeModal} className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--overlay-bg)] hover:bg-[var(--overlay-hover)] transition-colors border border-[var(--border-subtle)]">
                  <X size={18} className="text-[var(--text-secondary)]" />
                </button>
              </div>
              
              <form onSubmit={handleCreateBooking} className="flex flex-col gap-5">
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Customer Name</label>
                  <input required type="text" value={newBooking.customerName} onChange={e => setNewBooking({...newBooking, customerName: e.target.value})} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 focus:shadow-[var(--icon-glow-subtle)] text-[var(--text-primary)] font-medium transition-all" placeholder="Enter full name" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">WhatsApp Number</label>
                  <input required type="tel" value={newBooking.phone} onChange={e => setNewBooking({...newBooking, phone: e.target.value})} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 focus:shadow-[var(--icon-glow-subtle)] text-[var(--text-primary)] font-medium transition-all" placeholder="10-digit number" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Email Address (For Confirmation)</label>
                  <input type="email" value={newBooking.email} onChange={e => setNewBooking({...newBooking, email: e.target.value})} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 focus:shadow-[var(--icon-glow-subtle)] text-[var(--text-primary)] font-medium transition-all" placeholder="customer@example.com" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Date</label>
                    <input required type="date" value={newBooking.date} onChange={e => setNewBooking({...newBooking, date: e.target.value})} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 text-[var(--text-primary)] font-medium [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Start</label>
                    <input required type="time" step="1800" value={newBooking.time} onChange={e => setNewBooking({...newBooking, time: e.target.value})} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 text-[var(--text-primary)] font-medium [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">End</label>
                    <input required type="time" step="1800" value={newBooking.endTime} onChange={e => setNewBooking({...newBooking, endTime: e.target.value})} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 text-[var(--text-primary)] font-medium [color-scheme:dark]" />
                  </div>
                </div>
                
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 mt-2">
                  <label className="block text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">
                    TOTAL PRICE
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input required readOnly type="number" value={newBooking.amount} className="w-full bg-transparent border-none outline-none text-3xl font-extrabold text-emerald-400 drop-shadow-[var(--text-glow-emerald)] placeholder-emerald-900" placeholder="0" />
                    </div>
                    {user?.membership && !isDiscountApplied && (
                      <button type="button" onClick={() => setIsDiscountApplied(true)} className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-[var(--text-primary)] font-bold text-xs uppercase tracking-wider transition-colors shadow-[var(--button-glow-amber)]">
                        Apply Discount
                      </button>
                    )}
                    {user?.membership && isDiscountApplied && (
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase tracking-wider border border-emerald-500/30">
                        Discounted
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button type="button" onClick={closeModal} className="flex-1 px-4 py-3.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold hover:bg-[var(--overlay-bg)] transition-colors">Cancel</button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    className="flex-1 px-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-blue-500 text-black font-extrabold shadow-[var(--button-glow)] transition-all"
                  >
                    {isEditMode ? 'Update Session' : 'Confirm Slot'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detailed Record View Modal */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedBooking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="glass-panel border border-[var(--border-subtle)] rounded-3xl w-full max-w-2xl shadow-[var(--modal-shadow)] p-8 relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-emerald-500"></div>
              
              <div className="flex justify-between items-center mb-6 shrink-0">
                <div>
                  <h2 className="text-2xl font-light text-[var(--text-primary)] tracking-tight">Booking <span className="font-extrabold text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">Timeline</span></h2>
                  <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1">ID: {selectedBooking.id}</p>
                </div>
                <button onClick={() => setIsDetailsModalOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--overlay-bg)] hover:bg-[var(--overlay-hover)] transition-colors border border-[var(--border-subtle)]">
                  <X size={18} className="text-[var(--text-secondary)]" />
                </button>
              </div>

              <div className="bg-[var(--overlay-bg)] rounded-2xl p-6 border border-[var(--border-subtle)] mb-6 shrink-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] block mb-1">Customer</span>
                    <span className="text-sm font-bold text-[var(--text-primary)]">{selectedBooking.customerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] block mb-1">Phone</span>
                    <span className="text-sm font-bold text-[var(--text-primary)]">{selectedBooking.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] block mb-1">Status</span>
                    <span className={`text-sm font-extrabold px-2 py-0.5 rounded-md ${selectedBooking.status === 'Confirmed' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>{selectedBooking.status}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] block mb-1">Total Paid</span>
                    <span className="text-sm font-bold text-emerald-400">₹ {selectedBooking.amount}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col min-h-0 overflow-hidden flex-1">
                <h3 className="text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 shrink-0">Lifecycle History</h3>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-2">
                  {bookingLogs.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-[var(--text-secondary)] italic">No timeline history available for this booking.</p>
                      <p className="text-xs text-[var(--text-secondary)]/70 mt-1">Timeline tracking starts from the latest update.</p>
                    </div>
                  ) : (
                    <div className="relative border-l-2 border-[var(--border-subtle)] ml-3 pl-6 space-y-6">
                      {bookingLogs.map((log, index) => {
                        let detailsObj = {};
                        try { detailsObj = JSON.parse(log.details); } catch(e) {}
                        
                        return (
                          <div key={log.id || index} className="relative">
                            <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 border-[var(--bg-base)] ${log.action === 'Created' ? 'bg-blue-400' : log.action === 'Cancelled' ? 'bg-rose-400' : 'bg-emerald-400'}`}></div>
                            <div className="flex flex-col">
                              <span className="text-xs text-[var(--text-secondary)] font-medium mb-1">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                              <span className={`text-sm font-bold ${log.action === 'Created' ? 'text-blue-400' : log.action === 'Cancelled' ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {log.action}
                              </span>
                              {Object.keys(detailsObj).length > 0 && (
                                <div className="mt-2 bg-[var(--bg-base)]/50 rounded-lg p-3 border border-[var(--border-subtle)] grid grid-cols-2 gap-2">
                                  {Object.entries(detailsObj).map(([key, value]) => (
                                    <div key={key} className="flex flex-col text-xs">
                                      <span className="text-[var(--text-secondary)] capitalize font-semibold tracking-wide text-[10px]">{key}</span>
                                      <span className="text-[var(--text-primary)] font-medium">{value}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
