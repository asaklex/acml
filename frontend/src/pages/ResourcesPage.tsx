import { useState, useEffect } from 'react';
import api from '../api/client';
import Modal from '../components/Modal';
import { useAuthStore } from '../stores/auth';
import { 
  Building2, 
  Monitor, 
  Car, 
  Box, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Plus,
  Pencil,
  Trash2
} from 'lucide-react';

interface Resource {
  id: string;
  name: string;
  type: string;
  description: string;
  capacity?: number;
  is_available: boolean;
}

interface Reservation {
  id: string;
  resource: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string;
}

const ResourcesPage = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.is_staff;

  const [resources, setResources] = useState<Resource[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Reservation Modal State
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [reservationForm, setReservationForm] = useState({
    startTime: '',
    endTime: '',
    notes: ''
  });

  // Resource Management Modal State
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [resourceForm, setResourceForm] = useState({
    name: '',
    type: 'ROOM',
    description: '',
    capacity: '',
    is_available: true
  });

  useEffect(() => {
    fetchResources();
    fetchMyReservations();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await api.get('/resources/resources/');
      setResources(response.data);
    } catch (error: any) {
      console.error('Error fetching resources:', error);
      setError('Erreur de chargement des ressources: ' + (error.response?.status === 401 ? 'Session expirée' : error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReservations = async () => {
    try {
      const response = await api.get('/resources/reservations/');
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  // --- Reservation Logic ---

  const handleReserve = (resource: Resource) => {
    setSelectedResource(resource);
    setReservationForm({
      startTime: '',
      endTime: '',
      notes: ''
    });
    setShowReservationModal(true);
  };

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource) return;

    try {
      await api.post('/resources/reservations/', {
        resource: selectedResource.id,
        start_time: reservationForm.startTime,
        end_time: reservationForm.endTime,
        notes: reservationForm.notes
      });
      setShowReservationModal(false);
      fetchMyReservations();
      alert('Réservation soumise avec succès!');
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Erreur lors de la création de la réservation');
    }
  };

  // --- Resource Management Logic (Admin) ---

  const handleAddResource = () => {
    setEditingResource(null);
    setResourceForm({
      name: '',
      type: 'ROOM',
      description: '',
      capacity: '',
      is_available: true
    });
    setShowResourceModal(true);
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setResourceForm({
      name: resource.name,
      type: resource.type,
      description: resource.description,
      capacity: resource.capacity?.toString() || '',
      is_available: resource.is_available
    });
    setShowResourceModal(true);
  };

  const handleDeleteResource = async (resource: Resource) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${resource.name}" ?`)) return;

    try {
      await api.delete(`/resources/resources/${resource.id}/`);
      fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...resourceForm,
      capacity: resourceForm.capacity ? parseInt(resourceForm.capacity) : null
    };

    try {
      if (editingResource) {
        await api.patch(`/resources/resources/${editingResource.id}/`, payload);
      } else {
        await api.post('/resources/resources/', payload);
      }
      setShowResourceModal(false);
      fetchResources();
    } catch (error) {
      console.error('Error saving resource:', error);
      alert('Erreur lors de l\'enregistrement de la ressource');
    }
  };

  // --- UI Helpers ---

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'ROOM': return <Building2 className="w-6 h-6 text-primary" />;
      case 'EQUIPMENT': return <Monitor className="w-6 h-6 text-secondary" />;
      case 'VEHICLE': return <Car className="w-6 h-6 text-accent" />;
      default: return <Box className="w-6 h-6 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'ROOM': 'Salle',
      'EQUIPMENT': 'Matériel',
      'VEHICLE': 'Véhicule',
      'OTHER': 'Autre'
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'CANCELLED': 'bg-gray-100 text-gray-800'
    };
    
    const labels: Record<string, string> = {
      'PENDING': 'En attente',
      'APPROVED': 'Approuvée',
      'REJECTED': 'Rejetée',
      'CANCELLED': 'Annulée'
    };

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Ressources
          </h1>
          <p className="text-text-muted mt-1">
            Gestion des salles et équipements communautaires
          </p>
        </div>
        {isAdmin && (
          <button 
            onClick={handleAddResource}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Ajouter une ressource
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
          <Box className="text-primary" size={24} />
          Ressources Disponibles
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <div 
              key={resource.id} 
              className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden relative"
            >
              {isAdmin && (
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button 
                    onClick={() => handleEditResource(resource)}
                    className="p-2 bg-white text-gray-600 hover:text-primary rounded-full shadow-sm hover:shadow border border-gray-100"
                    title="Modifier"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteResource(resource)}
                    className="p-2 bg-white text-gray-600 hover:text-red-600 rounded-full shadow-sm hover:shadow border border-gray-100"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-primary/5 transition-colors">
                    {getResourceIcon(resource.type)}
                  </div>
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    resource.is_available 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {resource.is_available ? (
                      <><CheckCircle2 size={12} /> Disponible</>
                    ) : (
                      <><XCircle size={12} /> Indisponible</>
                    )}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-1">{resource.name}</h3>
                <p className="text-sm text-primary font-medium mb-3">{getTypeLabel(resource.type)}</p>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5em]">
                  {resource.description || 'Aucune description disponible.'}
                </p>
                
                {resource.capacity && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Users size={16} />
                    <span>Capacité: <span className="font-medium text-gray-900">{resource.capacity} personnes</span></span>
                  </div>
                )}

                <button
                  className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    resource.is_available
                      ? 'bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={() => resource.is_available && handleReserve(resource)}
                  disabled={!resource.is_available}
                >
                  <Calendar size={18} />
                  {resource.is_available ? 'Réserver maintenant' : 'Non disponible'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {reservations.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-gray-100">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
            <Calendar className="text-primary" size={24} />
            Mes Réservations
          </h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ressource</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Période</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Note</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{reservation.resource}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex flex-col gap-1">
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} className="text-gray-400" />
                            {new Date(reservation.start_time).toLocaleDateString('fr-CA', { 
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                            })}
                          </span>
                          <span className="text-xs text-gray-400 ml-5">
                            jusqu'au {new Date(reservation.end_time).toLocaleDateString('fr-CA', { 
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {reservation.notes || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(reservation.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Make Reservation */}
      {showReservationModal && selectedResource && (
        <Modal
          isOpen={showReservationModal}
          onClose={() => setShowReservationModal(false)}
          title={`Réserver: ${selectedResource.name}`}
          footer={
            <>
              <button 
                type="button" 
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" 
                onClick={() => setShowReservationModal(false)}
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  const form = document.getElementById('reservation-form') as HTMLFormElement;
                  if (form) form.requestSubmit();
                }}
                className="px-4 py-2 bg-primary text-white hover:bg-primary-dark rounded-lg shadow-sm hover:shadow transition-all"
              >
                Confirmer la réservation
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm flex gap-3 items-start">
              <AlertCircle className="shrink-0 mt-0.5" size={18} />
              <p>Votre demande de réservation sera soumise à l'approbation d'un administrateur. Vous recevrez une notification une fois traitée.</p>
            </div>

            <form id="reservation-form" onSubmit={handleReservationSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date et heure de début <span className="text-red-500">*</span></label>
                  <input
                    type="datetime-local"
                    value={reservationForm.startTime}
                    onChange={(e) => setReservationForm({ ...reservationForm, startTime: e.target.value })}
                    required
                    className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary shadow-sm"
                  />
                </div>
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date et heure de fin <span className="text-red-500">*</span></label>
                  <input
                    type="datetime-local"
                    value={reservationForm.endTime}
                    onChange={(e) => setReservationForm({ ...reservationForm, endTime: e.target.value })}
                    required
                    className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary shadow-sm"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes ou besoins spécifiques</label>
                <textarea
                  value={reservationForm.notes}
                  onChange={(e) => setReservationForm({ ...reservationForm, notes: e.target.value })}
                  rows={3}
                  placeholder="Ex: Besoin de chaises supplémentaires, installation du projecteur..."
                  className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary shadow-sm"
                />
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Modal - Manage Resource (Admin) */}
      {showResourceModal && (
        <Modal
          isOpen={showResourceModal}
          onClose={() => setShowResourceModal(false)}
          title={editingResource ? 'Modifier la ressource' : 'Ajouter une ressource'}
          footer={
            <>
              <button 
                type="button" 
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" 
                onClick={() => setShowResourceModal(false)}
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  const form = document.getElementById('resource-form') as HTMLFormElement;
                  if (form) form.requestSubmit();
                }}
                className="px-4 py-2 bg-primary text-white hover:bg-primary-dark rounded-lg shadow-sm hover:shadow transition-all"
              >
                Enregistrer
              </button>
            </>
          }
        >
          <form id="resource-form" onSubmit={handleResourceSubmit} className="flex flex-col gap-4">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la ressource <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={resourceForm.name}
                onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })}
                required
                className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary shadow-sm"
                placeholder="Ex: Salle de conférence"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={resourceForm.type}
                  onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })}
                  className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary shadow-sm"
                >
                  <option value="ROOM">Salle</option>
                  <option value="EQUIPMENT">Matériel</option>
                  <option value="VEHICLE">Véhicule</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacité (personnes)</label>
                <input
                  type="number"
                  value={resourceForm.capacity}
                  onChange={(e) => setResourceForm({ ...resourceForm, capacity: e.target.value })}
                  className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary shadow-sm"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={resourceForm.description}
                onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary shadow-sm"
                placeholder="Détails sur l'équipement ou la salle..."
              />
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="isAvailable"
                checked={resourceForm.is_available}
                onChange={(e) => setResourceForm({ ...resourceForm, is_available: e.target.checked })}
                className="rounded text-primary focus:ring-primary h-4 w-4"
              />
              <label htmlFor="isAvailable" className="text-sm text-gray-700 cursor-pointer">
                Disponible pour réservation
              </label>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ResourcesPage;
