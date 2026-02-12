import { useEffect, useState } from 'react';
import api from '../api/client';
import { Megaphone, Edit, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  published_at?: string;
  expires_at?: string;
  created_at: string;
}

interface AnnouncementFormData {
  title: string;
  content: string;
  category: string;
  status: string;
  published_at?: string;
  expires_at?: string;
}

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    content: '',
    category: 'ADMINISTRATIVE',
    status: 'DRAFT',
    published_at: '',
    expires_at: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/communications/announcements/');
      setAnnouncements(res.data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      category: 'ADMINISTRATIVE',
      status: 'DRAFT',
      published_at: '',
      expires_at: ''
    });
    setShowModal(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      category: announcement.category,
      status: announcement.status,
      published_at: announcement.published_at?.substring(0, 16) || '',
      expires_at: announcement.expires_at?.substring(0, 16) || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;
    try {
      await api.delete(`/communications/announcements/${id}/`);
      setAnnouncements(announcements.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting announcement:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        published_at: formData.published_at || null,
        expires_at: formData.expires_at || null
      };
      if (editingAnnouncement) {
        const res = await api.put(`/communications/announcements/${editingAnnouncement.id}/`, data);
        setAnnouncements(announcements.map(a => a.id === editingAnnouncement.id ? res.data : a));
      } else {
        const res = await api.post('/communications/announcements/', data);
        setAnnouncements([...announcements, res.data]);
      }
      setShowModal(false);
    } catch (err: any) {
      console.error('Error saving announcement:', err);
      alert(err.response?.data?.detail || 'Erreur lors de l\'enregistrement');
    }
  };

  const filteredAnnouncements = filterCategory === 'ALL'
    ? announcements
    : announcements.filter(a => a.category === filterCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'RELIGIOUS': return '#10b981';
      case 'CULTURAL': return '#8b5cf6';
      case 'ADMINISTRATIVE': return '#3b82f6';
      default: return '#64748b';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'RELIGIOUS': 'Religieux',
      'CULTURAL': 'Culturel',
      'ADMINISTRATIVE': 'Administratif'
    };
    return labels[category] || category;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'PUBLISHED': 'Publié',
      'DRAFT': 'Brouillon',
      'ARCHIVED': 'Archivé'
    };
    return labels[status] || status;
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Annonces Communautaires</h1>
        <button className="btn btn-primary" onClick={handleCreate}>
          + Nouvelle annonce
        </button>
      </div>

      <div className="filter-bar">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="ALL">Toutes les catégories</option>
          <option value="RELIGIOUS">Religieux</option>
          <option value="CULTURAL">Culturel</option>
          <option value="ADMINISTRATIVE">Administratif</option>
        </select>
      </div>

      <div className="announcements-list">
        {filteredAnnouncements.length === 0 ? (
          <div className="card empty-state">
            <Megaphone size={48} />
            <p>Aucune annonce trouvée.</p>
          </div>
        ) : (
          filteredAnnouncements.map(ann => (
            <div key={ann.id} className="card announcement-card">
              <div className="announcement-header">
                <div className="announcement-meta">
                  <span
                    className="badge"
                    style={{ background: `${getCategoryColor(ann.category)}15`, color: getCategoryColor(ann.category) }}
                  >
                    {getCategoryLabel(ann.category)}
                  </span>
                  <span className="announcement-status">{getStatusLabel(ann.status)}</span>
                  {ann.published_at && (
                    <span className="announcement-date">
                      Publié le {new Date(ann.published_at).toLocaleDateString('fr-CA')}
                    </span>
                  )}
                </div>
                <div className="announcement-actions">
                  <button className="icon-btn" onClick={() => handleEdit(ann)}>
                    <Edit size={16} />
                  </button>
                  <button className="icon-btn" onClick={() => handleDelete(ann.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3>{ann.title}</h3>
              <p className="announcement-content">{ann.content}</p>
              {ann.expires_at && (
                <div className="announcement-expiry">
                  Expire le {new Date(ann.expires_at).toLocaleDateString('fr-CA')}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingAnnouncement ? 'Modifier l\'annonce' : 'Nouvelle annonce'}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Annuler
            </button>
            <button
              onClick={() => {
                const form = document.getElementById('announcement-form') as HTMLFormElement;
                if (form) form.requestSubmit();
              }}
              className="btn btn-primary"
            >
              {editingAnnouncement ? 'Mettre à jour' : 'Publier'}
            </button>
          </>
        }
      >
        <form id="announcement-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="form-group">
            <label>Titre *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Contenu *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Catégorie</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="RELIGIOUS">Religieux</option>
                <option value="CULTURAL">Culturel</option>
                <option value="ADMINISTRATIVE">Administratif</option>
              </select>
            </div>
            <div className="form-group">
              <label>Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="DRAFT">Brouillon</option>
                <option value="PUBLISHED">Publié</option>
                <option value="ARCHIVED">Archivé</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date de publication</label>
              <input
                type="datetime-local"
                value={formData.published_at}
                onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Date d'expiration</label>
              <input
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AnnouncementsPage;
