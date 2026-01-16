import { useState } from 'react';
import { Users, CreditCard, LayoutDashboard, FileBarChart } from 'lucide-react';
import { AdminHR } from './admin/AdminHR';
import { AdminFinance } from './admin/AdminFinance';
import { AdminReports } from './admin/AdminReports';

export function AdministrationView() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'hr' | 'finance' | 'reports'>('hr');

  return (
    <div className="space-y-6">
      {/* Admin Nav */}
      <div className="flex space-x-4 bg-white dark:bg-card p-2 rounded-xl shadow-sm border border-gray-100 dark:border-border w-fit">
        <button
          onClick={() => setCurrentTab('hr')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentTab === 'hr' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'text-gray-600 dark:text-muted-foreground hover:bg-gray-50 dark:hover:bg-muted'
            }`}
        >
          <Users className="w-4 h-4" />
          <span>HR & Personeel</span>
        </button>
        <button
          onClick={() => setCurrentTab('finance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentTab === 'finance' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'text-gray-600 dark:text-muted-foreground hover:bg-gray-50 dark:hover:bg-muted'
            }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Financieel</span>
        </button>
        <button
          onClick={() => setCurrentTab('reports')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentTab === 'reports' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'text-gray-600 dark:text-muted-foreground hover:bg-gray-50 dark:hover:bg-muted'
            }`}
        >
          <FileBarChart className="w-4 h-4" />
          <span>Rapportages</span>
        </button>
      </div>

      <div className="transition-all duration-300">
        {currentTab === 'hr' && <AdminHR />}
        {currentTab === 'finance' && <AdminFinance />}
        {currentTab === 'reports' && <AdminReports />}
      </div>
    </div>
  );
}
