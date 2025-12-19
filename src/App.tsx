import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { Toaster } from './components/ui/sonner';
import { api, User } from './lib/api';
import { toast } from 'sonner';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = async (username: string, password: string) => {
    try {
      const user = await api.login(username, password);
      setUser(user);
      setIsAuthenticated(true);
      toast.success('Succesvol ingelogd');
    } catch (error) {
      console.error(error);
      toast.error('Inloggen mislukt. Controleer je gegevens.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    toast.info('Je bent uitgelogd');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthenticated ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
      <Toaster />
    </div>
  );
}