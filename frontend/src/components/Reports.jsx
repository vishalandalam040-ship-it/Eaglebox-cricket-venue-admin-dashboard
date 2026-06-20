import { FileText, Download, TrendingUp, Calendar, Users, Trophy, BrainCircuit, RefreshCcw, LogOut, ChevronRight } from 'lucide-react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

export const Reports = () => {
  const { user } = useAuth();

  const handleDownload = async (endpoint, filename) => {
    try {
      const response = await api.get(endpoint, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. You might not have permission.');
    }
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
      
      <motion.div variants={itemVariants} className="mb-10">
        <div className="flex items-center gap-2 mb-2 text-emerald-400 font-extrabold text-[10px] uppercase tracking-[0.2em] bg-emerald-500/10 w-fit px-3 py-1.5 rounded-md border border-emerald-500/20 shadow-[var(--icon-glow-subtle)]">
           <BrainCircuit size={14} className="animate-pulse" /> INTELLIGENCE-DRIVEN INSIGHTS
        </div>
        <h1 className="text-3xl font-light text-[var(--text-primary)] mb-2 tracking-tight">Executive <span className="font-extrabold text-emerald-400">Reports</span></h1>
        <p className="text-sm font-medium text-[var(--text-secondary)]">Automated analytics and generative business intelligence.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
        <div className="xl:col-span-2 flex flex-col gap-8">
          {/* AI Business Summary Card */}
          <motion.div 
            whileHover={{ y: -4 }}
            className={`glass-panel border-2 border-amber-500/30 rounded-3xl p-8 shadow-[0_0_30px_rgba(192,132,252,0.1)] relative overflow-hidden group ${!['Super Admin'].includes(user?.role) ? 'opacity-60 grayscale' : ''}`}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -z-10 group-hover:bg-amber-500/20 transition-all duration-700"></div>
            
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 gap-4">
               <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-amber-500/20 rounded-2xl border border-amber-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(192,132,252,0.2)]">
                     <BrainCircuit size={28} className="text-amber-400" />
                  </div>
                  <div>
                     <h3 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">AI Business Summary</h3>
                     <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">Generative executive summary for Q4</p>
                  </div>
               </div>
               <span className="text-[10px] font-extrabold text-emerald-400 border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 rounded-md uppercase tracking-[0.2em] shrink-0 h-fit">HIGH PRIORITY</span>
            </div>

            <div className="bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-2xl p-6 mb-8 relative">
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-amber-500 rounded-l-2xl"></div>
               <div className="flex items-center gap-2 mb-4">
                  <BrainCircuit size={16} className="text-emerald-400" />
                  <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-[0.2em]">AI PREDICTION INSIGHT</span>
               </div>
               <p className="text-base text-[var(--text-primary)]/90 italic leading-relaxed font-medium">
                 "Revenue is projected to increase by <span className="font-extrabold text-emerald-400">14.2%</span> based on current tournament registration trends. Recommend opening 2 additional court slots for weekend peak hours to maximize throughput."
               </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
               <div className="flex items-center gap-3">
                 <div className="flex -space-x-3">
                   <img src="https://ui-avatars.com/api/?name=Admin&background=0B1120&color=fff&rounded=true&bold=true" className="w-10 h-10 rounded-full border-2 border-[var(--bg-base)] relative z-30" alt="Admin" />
                   <img src="https://ui-avatars.com/api/?name=Staff&background=1E293B&color=fff&rounded=true&bold=true" className="w-10 h-10 rounded-full border-2 border-[var(--bg-base)] relative z-20" alt="Staff" />
                   <div className="w-10 h-10 rounded-full border-2 border-[var(--bg-base)] bg-[var(--border-subtle)] flex items-center justify-center text-xs font-extrabold text-[var(--text-primary)] relative z-10">+5</div>
                 </div>
                 <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Authorized Viewers</span>
               </div>
               
               <motion.button 
                 whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                 onClick={() => handleDownload('/reports/business-summary/pdf', 'ai_business_summary.pdf')}
                 disabled={!['Super Admin'].includes(user?.role)}
                 className="flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-400 to-blue-500 text-black px-8 py-3.5 rounded-xl font-extrabold shadow-[var(--button-glow)] hover:shadow-[0_0_30px_rgba(0,242,254,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
               >
                 <Download size={18} />
                 {['Super Admin'].includes(user?.role) ? 'Generate Report' : 'Access Denied'}
               </motion.button>
            </div>
          </motion.div>

          {/* Bookings Report Card */}
          <motion.div whileHover={{ y: -4 }} className="glass-panel border border-[var(--border-subtle)] rounded-3xl p-8 shadow-xl flex flex-col group w-full">
            <div className="w-12 h-12 bg-[var(--overlay-bg)] p-3 rounded-2xl border border-[var(--border-subtle)] mb-6 flex items-center justify-center group-hover:bg-[var(--overlay-hover)] transition-colors">
               <Calendar size={24} className="text-[var(--text-primary)]" />
            </div>
            <h3 className="text-xl font-extrabold text-[var(--text-primary)] mb-3">Bookings Report</h3>
            <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed mb-8 flex-1">
               Utilization metrics across all courts and facilities. Identifies peak usage times and high-churn cancellation patterns.
            </p>
            <div className="flex justify-between items-center mb-6 pt-6 border-t border-[var(--border-subtle)]">
               <span className="text-[9px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em]">DATA SCOPE</span>
               <span className="text-xs font-extrabold text-[var(--text-primary)]">31 Facilities</span>
            </div>
            <button 
              onClick={() => handleDownload('/reports/bookings/pdf', 'bookings_report.pdf')}
              className="w-full flex items-center justify-between bg-[var(--overlay-bg)] hover:bg-[var(--overlay-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] px-5 py-4 rounded-xl font-extrabold transition-colors group/btn"
            >
              <div className="flex items-center gap-3">
                <Download size={18} className="text-amber-400" />
                Download PDF
              </div>
              <ChevronRight size={18} className="text-[var(--text-secondary)] group-hover/btn:text-[var(--text-primary)] transition-colors group-hover/btn:translate-x-1" />
            </button>
          </motion.div>
        </div>

        {/* Revenue Report Card (Sidebar) */}
        <div className="flex flex-col gap-8">
          <motion.div whileHover={{ y: -4 }} className="glass-panel border border-[var(--border-subtle)] rounded-3xl p-8 shadow-xl flex flex-col h-full group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none"></div>
              
              <div className="w-12 h-12 bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 mb-6 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors relative z-10">
                 <TrendingUp size={24} className="text-amber-400" />
              </div>
              <h3 className="text-xl font-extrabold text-[var(--text-primary)] mb-3 relative z-10">Revenue Report</h3>
              <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed mb-8 relative z-10">
                 Detailed financial breakdown of membership fees, court rentals, retail sales, and tournament entry fees. Includes year-over-year comparison charts and predictive modeling.
              </p>
              
              <div className="mt-auto relative z-10">
                <div className="flex justify-between items-center mb-6 pt-6 border-t border-[var(--border-subtle)]">
                   <span className="text-[9px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em]">LAST GENERATED</span>
                   <span className="text-xs font-extrabold text-amber-400">2 hours ago</span>
                </div>
                <button 
                  onClick={() => handleDownload('/reports/revenue/pdf', 'revenue_report.pdf')}
                  className="w-full flex items-center justify-between bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 px-5 py-4 rounded-xl font-extrabold transition-colors group/btn"
                >
                  <div className="flex items-center gap-3">
                    <Download size={18} />
                    Download PDF
                  </div>
                  <ChevronRight size={18} className="text-amber-400/50 group-hover/btn:text-amber-400 transition-colors group-hover/btn:translate-x-1" />
                </button>
              </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
