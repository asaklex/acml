import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Modal from '../components/Modal';
import { useAuthStore } from '../stores/auth';
import { Shield } from 'lucide-react';

interface Member {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  status: string;
  sex?: string;
  postal_code: string;
  date_joined: string;
  is_staff: boolean;
}

interface MemberFormData {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  sex: string;
  status: string;
  postal_code: string;
  password?: string;
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
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    sex: 'M',
    status: 'ACTIVE',
    postal_code: '',
    password: '',
    is_staff: false,
    date_joined: new Date().toISOString()
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
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      sex: 'M',
      status: 'ACTIVE',
      postal_code: '',
      password: '',
      is_staff: false,
      date_joined: new Date().toISOString()
    });
    setShowModal(true);
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      email: member.email || '',
      first_name: member.first_name,
      last_name: member.last_name,
      phone: member.phone || '',
      sex: member.sex || 'M',
      status: member.status,
      postal_code: member.postal_code || '',
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
    
    // Normalize phone number (digits only)
    const normalizedPhone = formData.phone ? formData.phone.replace(/\D/g, '') : '';
    
    // Validation: Email OR Phone
    if (!formData.email && !normalizedPhone) {
        alert('Un courriel ou un numéro de téléphone est requis.');
        return;
    }

    // Validation: Phone must be 10 digits if provided
    if (normalizedPhone && normalizedPhone.length !== 10) {
        alert('Le numéro de téléphone doit comporter exactement 10 chiffres (ex: 5146194333).');
        return;
    }

    const finalFormData = { ...formData, phone: normalizedPhone };

    try {
      if (editingMember) {
        // Remove password if empty during edit
        const payload = { ...finalFormData };
        if (!payload.password) delete payload.password;
        
        const res = await api.put(`/members/members/${editingMember.id}/`, payload);
        setMembers(members.map(m => m.id === editingMember.id ? res.data : m));
      } else {
        const res = await api.post('/members/members/', finalFormData);
        setMembers([...members, res.data]);
      }
      setShowModal(false);
    } catch (err: any) {
      console.error('Error saving member:', err);
      // Handle backend validation errors (like unique phone)
      const errorData = err.response?.data;
      if (errorData?.phone) {
        alert(`Téléphone: ${errorData.phone[0]}`);
      } else {
        alert(errorData?.detail || 'Erreur lors de l\'enregistrement');
      }
    }
  };

  const filteredMembers = members.filter(m =>
    `${m.first_name} ${m.last_name} ${m.email} ${m.phone}`.toLowerCase().includes(searchTerm.toLowerCase())
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
          placeholder="Rechercher par nom, email ou téléphone..."
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
              <th>CODE POSTAL</th>
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
                          <small>{member.email || member.phone || 'N/A'}</small>
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
                  <td>{member.postal_code}</td>
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
              <small className="text-text-muted text-[10px]">Format: 10 chiffres (ex: 514-619-4333)</small>
            </div>
          </div>

          <div className="form-row">
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

          <div className="form-row">
            <div className="form-group">
              <label>Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">Actif</option>
                <option value="INACTIVE">Inactif</option>
                <option value="PENDING">En attente</option>
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
            </div>
          )}

          {!editingMember && (
            <div className="form-group">
              <label>Mot de passe *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="flex-1"
                  placeholder="Mot de passe temporaire"
                />
                <button
                  type="button"
                  className="btn btn-secondary px-3"
                  onClick={() => {
                    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
                    let pass = '';
                    for (let i = 0; i < 12; i++) {
                      pass += chars.charAt(Math.floor(Math.random() * chars.length));
                    }
                    setFormData({ ...formData, password: pass });
                  }}
                >
                  Générer
                </button>
              </div>
              <small className="text-text-muted text-[10px]">Le membre devra changer ce mot de passe à sa première connexion.</small>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default MembersPage;
