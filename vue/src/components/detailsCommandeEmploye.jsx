import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { doitAfficherBoutons, getConfigBoutonValider } from '../pages/employer/views/commande';

/**
 * Affiche les détails d'une commande dans une fenêtre modale.
 * @param {object} props
 * @param {boolean} props.isOpen - Indique si la modale est ouverte.
 * @param {function} props.onClose - Fonction pour fermer la modale.
 * @param {string|number} props.id_commande - L'identifiant de la commande.
 * @param {Array<object>} [props.menus] - La liste des menus de la commande.
 * @param {string} props.typeLocalisation - Le type de localisation ('estimation' ou autre).
 * @param {string} props.Localisation - L'adresse de localisation.
 * @param {string} props.date_livraison - La date de livraison.
 * @param {string} props.statut - Le statut de la commande.
 * @param {function} props.onAnnuler - Callback pour le bouton "Annuler".
 * @param {function} props.onValider - Callback pour le bouton "Valider".
 */
function DetailsCommandeEmploye({ isOpen, onClose, id_commande, menus, typeLocalisation, Localisation, date_livraison, statut, onValider, onAnnuler }) {

    if (!isOpen) {
        return null;
    }

    // Style pour la superposition qui fige l'écran
    const modalOverlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1050, // z-index élevé pour être au-dessus de tout
    };

    // Style pour la fenêtre flottante blanche
    const modalContentStyle = {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        width: '90%',
        maxWidth: '500px',
        position: 'relative',
    };

    // Formatter la date pour un affichage plus lisible
    const formattedDate = new Date(date_livraison).toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                <button 
                    type="button" 
                    className="btn-close" 
                    style={{ position: 'absolute', top: '1rem', right: '1rem' }} 
                    aria-label="Close" 
                    onClick={onClose}
                ></button>

                <h3 className="mb-4">Détails de la commande #{id_commande}</h3>

                <div className="mb-3">
                    <h5>Menus</h5>
                    <ul className="list-group">
                        {(menus || []).map((menu, index) => (
                            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                {menu.nom_menu || menu.nom}
                                <span className="badge bg-primary rounded-pill">{menu.quantite}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mb-3">
                    <h5>Livraison</h5>
                    <p>
                        <strong>{typeLocalisation === 'estimation' ? 'Localisation estimée :' : 'Localisation exacte :'}</strong> {Localisation}
                    </p>
                    <p>
                        <strong>Date de livraison :</strong> {formattedDate}
                    </p>
                </div>

                {/* Pied de page de la modale avec les boutons */}
                {doitAfficherBoutons(statut) && (
                    <div className="mt-4 d-flex justify-content-end">
                        <button className="btn btn-danger me-2" onClick={onAnnuler}>
                            Annuler la commande
                        </button>
                        {(() => {
                            const config = getConfigBoutonValider(statut);
                            return config && (
                                <button className="btn btn-success" onClick={onValider}>
                                    {config.libelle}
                                </button>
                            );
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DetailsCommandeEmploye;