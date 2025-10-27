import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/login.css';
import { loginUser } from '../services/user';

const LoginFormChoixRole = ({ onBack }) => {
    const navigate = useNavigate();

    const roles = [
        { key: 'administrateur', label: 'Administrateur' },
        { key: 'gerant', label: 'Gérant' },
        { key: 'livreur', label: 'Livreur' },
        { key: 'employe', label: 'Employé' },
        { key: 'client', label: 'Client' },
    ];

    const handleRoleSelection = async (roleKey) => {
        const credentials = JSON.parse(localStorage.getItem('loginCredentials'));
        if (!credentials || !credentials.email || !credentials.password) {
            console.error("Identifiants non trouvés. Retour à l'étape 1.");
            onBack();
            return;
        }

        const { email, password } = credentials;
        const res = await loginUser({ email, password, role: roleKey });

        // Nettoyer les identifiants temporaires après la tentative de connexion
        localStorage.removeItem('loginCredentials');

        if (res.success) {
            // Redirection en fonction du rôle
            switch (roleKey) {
                case 'administrateur':
                case 'gerant':
                case 'employe':
                    navigate('/employer'); // Exemple de redirection
                    break;
                case 'livreur':
                    navigate('/livreur-dashboard'); // Exemple de redirection
                    break;
                case 'client':
                default:
                    navigate('/');
                    break;
            }
        } else {
            // En cas d'échec (rare, mais possible si le token expire entre les étapes), on retourne au login
            console.error("Erreur de connexion finale:", res.message);
            onBack();
        }
    };

    return (
        <div className="login-container">
            <button className="back-button" onClick={onBack}>&#8592; Retour</button>
            <h2 className="text-center mb-4">Se connecter en tant que</h2>
            <div className="role-buttons">
                {roles.map((role) => (
                    <button key={role.key} className="login-btn role-btn" onClick={() => handleRoleSelection(role.key)}>
                        {role.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LoginFormChoixRole;
