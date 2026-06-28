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
      let startHour = parseInt(startParts[0]);
      let endHour = parseInt(endParts[0]);
      if (endHour < startHour || (endHour === startHour && parseInt(endParts[1]) < parseInt(startParts[1]))) endHour += 24;
      const durationHours = (endHour + parseInt(endParts[1])/60) - (startHour + parseInt(startParts[1])/60);
      
      if (durationHours > 0) {
        let minimumAmount = durationHours * hourlyRate;
        if (isDiscountApplied && user?.membership && !user.membership.includes('Expired')) {
          let discount = 0;
          if (user.membership.includes('Silver')) discount = 0.10;
          else if (user.membership.includes('Gold')) discount = 0.15;
          else if (user.membership.includes('Platinum')) discount = 0.20;
          minimumAmount = Math.round(minimumAmount * (1 - discount));
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
    let startHour = parseInt(startParts[0]);
    let endHour = parseInt(endParts[0]);
    if (endHour < startHour || (endHour === startHour && parseInt(endParts[1]) < parseInt(startParts[1]))) endHour += 24;
    const durationHours = (endHour + parseInt(endParts[1])/60) - (startHour + parseInt(startParts[1])/60);
    
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
          <h1 className="text-3xl font-light text-[var(--text-primary)] mb-2 tracking-tight">Active <span className="font-bold text-[var(--accent-emerald)] drop-">Bookings</span></h1>
          <p className="text-sm font-medium text-[var(--text-secondary)]">Manage court reservations and schedule.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {user?.role !== 'Viewer' ? (
            <div className="flex items-center gap-3 glass-panel px-5 py-2.5 rounded-sm border border-[var(--border-subtle)] focus-within:border-[var(--border-subtle)] focus-within: transition-all duration-300">
              <CreditCard size={16} className="text-[var(--accent-emerald)]" />
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Rate</span>
              <div className="w-px h-4 bg-[var(--border-subtle)]"></div>
              <span className="text-xs font-bold text-[var(--text-primary)]">₹</span>
              <input 
                type="number" 
                value={hourlyRate}
                onChange={e => setHourlyRate(e.target.value)}
                className="w-14 bg-transparent border-none outline-none text-[var(--text-primary)] font-bold text-sm"
              />
              <button 
                onClick={() => {
                  setIsSavingRate(true);
                  api.put('/settings/hourlyRate', { hourlyRate })
                    .then(() => setIsSavingRate(false))
                    .catch(() => setIsSavingRate(false));
                }}
                disabled={isSavingRate}
                className="ml-1 p-1 hover:bg-[var(--overlay-hover)] text-[var(--accent-emerald)] rounded-sm transition-colors disabled:opacity-50"
              >
                {isSavingRate ? <div className="w-4 h-4 border-2 border-[var(--accent-emerald)] border-t-transparent rounded-sm animate-spin"></div> : <span className="text-xs font-bold">SAVE</span>}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 glass-panel px-5 py-2.5 rounded-sm border border-[var(--border-subtle)]">
              <CreditCard size={16} className="text-[var(--accent-emerald)]" />
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Rate</span>
              <div className="w-px h-4 bg-[var(--border-subtle)]"></div>
              <span className="text-[var(--text-primary)] font-bold text-sm">₹ {hourlyRate} / hr</span>
            </div>
          )}
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCreateModal}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Plus size={18} /> New Booking
          </motion.button>
        </div>
      </motion.div>

      {user?.role === 'Viewer' ? (
        <motion.div variants={itemVariants} className="mt-8 mb-12">
           <div className="flex justify-between items-center mb-8">
             <h2 className="text-2xl font-bold text-[var(--text-primary)]">My Sessions</h2>
             <span className="text-[10px] font-bold text-[var(--accent-emerald)] uppercase tracking-widest bg-[var(--overlay-bg)] px-3 py-1 rounded-sm border border-[var(--border-subtle)]">
                {bookings.length} UPCOMING
             </span>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
             <AnimatePresence>
                {bookings.map((booking, index) => (
                   <motion.div 
                     layout
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     transition={{ delay: index * 0.05 }}
                     key={booking.id}
                     className="glass-panel border border-[var(--border-subtle)] rounded-2xl overflow-hidden group hover:border-[var(--accent-emerald)] transition-colors cursor-pointer"
                     onClick={() => handleViewDetails(booking)}
                   >
                     <div className="h-32 bg-[var(--overlay-bg)] relative p-6 flex flex-col justify-between overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-emerald)]/10 blur-[40px] group-hover:bg-[var(--accent-emerald)]/20 transition-all"></div>
                       <div className="flex justify-between items-start relative z-10">
                         <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest ${booking.status === 'Confirmed' ? 'bg-[var(--accent-emerald)]/20 text-[var(--accent-emerald)] border border-[var(--accent-emerald)]/30' : 'bg-[var(--accent-rose)]/20 text-[var(--accent-rose)] border border-[var(--accent-rose)]/30'}`}>
                           {booking.status}
                         </span>
                         <span className="text-xs font-bold text-[var(--text-secondary)]">ID: {booking.id}</span>
                       </div>
                       <h3 className="text-xl font-bold text-[var(--text-primary)] relative z-10">{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                     </div>
                     <div className="p-6 bg-[var(--bg-base)]">
                       <div className="flex items-center gap-4 mb-6">
                         <div className="w-12 h-12 rounded-xl bg-[var(--overlay-bg)] flex items-center justify-center text-[var(--accent-primary)]">
                           <Clock size={20} />
                         </div>
                         <div>
                           <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1">Time Slot</p>
                           <p className="text-[var(--text-primary)] font-bold">{booking.time} - {booking.endTime}</p>
                         </div>
                       </div>
                       
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-xl bg-[var(--overlay-bg)] flex items-center justify-center text-[var(--accent-emerald)]">
                           <CreditCard size={20} />
                         </div>
                         <div>
                           <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1">Amount Paid</p>
                           <p className="text-[var(--text-primary)] font-bold text-lg">₹{booking.amount}</p>
                         </div>
                       </div>
                     </div>
                   </motion.div>
                ))}
             </AnimatePresence>
           </div>
           
           {bookings.length === 0 && !loading && (
              <div className="w-full glass-panel border border-[var(--border-subtle)] rounded-3xl p-16 text-center text-[var(--text-secondary)] font-medium">No upcoming sessions. Book a slot to get started!</div>
           )}
        </motion.div>
      ) : (
      <motion.div variants={itemVariants} className="glass-panel overflow-hidden relative">
        
        <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center relative z-10 bg-[var(--overlay-bg)] ">
          <h2 className="text-xs font-bold text-[var(--text-secondary)] tracking-[0.2em] uppercase">UPCOMING SCHEDULE</h2>
          <span className="bg-[var(--overlay-bg)] text-[var(--accent-emerald)] border border-[var(--border-subtle)] text-xs font-bold px-3 py-1 rounded-sm ">
            {bookings.length}
          </span>
        </div>
        
        <div className="relative z-10">
          {loading ? (
            <div className="divide-y divide-[var(--border-subtle)]">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-sm skeleton-shimmer"></div>
                    <div>
                      <div className="w-32 h-5 skeleton-shimmer mb-2 rounded"></div>
                      <div className="w-24 h-3 skeleton-shimmer rounded"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-10 skeleton-shimmer rounded-sm"></div>
                    <div className="w-20 h-10 skeleton-shimmer rounded-sm"></div>
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
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ scale: 1.01 }}
                    key={booking.id} 
                    className="p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:bg-[var(--bg-surface-hover)] transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-5">
                       <div className="relative shrink-0">
                          <img src={`https://ui-avatars.com/api/?name=${booking.customerName}&background=0A0A0A&color=EDEDED&rounded=true&bold=true`} alt={booking.customerName} className="w-14 h-14 rounded-full border border-[var(--border-subtle)] group-hover:border-[var(--accent-primary)] transition-colors" />
                          {booking.status === 'Confirmed' && <div className="absolute bottom-0 right-0 w-4 h-4 bg-[var(--accent-emerald)] border-2 border-[var(--bg-surface)] rounded-full"></div>}
                       </div>
                       <div>
                          <div className="flex items-center gap-3 mb-1">
                             <p className="font-semibold text-[var(--text-primary)] text-lg tracking-tight">{booking.customerName}</p>
                             <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-widest ${booking.status === 'Confirmed' ? 'bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)] border border-[var(--accent-emerald)]/20' : 'bg-[var(--accent-rose)]/10 text-[var(--accent-rose)] border border-[var(--accent-rose)]/20'}`}>
                               {booking.status}
                             </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] font-medium">
                            <span className="flex items-center gap-1"><User size={12}/> ID: {booking.id}</span>
                            {user?.role !== 'Viewer' && (
                              <>
                                <span className="w-1 h-1 rounded-sm bg-white/20"></span>
                                <span>{booking.phone}</span>
                              </>
                            )}
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-wrap xl:flex-nowrap items-center gap-4 xl:gap-8 justify-end">
                      <div className="flex flex-col sm:flex-row flex-wrap xl:flex-nowrap items-center gap-4 sm:gap-6 bg-[var(--overlay-bg)] xl:bg-transparent p-4 xl:p-0 rounded-md border border-[var(--border-subtle)] xl:border-none w-full xl:w-auto">
                         <div className="flex items-center gap-4 pr-0 sm:pr-6 border-b sm:border-b-0 sm:border-r border-[var(--border-subtle)] w-full sm:w-auto pb-4 sm:pb-0">
                            <div className="w-10 h-10 rounded-sm bg-[var(--overlay-bg)] flex items-center justify-center text-[var(--accent-emerald)]">
                              <CalendarIcon size={18} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-0.5">Date</span>
                              <p className="text-sm font-bold text-[var(--text-primary)] whitespace-nowrap">{booking.date}</p>
                            </div>
                         </div>
                         
                         <div className="flex items-center gap-4 pr-0 sm:pr-6 border-b sm:border-b-0 sm:border-r border-[var(--border-subtle)] w-full sm:w-auto pb-4 sm:pb-0">
                            <div className="w-10 h-10 rounded-sm bg-[var(--overlay-bg)] flex items-center justify-center text-[var(--accent-primary)]">
                              <Clock size={18} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-0.5">Time</span>
                              <p className="text-sm font-bold text-[var(--text-primary)] whitespace-nowrap">{booking.time}{booking.endTime ? ` - ${booking.endTime}` : ''}</p>
                            </div>
                         </div>

                         {user?.role !== 'Viewer' && (
                           <div className="flex flex-col text-right ml-auto xl:ml-0">
                               <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-0.5">Revenue</span>
                               <p className="text-xl font-bold data-number text-[var(--text-primary)] whitespace-nowrap">₹ {booking.amount}</p>
                           </div>
                         )}
                      </div>

                      <div className="flex items-center gap-2 mt-4 xl:mt-0 w-full xl:w-auto justify-end">
                        {user?.role !== 'Viewer' && (
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => sendWhatsApp(booking)}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-[var(--overlay-bg)] text-[var(--accent-emerald)] hover:bg-[var(--accent-emerald)] hover:text-[var(--bg-base)] border border-[var(--border-subtle)] transition-all font-medium text-xs"
                          >
                            <MessageCircle size={16} /> WhatsApp
                          </motion.button>
                        )}
                        {user?.role === 'Super Admin' && (
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleViewDetails(booking)} className="p-2.5 rounded-sm bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-[var(--text-primary)] transition-colors border border-blue-500/20 ">
                             <Info size={16} />
                          </motion.button>
                        )}
                        {user?.role !== 'Viewer' && (
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleEditClick(booking)} className="p-2.5 rounded-sm bg-[var(--overlay-bg)] hover:bg-[var(--overlay-hover)] text-[var(--text-primary)] transition-colors border border-[var(--border-subtle)]">
                            <Edit2 size={16} />
                          </motion.button>
                        )}
                        {user?.role !== 'Viewer' && booking.status !== 'Cancelled' && (
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleCancelBooking(booking.id)} className="p-2.5 rounded-sm bg-[var(--overlay-bg)] hover:bg-[var(--accent-primary)] text-[var(--accent-primary)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border-subtle)]">
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
      )}
      {/* Premium Create Booking Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 "
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="glass-panel border border-[var(--border-subtle)] rounded-md w-[95%] sm:w-full max-w-md p-6 md:p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="absolute top-0 left-0 w-full h-1   "></div>
              
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-light text-[var(--text-primary)] tracking-tight">{isEditMode ? 'Edit' : 'New'} <span className="font-bold text-[var(--accent-emerald)] drop-">Booking</span></h2>
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1">Schedule Court Time</p>
                </div>
                <button onClick={closeModal} className="w-10 h-10 rounded-sm flex items-center justify-center bg-[var(--overlay-bg)] hover:bg-[var(--overlay-hover)] transition-colors border border-[var(--border-subtle)]">
                  <X size={18} className="text-[var(--text-secondary)]" />
                </button>
              </div>
              
              <form onSubmit={handleCreateBooking} className="flex flex-col gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Customer Name</label>
                  <input required type="text" value={newBooking.customerName} onChange={e => setNewBooking({...newBooking, customerName: e.target.value})} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-sm px-4 py-3 outline-none focus:border-[var(--border-subtle)] focus: text-[var(--text-primary)] font-medium transition-all" placeholder="Enter full name" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">WhatsApp Number</label>
                  <input required type="tel" value={newBooking.phone} onChange={e => setNewBooking({...newBooking, phone: e.target.value})} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-sm px-4 py-3 outline-none focus:border-[var(--border-subtle)] focus: text-[var(--text-primary)] font-medium transition-all" placeholder="10-digit number" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Email Address (For Confirmation)</label>
                  <input type="email" value={newBooking.email} onChange={e => setNewBooking({...newBooking, email: e.target.value})} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-sm px-4 py-3 outline-none focus:border-[var(--border-subtle)] focus: text-[var(--text-primary)] font-medium transition-all" placeholder="customer@example.com" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Date</label>
                    <input required type="date" value={newBooking.date} onChange={e => setNewBooking({...newBooking, date: e.target.value})} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-sm px-4 py-3 outline-none focus:border-[var(--border-subtle)] text-[var(--text-primary)] font-medium [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Start</label>
                    <input required type="time" step="1800" value={newBooking.time} onChange={e => setNewBooking({...newBooking, time: e.target.value})} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-sm px-4 py-3 outline-none focus:border-[var(--border-subtle)] text-[var(--text-primary)] font-medium [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">End</label>
                    <input required type="time" step="1800" value={newBooking.endTime} onChange={e => setNewBooking({...newBooking, endTime: e.target.value})} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-sm px-4 py-3 outline-none focus:border-[var(--border-subtle)] text-[var(--text-primary)] font-medium [color-scheme:dark]" />
                  </div>
                </div>
                
                <div className="p-4 rounded-sm border border-[var(--border-subtle)] bg-[var(--overlay-bg)] mt-2">
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">
                    TOTAL PRICE
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input required readOnly type="number" value={newBooking.amount} className="w-full bg-transparent border-none outline-none text-3xl font-bold text-[var(--accent-emerald)] drop- placeholder-emerald-900" placeholder="0" />
                    </div>
                    {user?.membership && !user.membership.includes('Expired') && !isDiscountApplied && (
                      <button type="button" onClick={() => setIsDiscountApplied(true)} className="px-4 py-2 rounded-sm bg-[var(--accent-primary)] hover:bg-amber-600 text-[var(--text-primary)] font-bold text-xs uppercase tracking-wider transition-colors ">
                        Apply Discount
                      </button>
                    )}
                    {user?.membership && isDiscountApplied && (
                      <span className="px-3 py-1.5 rounded-sm bg-[var(--overlay-bg)] text-[var(--accent-emerald)] font-bold text-[10px] uppercase tracking-wider border border-[var(--border-subtle)]">
                        Discounted
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button type="button" onClick={closeModal} className="flex-1 px-4 py-3.5 rounded-sm border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold hover:bg-[var(--overlay-bg)] transition-colors">Cancel</button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    className="flex-1 px-4 py-3.5 rounded-sm btn-primary flex items-center justify-center font-bold transition-all text-sm uppercase tracking-wider"
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 "
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="glass-panel border border-[var(--border-subtle)] rounded-sm w-full max-w-2xl  p-8 relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="absolute top-0 left-0 w-full h-1   "></div>
              
              <div className="flex justify-between items-center mb-6 shrink-0">
                <div>
                  <h2 className="text-2xl font-light text-[var(--text-primary)] tracking-tight">Booking <span className="font-bold text-blue-400 drop-">Timeline</span></h2>
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1">ID: {selectedBooking.id}</p>
                </div>
                <button onClick={() => setIsDetailsModalOpen(false)} className="w-10 h-10 rounded-sm flex items-center justify-center bg-[var(--overlay-bg)] hover:bg-[var(--overlay-hover)] transition-colors border border-[var(--border-subtle)]">
                  <X size={18} className="text-[var(--text-secondary)]" />
                </button>
              </div>

              <div className="bg-[var(--overlay-bg)] rounded-sm p-6 border border-[var(--border-subtle)] mb-6 shrink-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] block mb-1">Customer</span>
                    <span className="text-sm font-bold text-[var(--text-primary)]">{selectedBooking.customerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] block mb-1">Phone</span>
                    <span className="text-sm font-bold text-[var(--text-primary)]">{selectedBooking.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] block mb-1">Status</span>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded-sm ${selectedBooking.status === 'Confirmed' ? 'text-[var(--accent-emerald)] bg-[var(--overlay-bg)]' : 'text-[var(--accent-primary)] bg-[var(--overlay-bg)]'}`}>{selectedBooking.status}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] block mb-1">Total Paid</span>
                    <span className="text-sm font-bold text-[var(--accent-emerald)]">₹ {selectedBooking.amount}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col min-h-0 overflow-hidden flex-1">
                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 shrink-0">Lifecycle History</h3>
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
                            <div className={`absolute -left-[31px] w-4 h-4 rounded-sm border-2 border-[var(--bg-base)] ${log.action === 'Created' ? 'bg-blue-400' : log.action === 'Cancelled' ? 'bg-[var(--accent-primary)]' : 'bg-[var(--accent-emerald)]'}`}></div>
                            <div className="flex flex-col">
                              <span className="text-xs text-[var(--text-secondary)] font-medium mb-1">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                              <span className={`text-sm font-bold ${log.action === 'Created' ? 'text-blue-400' : log.action === 'Cancelled' ? 'text-[var(--accent-primary)]' : 'text-[var(--accent-emerald)]'}`}>
                                {log.action}
                              </span>
                              {Object.keys(detailsObj).length > 0 && (
                                <div className="mt-2 bg-[var(--bg-base)]/50 rounded-sm p-3 border border-[var(--border-subtle)] grid grid-cols-2 gap-2">
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
