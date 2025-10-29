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

/**
 * Créer une nouvelle promotion
 *
 * CONNEXION BASE DE DONNÉES :
 * ---------------------------
 * Cette fonction doit appeler un endpoint de l'API (ex: POST /api/promotions)
 * qui exécutera la fonction SQL `create_promotion`.
 *
 * Le corps de la requête doit contenir les données de la promotion.
 *
 * @param {Object} promoData - Données de la promotion à créer.
 * @param {string} promoData.name - Titre de la promotion.
 * @param {string} promoData.description - Description.
 * @param {number} promoData.discount - Pourcentage de réduction.
 * @param {string} promoData.startDate - Date de début (YYYY-MM-DD).
 * @param {string} promoData.endDate - Date de fin (YYYY-MM-DD).
 * @param {number|undefined} promoData.id_file - ID de l'image (optionnel).
 * @returns {Promise<Object>} - La promotion créée.
 */
export async function createPromotion(promoData) {
  try {
    const response = await fetch(API_URL + 'api/promotions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(promoData),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la création de la promotion: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur dans createPromotion:', error);
    throw error;
  }
}

/**
 * Mettre à jour une promotion existante
 *
 * CONNEXION BASE DE DONNÉES :
 * ---------------------------
 * Cette fonction doit appeler un endpoint de l'API (ex: PUT /api/promotions/{id})
 * qui exécutera la fonction SQL `update_promotion`.
 *
 * @param {string} id - ID de la promotion à mettre à jour.
 * @param {Object} promoData - Données de la promotion.
 * @returns {Promise<Object>} - La promotion mise à jour.
 */
export async function updatePromotion(id, promoData) {
  try {
    const response = await fetch(`${API_URL}api/promotions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(promoData),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la mise à jour de la promotion: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur dans updatePromotion:', error);
    throw error;
  }
}