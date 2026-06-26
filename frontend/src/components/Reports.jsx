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
        <div className="flex items-center gap-2 mb-2 text-[var(--accent-emerald)] font-bold text-[10px] uppercase tracking-[0.2em] bg-[var(--overlay-bg)] w-fit px-3 py-1.5 rounded-sm border border-[var(--border-subtle)] ">
           <BrainCircuit size={14} className="animate-pulse" /> INTELLIGENCE-DRIVEN INSIGHTS
        </div>
        <h1 className="text-3xl font-light text-[var(--text-primary)] mb-2 tracking-tight">Executive <span className="font-bold text-[var(--accent-emerald)]">Reports</span></h1>
        <p className="text-sm font-medium text-[var(--text-secondary)]">Automated analytics and generative business intelligence.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
        <div className="xl:col-span-2 flex flex-col gap-8">
          {/* AI Business Summary Card */}
          <motion.div 
            whileHover={{ y: -4 }}
            className={`glass-panel border-2 border-[var(--border-subtle)] rounded-sm p-8  relative overflow-hidden group ${!['Super Admin'].includes(user?.role) ? 'opacity-60 grayscale' : ''}`}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--overlay-bg)] rounded-sm blur-[80px] -z-10 group-hover:bg-[var(--overlay-bg)] transition-all duration-700"></div>
            
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 gap-4">
               <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-[var(--overlay-bg)] rounded-sm border border-[var(--border-subtle)] flex items-center justify-center ">
                     <BrainCircuit size={28} className="text-[var(--accent-primary)]" />
                  </div>
                  <div>
                     <h3 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">AI Business Summary</h3>
                     <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">Generative executive summary for Q4</p>
                  </div>
               </div>
               <span className="text-[10px] font-bold text-[var(--accent-emerald)] border border-[var(--border-subtle)] bg-[var(--overlay-bg)] px-3 py-1.5 rounded-sm uppercase tracking-[0.2em] shrink-0 h-fit">HIGH PRIORITY</span>
            </div>

            <div className="bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-sm p-6 mb-8 relative">
               <div className="absolute left-0 top-0 bottom-0 w-1    rounded-l-2xl"></div>
               <div className="flex items-center gap-2 mb-4">
                  <BrainCircuit size={16} className="text-[var(--accent-emerald)]" />
                  <span className="text-[10px] font-bold text-[var(--accent-emerald)] uppercase tracking-[0.2em]">AI PREDICTION INSIGHT</span>
               </div>
               <p className="text-base text-[var(--text-primary)]/90 italic leading-relaxed font-medium">
                 "Revenue is projected to increase by <span className="font-bold text-[var(--accent-emerald)]">14.2%</span> based on current tournament registration trends. Recommend opening 2 additional court slots for weekend peak hours to maximize throughput."
               </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
               <div className="flex items-center gap-3">
                 <div className="flex -space-x-3">
                   <img src="https://ui-avatars.com/api/?name=Admin&background=0B1120&color=fff&rounded=true&bold=true" className="w-10 h-10 rounded-sm border-2 border-[var(--bg-base)] relative z-30" alt="Admin" />
                   <img src="https://ui-avatars.com/api/?name=Staff&background=1E293B&color=fff&rounded=true&bold=true" className="w-10 h-10 rounded-sm border-2 border-[var(--bg-base)] relative z-20" alt="Staff" />
                   <div className="w-10 h-10 rounded-sm border-2 border-[var(--bg-base)] bg-[var(--border-subtle)] flex items-center justify-center text-xs font-bold text-[var(--text-primary)] relative z-10">+5</div>
                 </div>
                 <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Authorized Viewers</span>
               </div>
               
               <motion.button 
                 whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                 onClick={() => handleDownload('/reports/business-summary/pdf', 'ai_business_summary.pdf')}
                 disabled={!['Super Admin'].includes(user?.role)}
                 className="flex items-center justify-center gap-3    text-black px-8 py-3.5 rounded-sm font-bold  hover: transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
               >
                 <Download size={18} />
                 {['Super Admin'].includes(user?.role) ? 'Generate Report' : 'Access Denied'}
               </motion.button>
            </div>
          </motion.div>

          {/* Bookings Report Card */}
          <motion.div whileHover={{ y: -4 }} className="glass-panel border border-[var(--border-subtle)] rounded-sm p-8  flex flex-col group w-full">
            <div className="w-12 h-12 bg-[var(--overlay-bg)] p-3 rounded-sm border border-[var(--border-subtle)] mb-6 flex items-center justify-center group-hover:bg-[var(--overlay-hover)] transition-colors">
               <Calendar size={24} className="text-[var(--text-primary)]" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">Bookings Report</h3>
            <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed mb-8 flex-1">
               Utilization metrics across all courts and facilities. Identifies peak usage times and high-churn cancellation patterns.
            </p>
            <div className="flex justify-between items-center mb-6 pt-6 border-t border-[var(--border-subtle)]">
               <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">DATA SCOPE</span>
               <span className="text-xs font-bold text-[var(--text-primary)]">31 Facilities</span>
            </div>
            <button 
              onClick={() => handleDownload('/reports/bookings/pdf', 'bookings_report.pdf')}
              className="w-full flex items-center justify-between bg-[var(--overlay-bg)] hover:bg-[var(--overlay-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] px-5 py-4 rounded-sm font-bold transition-colors group/btn"
            >
              <div className="flex items-center gap-3">
                <Download size={18} className="text-[var(--accent-primary)]" />
                Download PDF
              </div>
              <ChevronRight size={18} className="text-[var(--text-secondary)] group-hover/btn:text-[var(--text-primary)] transition-colors group-hover/btn:translate-x-1" />
            </button>
          </motion.div>
        </div>

        {/* Revenue Report Card (Sidebar) */}
        <div className="flex flex-col gap-8">
          <motion.div whileHover={{ y: -4 }} className="glass-panel border border-[var(--border-subtle)] rounded-sm p-8  flex flex-col h-full group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-1/2    pointer-events-none"></div>
              
              <div className="w-12 h-12 bg-[var(--overlay-bg)] p-3 rounded-sm border border-[var(--border-subtle)] mb-6 flex items-center justify-center group-hover:bg-[var(--overlay-bg)] transition-colors relative z-10">
                 <TrendingUp size={24} className="text-[var(--accent-primary)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 relative z-10">Revenue Report</h3>
              <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed mb-8 relative z-10">
                 Detailed financial breakdown of membership fees, court rentals, retail sales, and tournament entry fees. Includes year-over-year comparison charts and predictive modeling.
              </p>
              
              <div className="mt-auto relative z-10">
                <div className="flex justify-between items-center mb-6 pt-6 border-t border-[var(--border-subtle)]">
                   <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">LAST GENERATED</span>
                   <span className="text-xs font-bold text-[var(--accent-primary)]">2 hours ago</span>
                </div>
                <button 
                  onClick={() => handleDownload('/reports/revenue/pdf', 'revenue_report.pdf')}
                  className="w-full flex items-center justify-between bg-[var(--overlay-bg)] hover:bg-[var(--overlay-bg)] border border-[var(--border-subtle)] text-[var(--accent-primary)] px-5 py-4 rounded-sm font-bold transition-colors group/btn"
                >
                  <div className="flex items-center gap-3">
                    <Download size={18} />
                    Download PDF
                  </div>
                  <ChevronRight size={18} className="text-[var(--accent-primary)]/50 group-hover/btn:text-[var(--accent-primary)] transition-colors group-hover/btn:translate-x-1" />
                </button>
              </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
