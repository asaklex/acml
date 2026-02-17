import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import { Clock } from 'lucide-react';

const PendingApprovalPage = () => {
  const location = useLocation();
  const isNewRegistration = location.state?.registered;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card text-center py-12">
          <div className="flex justify-center mb-8">
            <img src={logo} alt="ACML Logo" className="h-24 w-auto object-contain" />
          </div>
          
          <div className="w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-6 text-warning">
            <Clock size={40} />
          </div>

          <h1 className="text-2xl font-bold mb-4">
            {isNewRegistration ? 'Demande reçue !' : 'Compte en attente'}
          </h1>
          
          <p className="text-text-muted mb-8 px-4">
            Votre demande d'adhésion à l'ACML est actuellement <strong>en attente d'approbation</strong> par un administrateur. 
            Vous recevrez une notification dès que votre compte sera activé.
          </p>

          <div className="space-y-4">
            <div className="bg-gray-50/5 p-4 rounded-lg text-sm text-left border border-border/50">
              <h3 className="font-semibold mb-2">Prochaines étapes :</h3>
              <ul className="list-disc list-inside space-y-1 text-text-muted">
                <li>Vérification de vos informations par notre équipe.</li>
                <li>Activation de votre accès aux modules.</li>
                <li>Bienvenue officielle au sein de la communauté !</li>
              </ul>
            </div>

            <Link to="/login" className="block w-full btn btn-secondary py-3">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
