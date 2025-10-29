/**
 * Récupère les commandes pour le tableau de bord de l'employeur via l'API.
 * @param {string} [statusFilter='all'] - Filtre de statut ('all','non lu','en préparation','en livraison','validé','annulé').
 * @returns {Promise<Array<Object>>}
 */
export async function getCommandesEmployeur(statusFilter = 'all') {
    const API_URL = import.meta.env.VITE_API_URL;
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);

    const res = await fetch(`${API_URL}api/employe/commandes?${params.toString()}`, {
        headers: {
            'Accept': 'application/json'
        }
    });
    if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
    return await res.json();
}

/**
 * Met à jour le statut d'une commande via un appel API.
 * @param {string|number} orderId L'identifiant de la commande.
 * @param {string} newStatus Le nouveau statut.
 * @returns {Promise<Object>} Une promesse qui résout avec la commande mise à jour.
 */
export async function updateCommandeStatus(orderId, newStatus) {
    const API_URL = import.meta.env.VITE_API_URL;
    const res = await fetch(`${API_URL}api/commandes/${orderId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ statut: newStatus })
    });
    if (!res.ok) throw new Error(`Erreur statut commande (${res.status})`);
    return await res.json();
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
    const API_URL = import.meta.env.VITE_API_URL;
    const res = await fetch(`${API_URL}api/livreurs/disponibles`, {
        headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`Erreur chargement livreurs (${res.status})`);
    return await res.json();
}

/**
 * Assigne un livreur à une commande.
 * @param {string|number} commandeId - L'ID de la commande.
 * @param {string|number} livreurId - L'ID du livreur.
 * @returns {Promise<Object>} Les détails de la livraison créée.
 */
export async function assignerLivreur(commandeId, livreurId) {
    const API_URL = import.meta.env.VITE_API_URL;
    const res = await fetch(`${API_URL}api/commandes/${commandeId}/assigner-livreur`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ livreur_id: livreurId })
    });
    if (!res.ok) throw new Error(`Erreur assignation livreur (${res.status})`);
    return await res.json();
}