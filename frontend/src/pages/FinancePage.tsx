import { useEffect, useState } from 'react';
import api from '../api/client';
import { TrendingUp, Heart, FileText, Plus, Edit, Trash2, Download } from 'lucide-react';
import Modal from '../components/Modal';

interface Campaign {
  id: string;
  name: string;
  description: string;
  goal_amount?: number;
  current_amount: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
}

interface Donation {
  id: string;
  amount: number;
  type: string;
  payment_method: string;
  status: string;
  donated_at: string;
  member?: string;
  receipt_issued: boolean;
}

interface CampaignFormData {
  name: string;
  description: string;
  goal_amount?: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
}

interface DonationFormData {
  amount: number;
  type: string;
  payment_method: string;
  campaign?: string;
}

const FinancePage = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'donations'>('overview');
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const [campaignForm, setCampaignForm] = useState<CampaignFormData>({
    name: '',
    description: '',
    goal_amount: undefined,
    is_active: true,
    start_date: '',
    end_date: ''
  });

  const [donationForm, setDonationForm] = useState<DonationFormData>({
    amount: 0,
    type: 'DON_PONCTUEL',
    payment_method: 'STRIPE',
    campaign: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [campaignsRes, donationsRes] = await Promise.all([
        api.get('/finance/campaigns/'),
        api.get('/finance/donations/')
      ]);
      setCampaigns(campaignsRes.data);
      setDonations(donationsRes.data);
    } catch (err) {
      console.error('Error fetching finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = () => {
    setEditingCampaign(null);
    setCampaignForm({
      name: '',
      description: '',
      goal_amount: undefined,
      is_active: true,
      start_date: '',
      end_date: ''
    });
    setShowCampaignModal(true);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setCampaignForm({
      name: campaign.name,
      description: campaign.description,
      goal_amount: campaign.goal_amount,
      is_active: campaign.is_active,
      start_date: campaign.start_date?.substring(0, 10) || '',
      end_date: campaign.end_date?.substring(0, 10) || ''
    });
    setShowCampaignModal(true);
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) return;
    try {
      await api.delete(`/finance/campaigns/${id}/`);
      setCampaigns(campaigns.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting campaign:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCampaign) {
        const res = await api.put(`/finance/campaigns/${editingCampaign.id}/`, campaignForm);
        setCampaigns(campaigns.map(c => c.id === editingCampaign.id ? res.data : c));
      } else {
        const res = await api.post('/finance/campaigns/', campaignForm);
        setCampaigns([...campaigns, res.data]);
      }
      setShowCampaignModal(false);
    } catch (err: any) {
      console.error('Error saving campaign:', err);
      alert(err.response?.data?.detail || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleCreateDonation = () => {
    setDonationForm({
      amount: 0,
      type: 'DON_PONCTUEL',
      payment_method: 'STRIPE',
      campaign: ''
    });
    setShowDonationModal(true);
  };

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/finance/donations/', {
        ...donationForm,
        campaign: donationForm.campaign || null
      });
      setDonations([...donations, res.data]);
      fetchData(); // Refresh to get updated campaign amounts
      setShowDonationModal(false);
      alert('Don enregistré avec succès!');
    } catch (err: any) {
      console.error('Error saving donation:', err);
      alert(err.response?.data?.detail || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDownloadReceipt = async (donationId: string) => {
    try {
      const res = await api.get(`/finance/donations/${donationId}/download_receipt/`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recu_fiscal_${donationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading receipt:', err);
      // alert('Impossible de télécharger le reçu.');
    }
  };

  const totalCollected = donations
    .filter(d => d.status === 'COMPLETED')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalDonors = new Set(donations.filter(d => d.status === 'COMPLETED').map(d => d.member)).size;

  const receiptsIssued = donations.filter(d => d.receipt_issued).length;

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      'STRIPE': 'Carte de crédit',
      'INTERAC': 'Interac',
      'PAYPAL': 'PayPal',
      'CASH': 'Espèces'
    };
    return labels[method] || method;
  };

  const getDonationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'COTISATION': 'Cotisation',
      'DON_PONCTUEL': 'Don ponctuel',
      'DON_RECURRENT': 'Don récurrent'
    };
    return labels[type] || type;
  };

  const getDonationStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#10b981';
      case 'PENDING': return '#f59e0b';
      case 'FAILED': return '#ef4444';
      case 'REFUNDED': return '#64748b';
      default: return '#3b82f6';
    }
  };

  const getDonationStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'COMPLETED': 'Complété',
      'PENDING': 'En attente',
      'FAILED': 'Échoué',
      'REFUNDED': 'Remboursé'
    };
    return labels[status] || status;
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Financement & Dons</h1>
        <button className="btn btn-primary" onClick={handleCreateDonation}>
          <Plus size={16} /> Faire un don
        </button>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Aperçu
        </button>
        <button
          className={`tab ${activeTab === 'campaigns' ? 'active' : ''}`}
          onClick={() => setActiveTab('campaigns')}
        >
          Campagnes
        </button>
        <button
          className={`tab ${activeTab === 'donations' ? 'active' : ''}`}
          onClick={() => setActiveTab('donations')}
        >
          Dons
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="stats-grid">
            <div className="card stat-card">
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <div className="stat-label">Total Collecté</div>
                <div className="stat-value">${totalCollected.toFixed(2)}</div>
              </div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent)' }}>
                <Heart size={24} />
              </div>
              <div>
                <div className="stat-label">Donateurs</div>
                <div className="stat-value">{totalDonors}</div>
              </div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-light)' }}>
                <FileText size={24} />
              </div>
              <div>
                <div className="stat-label">Reçus Émis</div>
                <div className="stat-value">{receiptsIssued}</div>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <h2>Campagnes Actives</h2>
              <button className="btn btn-primary" onClick={handleCreateCampaign}>
                <Plus size={16} /> Nouvelle campagne
              </button>
            </div>
            <div className="campaigns-grid">
              {campaigns.filter(c => c.is_active).length === 0 ? (
                <div className="card empty-state">Aucune campagne active.</div>
              ) : (
                campaigns.filter(c => c.is_active).map(camp => (
                  <div key={camp.id} className="card campaign-card">
                    <div className="campaign-header">
                      <h3>{camp.name}</h3>
                      <div className="campaign-actions">
                        <button className="icon-btn" onClick={() => handleEditCampaign(camp)}>
                          <Edit size={16} />
                        </button>
                        <button className="icon-btn" onClick={() => handleDeleteCampaign(camp.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="campaign-description">{camp.description || 'Aucune description'}</p>

                    {camp.goal_amount && (
                      <>
                        <div className="campaign-progress-info">
                          <span>${camp.current_amount.toFixed(2)} / ${camp.goal_amount.toFixed(2)}</span>
                          <span>{Math.round((camp.current_amount / camp.goal_amount) * 100)}%</span>
                        </div>
                        <div className="campaign-progress-bar">
                          <div
                            className="campaign-progress-fill"
                            style={{ width: `${Math.min((camp.current_amount / camp.goal_amount) * 100, 100)}%` }}
                          />
                        </div>
                      </>
                    )}

                    {camp.end_date && (
                      <div className="campaign-expiry">
                        Termine le {new Date(camp.end_date).toLocaleDateString('fr-CA')}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'campaigns' && (
        <div className="section">
          <div className="section-header">
            <h2>Toutes les Campagnes</h2>
            <button className="btn btn-primary" onClick={handleCreateCampaign}>
              <Plus size={16} /> Nouvelle campagne
            </button>
          </div>
          <div className="campaigns-grid">
            {campaigns.length === 0 ? (
              <div className="card empty-state">Aucune campagne.</div>
            ) : (
              campaigns.map(camp => (
                <div key={camp.id} className={`card campaign-card ${!camp.is_active ? 'inactive' : ''}`}>
                  <div className="campaign-header">
                    <h3>{camp.name}</h3>
                    <div className="campaign-actions">
                      <button className="icon-btn" onClick={() => handleEditCampaign(camp)}>
                        <Edit size={16} />
                      </button>
                      <button className="icon-btn" onClick={() => handleDeleteCampaign(camp.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="campaign-description">{camp.description || 'Aucune description'}</p>

                  {camp.goal_amount && (
                    <>
                      <div className="campaign-progress-info">
                        <span>${camp.current_amount.toFixed(2)} / ${camp.goal_amount.toFixed(2)}</span>
                        <span>{Math.round((camp.current_amount / camp.goal_amount) * 100)}%</span>
                      </div>
                      <div className="campaign-progress-bar">
                        <div
                          className="campaign-progress-fill"
                          style={{ width: `${Math.min((camp.current_amount / camp.goal_amount) * 100, 100)}%` }}
                        />
                      </div>
                    </>
                  )}

                  <div className="campaign-meta">
                    <span className={`badge ${camp.is_active ? 'active' : 'inactive'}`}>
                      {camp.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'donations' && (
        <div className="section">
          <div className="section-header">
            <h2>Historique des Dons</h2>
            <button className="btn btn-primary" onClick={handleCreateDonation}>
              <Plus size={16} /> Nouveau don
            </button>
          </div>
          <div className="card table-container">
            <table>
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>TYPE</th>
                  <th>MONTANT</th>
                  <th>MÉTHODE</th>
                  <th>STATUT</th>
                  <th>REÇU</th>
                </tr>
              </thead>
              <tbody>
                {donations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">Aucun don enregistré.</td>
                  </tr>
                ) : (
                  donations.map(donation => (
                    <tr key={donation.id}>
                      <td>{new Date(donation.donated_at).toLocaleDateString('fr-CA')}</td>
                      <td>{getDonationTypeLabel(donation.type)}</td>
                      <td><strong>${donation.amount.toFixed(2)}</strong></td>
                      <td>{getPaymentMethodLabel(donation.payment_method)}</td>
                      <td>
                        <span
                          className="badge"
                          style={{ background: `${getDonationStatusColor(donation.status)}15`, color: getDonationStatusColor(donation.status) }}
                        >
                          {getDonationStatusLabel(donation.status)}
                        </span>
                      </td>
                      <td>
                        {donation.status === 'COMPLETED' ? (
                          <button 
                             className="btn btn-sm btn-outline flex items-center gap-1 text-primary hover:bg-primary hover:text-white transition-colors"
                             onClick={() => handleDownloadReceipt(donation.id)}
                          >
                             <Download size={14} />
                             <span className="hidden sm:inline">Reçu</span>
                          </button>
                        ) : (
                          <span className="text-text-muted text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        title={editingCampaign ? 'Modifier la campagne' : 'Nouvelle campagne'}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowCampaignModal(false)}>
              Annuler
            </button>
            <button
              onClick={() => {
                const form = document.getElementById('campaign-form') as HTMLFormElement;
                if (form) form.requestSubmit();
              }}
              className="btn btn-primary"
            >
              {editingCampaign ? 'Mettre à jour' : 'Créer'}
            </button>
          </>
        }
      >
        <form id="campaign-form" onSubmit={handleCampaignSubmit} className="flex flex-col gap-4">
          <div className="form-group">
            <label>Nom *</label>
            <input
              type="text"
              value={campaignForm.name}
              onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={campaignForm.description}
              onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Objectif ($)</label>
              <input
                type="number"
                value={campaignForm.goal_amount || ''}
                onChange={(e) => setCampaignForm({ ...campaignForm, goal_amount: e.target.value ? parseFloat(e.target.value) : undefined })}
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={campaignForm.is_active}
                  onChange={(e) => setCampaignForm({ ...campaignForm, is_active: e.target.checked })}
                />
                Campagne active
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date de début</label>
              <input
                type="date"
                value={campaignForm.start_date}
                onChange={(e) => setCampaignForm({ ...campaignForm, start_date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Date de fin</label>
              <input
                type="date"
                value={campaignForm.end_date}
                onChange={(e) => setCampaignForm({ ...campaignForm, end_date: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        title="Enregistrer un don"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowDonationModal(false)}>
              Annuler
            </button>
            <button
              onClick={() => {
                const form = document.getElementById('donation-form') as HTMLFormElement;
                if (form) form.requestSubmit();
              }}
              className="btn btn-primary"
            >
              Enregistrer
            </button>
          </>
        }
      >
        <form id="donation-form" onSubmit={handleDonationSubmit} className="flex flex-col gap-4">
          <div className="form-group">
            <label>Montant ($)*</label>
            <input
              type="number"
              value={donationForm.amount || ''}
              onChange={(e) => setDonationForm({ ...donationForm, amount: parseFloat(e.target.value) })}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select
                value={donationForm.type}
                onChange={(e) => setDonationForm({ ...donationForm, type: e.target.value })}
              >
                <option value="COTISATION">Cotisation</option>
                <option value="DON_PONCTUEL">Don ponctuel</option>
                <option value="DON_RECURRENT">Don récurrent</option>
              </select>
            </div>
            <div className="form-group">
              <label>Méthode de paiement</label>
              <select
                value={donationForm.payment_method}
                onChange={(e) => setDonationForm({ ...donationForm, payment_method: e.target.value })}
              >
                <option value="STRIPE">Carte de crédit</option>
                <option value="INTERAC">Interac</option>
                <option value="PAYPAL">PayPal</option>
                <option value="CASH">Espèces</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Campagne (optionnel)</label>
            <select
              value={donationForm.campaign}
              onChange={(e) => setDonationForm({ ...donationForm, campaign: e.target.value })}
            >
              <option value="">Aucune campagne</option>
              {campaigns.filter(c => c.is_active).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FinancePage;
