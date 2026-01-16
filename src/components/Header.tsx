import { Tent, LogOut, Bell, Settings, HelpCircle } from 'lucide-react';
import { memo } from 'react';
import { ColorSchemeToggle } from './ColorSchemeToggle';

interface HeaderProps {
  user: { username: string; role: string } | null;
  onLogout: () => void;
  onOpenHelp: () => void;
}

export const Header = memo(function Header({ user, onLogout, onOpenHelp }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
              <Tent className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <h1 className="text-gray-900">Het Digitale Erf</h1>
              <p className="text-xs text-gray-500">Camping Dashboard</p>
            </div>
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center gap-4">
            <ColorSchemeToggle />
            <button
              onClick={onOpenHelp}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Handleiding"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>

            <div className="h-8 w-px bg-gray-200" />

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Uitloggen</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});