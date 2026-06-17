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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-0">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-1">Tournament Management</h1>
        <p className="text-sm text-[var(--text-secondary)]">Oversee your sporting events with real-time analytics.</p>
      </div>



      <div className="bg-[#151C2C] border border-cyan-500/20 rounded-2xl p-6 mb-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6" style={{ background: 'linear-gradient(135deg, #151C2C 0%, #1A2235 100%)' }}>
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
          <Trophy size={200} />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-2 text-purple-400">Host Professional Tournaments</h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-md leading-relaxed mb-6 md:mb-0">Create, manage, and track local cricket tournaments directly from your dashboard. Handle team registrations, fixtures, and prize pools seamlessly.</p>
        </div>
        {user?.role !== 'Viewer' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="relative z-10 w-full md:w-auto bg-cyan-400 hover:bg-cyan-300 text-black px-6 py-3 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(0,242,254,0.3)] active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Create Tournament
          </button>
        )}
      </div>

      <div className="mb-8 flex justify-between items-center">
         <h2 className="text-sm font-bold text-cyan-400 tracking-wider">ACTIVE TOURNAMENT</h2>
         <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div> Live System Update
         </div>
      </div>

      {loading ? (
        <div className="text-center p-12 text-[var(--text-secondary)] animate-pulse">Loading tournaments...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 mb-8">
          {tournaments.map(tournament => (
            <div key={tournament.id} className="bg-[#0B1120] rounded-2xl border border-[#1E293B] overflow-hidden relative group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400"></div>
              
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <h3 className="text-xl font-bold text-white">{tournament.name}</h3>
                       <span className="bg-[#1E293B] text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-purple-500/20">{tournament.status}</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">Cricket • T20 Format • Season 4</p>
                  </div>
                  <div className="flex items-center gap-6 md:gap-12 text-center md:text-right">
                     <div>
                       <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1">STARTS IN</p>
                       <p className="text-sm font-bold text-white">{calculateTimeRemaining(tournament.startDate)}</p>
                     </div>
                     <div>
                       <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1">REGISTRATION</p>
                       <p className="text-sm font-bold text-cyan-400">Closing Soon</p>
                     </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                   <div className="bg-[#151C2C] border border-[#1E293B] rounded-xl p-4">
                     <div className="flex items-center gap-2 mb-2">
                        <Users size={16} className="text-[var(--text-secondary)]" />
                        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">REGISTERED TEAMS</span>
                     </div>
                     <div className="flex items-end gap-1 mb-2">
                        <span className="text-2xl font-bold text-white">{tournament.teams}</span>
                        <span className="text-sm text-[var(--text-secondary)] font-medium mb-0.5">/ {tournament.maxTeams || 16}</span>
                     </div>
                     <div className="w-full bg-[#1E293B] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${(tournament.teams / (tournament.maxTeams || 16)) * 100}%` }}></div>
                     </div>
                   </div>

                   <div className="bg-[#151C2C] border border-[#1E293B] rounded-xl p-4">
                     <div className="flex items-center gap-2 mb-2">
                        <span className="text-emerald-400 font-bold">₹</span>
                        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">PRIZE POOL</span>
                     </div>
                     <p className="text-2xl font-bold text-emerald-400 mb-1">₹ {tournament.prizePool.toLocaleString()}</p>
                     <p className="text-[10px] text-[var(--text-secondary)]">Base: ₹ 35k + Pool Bonuses</p>
                   </div>

                   <div className="bg-[#151C2C] border border-[#1E293B] rounded-xl p-4">
                     <div className="flex items-center gap-2 mb-2">
                        <span className="text-purple-400 font-bold">₹</span>
                        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">ENTRY FEE</span>
                     </div>
                     <p className="text-2xl font-bold text-purple-400 mb-1">₹ {(tournament.entryFee || 0).toLocaleString()}</p>
                     <p className="text-[10px] text-[var(--text-secondary)]">Per team (Inc. Refreshments)</p>
                   </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <button 
                    onClick={() => openJoinModal(tournament.id)} 
                    disabled={tournament.teams >= (tournament.maxTeams || 16)}
                    className="flex-1 py-4 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    {tournament.teams >= (tournament.maxTeams || 16) ? 'Registration Closed' : 'Quick Team Registration'}
                  </button>
                  {user?.role !== 'Viewer' && (
                    <div className="flex gap-4">
                      <button onClick={() => openManageModal(tournament.id)} className="px-6 py-4 rounded-xl border border-[#1E293B] bg-[#151C2C] hover:bg-[#1E293B] text-white font-bold transition-colors flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        Manage
                      </button>
                      <button onClick={() => alert('Bracket generation feature coming soon!')} className="px-6 py-4 rounded-xl border border-[#1E293B] bg-[#151C2C] hover:bg-[#1E293B] text-white font-bold transition-colors flex items-center justify-center gap-2">
                        <Calendar size={16} className="text-purple-400" />
                        Fixtures
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-[#1E293B] p-4 flex justify-between items-center bg-[#151C2C]">
                 <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <img className="w-6 h-6 rounded-full border border-[#151C2C]" src="https://ui-avatars.com/api/?name=Team1&background=1E293B&color=fff" alt="" />
                      <img className="w-6 h-6 rounded-full border border-[#151C2C]" src="https://ui-avatars.com/api/?name=Team2&background=3b82f6&color=fff" alt="" />
                      <div className="w-6 h-6 rounded-full border border-[#151C2C] bg-[#1E293B] flex items-center justify-center text-[8px] text-white font-bold">+{tournament.teams}</div>
                    </div>
                 </div>
              </div>
            </div>
          ))}
          {tournaments.length === 0 && (
            <div className="p-12 text-center text-[var(--text-secondary)]">No tournaments found.</div>
          )}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-sm font-bold text-white tracking-wider mb-4">VENUE TOOLS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-[#1E293B] transition-colors">
              <div className="flex items-center gap-4">
                 <div className="bg-[#0B1120] p-3 rounded-xl border border-[#1E293B]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M12 4v16"></path><path d="M2 8h20"></path><path d="M2 16h20"></path></svg>
                 </div>
                 <div>
                    <h3 className="font-bold text-white text-sm mb-0.5">Venue Availability</h3>
                    <p className="text-[10px] text-[var(--text-secondary)]">Manage court & ground slots</p>
                 </div>
              </div>
              <span className="text-[var(--text-secondary)]">›</span>
           </div>

           <a href="/tournament_rules.pdf" download="Tournament_Rules.pdf" className="bg-[#151C2C] border border-[#1E293B] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-[#1E293B] transition-colors block text-left">
              <div className="flex items-center gap-4">
                 <div className="bg-[#0B1120] p-3 rounded-xl border border-[#1E293B]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                 </div>
                 <div>
                    <h3 className="font-bold text-white text-sm mb-0.5">Rules & Policy</h3>
                    <p className="text-[10px] text-[var(--text-secondary)]">Download tournament guidelines</p>
                 </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-secondary)]"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
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
