import { FileText, Download, TrendingUp, Calendar, Users, Trophy, BrainCircuit, RefreshCcw, LogOut } from 'lucide-react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-0 px-2 md:px-0">
      <div className="mb-8">
        <h1 className="text-xs font-bold text-white uppercase tracking-wider">REPORTS CENTER</h1>
      </div>

      <div className="flex items-center gap-2 mb-6 text-cyan-400 font-bold text-[10px] uppercase tracking-widest">
         <BrainCircuit size={14} /> INTELLIGENCE-DRIVEN INSIGHTS
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* AI Business Summary Card */}
          <div className={`bg-[#0B1120] border border-[#1E293B] rounded-2xl p-6 shadow-xl relative overflow-hidden group ${!['Super Admin'].includes(user?.role) ? 'opacity-60 grayscale' : ''}`}>
            <div className="flex justify-between items-start mb-6">
               <div className="flex items-center gap-4">
                  <div className="bg-purple-500/20 p-3 rounded-xl border border-purple-500/30">
                     <BrainCircuit size={24} className="text-purple-400" />
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-white mb-1">AI Business Summary</h3>
                     <p className="text-xs text-[var(--text-secondary)]">Generative executive summary for Q4</p>
                  </div>
               </div>
               <span className="text-[9px] font-bold text-cyan-400 border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 rounded-full uppercase tracking-wider">HIGH PRIORITY</span>
            </div>

            <div className="bg-[#151C2C] border border-[#1E293B] rounded-xl p-5 mb-6">
               <div className="flex items-center gap-2 mb-3">
                  <BrainCircuit size={14} className="text-cyan-400" />
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">AI PREDICTION INSIGHT</span>
               </div>
               <p className="text-sm text-white italic leading-relaxed">
                 "Revenue is projected to increase by <span className="font-bold text-cyan-400">14.2%</span> based on current tournament registration trends. Recommend opening 2 additional court slots for weekend peak hours to maximize throughput."
               </p>
            </div>

            <div className="flex justify-between items-center">
               <div className="flex items-center -space-x-2">
                 <img src="https://ui-avatars.com/api/?name=Admin&background=1E293B&color=fff&rounded=true" className="w-8 h-8 rounded-full border-2 border-[#0B1120]" alt="Admin" />
                 <img src="https://ui-avatars.com/api/?name=Staff&background=1E293B&color=fff&rounded=true" className="w-8 h-8 rounded-full border-2 border-[#0B1120]" alt="Staff" />
                 <div className="w-8 h-8 rounded-full border-2 border-[#0B1120] bg-[#1E293B] flex items-center justify-center text-[10px] font-bold text-white">+5</div>
               </div>
               <button 
                 onClick={() => handleDownload('/reports/business-summary/pdf', 'ai_business_summary.pdf')}
                 disabled={!['Super Admin'].includes(user?.role)}
                 className="flex items-center justify-center gap-2 bg-cyan-400 text-black px-6 py-2.5 rounded-xl font-bold shadow-[0_0_15px_rgba(0,242,254,0.3)] hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <Download size={16} />
                 {['Super Admin'].includes(user?.role) ? 'Download PDF' : 'Access Denied'}
               </button>
            </div>
          </div>

          {/* Bookings Report Card */}
          <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl p-6 shadow-xl lg:w-2/3">
            <div className="bg-[#1E293B] p-2 rounded-lg inline-block mb-4">
               <Calendar size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Bookings Report</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-8">
               Utilization metrics across all courts and facilities. Identifies peak usage times and high-churn cancellation patterns.
            </p>
            <div className="flex justify-between items-center mb-4">
               <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">DATA SCOPE</span>
               <span className="text-xs font-bold text-white">31 Facilities</span>
            </div>
            <button 
              onClick={() => handleDownload('/reports/bookings/pdf', 'bookings_report.pdf')}
              className="w-full flex items-center justify-center gap-2 bg-[#1E293B] hover:bg-[#2D3748] border border-[#334155] text-white px-4 py-3 rounded-xl font-bold transition-colors"
            >
              <Download size={16} className="text-purple-400" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Revenue Report Card */}
        <div className="bg-[#151C2C] border border-[#1E293B] rounded-2xl p-6 shadow-xl flex flex-col h-fit">
            <div className="bg-[#1E293B] p-2 rounded-lg inline-block mb-4 w-fit">
               <TrendingUp size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Revenue Report</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-8">
               Detailed breakdown of membership fees, court rentals, and retail sales. Includes year-over-year comparison charts.
            </p>
            <div className="flex justify-between items-center mb-4 mt-auto">
               <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">LAST GENERATED</span>
               <span className="text-xs font-bold text-white">2 hours ago</span>
            </div>
            <button 
              onClick={() => handleDownload('/reports/revenue/pdf', 'revenue_report.pdf')}
              className="w-full flex items-center justify-center gap-2 bg-[#1E293B] hover:bg-[#2D3748] border border-[#334155] text-white px-4 py-3 rounded-xl font-bold transition-colors"
            >
              <Download size={16} className="text-purple-400" />
              Download PDF
            </button>
        </div>
      </div>
  );
};

