import { useState, useEffect } from 'react';
import api from '../api';
import { Trophy, Users, Calendar, Plus, ChevronRight, X, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Tournaments = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTournament, setNewTournament] = useState({ name: '', prizePool: '', maxTeams: '', entryFee: '', startDate: '', status: 'Upcoming' });

  const [activeTournamentId, setActiveTournamentId] = useState(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ teamName: '', playersCount: '', amountPaid: '' });
  
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
    setNewTeam({ teamName: '', playersCount: '', amountPaid: '' });
    setIsJoinModalOpen(true);
  };

  const handleJoinTeam = (e) => {
    e.preventDefault();
    const id = 'team' + Date.now();
    api.post(`/tournaments/${activeTournamentId}/teams`, { id, ...newTeam })
      .then(() => {
        setIsJoinModalOpen(false);
        setTournaments(tournaments.map(t => t.id === activeTournamentId ? { ...t, teams: t.teams + 1 } : t));
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
      <motion.div variants={itemVariants} className="glass-panel rounded-[2rem] p-8 mb-8 relative overflow-hidden flex flex-col items-start justify-center min-h-[260px] border border-[var(--border-subtle)] shadow-2xl group">
        <div className="absolute inset-0 z-0 overflow-hidden">
           <motion.img 
             initial={{ scale: 1.1 }}
             animate={{ scale: 1 }}
             transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
             src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" alt="Stadium" 
             className="w-full h-full object-cover opacity-20" 
           />
           <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-base)] via-[var(--bg-base)]/80 to-transparent"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] to-transparent opacity-80"></div>
        </div>
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -z-10 group-hover:bg-emerald-500/20 transition-all duration-700"></div>

        <div className="relative z-10 max-w-2xl w-full">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(0,242,254,0.2)]">
                <Trophy size={20} />
             </div>
             <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-[0.2em]">Tournament Center</span>
          </div>
          <h2 className="text-4xl font-light text-white mb-4 tracking-tight">Host Professional <span className="font-extrabold text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">Esports & Events</span></h2>
          <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed mb-8 max-w-xl">Elevate your venue with full-scale tournament management. From registration to live fixtures, handle everything in one intelligence-driven dashboard.</p>
          
          <div className="flex flex-wrap gap-4">
            {user?.role !== 'Viewer' && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-emerald-400 to-blue-500 hover:from-emerald-300 hover:to-blue-400 text-black px-6 py-3 rounded-xl font-extrabold transition-all shadow-[0_0_20px_rgba(0,242,254,0.3)] flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Initialize Tournament
              </motion.button>
            )}
            <motion.a 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={`${import.meta.env.BASE_URL}tournament_rules.pdf`} download="Tournament_Rules.pdf" 
              className="glass-panel px-6 py-3 rounded-xl font-extrabold transition-all border border-[var(--border-subtle)] text-white hover:bg-white/5 flex items-center justify-center gap-2"
            >
              Download Policy
            </motion.a>
          </div>
        </div>
      </motion.div>

      {/* Active Tournaments Header */}
      <motion.div variants={itemVariants} className="mb-6 flex justify-between items-end">
         <div className="flex flex-col">
            <h3 className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-1">Live Feed</h3>
            <h2 className="text-xl font-bold text-white tracking-tight">Active Tournaments</h2>
         </div>
      </motion.div>

      {/* Tournaments List */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 mb-12">
        {loading ? (
           <div className="glass-panel rounded-3xl p-6 h-64 flex flex-col justify-center items-center">
             <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-emerald-400 animate-spin mb-4"></div>
             <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em]">Syncing Neural Data...</p>
           </div>
        ) : tournaments.length === 0 ? (
           <div className="glass-panel rounded-3xl p-16 text-center text-[var(--text-secondary)] font-medium">No active tournaments found in the system.</div>
        ) : (
          <AnimatePresence>
            {tournaments.map((tournament, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={tournament.id} 
                className="glass-panel-interactive rounded-3xl overflow-hidden p-6 lg:p-8 flex flex-col xl:flex-row gap-8"
              >
                 {/* Left Section - Info */}
                 <div className="flex-1 flex flex-col justify-between relative">
                    <div className="absolute -left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-amber-500 rounded-r-full shadow-[0_0_15px_rgba(0,242,254,0.5)]"></div>
                    
                    <div>
                       <div className="flex items-center gap-3 mb-4">
                         <span className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> LIVE
                         </span>
                         <span className="text-[9px] font-extrabold text-[var(--text-secondary)] uppercase tracking-widest">ID: {tournament.id}</span>
                       </div>
                       
                       <h3 className="text-3xl font-extrabold text-white mb-3 tracking-tight">{tournament.name}</h3>
                       
                       <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[var(--text-secondary)] mb-6">
                          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)]">
                             <Calendar size={14} className="text-emerald-400" /> 
                             {new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)]">
                             <Users size={14} className="text-amber-400" /> 
                             Main Arena
                          </div>
                       </div>
                    </div>
                    
                    {user?.role !== 'Viewer' && (
                      <div className="flex flex-wrap gap-3 mt-4 xl:mt-0">
                        <motion.button 
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => openManageModal(tournament.id)} 
                          className="px-6 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-white/5 hover:bg-white/10 text-white font-bold transition-colors text-xs uppercase tracking-wider"
                        >
                          Manage Rosters
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => openJoinModal(tournament.id)} 
                          className="px-6 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-400 hover:text-black font-extrabold transition-all shadow-[0_0_15px_rgba(0,242,254,0.1)] text-xs uppercase tracking-wider"
                        >
                          Register Team
                        </motion.button>
                      </div>
                    )}
                 </div>

                 {/* Right Section - Stats Cards */}
                 <div className="flex flex-col md:flex-row gap-4 xl:w-2/3">
                    {/* Teams Card */}
                    <div className="bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-2xl p-6 flex-1 flex flex-col justify-between relative overflow-hidden group">
                       <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
                       <div>
                          <h4 className="text-[9px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Users size={12} className="text-amber-400"/> REGISTERED TEAMS</h4>
                          <div className="flex items-baseline gap-2 mb-6">
                             <span className="text-5xl font-extrabold text-white tracking-tighter">{tournament.teams}</span>
                             <span className="text-sm font-bold text-[var(--text-secondary)]">/ {tournament.maxTeams || 16}</span>
                          </div>
                       </div>
                       <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(tournament.teams / (tournament.maxTeams || 16)) * 100}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="bg-amber-500 h-full rounded-full shadow-[0_0_10px_rgba(192,132,252,0.8)]"
                          ></motion.div>
                       </div>
                    </div>

                    {/* Prize Pool Card */}
                    <div className="bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-2xl p-6 flex-1 flex flex-col justify-between relative overflow-hidden group">
                       <div className="absolute top-0 left-0 w-full h-1 bg-amber-400"></div>
                       <div>
                          <h4 className="text-[9px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Trophy size={12} className="text-amber-400"/> PRIZE POOL</h4>
                          <p className="text-3xl font-extrabold text-white flex items-baseline gap-1 mb-1 tracking-tight">
                            <span className="text-sm text-amber-400">₹</span> {tournament.prizePool.toLocaleString()}
                          </p>
                          <p className="text-[10px] font-bold text-[var(--text-secondary)]">Winner takes 60%</p>
                       </div>
                       <div className="mt-4 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 w-fit px-3 py-1.5 rounded-md">
                          <span className="text-[9px] font-extrabold text-amber-400 uppercase tracking-widest">Sponsored Event</span>
                       </div>
                    </div>

                    {/* Entry Fee Card */}
                    <div className="bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-2xl p-6 flex-1 flex flex-col justify-between relative overflow-hidden group">
                       <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400"></div>
                       <div>
                          <h4 className="text-[9px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Plus size={12} className="text-emerald-400"/> REGISTRATION FEE</h4>
                          <p className="text-3xl font-extrabold text-white flex items-baseline gap-1 mb-1 tracking-tight">
                            <span className="text-sm text-emerald-400">₹</span> {(tournament.entryFee || 0).toLocaleString()}
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

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="glass-panel border border-[var(--border-subtle)] rounded-3xl w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-light text-white tracking-tight">New <span className="font-extrabold text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">Tournament</span></h2>
                  <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1">Configure Event Parameters</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors border border-[var(--border-subtle)]">
                  <X size={18} className="text-[var(--text-secondary)]" />
                </button>
              </div>
              <form onSubmit={handleCreateTournament} className="flex flex-col gap-5">
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Tournament Name</label>
                  <input required type="text" value={newTournament.name} onChange={e => setNewTournament({...newTournament, name: e.target.value})} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 text-white font-medium transition-all" placeholder="e.g. Champions League 2024" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Start Date</label>
                  <input required type="date" value={newTournament.startDate} onChange={e => setNewTournament({...newTournament, startDate: e.target.value})} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 text-white font-medium [color-scheme:dark]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Prize Pool (₹)</label>
                    <input required type="number" value={newTournament.prizePool} onChange={e => setNewTournament({...newTournament, prizePool: e.target.value})} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 text-white font-medium" placeholder="50000" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Entry Fee (₹)</label>
                    <input required type="number" value={newTournament.entryFee} onChange={e => setNewTournament({...newTournament, entryFee: e.target.value})} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 text-white font-medium" placeholder="2500" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Max Teams</label>
                  <input required type="number" min="2" value={newTournament.maxTeams} onChange={e => setNewTournament({...newTournament, maxTeams: e.target.value})} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 text-white font-medium" placeholder="16" />
                </div>
                <div className="mt-8 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3.5 rounded-xl border border-[var(--border-subtle)] text-white font-bold hover:bg-white/5 transition-colors">Cancel</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="flex-1 px-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-blue-500 text-black font-extrabold shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all">
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="glass-panel border border-[var(--border-subtle)] rounded-3xl w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-light text-white tracking-tight">Register <span className="font-extrabold text-amber-400">Team</span></h2>
                  <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1">Secure your tournament slot</p>
                </div>
                <button onClick={() => setIsJoinModalOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors border border-[var(--border-subtle)]">
                  <X size={18} className="text-[var(--text-secondary)]" />
                </button>
              </div>
              <form onSubmit={handleJoinTeam} className="flex flex-col gap-5">
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Team Name</label>
                  <input required type="text" value={newTeam.teamName} onChange={e => setNewTeam({...newTeam, teamName: e.target.value})} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 outline-none focus:border-amber-500/50 text-white font-medium" placeholder="Thunderbolts" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Squad Size</label>
                  <input required type="number" min="5" max="25" value={newTeam.playersCount} onChange={e => setNewTeam({...newTeam, playersCount: e.target.value})} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 outline-none focus:border-amber-500/50 text-white font-medium" placeholder="11" />
                </div>
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 mt-2">
                  <label className="block text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">
                    Payment Amount (Min: ₹{tournaments.find(t => t.id === activeTournamentId)?.entryFee || 0})
                  </label>
                  <input required type="number" value={newTeam.amountPaid} onChange={e => setNewTeam({...newTeam, amountPaid: e.target.value})} className="w-full bg-transparent border-none outline-none text-3xl font-extrabold text-amber-400 placeholder-amber-900" placeholder="0" />
                </div>
                <div className="mt-8 flex gap-4">
                  <button type="button" onClick={() => setIsJoinModalOpen(false)} className="flex-1 px-4 py-3.5 rounded-xl border border-[var(--border-subtle)] text-white font-bold hover:bg-white/5 transition-colors">Cancel</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={!newTeam.amountPaid || Number(newTeam.amountPaid) < (tournaments.find(t => t.id === activeTournamentId)?.entryFee || 0)} type="submit" className="flex-1 px-4 py-3.5 rounded-xl bg-amber-500 text-white font-extrabold shadow-[0_0_20px_rgba(192,132,252,0.4)] transition-all disabled:opacity-50 disabled:shadow-none">
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="glass-panel border border-[var(--border-subtle)] rounded-3xl w-full max-w-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 relative overflow-hidden flex flex-col max-h-[85vh]">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <div>
                  <h2 className="text-2xl font-light text-white tracking-tight">Manage <span className="font-extrabold text-emerald-400">Rosters</span></h2>
                  <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1">Tournament Administration</p>
                </div>
                <button onClick={() => setIsManageModalOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors border border-[var(--border-subtle)]">
                  <X size={18} className="text-[var(--text-secondary)]" />
                </button>
              </div>
              
              {user?.role !== 'Viewer' && (
                <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col md:flex-row md:items-end gap-4 shrink-0">
                  <div className="flex-1">
                    <label className="block text-[10px] font-extrabold text-emerald-400 uppercase tracking-[0.2em] mb-2">Update Entry Fee (₹)</label>
                    <input type="number" value={activeTournamentFee} onChange={e => setActiveTournamentFee(e.target.value)} className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 text-white font-extrabold" />
                  </div>
                  <button 
                    onClick={handleUpdateFee}
                    disabled={isSavingManageFee}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 text-black font-extrabold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:from-emerald-300 hover:to-emerald-400 transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {isSavingManageFee ? 'Saving...' : 'Save Price'}
                  </button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
                {teams.length === 0 ? (
                  <div className="py-12 text-center text-[var(--text-secondary)] font-medium bg-white/5 rounded-2xl border border-[var(--border-subtle)]">No squads registered yet.</div>
                ) : (
                  <div className="space-y-3">
                    {teams.map((team, idx) => (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} key={team.id} className="bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-2xl p-4 flex justify-between items-center hover:border-emerald-500/30 transition-colors">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                             <Users size={16} />
                           </div>
                           <div>
                             <p className="font-extrabold text-white text-base">{team.teamName}</p>
                             <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">ID: {team.id}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border border-amber-500/20">
                            {team.playersCount} Players
                          </span>
                          {user?.role !== 'Viewer' && (
                            <button onClick={() => handleDeleteTeam(team.id, activeTournamentId)} className="w-8 h-8 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors border border-transparent hover:border-rose-500/20" title="Remove Team">
                               <X size={14} />
                            </button>
                          )}
                        </div>
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
