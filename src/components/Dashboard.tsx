import { useState, useCallback } from 'react';
import { Header } from './Header';
import { StatsCards } from './StatsCards';
import { ReservationsTable } from './ReservationsTable';
import { OccupancyChart } from './OccupancyChart';
import { ActivityOverview } from './ActivityOverview';
import { QuickActions } from './QuickActions';
import { AgendaView } from './AgendaView';
import { TasksView } from './TasksView';
import { SickLeaveView } from './SickLeaveView';
import { AdministrationView } from './AdministrationView';
import { FileSharingView } from './FileSharingView';
import { HelpModal } from './HelpModal';
import { Shield } from 'lucide-react';

interface DashboardProps {
  user: { username: string; role: string; token?: string } | null;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'agenda' | 'tasks' | 'reservations' | 'activities' | 'sickleave' | 'administration' | 'filesharing'>('overview');
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleOpenHelp = useCallback(() => setShowHelpModal(true), []);
  const handleCloseHelp = useCallback(() => setShowHelpModal(false), []);

  // Check of de gebruiker Boer Bert (admin) is
  const isBoerBert = user?.username.toLowerCase() === 'boer bert' || user?.role === 'Beheerder' || user?.role === 'admin' || user?.username === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} onOpenHelp={handleOpenHelp} />
      <HelpModal isOpen={showHelpModal} onClose={handleCloseHelp} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Role Badge */}
        <div className="mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm w-fit">
            <Shield className="w-4 h-4 text-green-700" />
            <span className="text-sm text-gray-600">Rol:</span>
            <span className="text-sm text-gray-900">{user?.role}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-2 whitespace-nowrap transition-colors ${activeTab === 'overview'
              ? 'border-b-2 border-green-700 text-green-700'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Overzicht
          </button>
          <button
            onClick={() => setActiveTab('agenda')}
            className={`pb-4 px-2 whitespace-nowrap transition-colors ${activeTab === 'agenda'
              ? 'border-b-2 border-green-700 text-green-700'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Agenda
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-4 px-2 whitespace-nowrap transition-colors ${activeTab === 'tasks'
              ? 'border-b-2 border-green-700 text-green-700'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Taken
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`pb-4 px-2 whitespace-nowrap transition-colors ${activeTab === 'reservations'
              ? 'border-b-2 border-green-700 text-green-700'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Reserveringen
          </button>
          {/* Evenementen Tab - Alleen voor Boer Bert */}
          {isBoerBert && (
            <button
              onClick={() => setActiveTab('activities')}
              className={`pb-4 px-2 whitespace-nowrap transition-colors ${activeTab === 'activities'
                ? 'border-b-2 border-green-700 text-green-700'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Evenementen
            </button>
          )}
          <button
            onClick={() => !isBoerBert ? null : setActiveTab('sickleave')}
            disabled={!isBoerBert}
            className={`pb-4 px-2 whitespace-nowrap transition-colors ${activeTab === 'sickleave'
              ? 'border-b-2 border-green-700 text-green-700'
              : !isBoerBert
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900'
              }`}
            title={!isBoerBert ? 'Alleen toegankelijk voor beheerders' : ''}
          >
            Ziekte/Verzuim
          </button>
          <button
            onClick={() => setActiveTab('administration')}
            className={`pb-4 px-2 whitespace-nowrap transition-colors ${activeTab === 'administration'
              ? 'border-b-2 border-green-700 text-green-700'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Administratie
          </button>
          <button
            onClick={() => setActiveTab('filesharing')}
            className={`pb-4 px-2 whitespace-nowrap transition-colors ${activeTab === 'filesharing'
              ? 'border-b-2 border-green-700 text-green-700'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            File Sharing
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <StatsCards />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <OccupancyChart />
              </div>
              <div>
                <QuickActions />
              </div>
            </div>
            <ReservationsTable limit={5} />
          </div>
        )}

        {/* Agenda Tab */}
        {activeTab === 'agenda' && (
          <div>
            <AgendaView />
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div>
            <TasksView />
          </div>
        )}

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <div>
            <ReservationsTable />
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && isBoerBert && (
          <div>
            <ActivityOverview />
          </div>
        )}

        {/* Sick Leave Tab */}
        {activeTab === 'sickleave' && isBoerBert && (
          <div>
            <SickLeaveView />
          </div>
        )}

        {/* Administration Tab */}
        {activeTab === 'administration' && (
          <div>
            <AdministrationView />
          </div>
        )}

        {/* File Sharing Tab */}
        {activeTab === 'filesharing' && (
          <div>
            <FileSharingView />
          </div>
        )}
      </main>
    </div>
  );
}