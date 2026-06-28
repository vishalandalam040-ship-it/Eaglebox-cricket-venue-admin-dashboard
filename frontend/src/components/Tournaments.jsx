import { useState, useEffect } from 'react';
import api from '../api';
import { Trophy, Users, Calendar, Plus, ChevronRight, X, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';
export const Tournaments = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTournament, setNewTournament] = useState({ name: '', prizePool: '', maxTeams: '', entryFee: '', startDate: '', status: 'Upcoming' });

  const [activeTournamentId, setActiveTournamentId] = useState(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ teamName: '', email: '', playersCount: '', amountPaid: '', playerNames: [] });
  
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [teams, setTeams] = useState([]);
  const [activeTournamentFee, setActiveTournamentFee] = useState('');
  const [isSavingManageFee, setIsSavingManageFee] = useState(false);

  useEffect(() => {
    api.get('/tournaments')
      .then(res => {
        setTournaments(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching tournaments", err);
        setLoading(false);
      });
  }, []);

  const handleCreateTournament = (e) => {
    e.preventDefault();
    const id = 't' + Date.now();
    const tournamentToCreate = { 
      id, 
      ...newTournament, 
      maxTeams: parseInt(newTournament.maxTeams, 10) || 16,
      teams: 0 
    };
    
    api.post('/tournaments', tournamentToCreate)
      .then(res => {
        setTournaments([tournamentToCreate, ...tournaments]);
        setIsModalOpen(false);
        setNewTournament({ name: '', prizePool: '', maxTeams: '', entryFee: '', startDate: '', status: 'Upcoming' });
      })
      .catch(err => alert("Failed to create tournament."));
  };

  const handleDeleteTournament = (id) => {
    api.delete(`/tournaments/${id}`)
      .then(() => setTournaments(tournaments.filter(t => t.id !== id)))
      .catch(err => alert("Failed to delete tournament"));
  };

  const handleDeleteTeam = (teamId, tournamentId) => {
    api.delete(`/tournaments/${tournamentId}/teams/${teamId}`)
      .then(() => {
        setTeams(teams.filter(t => t.id !== teamId));
        setTournaments(tournaments.map(t => t.id === tournamentId ? { ...t, teams: Math.max(0, t.teams - 1) } : t));
      })
      .catch(err => alert("Failed to remove team."));
  };

  const openJoinModal = (tournamentId) => {
    setActiveTournamentId(tournamentId);
    const tournament = tournaments.find(t => t.id === tournamentId);
    setNewTeam({ teamName: '', email: '', playersCount: '', amountPaid: tournament?.entryFee || 0, playerNames: [] });
    setIsJoinModalOpen(true);
  };

  const handleJoinTeam = (e) => {
    e.preventDefault();
    const id = 'team' + Date.now();
    api.post(`/tournaments/${activeTournamentId}/teams`, { id, ...newTeam, players: newTeam.playerNames })
      .then(() => {
        setIsJoinModalOpen(false);
        setTournaments(tournaments.map(t => t.id === activeTournamentId ? { ...t, teams: t.teams + 1 } : t));
        
        if (newTeam.email) {
          const tournament = tournaments.find(t => t.id === activeTournamentId);
          emailjs.send(
            'service_jjrbdlf', 
            'template_48wbbl9', 
            {
              customerName: newTeam.teamName,
              email: newTeam.email,
              date: `Tournament: ${tournament?.name || 'Esports Event'}`,
              time: `Players: ${newTeam.playerNames.join(', ')}`,
              endTime: 'Eagle in Eagle Box Ticket',
              amount: newTeam.amountPaid,
              message: `Successfully your team is registered for this tournament!`
            }, 
            'FwnHDTuxpHD_Hsv8l'
          ).catch(err => console.error("EmailJS error:", err));
        }

        alert('Team registered successfully!');
      })
      .catch(err => alert(err.response?.data?.error || 'Failed to register team.'));
  };

  const openManageModal = (tournamentId) => {
    setActiveTournamentId(tournamentId);
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (tournament) {
      setActiveTournamentFee(tournament.entryFee || 0);
    }
    api.get(`/tournaments/${tournamentId}/teams`)
      .then(res => {
        setTeams(res.data);
        setIsManageModalOpen(true);
      })
      .catch(err => alert("Failed to fetch teams"));
  };

  const handleUpdateFee = () => {
    if (user?.role === 'Viewer') return;
    setIsSavingManageFee(true);
    api.put(`/tournaments/${activeTournamentId}/fee`, { entryFee: activeTournamentFee })
      .then(res => {
        setTournaments(tournaments.map(t => t.id === activeTournamentId ? { ...t, entryFee: activeTournamentFee } : t));
        alert("Tournament entry fee permanently updated!");
        setIsSavingManageFee(false);
      })
      .catch(err => {
        alert("Failed to update tournament fee.");
        setIsSavingManageFee(false);
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
      
      {/* Header & Hero Section */}
      <motion.div variants={itemVariants} className="glass-panel rounded-[2rem] p-8 mb-8 relative overflow-hidden flex flex-col items-start justify-center min-h-[260px] border border-[var(--border-subtle)]  group">
        <div className="absolute inset-0 z-0 overflow-hidden">
           <motion.img 
             initial={{ scale: 1.1 }}
             animate={{ scale: 1 }}
             transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
             src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" alt="Stadium" 
             className="w-full h-full object-cover opacity-30 dark:opacity-20 mix-blend-luminosity" 
           />
           <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-base)] via-[var(--bg-base)]/90 to-transparent"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/50 to-transparent"></div>
        </div>
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--overlay-bg)] rounded-sm blur-[80px] -z-10 group-hover:bg-[var(--overlay-bg)] transition-all duration-700"></div>

        <div className="relative z-10 max-w-2xl w-full">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-sm bg-[var(--overlay-bg)] flex items-center justify-center text-[var(--accent-emerald)] border border-[var(--border-subtle)] ">
                <Trophy size={20} />
             </div>
             <span className="text-[10px] font-bold text-[var(--accent-emerald)] uppercase tracking-[0.2em]">Tournament Center</span>
          </div>
          <h2 className="text-4xl font-light text-[var(--text-primary)] mb-4 tracking-tight">Host Professional <span className="font-bold text-[var(--accent-emerald)] drop-">Esports & Events</span></h2>
          <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed mb-8 max-w-xl">Elevate your venue with full-scale tournament management. From registration to live fixtures, handle everything in one intelligence-driven dashboard.</p>
          
          <div className="flex flex-wrap gap-4">
            {user?.role !== 'Viewer' && (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsModalOpen(true)}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Initialize Tournament
              </motion.button>
            )}
            <motion.a 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={`${import.meta.env.BASE_URL}tournament_rules.pdf`} download="Tournament_Rules.pdf" 
              className="px-6 py-2 rounded-md transition-all border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--overlay-bg)] flex items-center justify-center gap-2 text-sm font-medium"
            >
              Download Policy
            </motion.a>
          </div>
        </div>
      </motion.div>

      {/* Active Tournaments Header */}
      <motion.div variants={itemVariants} className="mb-6 flex justify-between items-end">
         <div className="flex flex-col">
            <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-1">Live Feed</h3>
            <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Active Tournaments</h2>
         </div>
      </motion.div>

      {/* Tournaments List */}
      {user?.role === 'Viewer' ? (
        <motion.div variants={itemVariants} className="mb-12 relative w-full overflow-hidden">
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory custom-scrollbar pr-8">
            {loading ? (
               <div className="w-80 h-[500px] shrink-0 rounded-3xl glass-panel flex flex-col justify-center items-center border border-[var(--border-subtle)]">
                 <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-[var(--accent-emerald)] animate-spin mb-4"></div>
                 <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">Syncing Neural Data...</p>
               </div>
            ) : tournaments.length === 0 ? (
               <div className="w-full glass-panel border border-[var(--border-subtle)] rounded-3xl p-16 text-center text-[var(--text-secondary)] font-medium h-[500px] flex items-center justify-center">No active tournaments found.</div>
            ) : (
              <AnimatePresence>
                {tournaments.map((tournament, index) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={tournament.id} 
                    className="w-[85vw] sm:w-[400px] shrink-0 snap-center relative overflow-hidden rounded-3xl group cursor-pointer border border-[var(--border-subtle)] hover:border-[var(--accent-emerald)] transition-all duration-500 h-[500px]"
                    onClick={() => {
                      if (tournament.teams >= (tournament.maxTeams || 16)) {
                        alert("Tournament is already full!");
                      } else {
                        openJoinModal(tournament.id);
                      }
                    }}
                  >
                    <div className="absolute inset-0 bg-black/50 z-10 transition-all duration-500 group-hover:bg-black/30"></div>
                    <img src={`https://images.unsplash.com/photo-1542652694-40abf526446e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&sig=${index}`} alt="Tournament" className="absolute inset-0 w-full h-full object-cover z-0 filter grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent z-10"></div>
                    
                    <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end">
                      <div className="mb-auto self-start">
                        <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md border border-white/10 text-[var(--accent-emerald)] text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest ">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-emerald)] animate-pulse shadow-[0_0_10px_var(--accent-emerald)]"></span> LIVE EVENT
                        </span>
                      </div>
                      
                      <h3 className="text-3xl font-black text-white mb-2 tracking-tight group-hover:-translate-y-2 transition-transform duration-500">{tournament.name}</h3>
                      
                      <div className="flex items-center gap-4 text-xs font-bold text-gray-300 mb-6 group-hover:-translate-y-2 transition-transform duration-500 delay-75">
                         <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-[var(--accent-emerald)]" /> 
                            {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                         </div>
                         <div className="w-1 h-1 rounded-full bg-gray-500"></div>
                         <div className="flex items-center gap-1.5 text-emerald-400">
                            ₹{tournament.prizePool?.toLocaleString() || 0} PRIZE
                         </div>
                         <div className="w-1 h-1 rounded-full bg-gray-500"></div>
                         <div className="flex items-center gap-1.5 text-blue-400">
                            <Users size={14} /> {tournament.teams} / {tournament.maxTeams || 16} TEAMS
                         </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-1">Entry Fee</span>
                          <span className="text-xl font-black text-white">₹{tournament.entryFee || 0}</span>
                        </div>
                        <button className={`${tournament.teams >= (tournament.maxTeams || 16) ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 'bg-[var(--accent-emerald)] shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]'} text-black px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform`}>
                          {tournament.teams >= (tournament.maxTeams || 16) ? 'Tournament Full' : 'Join Squad'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      ) : (
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 mb-12">
        {loading ? (
           <div className="glass-panel rounded-sm p-6 h-64 flex flex-col justify-center items-center">
             <div className="w-16 h-16 rounded-sm border-4 border-white/10 border-t-emerald-400 animate-spin mb-4"></div>
             <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">Syncing Neural Data...</p>
           </div>
        ) : tournaments.length === 0 ? (
           <div className="glass-panel rounded-sm p-16 text-center text-[var(--text-secondary)] font-medium">No active tournaments found in the system.</div>
        ) : (
          <AnimatePresence>
            {tournaments.map((tournament, index) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                key={tournament.id} 
                className="glass-panel-interactive overflow-hidden p-6 lg:p-8 flex flex-col xl:flex-row gap-8 cursor-default"
              >
                 {/* Left Section - Info */}
                 <div className="flex-1 flex flex-col justify-between relative">
                    
                    <div>
                       <div className="flex items-center gap-3 mb-4">
                         <span className="flex items-center gap-1.5 bg-[var(--overlay-bg)] border border-[var(--border-subtle)] text-[var(--accent-emerald)] text-[9px] font-bold px-3 py-1 rounded-sm uppercase tracking-widest ">
                           <span className="w-1.5 h-1.5 rounded-sm bg-[var(--accent-emerald)] animate-pulse"></span> LIVE
                         </span>
                         <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">ID: {tournament.id}</span>
                       </div>
                       
                       <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">{tournament.name}</h3>
                       
                       <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[var(--text-secondary)] mb-6">
                          <div className="flex items-center gap-1.5 bg-[var(--overlay-bg)] px-3 py-1.5 rounded-sm border border-[var(--border-subtle)]">
                             <Calendar size={14} className="text-[var(--accent-emerald)]" /> 
                             {new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-1.5 bg-[var(--overlay-bg)] px-3 py-1.5 rounded-sm border border-[var(--border-subtle)]">
                             <Users size={14} className="text-[var(--accent-primary)]" /> 
                             Main Arena
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mt-4 xl:mt-0">
                      {user?.role !== 'Viewer' && (
                        <motion.button 
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => openManageModal(tournament.id)} 
                          className="px-6 py-2.5 rounded-sm border border-[var(--border-subtle)] bg-[var(--overlay-bg)] hover:bg-[var(--overlay-hover)] text-[var(--text-primary)] font-bold transition-colors text-xs uppercase tracking-wider"
                        >
                          Manage Rosters
                        </motion.button>
                      )}
                      <motion.button 
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (tournament.teams >= (tournament.maxTeams || 16)) {
                            alert("Tournament is already full!");
                          } else {
                            openJoinModal(tournament.id);
                          }
                        }}
                        className={`px-4 py-2 rounded-md bg-[var(--overlay-bg)] border border-[var(--border-subtle)] font-medium transition-colors text-xs uppercase tracking-wider ${tournament.teams >= (tournament.maxTeams || 16) ? 'text-red-500 hover:bg-red-500 hover:text-white' : 'text-[var(--accent-emerald)] hover:bg-[var(--accent-emerald)] hover:text-[var(--bg-base)]'}`}
                      >
                        {tournament.teams >= (tournament.maxTeams || 16) ? 'Tournament Full' : 'Register Team'}
                      </motion.button>
                    </div>
                 </div>

                 {/* Right Section - Stats Cards */}
                 <div className="flex flex-col lg:flex-row gap-4 xl:w-2/3">
                    {/* Teams Card */}
                    <div className="bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-sm p-6 flex-1 flex flex-col justify-between relative overflow-hidden group">
                       <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent-primary)]"></div>
                       <div>
                          <h4 className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Users size={12} className="text-[var(--accent-primary)]"/> REGISTERED TEAMS</h4>
                          <div className="flex items-baseline gap-2 mb-6">
                             <span className="text-5xl font-bold text-[var(--text-primary)] tracking-tighter">{tournament.teams}</span>
                             <span className="text-sm font-bold text-[var(--text-secondary)]">/ {tournament.maxTeams || 16}</span>
                          </div>
                       </div>
                       <div className="w-full bg-[var(--overlay-bg)] h-1.5 rounded-sm overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(tournament.teams / (tournament.maxTeams || 16)) * 100}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="bg-[var(--accent-primary)] h-full rounded-sm "
                          ></motion.div>
                       </div>
                    </div>

                    {/* Prize Pool Card */}
                    <div className="bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-sm p-6 flex-1 flex flex-col justify-between relative overflow-hidden group">
                       <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent-primary)]"></div>
                       <div>
                          <h4 className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Trophy size={12} className="text-[var(--accent-primary)]"/> PRIZE POOL</h4>
                          <p className="text-3xl font-bold text-[var(--text-primary)] flex items-baseline gap-1 mb-1 tracking-tight">
                            <span className="text-sm text-[var(--accent-primary)]">₹</span> {tournament.prizePool.toLocaleString()}
                          </p>
                          <p className="text-[10px] font-bold text-[var(--text-secondary)]">Winner takes 60%</p>
                       </div>
                       <div className="mt-4 flex items-center gap-1.5 bg-[var(--overlay-bg)] border border-[var(--border-subtle)] w-fit px-3 py-1.5 rounded-sm">
                          <span className="text-[9px] font-bold text-[var(--accent-primary)] uppercase tracking-widest">Sponsored Event</span>
                       </div>
                    </div>

                    {/* Entry Fee Card */}
                    <div className="bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-sm p-6 flex-1 flex flex-col justify-between relative overflow-hidden group">
                       <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent-emerald)]"></div>
                       <div>
                          <h4 className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Plus size={12} className="text-[var(--accent-emerald)]"/> REGISTRATION FEE</h4>
                          <p className="text-3xl font-bold text-[var(--text-primary)] flex items-baseline gap-1 mb-1 tracking-tight">
                            <span className="text-sm text-[var(--accent-emerald)]">₹</span> {(tournament.entryFee || 0).toLocaleString()}
                          </p>
                          <p className="text-[10px] font-bold text-[var(--text-secondary)]">Per team base rate</p>
                       </div>
                    </div>
                 </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 ">
            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="glass-panel border border-[var(--border-subtle)] rounded-md w-[95%] sm:w-full max-w-md p-6 md:p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="absolute top-0 left-0 w-full h-1   "></div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-light text-[var(--text-primary)] tracking-tight">New <span className="font-bold text-[var(--accent-emerald)] drop-">Tournament</span></h2>
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1">Configure Event Parameters</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-sm flex items-center justify-center bg-[var(--overlay-bg)] hover:bg-[var(--overlay-hover)] transition-colors border border-[var(--border-subtle)]">
                  <X size={18} className="text-[var(--text-secondary)]" />
                </button>
              </div>
              <form onSubmit={handleCreateTournament} className="flex flex-col gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Tournament Name</label>
                  <input required type="text" value={newTournament.name} onChange={e => setNewTournament({...newTournament, name: e.target.value})} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-sm px-4 py-3 outline-none focus:border-[var(--border-subtle)] text-[var(--text-primary)] font-medium transition-all" placeholder="e.g. Champions League 2024" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Start Date</label>
                  <input required type="date" value={newTournament.startDate} onChange={e => setNewTournament({...newTournament, startDate: e.target.value})} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-sm px-4 py-3 outline-none focus:border-[var(--border-subtle)] text-[var(--text-primary)] font-medium [color-scheme:dark]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Prize Pool (₹)</label>
                    <input required type="number" value={newTournament.prizePool} onChange={e => setNewTournament({...newTournament, prizePool: e.target.value})} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-sm px-4 py-3 outline-none focus:border-[var(--border-subtle)] text-[var(--text-primary)] font-medium" placeholder="50000" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Entry Fee (₹)</label>
                    <input required type="number" value={newTournament.entryFee} onChange={e => setNewTournament({...newTournament, entryFee: e.target.value})} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-sm px-4 py-3 outline-none focus:border-[var(--border-subtle)] text-[var(--text-primary)] font-medium" placeholder="2500" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Max Teams</label>
                  <input required type="number" min="2" value={newTournament.maxTeams} onChange={e => setNewTournament({...newTournament, maxTeams: e.target.value})} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-sm px-4 py-3 outline-none focus:border-[var(--border-subtle)] text-[var(--text-primary)] font-medium" placeholder="16" />
                </div>
                <div className="mt-8 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3.5 rounded-sm border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold hover:bg-[var(--overlay-bg)] transition-colors">Cancel</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="flex-1 btn-primary">
                    Initialize
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isJoinModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 ">
            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="glass-panel border border-[var(--border-subtle)] rounded-md w-[95%] sm:w-full max-w-md p-6 md:p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent-primary)]"></div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-light text-[var(--text-primary)] tracking-tight">Register <span className="font-bold text-[var(--accent-primary)]">Team</span></h2>
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1">Secure your tournament slot</p>
                </div>
                <button onClick={() => setIsJoinModalOpen(false)} className="w-10 h-10 rounded-sm flex items-center justify-center bg-[var(--overlay-bg)] hover:bg-[var(--overlay-hover)] transition-colors border border-[var(--border-subtle)]">
                  <X size={18} className="text-[var(--text-secondary)]" />
                </button>
              </div>
              <form onSubmit={handleJoinTeam} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Team Name</label>
                    <input required type="text" value={newTeam.teamName} onChange={e => setNewTeam({...newTeam, teamName: e.target.value})} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-sm px-4 py-3 outline-none focus:border-[var(--border-subtle)] text-[var(--text-primary)] font-medium" placeholder="Thunderbolts" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Contact Email</label>
                    <input required type="email" value={newTeam.email} onChange={e => setNewTeam({...newTeam, email: e.target.value})} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-sm px-4 py-3 outline-none focus:border-[var(--border-subtle)] text-[var(--text-primary)] font-medium" placeholder="captain@example.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Squad Size</label>
                  <input required type="number" min="5" max="25" value={newTeam.playersCount} onChange={e => {
                    const count = parseInt(e.target.value) || 0;
                    setNewTeam({
                      ...newTeam, 
                      playersCount: e.target.value,
                      playerNames: Array(count).fill('').map((_, i) => newTeam.playerNames[i] || '')
                    })
                  }} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-sm px-4 py-3 outline-none focus:border-[var(--border-subtle)] text-[var(--text-primary)] font-medium" placeholder="11" />
                </div>
                
                {Number(newTeam.playersCount) > 0 && (
                  <div className="mt-4 max-h-48 overflow-y-auto custom-scrollbar pr-2 space-y-3 border border-[var(--border-subtle)] p-4 rounded-sm bg-[var(--bg-base)]/30">
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2 sticky top-0 bg-[var(--bg-base)] py-1 z-10">Player Roster</label>
                    {newTeam.playerNames.map((name, idx) => (
                      <input 
                        key={idx}
                        required 
                        type="text" 
                        value={name} 
                        onChange={e => {
                          const newNames = [...newTeam.playerNames];
                          newNames[idx] = e.target.value;
                          setNewTeam({...newTeam, playerNames: newNames});
                        }} 
                        className="w-full bg-[var(--bg-base)]/80 border border-[var(--border-subtle)] rounded-sm px-3 py-2 outline-none focus:border-[var(--border-subtle)] text-[var(--text-primary)] text-sm" 
                        placeholder={`Player ${idx + 1} Name`} 
                      />
                    ))}
                  </div>
                )}
                <div className="p-4 rounded-sm border border-[var(--border-subtle)] bg-[var(--overlay-bg)] mt-2">
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">
                    Entry Fee
                  </label>
                  <input readOnly required type="number" value={newTeam.amountPaid} className="w-full bg-transparent border-none outline-none text-3xl font-bold text-[var(--accent-primary)] cursor-not-allowed" />
                </div>
                <div className="mt-8 flex gap-4">
                  <button type="button" onClick={() => setIsJoinModalOpen(false)} className="flex-1 px-4 py-3.5 rounded-sm border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold hover:bg-[var(--overlay-bg)] transition-colors">Cancel</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={!newTeam.amountPaid || Number(newTeam.amountPaid) < (tournaments.find(t => t.id === activeTournamentId)?.entryFee || 0)} type="submit" className="flex-1 px-4 py-3.5 rounded-sm bg-[var(--accent-primary)] text-[var(--text-primary)] font-bold  transition-all disabled:opacity-50 disabled:shadow-none">
                    Confirm Registration
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isManageModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 ">
            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="glass-panel border border-[var(--border-subtle)] rounded-md w-[95%] sm:w-full max-w-2xl p-6 md:p-8 relative overflow-hidden flex flex-col max-h-[90vh] custom-scrollbar">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <div>
                  <h2 className="text-2xl font-light text-[var(--text-primary)] tracking-tight">Manage <span className="font-bold text-[var(--accent-emerald)]">Rosters</span></h2>
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1">Tournament Administration</p>
                </div>
                <button onClick={() => setIsManageModalOpen(false)} className="w-10 h-10 rounded-sm flex items-center justify-center bg-[var(--overlay-bg)] hover:bg-[var(--overlay-hover)] transition-colors border border-[var(--border-subtle)]">
                  <X size={18} className="text-[var(--text-secondary)]" />
                </button>
              </div>
              
              {user?.role !== 'Viewer' && (
                <div className="mb-6 p-4 rounded-sm border border-[var(--border-subtle)] bg-[var(--overlay-bg)] flex flex-col md:flex-row md:items-end gap-4 shrink-0">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-[var(--accent-emerald)] uppercase tracking-[0.2em] mb-2">Update Entry Fee (₹)</label>
                    <input type="number" value={activeTournamentFee} onChange={e => setActiveTournamentFee(e.target.value)} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-sm px-4 py-3 outline-none focus:border-[var(--border-subtle)] text-[var(--text-primary)] font-bold" />
                  </div>
                  <button 
                    onClick={handleUpdateFee}
                    disabled={isSavingManageFee}
                    className="btn-primary whitespace-nowrap"
                  >
                    {isSavingManageFee ? 'Saving...' : 'Save Price'}
                  </button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
                {teams.length === 0 ? (
                  <div className="py-12 text-center text-[var(--text-secondary)] font-medium bg-[var(--overlay-bg)] rounded-sm border border-[var(--border-subtle)]">No squads registered yet.</div>
                ) : (
                  <div className="space-y-3">
                    {teams.map((team, idx) => (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} key={team.id} className="bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-sm p-4 flex flex-col gap-4 hover:border-[var(--border-subtle)] transition-colors">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-sm bg-[var(--overlay-bg)] flex items-center justify-center text-[var(--accent-emerald)] border border-[var(--border-subtle)]">
                               <Users size={16} />
                             </div>
                             <div>
                               <p className="font-bold text-[var(--text-primary)] text-base">{team.teamName}</p>
                               <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">ID: {team.id}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="bg-[var(--overlay-bg)] text-[var(--accent-primary)] px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest border border-[var(--border-subtle)]">
                              {team.playersCount} Players
                            </span>
                            {user?.role !== 'Viewer' && (
                              <button onClick={() => handleDeleteTeam(team.id, activeTournamentId)} className="w-8 h-8 rounded-sm flex items-center justify-center text-[var(--accent-primary)] hover:bg-[var(--overlay-bg)] hover:text-[var(--accent-primary)] transition-colors border border-transparent hover:border-[var(--border-subtle)]" title="Remove Team">
                                 <X size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                        {team.players && team.players.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-3 border-t border-[var(--border-subtle)]">
                            {team.players.map(p => (
                              <span key={p.id} className="text-xs bg-[var(--overlay-bg)] border border-[var(--border-subtle)] text-[var(--text-secondary)] px-2.5 py-1 rounded-sm">{p.playerName}</span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
