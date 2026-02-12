import { useEffect, useState } from 'react';
import api from '../api/client';
import { Calendar as CalendarIcon, MapPin, Users, Clock, Edit, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';

interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  max_capacity?: number;
  current_registrations: number;
  status: string;
  image_consent_required: boolean;
}

interface EventFormData {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  max_capacity?: number;
  status: string;
  image_consent_required: boolean;
}

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    max_capacity: undefined,
    status: 'DRAFT',
    image_consent_required: false
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events/events/');
      setEvents(res.data);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      location: '',
      max_capacity: undefined,
      status: 'DRAFT',
      image_consent_required: false
    });
    setShowModal(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      start_date: event.start_date.substring(0, 16),
      end_date: event.end_date.substring(0, 16),
      location: event.location,
      max_capacity: event.max_capacity,
      status: event.status,
      image_consent_required: event.image_consent_required
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;
    try {
      await api.delete(`/events/events/${id}/`);
      setEvents(events.filter(e => e.id !== id));
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        const res = await api.put(`/events/events/${editingEvent.id}/`, formData);
        setEvents(events.map(ev => ev.id === editingEvent.id ? res.data : ev));
      } else {
        const res = await api.post('/events/events/', formData);
        setEvents([...events, res.data]);
      }
      setShowModal(false);
    } catch (err: any) {
      console.error('Error saving event:', err);
      alert(err.response?.data?.detail || 'Erreur lors de l\'enregistrement');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return '#10b981';
      case 'CLOSED': return '#ef4444';
      case 'COMPLETED': return '#64748b';
      case 'CANCELLED': return '#ef4444';
      case 'DRAFT': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'OPEN': 'Ouvert',
      'CLOSED': 'Fermé',
      'COMPLETED': 'Terminé',
      'CANCELLED': 'Annulé',
      'DRAFT': 'Brouillon'
    };
    return labels[status] || status;
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Événements & Activités</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? 'Liste' : 'Grille'}
          </button>
          <button className="btn btn-primary" onClick={handleCreate}>
            + Créer un événement
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="events-grid">
          {events.length === 0 ? (
            <div className="card empty-state">
              <CalendarIcon size={48} />
              <p>Aucun événement prévu pour le moment.</p>
            </div>
          ) : (
            events.map(event => (
              <div key={event.id} className="card event-card">
                <div className="event-header">
                  <span className="badge" style={{ background: `${getStatusColor(event.status)}15`, color: getStatusColor(event.status) }}>
                    {getStatusLabel(event.status)}
                  </span>
                  <div className="event-actions">
                    <button className="icon-btn" onClick={() => handleEdit(event)}>
                      <Edit size={16} />
                    </button>
                    <button className="icon-btn" onClick={() => handleDelete(event.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3>{event.title}</h3>

                <div className="event-details">
                  <div className="event-detail">
                    <Clock size={16} />
                    <span>{new Date(event.start_date).toLocaleString('fr-CA', { dateStyle: 'long', timeStyle: 'short' })}</span>
                  </div>
                  <div className="event-detail">
                    <MapPin size={16} />
                    <span>{event.location || 'Non spécifié'}</span>
                  </div>
                  <div className="event-detail">
                    <Users size={16} />
                    <span>
                      {event.max_capacity
                        ? `${event.current_registrations} / ${event.max_capacity} inscrits`
                        : `${event.current_registrations} inscrits`}
                    </span>
                  </div>
                </div>

                <p className="event-description">{event.description || 'Aucune description'}</p>

                {event.image_consent_required && (
                  <div className="consent-notice">
                    Consentement photo requis
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="card table-container">
          <table>
            <thead>
              <tr>
                <th>ÉVÉNEMENT</th>
                <th>DATE</th>
                <th>LIEU</th>
                <th>INSCRITS</th>
                <th>STATUT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center">Aucun événement trouvé.</td>
                </tr>
              ) : (
                events.map(event => (
                  <tr key={event.id}>
                    <td><strong>{event.title}</strong></td>
                    <td>{new Date(event.start_date).toLocaleDateString('fr-CA')}</td>
                    <td>{event.location || '-'}</td>
                    <td>
                      {event.max_capacity
                        ? `${event.current_registrations} / ${event.max_capacity}`
                        : event.current_registrations}
                    </td>
                    <td>
                      <span className="badge" style={{ background: `${getStatusColor(event.status)}15`, color: getStatusColor(event.status) }}>
                        {getStatusLabel(event.status)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-sm" onClick={() => handleEdit(event)}>Modifier</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(event.id)}>Supprimer</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Annuler
            </button>
            <button
              onClick={() => {
                const form = document.getElementById('event-form') as HTMLFormElement;
                if (form) form.requestSubmit();
              }}
              className="btn btn-primary"
            >
              {editingEvent ? 'Mettre à jour' : 'Créer'}
            </button>
          </>
        }
      >
        <form id="event-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date de début *</label>
              <input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Date de fin *</label>
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Lieu</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Capacité maximale</label>
              <input
                type="number"
                value={formData.max_capacity || ''}
                onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value ? parseInt(e.target.value) : undefined })}
                min="1"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="DRAFT">Brouillon</option>
                <option value="OPEN">Ouvert</option>
                <option value="CLOSED">Fermé</option>
                <option value="COMPLETED">Terminé</option>
                <option value="CANCELLED">Annulé</option>
              </select>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.image_consent_required}
                  onChange={(e) => setFormData({ ...formData, image_consent_required: e.target.checked })}
                />
                Consentement photo requis
              </label>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EventsPage;
