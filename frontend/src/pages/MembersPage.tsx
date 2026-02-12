import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Modal from '../components/Modal';
import { useAuthStore } from '../stores/auth';
import { Shield } from 'lucide-react';

interface Member {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  status: string;
  membership_type?: string;
  gender?: string;
  date_joined: string;
  is_staff: boolean;
}

interface MemberFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  gender: string;
  status: string;
  membership_type?: string;
  password: string;
  is_staff: boolean;
  date_joined: string;
}

const MembersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.is_staff;

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<MemberFormData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    gender: 'M',
    status: 'PENDING',
    membership_type: 'MONTHLY',
    password: '',
    is_staff: false,
    date_joined: ''
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await api.get('/members/members/');
      setMembers(res.data);
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMember(null);
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      gender: 'M',
      status: 'PENDING',
      membership_type: 'MONTHLY',
      password: '',
      is_staff: false,
      date_joined: new Date().toISOString()
    });
    setShowModal(true);
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      username: member.username,
      email: member.email,
      first_name: member.first_name,
      last_name: member.last_name,
      phone: member.phone || '',
      gender: member.gender || 'M',
      status: member.status,
      membership_type: member.membership_type || 'MONTHLY',
      password: '',
      is_staff: member.is_staff || false,
      date_joined: member.date_joined || new Date().toISOString()
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) return;
    try {
      await api.delete(`/members/members/${id}/`);
      setMembers(members.filter(m => m.id !== id));
    } catch (err) {
      console.error('Error deleting member:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMember) {
        const res = await api.put(`/members/members/${editingMember.id}/`, formData);
        setMembers(members.map(m => m.id === editingMember.id ? res.data : m));
      } else {
        const res = await api.post('/members/members/', formData);
        setMembers([...members, res.data]);
      }
      setShowModal(false);
    } catch (err: any) {
      console.error('Error saving member:', err);
      alert(err.response?.data?.detail || 'Erreur lors de l\'enregistrement');
    }
  };

  const filteredMembers = members.filter(m =>
    `${m.first_name} ${m.last_name} ${m.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#10b981';
      case 'INACTIVE': return '#64748b';
      case 'PENDING': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'ACTIVE': 'Actif',
      'INACTIVE': 'Inactif',
      'PENDING': 'En attente'
    };
    return labels[status] || status;
  };

  // Helper to format date for input type="datetime-local"
  const formatDateForInput = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Adjust to local time zone logic if needed, or just slice. 
    // Simplest approach for ISO string from backend (which is usually UTC) to datetime-local:
    // This is tricky with timezones. simplest is just substring if we accept UTC or local.
    // Let's try to keep it simple: new Date(isoString).toISOString().slice(0, 16) gives UTC.
    // For local input, we want local time.
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Répertoire des Membres</h1>
        <button className="btn btn-primary" onClick={handleCreate}>
          + Ajouter un membre
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>MEMBRE</th>
              <th>STATUT</th>
              <th>TYPE</th>
              <th>DATE D'ADHÉSION</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">Aucun membre trouvé.</td>
              </tr>
            ) : (
              filteredMembers.map(member => (
                <tr key={member.id} onClick={(e) => {
                    // Prevent navigation if clicking on action buttons
                    if ((e.target as HTMLElement).closest('.action-buttons')) return;
                    navigate(`/members/${member.id}`);
                }} className="cursor-pointer hover:bg-gray-50/5 transition-colors">
                  <td>
                    <div className="user-cell">
                      <div className="avatar">
                        {member.first_name?.[0]}{member.last_name?.[0]}
                      </div>
                      <div>
                        <strong>{member.first_name} {member.last_name}</strong>
                        <div className="flex items-center gap-2">
                          <small>{member.email}</small>
                          {member.is_staff && (
                            <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-purple-200">
                              <Shield size={10} /> Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ background: `${getStatusColor(member.status)}15`, color: getStatusColor(member.status) }}>
                      {getStatusLabel(member.status)}
                    </span>
                  </td>
                  <td>{member.membership_type || '-'}</td>
                  <td>
                    {member.date_joined ? new Date(member.date_joined).toLocaleDateString('fr-CA') : '-'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-sm" onClick={() => handleEdit(member)}>Modifier</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(member.id)}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingMember ? 'Modifier le membre' : 'Nouveau membre'}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Annuler
            </button>
            <button
              onClick={() => {
                const form = document.getElementById('member-form') as HTMLFormElement;
                if (form) form.requestSubmit();
              }}
              className="btn btn-primary"
            >
              {editingMember ? 'Mettre à jour' : 'Créer'}
            </button>
          </>
        }
      >
        <form id="member-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="form-row">
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

          <div className="form-row">
            <div className="form-group">
              <label>Courriel *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Nom d'utilisateur *</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                disabled={!!editingMember}
              />
            </div>
            <div className="form-group">
              <label>Genre</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="M">Homme</option>
                <option value="F">Femme</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="PENDING">En attente</option>
                <option value="ACTIVE">Actif</option>
                <option value="INACTIVE">Inactif</option>
              </select>
            </div>
            <div className="form-group">
              <label>Type d'adhésion</label>
              <select
                value={formData.membership_type}
                onChange={(e) => setFormData({ ...formData, membership_type: e.target.value })}
              >
                <option value="MONTHLY">Mensuel</option>
                <option value="ANNUAL">Annuel</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Date d'adhésion</label>
            <input
              type="datetime-local"
              value={formatDateForInput(formData.date_joined)}
              onChange={(e) => setFormData({ ...formData, date_joined: new Date(e.target.value).toISOString() })}
            />
          </div>

          {isAdmin && (
            <div className="form-group border-t border-gray-100 pt-4 mt-2">
              <label className="flex items-center gap-2 text-purple-700 font-medium">
                <Shield size={16} /> Rôle Système
              </label>
              <select
                value={formData.is_staff ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, is_staff: e.target.value === 'true' })}
                className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="false">Membre Standard</option>
                <option value="true">Administrateur</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Les administrateurs ont accès à la gestion des ressources, des finances, et des autres membres.
              </p>
            </div>
          )}

          {!editingMember && (
            <div className="form-group">
              <label>Mot de passe *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default MembersPage;
