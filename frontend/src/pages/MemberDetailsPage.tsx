import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import Modal from '../components/Modal';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { ArrowLeft, User, Users, Award, CreditCard, Clock, Trash2, Plus } from 'lucide-react';

interface Member {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  status: string;
  gender?: string;
  membership_type?: string;
  date_joined: string;
  families: any[];
  skills: any[];
  contributions: any[];
  cards: any[];
}

const MemberDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  // Modal State
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);

  // Forms Data
  const [familyForm, setFamilyForm] = useState({
    first_name: '',
    last_name: '',
    relationship: 'SPOUSE'
  });
  const [skillForm, setSkillForm] = useState({
    skill_name: '',
    proficiency: 'Intermédiaire'
  });

  useEffect(() => {
    if (id) fetchMemberDetails();
  }, [id]);

  const fetchMemberDetails = async () => {
    try {
      const res = await api.get(`/members/members/${id}/`);
      setMember(res.data);
    } catch (err) {
      console.error('Error fetching member details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFamily = async () => {
    if (!member) return;
    try {
      const payload = { ...familyForm, member: member.id };
      await api.post('/members/families/', payload);
      await fetchMemberDetails(); // Refresh
      setShowFamilyModal(false);
      setFamilyForm({ first_name: '', last_name: '', relationship: 'SPOUSE' });
    } catch (err) {
      console.error('Error adding family member:', err);
      alert('Erreur lors de l\'ajout du membre de la famille');
    }
  };

  const handleDeleteFamily = async (familyId: string) => {
    if (!confirm('Supprimer ce membre de la famille ?')) return;
    try {
      await api.delete(`/members/families/${familyId}/`);
      await fetchMemberDetails();
    } catch (err) {
      console.error('Error deleting family member:', err);
    }
  };

  const handleAddSkill = async () => {
    if (!member) return;
    try {
      const payload = { ...skillForm, member: member.id };
      await api.post('/members/skills/', payload);
      await fetchMemberDetails();
      setShowSkillModal(false);
      setSkillForm({ skill_name: '', proficiency: 'Intermédiaire' });
    } catch (err) {
      console.error('Error adding skill:', err);
      alert('Erreur lors de l\'ajout de la compétence');
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (!confirm('Supprimer cette compétence ?')) return;
    try {
      await api.delete(`/members/skills/${skillId}/`);
      await fetchMemberDetails();
    } catch (err) {
      console.error('Error deleting skill:', err);
    }
  };

  const handleDownloadCard = async () => {
    if (!member) return;
    const cardElement = document.getElementById('digital-member-card');
    if (cardElement) {
        // Temporarily remove hover effects for capture
        const originalTransform = cardElement.style.transform;
        cardElement.style.transform = 'none';
        
        try {
            const canvas = await html2canvas(cardElement, { 
                scale: 3, 
                backgroundColor: null,
                logging: false,
                useCORS: true
            });
            
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `ACML-Carte-${member.first_name}-${member.last_name}.png`;
            link.click();
        } catch (err) {
            console.error('Error generating card image:', err);
            alert('Erreur lors du téléchargement de la carte');
        } finally {
            cardElement.style.transform = originalTransform;
        }
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (!member) return <div className="p-8 text-center">Membre introuvable</div>;

  const tabs = [
    { id: 'info', label: 'Informations', icon: User },
    { id: 'family', label: 'Famille', icon: Users },
    { id: 'skills', label: 'Compétences', icon: Award },
    { id: 'contributions', label: 'Contributions', icon: Clock },
    { id: 'card', label: 'Carte Membre', icon: CreditCard },
  ];

  const relationshipLabels: Record<string, string> = {
    'SPOUSE': 'Conjoint(e)',
    'CHILD': 'Enfant',
    'PARENT': 'Parent'
  };

  return (
    <div className="page-container">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/members')} 
          className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft size={20} /> Retour à la liste
        </button>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {member.first_name[0]}{member.last_name[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold m-0">{member.first_name} {member.last_name}</h1>
            <p className="text-text-muted">{member.email} • <span className={`status-badge status-${member.status.toLowerCase()}`}>{member.status}</span></p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-border mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-primary text-primary font-medium' 
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card p-6">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Coordonnées</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-text-muted">Courriel</label>
                  <p>{member.email}</p>
                </div>
                <div>
                  <label className="block text-sm text-text-muted">Téléphone</label>
                  <p>{member.phone || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm text-text-muted">Genre</label>
                  <p>{member.gender === 'M' ? 'Homme' : member.gender === 'F' ? 'Femme' : '-'}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Adhésion</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-text-muted">Type</label>
                  <p>{member.membership_type || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm text-text-muted">Statut</label>
                  <p>{member.status}</p>
                </div>
                 <div>
                  <label className="block text-sm text-text-muted">Membre depuis le</label>
                  <p>{new Date(member.date_joined).toLocaleDateString('fr-CA')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'family' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Membres de la famille</h3>
              <button 
                className="btn btn-sm btn-outline flex items-center gap-2"
                onClick={() => setShowFamilyModal(true)}
              >
                <Plus size={16} /> Ajouter
              </button>
            </div>
            {member.families && member.families.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {member.families.map((fam: any) => (
                  <div key={fam.id} className="border rounded-lg p-4 flex justify-between items-center bg-gray-50/50">
                    <div>
                      <h4 className="font-semibold">{fam.first_name} {fam.last_name}</h4>
                      <p className="text-sm text-text-muted">{relationshipLabels[fam.relationship] || fam.relationship}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteFamily(fam.id)}
                      className="text-danger hover:bg-danger/10 p-2 rounded-full transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-muted bg-gray-50/50 rounded-lg border border-dashed">
                <p>Aucun membre de la famille enregistré.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'skills' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Compétences</h3>
              <button 
                className="btn btn-sm btn-outline flex items-center gap-2"
                onClick={() => setShowSkillModal(true)}
              >
                <Plus size={16} /> Ajouter
              </button>
            </div>
             {member.skills && member.skills.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {member.skills.map((skill: any) => (
                   <div key={skill.id} className="border rounded-lg p-4 flex justify-between items-center bg-gray-50/50">
                      <div>
                        <h4 className="font-semibold">{skill.skill_name}</h4>
                        <p className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary inline-block mt-1">
                          {skill.proficiency}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="text-danger hover:bg-danger/10 p-2 rounded-full transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                   </div>
                 ))}
               </div>
            ) : (
              <div className="text-center py-8 text-text-muted bg-gray-50/50 rounded-lg border border-dashed">
                <p>Aucune compétence enregistrée.</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'contributions' && (
            <div>
                 <h3 className="text-lg font-semibold mb-4">Historique des contributions</h3>
                 {member.contributions && member.contributions.length > 0 ? (
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-sm text-text-muted border-b">
                                <th className="pb-2">Date</th>
                                <th className="pb-2">Type</th>
                                <th className="pb-2">Montant/Heures</th>
                                <th className="pb-2">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {member.contributions.map((c: any) => (
                                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50/5 transition-colors">
                                    <td className="py-3">{c.contributed_at}</td>
                                    <td className="py-3">
                                      <span className="px-2 py-1 rounded text-xs bg-gray-100 font-medium">
                                        {c.type}
                                      </span>
                                    </td>
                                    <td className="py-3 font-medium">
                                        {c.amount ? `${c.amount} $` : ''} 
                                        {c.hours ? `${c.hours} h` : ''}
                                    </td>
                                    <td className="py-3 text-text-muted">{c.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 ) : (
                    <div className="text-center py-8 text-text-muted bg-gray-50/50 rounded-lg border border-dashed">
                     <p>Aucune contribution enregistrée.</p>
                    </div>
                 )}
            </div>
        )}
        
        {activeTab === 'card' && (
             <div className="flex flex-col items-center justify-center p-8">
                <div id="digital-member-card" className="w-96 h-56 bg-gradient-to-br from-primary to-primary-dark rounded-xl shadow-lg relative overflow-hidden text-white p-6 transition-transform hover:scale-105 duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold tracking-wider">ACML</h2>
                            <p className="text-xs opacity-80 uppercase tracking-widest mt-1">Membre Officiel</p>
                        </div>
                        <div className="bg-white p-1 rounded-lg">
                             <QRCodeCanvas 
                                value={`ACML:${member.id}`} 
                                size={48}
                                level={"H"}
                                includeMargin={false}
                             />
                        </div>
                    </div>
                    <div className="absolute bottom-6 left-6 z-10">
                        <p className="text-lg font-medium tracking-wide">{member.first_name} {member.last_name}</p>
                        <p className="text-xs opacity-70 font-mono mt-1 tracking-widest">{member.id.split('-')[0].toUpperCase()} • {member.status}</p>
                    </div>
                    <div className="absolute bottom-6 right-6 z-10 text-right">
                         <p className="text-[10px] opacity-80 uppercase tracking-wider mb-1">Valide jusqu'au</p>
                         <p className="font-bold text-lg">31 DÉC 2026</p>
                    </div>
                </div>
                <button onClick={handleDownloadCard} className="btn btn-primary mt-8 flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                    <Award size={18} /> Télécharger la carte numérique
                </button>
            </div>
        )}

      </div>

      {/* Add Family Modal */}
      <Modal
        isOpen={showFamilyModal}
        onClose={() => setShowFamilyModal(false)}
        title="Ajouter un membre de la famille"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowFamilyModal(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={handleAddFamily}>Ajouter</button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="form-group">
            <label>Prénom</label>
            <input 
              type="text" 
              value={familyForm.first_name}
              onChange={e => setFamilyForm({...familyForm, first_name: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="form-group">
            <label>Nom</label>
            <input 
              type="text" 
              value={familyForm.last_name}
              onChange={e => setFamilyForm({...familyForm, last_name: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="form-group">
            <label>Relation</label>
            <select 
              value={familyForm.relationship}
              onChange={e => setFamilyForm({...familyForm, relationship: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="SPOUSE">Conjoint(e)</option>
              <option value="CHILD">Enfant</option>
              <option value="PARENT">Parent</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Add Skill Modal */}
      <Modal
        isOpen={showSkillModal}
        onClose={() => setShowSkillModal(false)}
        title="Ajouter une compétence"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowSkillModal(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={handleAddSkill}>Ajouter</button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="form-group">
            <label>Compétence</label>
            <input 
              type="text" 
              placeholder="Ex: Enseignement, Plomberie, Design..."
              value={skillForm.skill_name}
              onChange={e => setSkillForm({...skillForm, skill_name: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="form-group">
            <label>Niveau</label>
            <select 
              value={skillForm.proficiency}
              onChange={e => setSkillForm({...skillForm, proficiency: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="Débutant">Débutant</option>
              <option value="Intermédiaire">Intermédiaire</option>
              <option value="Avancé">Avancé</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default MemberDetailsPage;
