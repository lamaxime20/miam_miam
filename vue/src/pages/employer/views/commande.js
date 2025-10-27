/**
 * Récupère les commandes pour le tableau de bord de l'employeur.
 * NOTE : Actuellement, cette fonction retourne des données statiques (mock) et sera mise à jour pour appeler l'API réelle.
 * @param {string} [statusFilter='all'] - Le statut par lequel filtrer les commandes.
 * @returns {Promise<Array<Object>>} Une promesse qui résout en un tableau de commandes.
 */
export async function getCommandesEmployeur(statusFilter = 'all') {
    // Simule une latence réseau en attendant l'API
    await new Promise(resolve => setTimeout(resolve, 500));

    // Données par défaut en attendant l'API
    const mockCommandes = [
        {
            id_commande: 'CMD-1024',
            nom_client: 'Alice Martin',
            statut: 'non lu',
            date_livraison: '2025-10-26T12:30:00Z',
            localisation_client: 'Yaoundé - Carrefour Biyem-Assi',
            type_localisation: 'estimation',
            menus: [
                { nom: 'Poulet DG', quantite: 2 },
                { nom: 'Jus de foléré', quantite: 2 },
            ],
        },
        {
            id_commande: 'CMD-1025',
            nom_client: 'Bob Leclerc',
            statut: 'en préparation',
            date_livraison: '2025-10-26T13:00:00Z',
            localisation_client: 'Douala - Akwa, Rue de la Joie',
            type_localisation: 'exacte',
            menus: [
                { nom: 'Ndolé avec crevettes', quantite: 1 },
            ],
        },
        {
            id_commande: 'CMD-1026',
            nom_client: 'Claire Dubois',
            statut: 'validé',
            date_livraison: '2025-10-25T19:00:00Z',
            localisation_client: 'Yaoundé - Mvan',
            type_localisation: 'estimation',
            menus: [
                { nom: 'Poisson braisé', quantite: 1 },
                { nom: 'Alokos', quantite: 2 },
                { nom: 'Coca-Cola', quantite: 1 },
            ],
        },
        {
            id_commande: 'CMD-1027',
            nom_client: 'Diane Moreau',
            statut: 'annulé',
            date_livraison: '2025-10-26T12:45:00Z',
            localisation_client: 'Douala - Bonamoussadi',
            type_localisation: 'estimation',
            menus: [
                { nom: 'Eru', quantite: 1 },
                { nom: 'Okok', quantite: 1 },
            ],
        },
    ];

    const filter = statusFilter.toLowerCase();
    if (filter && filter !== 'all') {
        return mockCommandes.filter(c => c.statut.toLowerCase() === filter);
    }

    return mockCommandes;
}

/**
 * Met à jour le statut d'une commande via un appel API.
 * @param {string|number} orderId L'identifiant de la commande.
 * @param {string} newStatus Le nouveau statut.
 * @returns {Promise<Object>} Une promesse qui résout avec la commande mise à jour.
 */
export async function updateCommandeStatus(orderId, newStatus) {
    // NOTE: Implémentation réelle du fetch à venir
    // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    // try {
    //     const response = await fetch(`${API_URL}/api/commandes/${orderId}/status`, {
    //         method: 'PUT',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': `Bearer ${localStorage.getItem('token')}` // À adapter selon votre système d'auth
    //         },
    //         body: JSON.stringify({ statut: newStatus })
    //     });

    //     if (!response.ok) {
    //         throw new Error(`Erreur lors de la mise à jour du statut de la commande: ${response.statusText}`);
    //     }

    //     return await response.json();
    //} catch (error) {
    //    console.error('Erreur lors de la mise à jour du statut:', error);
    //    throw error;
    //}
    return {
        id_commande: orderId,
        statut: newStatus,
    }
}

/**
 * Valide une commande non lue et la passe en préparation.
 * @param {string|number} orderId L'identifiant de la commande.
 * @returns {Promise<Object>} La commande mise à jour.
 */
export async function validerCommandeNonLue(orderId) {
    return await updateCommandeStatus(orderId, 'en préparation');
}

/**
 * Valide une commande en préparation, la passe à validé.
 * @param {string|number} orderId L'identifiant de la commande.
 * @returns {Promise<Object>} La commande mise à jour.
 */
export async function validerCommandeEnPreparation(orderId) {
    try {
        const commandeValidee = await updateCommandeStatus(orderId, 'validé');
        return commandeValidee;
    } catch (error) {
        console.error('Erreur lors de la validation de la commande:', error);
        throw error;
    }
}

/**
 * Annule une commande quel que soit son état actuel.
 * @param {string|number} orderId L'identifiant de la commande.
 * @returns {Promise<Object>} La commande mise à jour.
 */
export async function annulerCommande(orderId) {
    return await updateCommandeStatus(orderId, 'annulé');
}

/**
 * Vérifie si les boutons d'action doivent être affichés pour une commande.
 * @param {string} status Le statut actuel de la commande.
 * @returns {boolean} True si les boutons doivent être affichés, false sinon.
 */
export function doitAfficherBoutons(status) {
    return !['validé', 'annulé'].includes(status);
}

/**
 * Détermine si le bouton valider doit être affiché et son libellé.
 * @param {string} status Le statut actuel de la commande.
 * @returns {Object|null} Un objet contenant le libellé du bouton et sa fonction, ou null si le bouton ne doit pas être affiché.
 */
export function getConfigBoutonValider(status) {
    switch (status) {
        case 'non lu':
            return {
                libelle: 'Valider',
                action: validerCommandeNonLue
            };
        case 'en préparation':
            return {
                libelle: 'Terminer préparation',
                action: validerCommandeEnPreparation
            };
        default:
            return null;
    }
}

/**
 * Rafraîchit la liste des commandes avec le filtre spécifié.
 * Cette fonction est utilisée pour mettre à jour la liste des commandes après une modification.
 * @param {string} [status='all'] - Le statut à filtrer ('all', 'non lu', 'en préparation', 'validé', 'annulé')
 * @returns {Promise<Array<Object>>} Les commandes mises à jour
 */
export async function fetchCommandes(status = 'all') {
    try {
        const data = await getCommandesEmployeur(status);
        return data;
    } catch (error) {
        console.error("Erreur lors de la récupération des commandes :", error);
        throw error;
    }
}

/**
 * Récupère la liste des livreurs disponibles.
 * @returns {Promise<Array<Object>>} La liste des livreurs.
 */
export async function getLivreursDisponibles() {
    // NOTE: Implémentation réelle du fetch à venir
    // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    // try {
    //     const response = await fetch(`${API_URL}/api/livreurs/disponibles`, {
    //         headers: {
    //             'Authorization': `Bearer ${localStorage.getItem('token')}`
    //         }
    //     });
    //     if (!response.ok) throw new Error('Erreur lors de la récupération des livreurs');
    //     return await response.json();
    // } catch (error) {
    //     console.error('Erreur:', error);
    //     throw error;
    // }

    // Mock pour les tests
    return [
        { id: 1, nom: 'John Doe', tel: '+237 6xx xx xx xx', evaluation: 4.5 },
        { id: 2, nom: 'Jane Smith', tel: '+237 6xx xx xx xx', evaluation: 4.8 },
        { id: 3, nom: 'Bob Johnson', tel: '+237 6xx xx xx xx', evaluation: 4.2 },
    ];
}

/**
 * Assigne un livreur à une commande.
 * @param {string|number} commandeId - L'ID de la commande.
 * @param {string|number} livreurId - L'ID du livreur.
 * @returns {Promise<Object>} Les détails de la livraison créée.
 */
export async function assignerLivreur(commandeId, livreurId) {
    // NOTE: Implémentation réelle du fetch à venir
    // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    // try {
    //     const response = await fetch(`${API_URL}/api/livraisons`, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': `Bearer ${localStorage.getItem('token')}`
    //         },
    //         body: JSON.stringify({
    //             commande_id: commandeId,
    //             livreur_id: livreurId
    //         })
    //     });
    //     
    //     if (!response.ok) throw new Error('Erreur lors de l\'assignation du livreur');
    //     return await response.json();
    // } catch (error) {
    //     console.error('Erreur:', error);
    //     // En cas d'erreur, on remet la commande en état "en préparation"
    //     await updateCommandeStatus(commandeId, 'en préparation');
    //     throw error;
    // }

    // Mock pour les tests
    return {
        id_livraison: Math.floor(Math.random() * 1000),
        id_commande: commandeId,
        id_livreur: livreurId,
        statut: 'assigné'
    };
}