/**
 * Récupère les commandes pour le tableau de bord de l'employeur.
 * NOTE : Actuellement, cette fonction retourne des données statiques (mock).
 * Elle sera mise à jour pour appeler l'API réelle.
 * 
 * @returns {Promise<Array<Object>>} Une promesse qui résout en un tableau de commandes.
 */
export async function getCommandesEmployeur() {
    // Simule une latence réseau
    await new Promise(resolve => setTimeout(resolve, 500));

    // Données par défaut en attendant l'API
    const mockCommandes = [
        {
            id_commande: 'CMD-1024',
            nom_client: 'Alice Martin',
            statut: 'non lu',
        },
        {
            id_commande: 'CMD-1025',
            nom_client: 'Bob Leclerc',
            statut: 'en cours',
        },
        {
            id_commande: 'CMD-1026',
            nom_client: 'Claire Dubois',
            statut: 'validé',
        },
    ];

    return mockCommandes;
}