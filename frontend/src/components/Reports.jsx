import { FileText, Download, TrendingUp, Calendar, Users, Trophy, BrainCircuit } from 'lucide-react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

export const Reports = () => {
  const { user } = useAuth();

  const handleDownload = async (endpoint, filename) => {
    try {
      const response = await api.get(endpoint, {
        responseType: 'blob', // Important for downloading files
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      
      // Append to html link element page
      document.body.appendChild(link);
      
      // Start download
      link.click();
      
      // Clean up and remove the link
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. You might not have permission.');
    }
  };

  const reportsList = [
    {
      title: 'Revenue Report',
      description: 'Comprehensive financial breakdown, transactions, and revenue trends.',
      icon: TrendingUp,
      endpoint: '/reports/revenue/pdf',
      filename: 'revenue_report.pdf',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      allowed: ['Super Admin', 'Staff', 'Viewer']
    },
    {
      title: 'Bookings Report',
      description: 'Recent booking history, active slots, and time utilization.',
      icon: Calendar,
      endpoint: '/reports/bookings/pdf',
      filename: 'bookings_report.pdf',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      allowed: ['Super Admin', 'Staff', 'Viewer']
    },
    {
      title: 'AI Business Summary',
      description: 'AI-generated executive summary with actionable growth insights.',
      icon: BrainCircuit,
      endpoint: '/reports/business-summary/pdf',
      filename: 'ai_business_summary.pdf',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      allowed: ['Super Admin'] // Only Super Admin
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Reports Center</h1>
          <p className="text-[var(--text-secondary)]">Download professional PDF reports for your business metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportsList.map((report, index) => {
          const Icon = report.icon;
          const hasAccess = report.allowed.includes(user?.role);

          return (
            <div key={index} className={`glass-card flex flex-col relative overflow-hidden group ${!hasAccess ? 'opacity-60 grayscale' : ''}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-2xl ${report.bg}`}>
                  <Icon size={24} className={report.color} />
                </div>
                <h3 className="text-xl font-bold">{report.title}</h3>
              </div>
              <p className="text-[var(--text-secondary)] text-sm mb-6 flex-1">
                {report.description}
              </p>
              
              <button 
                onClick={() => handleDownload(report.endpoint, report.filename)}
                disabled={!hasAccess}
                className="w-full flex items-center justify-center gap-2 bg-black/5 dark:bg-white/10 hover:bg-blue-500 hover:text-white transition-colors py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black/5 disabled:hover:text-[var(--text-primary)]"
              >
                <Download size={18} />
                {hasAccess ? 'Download PDF' : 'Access Denied'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
