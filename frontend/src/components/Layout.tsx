import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import {
  Home, Users, Calendar, Megaphone,
  CreditCard, BookOpen, Package, LogOut
} from 'lucide-react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Accueil', path: '/', icon: <Home size={20} /> },
    { label: 'Annonces', path: '/announcements', icon: <Megaphone size={20} /> },
    { label: 'Membres', path: '/members', icon: <Users size={20} /> },
    { label: 'Événements', path: '/events', icon: <Calendar size={20} /> },
    { label: 'Finances', path: '/finance', icon: <CreditCard size={20} /> },
    { label: 'Cours', path: '/education', icon: <BookOpen size={20} /> },
    { label: 'Ressources', path: '/resources', icon: <Package size={20} /> },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white p-6 flex flex-col">
        <div className="text-2xl font-bold mb-8">ACML Platform</div>

        <nav className="flex-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                location.pathname === item.path
                  ? 'bg-white/10 text-white'
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="mb-4 text-sm text-white/70">
            Connecté en tant que:
            <br />
            <strong className="text-white">{user?.username || 'Utilisateur'}</strong>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <LogOut size={20} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 bg-background flex flex-col">
        <header className="bg-white px-8 py-4 border-b border-border flex justify-end items-center">
          <span className="text-text-muted">Joliette, QC</span>
        </header>
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
