import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import logo from '../assets/logo.png';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    sex: 'M',
    postal_code: '',
    password: '',
    confirm_password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Normalize phone
    const normalizedPhone = formData.phone ? formData.phone.replace(/\D/g, '') : '';
    
    if (!formData.email && !normalizedPhone) {
        setError('Un courriel ou un numéro de téléphone est requis.');
        return;
    }

    if (normalizedPhone && normalizedPhone.length !== 10) {
        setError('Le numéro de téléphone doit comporter exactement 10 chiffres (ex: 5146194333).');
        return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit comporter au moins 8 caractères.');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      const payload = { ...formData, phone: normalizedPhone };
      delete (payload as any).confirm_password;
      
      await api.post('/members/members/register/', payload);
      navigate('/pending-approval', { state: { registered: true } });
    } catch (err: any) {
      console.error('Registration error:', err);
      const data = err.response?.data;
      if (data?.email) setError(`Courriel: ${data.email[0]}`);
      else if (data?.phone) setError(`Téléphone: ${data.phone[0]}`);
      else setError(data?.detail || 'Une erreur est survenue lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="card">
          <div className="flex justify-center mb-6">
            <Link to="/login">
              <img src={logo} alt="ACML Logo" className="h-20 w-auto object-contain" />
            </Link>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Devenir membre</h1>
            <p className="text-text-muted mt-2">Rejoignez la communauté de l'ACML</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-lg">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label>Prénom *</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label>Courriel</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="514 619 4333"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label>Code Postal *</label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value.toUpperCase() })}
                  required
                  placeholder="J6E 2A1"
                />
              </div>
              <div className="form-group">
                <label>Sexe</label>
                <select
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                >
                  <option value="M">Homme</option>
                  <option value="F">Femme</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label>Mot de passe *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirmer le mot de passe *</label>
                <input
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full btn btn-primary py-3 mt-4"
              disabled={loading}
            >
              {loading ? 'Création du compte...' : "S'inscrire"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-text-muted text-sm">
              Déjà membre ? <Link to="/login" className="text-primary font-medium hover:underline">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
