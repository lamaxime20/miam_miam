import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Spinner } from 'react-bootstrap';
import { doitAfficherBoutons, getConfigBoutonValider } from '../pages/employer/views/commande';

/**
 * Un composant flottant pour afficher un aperçu d'une commande avec des actions.
 *
 * @param {object} props
 * @param {string|number} props.id_commande - L'identifiant de la commande.
 * @param {string} props.nom_client - Le nom du client associé à la commande.
 * @param {string} props.statut - Le statut actuel de la commande ('non lu', 'en cours', 'validé').
 * @param {boolean} props.isUpdating - Indique si la commande est en cours de mise à jour.
 * @param {function} props.onValider - Callback pour le bouton "Valider".
 * @param {function} props.onAnnuler - Callback pour le bouton "Annuler".
 * @param {function} props.onDetails - Callback pour le bouton "Détails".
 */
function CommandeFlottant({ id_commande, nom_client, statut, isUpdating, onValider, onAnnuler, onDetails }) {

    /**
     * Détermine le style du badge de statut en fonction de sa valeur.
     * @param {string} currentStatus - Le statut de la commande.
     * @returns {object} Un objet de style pour le badge.
     */
    const getStatusStyle = (currentStatus) => {
        const status = (currentStatus || '').toLowerCase();
        switch (status) {
            case 'non lu':
                return { backgroundColor: '#6c757d', color: 'white' }; // Gris (secondaire)
            case 'en préparation':
                return { backgroundColor: '#ffc107', color: 'black' }; // Jaune (avertissement)
            case 'annulé':
                return { backgroundColor: '#dc3545', color: 'white' }; // Rouge (danger)
            case 'validé':
                return { backgroundColor: '#28a745', color: 'white' }; // Vert (succès)
            default:
                return { backgroundColor: '#f8f9fa', color: 'black' }; // Gris clair (par défaut)
        }
    };

    const statusStyle = {
        ...getStatusStyle(statut),
        padding: '0.35em 0.65em',
        fontSize: '0.8em',
        fontWeight: '700',
        borderRadius: '0.25rem',
        textTransform: 'capitalize',
    };

    const cardStyle = {
        backgroundColor: 'white',
        width: '95%',
        margin: '1rem auto',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
    };

    return (
        <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 'bold' }}>#{id_commande}</span>
                <span>{nom_client}</span>
                <span style={statusStyle}>{statut || 'Inconnu'}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {isUpdating && <Spinner animation="border" size="sm" />}
                {doitAfficherBoutons(statut) && (
                    <>
                        {(() => {
                            const config = getConfigBoutonValider(statut);
                            return config && (
                                <button 
                                    className="btn btn-success btn-sm" 
                                    onClick={onValider} 
                                    disabled={isUpdating}
                                >
                                    {config.libelle}
                                </button>
                            );
                        })()}
                        <button 
                            className="btn btn-danger btn-sm" 
                            onClick={onAnnuler} 
                            disabled={isUpdating}
                        >
                            Annuler
                        </button>
                    </>
                )}

                <button className="btn btn-secondary btn-sm" onClick={onDetails} disabled={isUpdating}>Détails</button>
            </div>
        </div>
    );
}

export default CommandeFlottant;