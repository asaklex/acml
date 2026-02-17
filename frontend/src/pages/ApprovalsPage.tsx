import { useEffect, useState } from 'react';
import api from '../api/client';
import { Check, X, Shield, Clock } from 'lucide-react';

interface Member {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  sex?: string;
  postal_code: string;
  date_joined: string;
}

const ApprovalsPage = () => {
  const [pendingMembers, setPendingMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await api.get('/members/members/', { params: { status: 'PENDING' } });
      setPendingMembers(res.data);
    } catch (err) {
      console.error('Error fetching pending members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/members/members/${id}/approve/`);
      setPendingMembers(pendingMembers.filter(m => m.id !== id));
      alert('Membre approuvé avec succès.');
    } catch (err) {
      console.error('Error approving member:', err);
      alert("Erreur lors de l'approbation.");
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir rejeter cette demande ? Le compte sera supprimé.')) return;
    try {
      await api.delete(`/members/members/${id}/`);
      setPendingMembers(pendingMembers.filter(m => m.id !== id));
    } catch (err) {
      console.error('Error rejecting member:', err);
      alert('Erreur lors du rejet.');
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <Shield size={24} />
          </div>
          <div>
            <h1>Approbations en attente</h1>
            <p className="text-text-muted text-sm">Gérez les demandes d'adhésion des nouveaux membres.</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {pendingMembers.length === 0 ? (
          <div className="card text-center py-16 bg-gray-50/5">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4 text-success">
              <Check size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Toutes les demandes sont traitées</h3>
            <p className="text-text-muted">Il n'y a aucune nouvelle demande d'adhésion en ce moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingMembers.map((member) => (
              <div key={member.id} className="card flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary/30 transition-all">
                <div className="user-cell flex-1">
                  <div className="avatar h-14 w-14 text-xl">
                    {member.first_name?.[0]}{member.last_name?.[0]}
                  </div>
                  <div>
                    <strong className="text-lg">{member.first_name} {member.last_name}</strong>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-1">
                      <div className="flex items-center gap-2 text-sm text-text-muted">
                        <span className="opacity-70">Email:</span> {member.email || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-muted">
                        <span className="opacity-70">Tél:</span> {member.phone || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-muted">
                        <span className="opacity-70">Code Postal:</span> {member.postal_code}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-muted">
                        <Clock size={14} className="opacity-50" />
                        <span className="opacity-70">Inscrit le:</span> {new Date(member.date_joined).toLocaleDateString('fr-CA')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => handleReject(member.id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 border border-danger/30 text-danger hover:bg-danger/5 rounded-lg transition-all"
                  >
                    <X size={18} /> Rejeter
                  </button>
                  <button 
                    onClick={() => handleApprove(member.id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg shadow-sm transition-all"
                  >
                    <Check size={18} /> Approuver
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalsPage;
