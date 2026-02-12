import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../stores/auth';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/token-auth/', { username, password });
      const { token, user } = response.data;
      setAuth(token, user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.non_field_errors?.[0] || 'Identifiants invalides.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card">
          <h2 className="text-2xl font-bold text-center mb-6">Connexion ACML</h2>

          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg">
              <p className="text-sm text-danger text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-2 font-medium text-sm">Nom d'utilisateur</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light/20 focus:border-primary-light"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-medium text-sm">Mot de passe</label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light/20 focus:border-primary-light"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full btn btn-primary py-3 text-base"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-text-muted">
            <p>Bienvenue sur la plateforme ACML</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
