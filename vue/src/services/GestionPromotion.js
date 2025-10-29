const API_URL = import.meta.env.VITE_API_URL;
// ============================================================================
// GESTION DES PROMOTIONS
// ============================================================================

/**
 * Récupérer toutes les promotions (actives, programmées, expirées)
 *
 * CONNEXION BASE DE DONNÉES :
 * ---------------------------
 * La fonction `get_promotions_actives` a été modifiée pour retourner le chemin de l'image.
 * Il faudrait idéalement une fonction qui retourne toutes les promotions, pas seulement les actives.
 * Pour l'exemple, nous utilisons `get_promotions_actives`.
 *
 * Format de réponse API attendu :
 * [
 *   {
 *     "id_promo": 1,
 *     "titre": "Promo Printemps",
 *     "description_promotion": "Réduction de 20% sur tous les plats",
 *     "pourcentage_reduction": 20.00,
 *     "date_debut": "2025-03-01T00:00:00",
 *     "date_fin": "2025-03-31T23:59:59",
 *     "image_path": "/path/to/image.jpg"
 *   },
 *   ...
 * ]
 *
 * @returns {Promise<Array>} - Liste des promotions
 */
export async function getPromotions() {
  try {
    // TODO: Remplacer par un appel API réel vers un endpoint qui retourne toutes les promotions.
    // Pour l'instant, nous utilisons l'endpoint des promotions actives.
    const response = await fetch(API_URL + 'api/promotions');
    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Erreur lors de la récupération des promotions:', error);
    return [];
  }
}