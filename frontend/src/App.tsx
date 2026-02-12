import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import MembersPage from './pages/MembersPage';
import MemberDetailsPage from './pages/MemberDetailsPage';
import EventsPage from './pages/EventsPage';
import FinancePage from './pages/FinancePage';
import EducationPage from './pages/EducationPage';
import ResourcesPage from './pages/ResourcesPage';
import './styles/main.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Bienvenue</h1>
      <p className="text-text-muted">Accès rapide aux modules de la plateforme.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div 
          onClick={() => navigate('/members')}
          className="card hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold">👥</span>
            </div>
            <h3 className="font-semibold">Membres</h3>
          </div>
          <p className="text-sm text-text-muted">Gérer les membres de la communauté</p>
        </div>

        <div 
          onClick={() => navigate('/events')}
          className="card hover:shadow-md transition-shadow cursor-pointer hover:border-secondary/50"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <span className="text-secondary font-bold">📅</span>
            </div>
            <h3 className="font-semibold">Événements</h3>
          </div>
          <p className="text-sm text-text-muted">Organiser des activités communautaires</p>
        </div>

        <div 
          onClick={() => navigate('/education')}
          className="card hover:shadow-md transition-shadow cursor-pointer hover:border-accent/50"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <span className="text-accent font-bold">📚</span>
            </div>
            <h3 className="font-semibold">Cours</h3>
          </div>
          <p className="text-sm text-text-muted">Programmes éducatifs et inscrits</p>
        </div>

        <div 
          onClick={() => navigate('/finance')}
          className="card hover:shadow-md transition-shadow cursor-pointer hover:border-danger/50"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center">
              <span className="text-danger font-bold">💰</span>
            </div>
            <h3 className="font-semibold">Finances</h3>
          </div>
          <p className="text-sm text-text-muted">Dons et campagnes (Reçus fiscaux)</p>
        </div>

        <div 
          onClick={() => navigate('/announcements')}
          className="card hover:shadow-md transition-shadow cursor-pointer hover:border-primary-light/50"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary-light/10 flex items-center justify-center">
              <span className="text-primary-light font-bold">📢</span>
            </div>
            <h3 className="font-semibold">Annonces</h3>
          </div>
          <p className="text-sm text-text-muted">Communications et calendrier</p>
        </div>

        <div 
          onClick={() => navigate('/resources')}
          className="card hover:shadow-md transition-shadow cursor-pointer hover:border-purple-500/50"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <span className="text-purple-500 font-bold">📦</span>
            </div>
            <h3 className="font-semibold">Ressources</h3>
          </div>
          <p className="text-sm text-text-muted">Réservation de salles et équipements</p>
        </div>
      </div>
    </div>
  );
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);
  return token ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/announcements" element={<PrivateRoute><AnnouncementsPage /></PrivateRoute>} />
        <Route path="/members" element={<PrivateRoute><MembersPage /></PrivateRoute>} />
        <Route path="/members/:id" element={<PrivateRoute><MemberDetailsPage /></PrivateRoute>} />
        <Route path="/events" element={<PrivateRoute><EventsPage /></PrivateRoute>} />
        <Route path="/finance" element={<PrivateRoute><FinancePage /></PrivateRoute>} />
        <Route path="/education" element={<PrivateRoute><EducationPage /></PrivateRoute>} />
        <Route path="/resources" element={<PrivateRoute><ResourcesPage /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
