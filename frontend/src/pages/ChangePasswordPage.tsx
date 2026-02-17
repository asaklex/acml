import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../stores/auth';
import logo from '../assets/logo.png';

const ChangePasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Le mot de passe doit comporter au moins 8 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/members/members/change_password/', { password });
      
      // Update local user state
      if (user) {
        const updatedUser = { ...user, must_change_password: false };
        const token = localStorage.getItem('token') || '';
        setAuth(token, updatedUser);
      }
      
      alert('Mot de passe mis à jour avec succès !');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la mise à jour.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card text-center">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="ACML Logo" className="h-24 w-auto object-contain" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Changer votre mot de passe</h2>
          <p className="text-text-muted mb-6 text-sm">
            C'est votre première connexion ou votre mot de passe est temporaire. 
            Veuillez définir un nouveau mot de passe sécurisé.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="text-left">
            <div className="mb-4">
              <label className="block mb-2 font-medium text-sm">Nouveau mot de passe</label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light/20 focus:border-primary-light"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-medium text-sm">Confirmer le mot de passe</label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light/20 focus:border-primary-light"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full btn btn-primary py-3"
              disabled={loading}
            >
              {loading ? 'Mise à jour...' : 'Enregistrer le nouveau mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
