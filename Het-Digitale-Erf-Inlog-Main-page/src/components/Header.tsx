
import { Tent, LogOut } from 'lucide-react';
import { memo } from 'react';
import { ColorSchemeToggle } from './ColorSchemeToggle';
import { DarkModeToggle } from './DarkModeToggle';

interface HeaderProps {
  user: { username: string; role: string } | null;
  onLogout: () => void;
}

export const Header = memo(function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-card border-b border-gray-200 dark:border-border sticky top-0 z-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Tent className="w-6 h-6 text-green-700 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-gray-900 dark:text-foreground font-semibold">Het Digital Erf</h1>
              <p className="text-xs text-gray-500 dark:text-muted-foreground">Camping Dashboard</p>
            </div>
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center gap-4">
            <DarkModeToggle />
            <ColorSchemeToggle />

            <div className="h-8 w-px bg-gray-200 dark:bg-border" />

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