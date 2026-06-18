import { useState, useEffect } from 'react';
import api from '../api';
import { Trophy, Users, Calendar, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
    // Fetch mock data from backend
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
        setTournaments([...tournaments, tournamentToCreate]);
        setIsModalOpen(false);
        setNewTournament({ name: '', prizePool: '', maxTeams: '', entryFee: '', startDate: '', status: 'Upcoming' });
      })
      .catch(err => {
        console.error("Error creating tournament", err);
        alert("Failed to create tournament.");
      });
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

  const calculateTimeRemaining = (startDate) => {
    if (!startDate) return "Not Scheduled";
    const start = new Date(startDate);
    const now = new Date();
    const diff = start - now;
    if (diff <= 0) return "Started";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days} Days ${hours} Hours`;
    if (hours > 0) return `${hours} Hours ${minutes} Mins`;
    return `${minutes} Mins`;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-0 px-2 md:px-0">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
          ADMIN DASHBOARD <span className="text-white">/ Tournament Center</span>
        </h1>
      </div>

      <div className="rounded-2xl p-8 mb-8 relative overflow-hidden flex flex-col items-start justify-center min-h-[220px] border border-[#1E293B]">
        <div className="absolute inset-0 z-0">
           <img src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" alt="Stadium" className="w-full h-full object-cover opacity-30" />
           <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120] via-[#0B1120]/90 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-normal text-white mb-3">Host Professional Tournaments</h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-8">Elevate your venue with full-scale tournament management. From registration to live fixtures, handle everything in one intelligence-driven dashboard.</p>
          
          {user?.role !== 'Viewer' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-cyan-400 hover:bg-cyan-300 text-black px-6 py-2.5 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(0,242,254,0.3)] active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Create Tournament
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
         <div className="flex items-center gap-2">
            <div className="bg-[#1E293B] p-1.5 rounded-md">
               <Trophy size={14} className="text-cyan-400" />
            </div>
            <h2 className="text-xs font-bold text-white">Active Tournament</h2>
         </div>
         <button className="text-[10px] font-bold text-white hover:text-cyan-400 transition-colors uppercase tracking-widest">
            View All Active
         </button>
      </div>

      {loading ? (
        <div className="text-center p-12 text-[var(--text-secondary)] animate-pulse">Loading tournaments...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 mb-12">
          {tournaments.map(tournament => (
            <div key={tournament.id} className="bg-[#0B1120] rounded-3xl border border-[#1E293B] overflow-hidden p-6 flex flex-col lg:flex-row gap-6 shadow-2xl">
               
               {/* Left Section - Info & Buttons */}
               <div className="flex-1 flex flex-col justify-between">
                  <div>
                     <span className="inline-block border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                       CURRENTLY LIVE
                     </span>
                     <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{tournament.name}</h3>
                     <div className="flex items-center gap-4 text-xs font-bold text-[var(--text-secondary)] mb-6">
                        <div className="flex items-center gap-1.5">
                           <Calendar size={12} /> {new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1.5">
                           <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Main Arena
                        </div>
                     </div>
                  </div>
                  
                  {user?.role !== 'Viewer' && (
                    <div className="flex gap-3 mt-4 lg:mt-0">
                      <button onClick={() => openManageModal(tournament.id)} className="px-6 py-2.5 rounded-xl border border-[#1E293B] bg-[#151C2C] hover:bg-white/5 text-white font-bold transition-colors text-sm">
                        Manage
                      </button>
                      <button onClick={() => alert('Bracket generation feature coming soon!')} className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold transition-all shadow-[0_0_15px_rgba(0,242,254,0.3)] text-sm">
                        Fixtures
                      </button>
                    </div>
                  )}
               </div>

               {/* Right Section - Stats Cards */}
               <div className="flex flex-col md:flex-row gap-4 lg:w-2/3">
                  
                  {/* Registered Teams */}
                  <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl p-6 flex-1 flex flex-col justify-between">
                     <div>
                        <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4">REGISTERED TEAMS</h4>
                        <div className="flex items-baseline gap-1 mb-6">
                           <span className="text-4xl font-bold text-white">{tournament.teams}</span>
                           <span className="text-sm font-bold text-[var(--text-secondary)]">/ {tournament.maxTeams || 16}</span>
                        </div>
                     </div>
                     <div className="w-full bg-[#1E293B] h-2 rounded-full overflow-hidden">
                        <div className="bg-cyan-400 h-full rounded-full shadow-[0_0_10px_rgba(0,242,254,0.5)]" style={{ width: `${(tournament.teams / (tournament.maxTeams || 16)) * 100}%` }}></div>
                     </div>
                  </div>

                  {/* Prize Pool */}
                  <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl p-6 flex-1 flex flex-col justify-between">
                     <div>
                        <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4">PRIZE POOL</h4>
                        <p className="text-2xl font-bold text-white flex items-center gap-1 mb-1">
                          <span className="text-slate-400">₹</span> {tournament.prizePool.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-[var(--text-secondary)]">Winner takes 60%</p>
                     </div>
                     <div className="mt-4 flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 w-fit px-3 py-1 rounded-full">
                        <span className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-[8px] font-bold text-white">$</span>
                        <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider">Fully Sponsored</span>
                     </div>
                  </div>

                  {/* Entry Fee */}
                  <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl p-6 flex-1 flex flex-col justify-between group cursor-pointer hover:border-cyan-500/50 transition-colors" onClick={() => openJoinModal(tournament.id)}>
                     <div>
                        <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4">ENTRY FEE</h4>
                        <p className="text-2xl font-bold text-white flex items-center gap-1 mb-1">
                          <span className="text-slate-400">₹</span> {(tournament.entryFee || 0).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-[var(--text-secondary)]">Per team registration</p>
                     </div>
                     <div className="mt-6 flex items-center justify-between text-white group-hover:text-cyan-400 transition-colors">
                        <span className="text-xs font-bold">Quick<br/>Registration</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                     </div>
                  </div>

               </div>
            </div>
          ))}
          {tournaments.length === 0 && (
            <div className="p-12 text-center text-[var(--text-secondary)]">No active tournaments found.</div>
          )}
        </div>
      )}

      <div className="mb-6 border-t border-[#1E293B] pt-8 relative">
        <h2 className="text-[10px] font-bold text-[var(--text-secondary)] tracking-wider absolute top-0 -translate-y-1/2 bg-[#0B1120] px-4 left-0">Venue Tools</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 mt-4">
           <a href={`${import.meta.env.BASE_URL}tournament_rules.pdf`} download="Tournament_Rules.pdf" className="bg-[#151C2C] border border-[#1E293B] rounded-2xl p-5 flex flex-col cursor-pointer hover:bg-[#1E293B] transition-colors relative group h-32 justify-between">
              <div className="bg-[#1E293B] p-2 rounded-lg w-fit group-hover:bg-[#2D3748] transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <div>
                 <h3 className="font-bold text-white text-sm mb-1">Rules & Policy</h3>
                 <p className="text-[10px] text-[var(--text-secondary)] leading-tight">Customize tournament rules, fair play policies, and waivers.</p>
              </div>
              <div className="absolute bottom-4 right-4 text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity">
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </div>
           </a>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#151C2C] border border-[#1E293B] rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">New Tournament</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-[var(--text-secondary)]">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTournament} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Tournament Name</label>
                <input required type="text" value={newTournament.name} onChange={e => setNewTournament({...newTournament, name: e.target.value})} className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 text-white" placeholder="Summer Cup 2024" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Start Date</label>
                <input required type="date" value={newTournament.startDate} onChange={e => setNewTournament({...newTournament, startDate: e.target.value})} className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 text-white [&::-webkit-calendar-picker-indicator]:invert" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Prize Pool (₹)</label>
                  <input required type="number" value={newTournament.prizePool} onChange={e => setNewTournament({...newTournament, prizePool: e.target.value})} className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 text-white" placeholder="50000" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Entry Fee (₹)</label>
                  <input required type="number" value={newTournament.entryFee} onChange={e => setNewTournament({...newTournament, entryFee: e.target.value})} className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 text-white" placeholder="2500" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Max Teams</label>
                  <input required type="number" min="2" value={newTournament.maxTeams} onChange={e => setNewTournament({...newTournament, maxTeams: e.target.value})} className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 text-white" placeholder="16" />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl border border-[#1E293B] text-white font-bold hover:bg-white/5 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-cyan-400 text-black font-bold hover:bg-cyan-300 shadow-[0_0_15px_rgba(0,242,254,0.3)] transition-all active:scale-95">Create Tournament</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-md bg-[var(--bg-color)] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Register Team</h2>
              <button onClick={() => setIsJoinModalOpen(false)} className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleJoinTeam} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Team Name</label>
                <input required type="text" value={newTeam.teamName} onChange={e => setNewTeam({...newTeam, teamName: e.target.value})} className="w-full bg-black/5 dark:bg-white/10 border border-[var(--border-color)] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500/50 text-[var(--text-primary)]" placeholder="Thunderbolts" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Number of Players</label>
                <input required type="number" min="5" max="25" value={newTeam.playersCount} onChange={e => setNewTeam({...newTeam, playersCount: e.target.value})} className="w-full bg-black/5 dark:bg-white/10 border border-[var(--border-color)] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500/50 text-[var(--text-primary)]" placeholder="11" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Price (Minimum: ₹{tournaments.find(t => t.id === activeTournamentId)?.entryFee || 0})
                </label>
                <input required type="number" value={newTeam.amountPaid} onChange={e => setNewTeam({...newTeam, amountPaid: e.target.value})} className={`w-full bg-black/5 dark:bg-white/10 border ${Number(newTeam.amountPaid) >= (tournaments.find(t => t.id === activeTournamentId)?.entryFee || 0) ? 'border-emerald-500/50 focus:ring-emerald-500/50' : 'border-[var(--border-color)] focus:ring-purple-500/50'} rounded-xl px-4 py-2.5 outline-none focus:ring-2 text-[var(--text-primary)] transition-colors`} placeholder="Enter price" />
                {newTeam.amountPaid && Number(newTeam.amountPaid) < (tournaments.find(t => t.id === activeTournamentId)?.entryFee || 0) && (
                  <p className="text-xs text-red-400 mt-1">Price must be at least ₹{tournaments.find(t => t.id === activeTournamentId)?.entryFee || 0}.</p>
                )}
              </div>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setIsJoinModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border-color)] font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Cancel</button>
                <button type="submit" disabled={!newTeam.amountPaid || Number(newTeam.amountPaid) < (tournaments.find(t => t.id === activeTournamentId)?.entryFee || 0)} className="flex-1 px-4 py-2.5 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 shadow-md shadow-purple-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-500">Pay & Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-lg bg-[var(--bg-color)] shadow-2xl animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2"><Users size={24} className="text-purple-500" /> Registered Teams</h2>
              <button onClick={() => setIsManageModalOpen(false)} className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
            
            {user?.role !== 'Viewer' && (
              <div className="mb-6 p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-[var(--border-color)]">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Minimum Registration Price (₹)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={activeTournamentFee}
                    onChange={e => setActiveTournamentFee(e.target.value)}
                    className="flex-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500/50 text-[var(--text-primary)]"
                    placeholder="Enter minimum price"
                  />
                  <button 
                    onClick={() => {
                      setIsSavingManageFee(true);
                      api.put(`/tournaments/${activeTournamentId}/fee`, { entryFee: activeTournamentFee })
                        .then(() => {
                          alert("Minimum price saved permanently!");
                          setIsSavingManageFee(false);
                          setTournaments(tournaments.map(t => t.id === activeTournamentId ? { ...t, entryFee: Number(activeTournamentFee) } : t));
                        })
                        .catch(err => {
                          console.error(err);
                          alert("Failed to save minimum price.");
                          setIsSavingManageFee(false);
                        });
                    }}
                    disabled={isSavingManageFee}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isSavingManageFee ? 'Saving...' : 'Save Price'}
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto">
              {teams.length === 0 ? (
                <p className="text-center text-[var(--text-secondary)] py-8">No teams have registered for this tournament yet.</p>
              ) : (
                <ul className="divide-y divide-[var(--border-color)]">
                  {teams.map(team => (
                    <li key={team.id} className="py-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold">{team.teamName}</p>
                        <p className="text-sm text-[var(--text-secondary)]">ID: {team.id}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="bg-purple-500/10 text-purple-600 px-3 py-1 rounded-full text-sm font-semibold border border-purple-500/20">
                          {team.playersCount} Players
                        </span>
                        {user?.role !== 'Viewer' && (
                          <button onClick={() => handleDeleteTeam(team.id, activeTournamentId)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-full transition-colors" title="Remove Team">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
              <button onClick={() => setIsManageModalOpen(false)} className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 font-medium hover:bg-black/10 dark:hover:bg-white/20 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
