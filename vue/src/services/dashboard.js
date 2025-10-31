/**
 * Service Dashboard - Gestion des statistiques du tableau de bord
 * 
 * Ce fichier contient toutes les fonctions pour récupérer et calculer
 * les statistiques affichées sur le dashboard admin.
 * 
 * INSTRUCTIONS POUR LA CONNEXION À LA BASE DE DONNÉES :
 * ======================================================
 * 1. Remplacer les données mockées par des appels API vers le backend
 * 2. Les fonctions retournent des Promises pour faciliter l'intégration
 * 3. Format de données attendu documenté dans chaque fonction
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

import { getAuthInfo } from './user';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/';

// helper pour récupérer l'id du restaurant courant depuis le token
function getRestaurantId() {
  const auth = getAuthInfo();
  // valeurs possibles: string ou number dans le token
  return auth?.restaurant ?? null;
}

/**
 * Formater un montant en XAF avec séparateurs de milliers
 * @param {number} montant - Montant en FCFA à formater
 * @returns {string} - Montant formaté (ex: "1000 FCFA")
 */
export function formaterMontantXAF(montant) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant);
}


// ============================================================================
// VENTES AUJOURD'HUI
// ============================================================================

/**
 * Récupérer les ventes du jour
 * 
 * CONNEXION BASE DE DONNÉES :
 * ---------------------------
 * Requête SQL attendue :
 * 
 * SELECT SUM(p.montant) as total_ventes
 * FROM Paiement p
 * WHERE DATE(p.date_paiement) = CURRENT_DATE
 * AND p.statut_paiement = 'reussi';
 * 
 * OU utiliser la fonction PostgreSQL existante :
 * SELECT get_ventes_aujourdhui();
 * 
 * Format de réponse API attendu :
 * {
 *   "total_xaf": 1867432,
 *   "pourcentage_vs_hier": 12.3
 * }
 * 
 * @returns {Promise<Object>} - { total: number, pourcentage_vs_hier: number }
 */
export async function getVentesAujourdhui() {
  try {
    const restaurantId = getRestaurantId();
    const url = new URL('api/dashboard/ventes-aujourdhui', API_URL);
    if (restaurantId) url.searchParams.set('restaurant_id', restaurantId);
    const response = await fetch(url.toString());
    const data = await response.json();

    const totalFCFA = Number(data.total_xaf ?? data.total ?? 0) || 0;

    return {
      total: totalFCFA,
      totalFormate: formaterMontantXAF(totalFCFA),
      pourcentage_vs_hier: Number(data.pourcentage_vs_hier ?? 0) || 0,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des ventes:', error);
    return { total: 0, totalFormate: formaterMontantXAF(0), pourcentage_vs_hier: 0 };
  }
}

// ============================================================================
// VENTES DE LA SEMAINE (pour comparaison)
// ============================================================================

/**
 * Récupérer les ventes de la semaine
 * 
 * CONNEXION BASE DE DONNÉES :
 * ---------------------------
 * Requête SQL attendue :
 * 
 * SELECT 
 *   EXTRACT(DOW FROM p.date_paiement) as jour_semaine,
 *   SUM(p.montant) as total
 * FROM Paiement p
 * WHERE p.date_paiement >= CURRENT_DATE - INTERVAL '7 days'
 * AND p.statut_paiement = 'reussi'
 * GROUP BY jour_semaine
 * ORDER BY jour_semaine;
 * 
 * Format de réponse API attendu :
 * [
 *   { "jour": "Lun", "ventes_xaf": 1836680 },
 *   { "jour": "Mar", "ventes_xaf": 2099062 },
 *   ...
 * ]
 * 
 * @returns {Promise<Array>} - Tableau des ventes par jour
 */
export async function getVentesSemaine() {
  try {
    const restaurantId = getRestaurantId();
    const url = new URL('api/dashboard/ventes-semaine', API_URL);
    if (restaurantId) url.searchParams.set('restaurant_id', restaurantId);
    const response = await fetch(url.toString());
    const data = await response.json();

    return data.map(jour => {
      const v = Number(jour.ventes_xaf ?? jour.ventes ?? 0) || 0; // Le backend renvoie déjà des XAF
      return {
        jour: jour.jour,
        ventes: v,
        ventesFormatees: formaterMontantXAF(v),
      };
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des ventes de la semaine:', error);
    return [];
  }
}

// ============================================================================
// UTILISATEURS ACTIFS
// ============================================================================

/**
 * Récupérer les utilisateurs actifs du mois en cours
 * 
 * CONNEXION BASE DE DONNÉES :
 * ---------------------------
 * Requête SQL attendue :
 * 
 * SELECT COUNT(DISTINCT id_user) as total
 * FROM "Utilisateur"
 * WHERE EXTRACT(MONTH FROM last_connexion) = EXTRACT(MONTH FROM CURRENT_DATE)
 * AND EXTRACT(YEAR FROM last_connexion) = EXTRACT(YEAR FROM CURRENT_DATE);
 * 
 * Format de réponse API attendu :
 * {
 *   "total": 1247,
 *   "pourcentage_vs_mois_dernier": 8.2
 * }
 * 
 * @returns {Promise<Object>} - { total: number, pourcentage: number }
 */
export async function getUtilisateursActifsMois() {
  try {
    // TODO: Remplacer par un appel API réel
    // const response = await fetch('/api/dashboard/utilisateurs-actifs-mois');
    // const data = await response.json();
    
    // DONNÉES MOCKÉES (à remplacer)
    const dataMockee = {
      total: 1247,
      pourcentage_vs_mois_dernier: 8.2
    };
    
    return {
      total: dataMockee.total,
      pourcentage: dataMockee.pourcentage_vs_mois_dernier
    };
    
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs actifs:', error);
    return {
      total: 0,
      pourcentage: 0
    };
  }
}

/**
 * Récupérer la moyenne d'utilisateurs actifs par mois (12 derniers mois)
 * 
 * CONNEXION BASE DE DONNÉES :
 * ---------------------------
 * Requête SQL attendue :
 * 
 * SELECT 
 *   TO_CHAR(last_connexion, 'Mon') as mois,
 *   EXTRACT(MONTH FROM last_connexion) as num_mois,
 *   COUNT(DISTINCT id_user) as total_utilisateurs
 * FROM "Utilisateur"
 * WHERE last_connexion >= CURRENT_DATE - INTERVAL '12 months'
 * GROUP BY TO_CHAR(last_connexion, 'Mon'), EXTRACT(MONTH FROM last_connexion)
 * ORDER BY num_mois;
 * 
 * Format de réponse API attendu :
 * [
 *   { "mois": "Jan", "total": 1150 },
 *   { "mois": "Fév", "total": 1200 },
 *   { "mois": "Mar", "total": 1180 },
 *   ...
 * ]
 * 
 * @returns {Promise<Object>} - { donnees: Array, moyenne: number }
 */
export async function getMoyenneUtilisateursParMois() {
  try {
    // TODO: Remplacer par un appel API réel
    // const response = await fetch('/api/dashboard/utilisateurs-par-mois');
    // const data = await response.json();
    
    // DONNÉES MOCKÉES (à remplacer)
    const dataMockee = [
      { mois: 'Jan', total: 1150 },
      { mois: 'Fév', total: 1200 },
      { mois: 'Mar', total: 1180 },
      { mois: 'Avr', total: 1220 },
      { mois: 'Mai', total: 1250 },
      { mois: 'Juin', total: 1280 },
      { mois: 'Juil', total: 1300 },
      { mois: 'Août', total: 1270 },
      { mois: 'Sept', total: 1290 },
      { mois: 'Oct', total: 1247 },
      { mois: 'Nov', total: 0 },    // Mois futur
      { mois: 'Déc', total: 0 },    // Mois futur
    ];
    
    // Filtrer les mois avec des données (exclure les mois futurs)
    const donneesValides = dataMockee.filter(m => m.total > 0);
    
    // Calculer la moyenne
    const somme = donneesValides.reduce((acc, m) => acc + m.total, 0);
    const moyenne = Math.round(somme / donneesValides.length);
    
    return {
      donnees: dataMockee,
      moyenne: moyenne,
      moyenneFormatee: moyenne.toLocaleString('fr-FR') + ' utilisateurs/mois'
    };
    
  } catch (error) {
    console.error('Erreur lors de la récupération de la moyenne par mois:', error);
    return {
      donnees: [],
      moyenne: 0,
      moyenneFormatee: '0 utilisateurs/mois'
    };
  }
}

/**
 * Récupérer la moyenne d'utilisateurs actifs par semaine (8 dernières semaines)
 * 
 * CONNEXION BASE DE DONNÉES :
 * ---------------------------
 * Requête SQL attendue :
 * 
 * SELECT 
 *   EXTRACT(WEEK FROM last_connexion) as num_semaine,
 *   'Sem ' || EXTRACT(WEEK FROM last_connexion) as semaine,
 *   COUNT(DISTINCT id_user) as total_utilisateurs
 * FROM "Utilisateur"
 * WHERE last_connexion >= CURRENT_DATE - INTERVAL '8 weeks'
 * GROUP BY EXTRACT(WEEK FROM last_connexion)
 * ORDER BY num_semaine;
 * 
 * Format de réponse API attendu :
 * [
 *   { "semaine": "Sem 35", "total": 280 },
 *   { "semaine": "Sem 36", "total": 295 },
 *   { "semaine": "Sem 37", "total": 310 },
 *   ...
 * ]
 * 
 * @returns {Promise<Object>} - { donnees: Array, moyenne: number }
 */
export async function getMoyenneUtilisateursParSemaine() {
  try {
    // TODO: Remplacer par un appel API réel
    // const response = await fetch('/api/dashboard/utilisateurs-par-semaine');
    // const data = await response.json();
    
    // DONNÉES MOCKÉES (à remplacer)
    const dataMockee = [
      { semaine: 'Sem 35', total: 280 },
      { semaine: 'Sem 36', total: 295 },
      { semaine: 'Sem 37', total: 310 },
      { semaine: 'Sem 38', total: 305 },
      { semaine: 'Sem 39', total: 320 },
      { semaine: 'Sem 40', total: 315 },
      { semaine: 'Sem 41', total: 330 },
      { semaine: 'Sem 42', total: 312 },
    ];
    
    // Calculer la moyenne
    const somme = dataMockee.reduce((acc, s) => acc + s.total, 0);
    const moyenne = Math.round(somme / dataMockee.length);
    
    return {
      donnees: dataMockee,
      moyenne: moyenne,
      moyenneFormatee: moyenne.toLocaleString('fr-FR') + ' utilisateurs/semaine'
    };
    
  } catch (error) {
    console.error('Erreur lors de la récupération de la moyenne par semaine:', error);
    return {
      donnees: [],
      moyenne: 0,
      moyenneFormatee: '0 utilisateurs/semaine'
    };
  }
}

/**
 * Récupérer les statistiques complètes des utilisateurs actifs
 * Combine les données du mois, par mois et par semaine
 * 
 * @param {string} periode - 'mois' ou 'semaine'
 * @returns {Promise<Object>} - Statistiques complètes
 */
export async function getStatistiquesUtilisateurs(periode = 'mois') {
  try {
    const [actifsMois, moyenneParMois, moyenneParSemaine] = await Promise.all([
      getUtilisateursActifsMois(),
      getMoyenneUtilisateursParMois(),
      getMoyenneUtilisateursParSemaine()
    ]);
    
    return {
      moisActuel: actifsMois,
      moyenneParMois: moyenneParMois,
      moyenneParSemaine: moyenneParSemaine,
      periodeSelectionnee: periode
    };
    
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques utilisateurs:', error);
    return null;
  }
}

// ============================================================================
// RÉCLAMATIONS
// ============================================================================

/**
 * Récupérer le nombre total de réclamations et les non traitées
 * 
 * CONNEXION BASE DE DONNÉES :
 * ---------------------------
 * Requête SQL attendue :
 * 
 * SELECT 
 *   COUNT(*) as total,
 *   COUNT(CASE WHEN statut_reclamation IN ('ouverte', 'en_traitement') THEN 1 END) as non_traitees
 * FROM Reclamation;
 * 
 * Format de réponse API attendu :
 * {
 *   "total": 23,
 *   "non_traitees": 5,
 *   "traitees": 18
 * }
 * 
 * @returns {Promise<Object>} - { total: number, non_traitees: number, traitees: number }
 */
export async function getReclamations() {
  try {
    // TODO: Remplacer par un appel API réel
    // const response = await fetch('/api/dashboard/reclamations');
    // const data = await response.json();
    
    // DONNÉES MOCKÉES (à remplacer)
    const dataMockee = {
      total: 23,
      non_traitees: 5,
      traitees: 18
    };
    
    return {
      total: dataMockee.total,
      nonTraitees: dataMockee.non_traitees,
      traitees: dataMockee.traitees
    };
    
  } catch (error) {
    console.error('Erreur lors de la récupération des réclamations:', error);
    return {
      total: 0,
      nonTraitees: 0,
      traitees: 0
    };
  }
}

/**
 * Récupérer le nombre de réclamations par mois (12 derniers mois)
 * 
 * CONNEXION BASE DE DONNÉES :
 * ---------------------------
 * Requête SQL attendue :
 * 
 * SELECT 
 *   TO_CHAR(date_reclamation, 'Mon') as mois,
 *   EXTRACT(MONTH FROM date_reclamation) as num_mois,
 *   COUNT(*) as total_reclamations,
 *   COUNT(CASE WHEN statut_reclamation = 'ouverte' THEN 1 END) as ouvertes,
 *   COUNT(CASE WHEN statut_reclamation = 'en_traitement' THEN 1 END) as en_traitement,
 *   COUNT(CASE WHEN statut_reclamation = 'fermée' THEN 1 END) as fermees
 * FROM Reclamation
 * WHERE date_reclamation >= CURRENT_DATE - INTERVAL '12 months'
 * GROUP BY TO_CHAR(date_reclamation, 'Mon'), EXTRACT(MONTH FROM date_reclamation)
 * ORDER BY num_mois;
 * 
 * Format de réponse API attendu :
 * [
 *   { 
 *     "mois": "Jan", 
 *     "total": 18,
 *     "ouvertes": 3,
 *     "en_traitement": 5,
 *     "fermees": 10
 *   },
 *   { "mois": "Fév", "total": 22, ... },
 *   ...
 * ]
 * 
 * @returns {Promise<Object>} - { donnees: Array, moyenne: number, totalAnnee: number }
 */
export async function getReclamationsParMois() {
  try {
    // TODO: Remplacer par un appel API réel
    // const response = await fetch('/api/dashboard/reclamations-par-mois');
    // const data = await response.json();
    
    // DONNÉES MOCKÉES (à remplacer)
    const dataMockee = [
      { mois: 'Jan', total: 18, ouvertes: 3, en_traitement: 5, fermees: 10 },
      { mois: 'Fév', total: 22, ouvertes: 4, en_traitement: 6, fermees: 12 },
      { mois: 'Mar', total: 20, ouvertes: 2, en_traitement: 7, fermees: 11 },
      { mois: 'Avr', total: 25, ouvertes: 5, en_traitement: 8, fermees: 12 },
      { mois: 'Mai', total: 19, ouvertes: 3, en_traitement: 6, fermees: 10 },
      { mois: 'Juin', total: 21, ouvertes: 4, en_traitement: 5, fermees: 12 },
      { mois: 'Juil', total: 23, ouvertes: 6, en_traitement: 7, fermees: 10 },
      { mois: 'Août', total: 17, ouvertes: 2, en_traitement: 5, fermees: 10 },
      { mois: 'Sept', total: 24, ouvertes: 5, en_traitement: 8, fermees: 11 },
      { mois: 'Oct', total: 23, ouvertes: 5, en_traitement: 6, fermees: 12 },
      { mois: 'Nov', total: 0, ouvertes: 0, en_traitement: 0, fermees: 0 },  // Mois futur
      { mois: 'Déc', total: 0, ouvertes: 0, en_traitement: 0, fermees: 0 },  // Mois futur
    ];
    
    // Filtrer les mois avec des données (exclure les mois futurs)
    const donneesValides = dataMockee.filter(m => m.total > 0);
    
    // Calculer la moyenne mensuelle
    const somme = donneesValides.reduce((acc, m) => acc + m.total, 0);
    const moyenne = Math.round(somme / donneesValides.length);
    
    // Calculer le total sur l'année
    const totalAnnee = somme;
    
    return {
      donnees: dataMockee,
      moyenne: moyenne,
      moyenneFormatee: moyenne.toLocaleString('fr-FR') + ' réclamations/mois',
      totalAnnee: totalAnnee,
      totalAnneeFormate: totalAnnee.toLocaleString('fr-FR') + ' réclamations'
    };
    
  } catch (error) {
    console.error('Erreur lors de la récupération des réclamations par mois:', error);
    return {
      donnees: [],
      moyenne: 0,
      moyenneFormatee: '0 réclamations/mois',
      totalAnnee: 0,
      totalAnneeFormate: '0 réclamations'
    };
  }
}

/**
 * Récupérer les réclamations par statut
 * 
 * CONNEXION BASE DE DONNÉES :
 * ---------------------------
 * Requête SQL attendue :
 * 
 * SELECT 
 *   statut_reclamation,
 *   COUNT(*) as nombre
 * FROM Reclamation
 * GROUP BY statut_reclamation;
 * 
 * Format de réponse API attendu :
 * {
 *   "ouverte": 5,
 *   "en_traitement": 8,
 *   "fermée": 10
 * }
 * 
 * @returns {Promise<Object>} - Nombre de réclamations par statut
 */
export async function getReclamationsParStatut() {
  try {
    // TODO: Remplacer par un appel API réel
    // const response = await fetch('/api/dashboard/reclamations-par-statut');
    // const data = await response.json();
    
    // DONNÉES MOCKÉES (à remplacer)
    const dataMockee = {
      ouverte: 5,
      en_traitement: 8,
      fermee: 10
    };
    
    return {
      ouverte: dataMockee.ouverte,
      enTraitement: dataMockee.en_traitement,
      fermee: dataMockee.fermee,
      total: dataMockee.ouverte + dataMockee.en_traitement + dataMockee.fermee
    };
    
  } catch (error) {
    console.error('Erreur lors de la récupération des réclamations par statut:', error);
    return {
      ouverte: 0,
      enTraitement: 0,
      fermee: 0,
      total: 0
    };
  }
}

/**
 * Récupérer les statistiques complètes des réclamations
 * Combine toutes les données : total, par mois, par statut
 * 
 * @returns {Promise<Object>} - Statistiques complètes
 */
export async function getStatistiquesReclamations() {
  try {
    const [total, parMois, parStatut] = await Promise.all([
      getReclamations(),
      getReclamationsParMois(),
      getReclamationsParStatut()
    ]);
    
    return {
      total: total,
      parMois: parMois,
      parStatut: parStatut
    };
    
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques réclamations:', error);
    return null;
  }
}

// ============================================================================
// POINTS DE FIDELITE
// ============================================================================

/**
 * Récupérer le total des points de fidélité distribués
 * 
 * CONNEXION BASE DE DONNÉES :
 * ---------------------------
 * Requête SQL attendue :
 * 
 * SELECT COALESCE(SUM(points_fidelite), 0) as total_points
 * FROM Client;
 * 
 * Format de réponse API attendu :
 * {
 *   "total_points": 45892,
 *   "points_mois_actuel": 3250
 * }
 * 
 * @returns {Promise<Object>} - { total: number, moisActuel: number }
 */
export async function getPointsFidelite() {
  try {
    // TODO: Remplacer par un appel API réel
    // const response = await fetch('/api/dashboard/points-fidelite');
    // const data = await response.json();
    
    // DONNÉES MOCKÉES (à remplacer)
    const dataMockee = {
      total_points: 45892,
      points_mois_actuel: 3250
    };
    
    return {
      total: dataMockee.total_points,
      totalFormate: dataMockee.total_points.toLocaleString('fr-FR') + ' points',
      moisActuel: dataMockee.points_mois_actuel,
      moisActuelFormate: dataMockee.points_mois_actuel.toLocaleString('fr-FR') + ' points'
    };
    
  } catch (error) {
    console.error('Erreur lors de la récupération des points de fidélité:', error);
    return {
      total: 0,
      totalFormate: '0 points',
      moisActuel: 0,
      moisActuelFormate: '0 points'
    };
  }
}

/**
 * Récupérer les points de fidélité distribués par mois (12 derniers mois)
 * 
 * CONNEXION BASE DE DONNÉES :
 * ---------------------------
 * Requête SQL attendue :
 * 
 * SELECT 
 *   TO_CHAR(date_attribution, 'Mon') as mois,
 *   EXTRACT(MONTH FROM date_attribution) as num_mois,
 *   SUM(points_attribues) as total_points,
 *   COUNT(DISTINCT id_client) as nombre_clients
 * FROM (
 *   -- Récupérer les points attribués via les commandes
 *   SELECT 
 *     c.id_user as id_client,
 *     cmd.date_commande as date_attribution,
 *     FLOOR(cmd.montant_total * 0.1) as points_attribues
 *   FROM Client c
 *   JOIN Commande cmd ON cmd.id_client = c.id_user
 *   WHERE cmd.date_commande >= CURRENT_DATE - INTERVAL '12 months'
 *   AND cmd.statut_commande = 'validée'
 * ) AS points_distribues
 * GROUP BY TO_CHAR(date_attribution, 'Mon'), EXTRACT(MONTH FROM date_attribution)
 * ORDER BY num_mois;
 * 
 * Format de réponse API attendu :
 * [
 *   { 
 *     "mois": "Jan", 
 *     "total_points": 3850,
 *     "nombre_clients": 125
 *   },
 *   { "mois": "Fév", "total_points": 4200, ... },
 *   ...
 * ]
 * 
 * @returns {Promise<Object>} - { donnees: Array, moyenne: number, totalAnnee: number }
 */
export async function getPointsFideliteParMois() {
  try {
    // TODO: Remplacer par un appel API réel
    // const response = await fetch('/api/dashboard/points-fidelite-par-mois');
    // const data = await response.json();
    
    // DONNÉES MOCKÉES (à remplacer)
    const dataMockee = [
      { mois: 'Jan', total_points: 3850, nombre_clients: 125 },
      { mois: 'Fév', total_points: 4200, nombre_clients: 138 },
      { mois: 'Mar', total_points: 3920, nombre_clients: 130 },
      { mois: 'Avr', total_points: 4150, nombre_clients: 142 },
      { mois: 'Mai', total_points: 4380, nombre_clients: 145 },
      { mois: 'Juin', total_points: 4520, nombre_clients: 150 },
      { mois: 'Juil', total_points: 4680, nombre_clients: 155 },
      { mois: 'Août', total_points: 3750, nombre_clients: 120 },
      { mois: 'Sept', total_points: 4420, nombre_clients: 148 },
      { mois: 'Oct', total_points: 3250, nombre_clients: 110 },
      { mois: 'Nov', total_points: 0, nombre_clients: 0 },  // Mois futur
      { mois: 'Déc', total_points: 0, nombre_clients: 0 },  // Mois futur
    ];
    
    // Filtrer les mois avec des données (exclure les mois futurs)
    const donneesValides = dataMockee.filter(m => m.total_points > 0);
    
    // Calculer la moyenne mensuelle
    const somme = donneesValides.reduce((acc, m) => acc + m.total_points, 0);
    const moyenne = Math.round(somme / donneesValides.length);
    
    // Calculer le total sur l'année
    const totalAnnee = somme;
    
    return {
      donnees: dataMockee,
      moyenne: moyenne,
      moyenneFormatee: moyenne.toLocaleString('fr-FR') + ' points/mois',
      totalAnnee: totalAnnee,
      totalAnneeFormate: totalAnnee.toLocaleString('fr-FR') + ' points'
    };
    
  } catch (error) {
    console.error('Erreur lors de la récupération des points par mois:', error);
    return {
      donnees: [],
      moyenne: 0,
      moyenneFormatee: '0 points/mois',
      totalAnnee: 0,
      totalAnneeFormate: '0 points'
    };
  }
}

/**
 * Récupérer les statistiques des points de fidélité par client
 * 
 * CONNEXION BASE DE DONNÉES :
 * ---------------------------
 * Requête SQL attendue :
 * 
 * SELECT 
 *   AVG(points_fidelite) as moyenne_par_client,
 *   MAX(points_fidelite) as max_points,
 *   MIN(points_fidelite) as min_points,
 *   COUNT(CASE WHEN points_fidelite > 0 THEN 1 END) as clients_avec_points
 * FROM Client;
 * 
 * Format de réponse API attendu :
 * {
 *   "moyenne_par_client": 367,
 *   "max_points": 5420,
 *   "min_points": 0,
 *   "clients_avec_points": 125
 * }
 * 
 * @returns {Promise<Object>} - Statistiques des points par client
 */
export async function getStatistiquesPointsParClient() {
  try {
    // TODO: Remplacer par un appel API réel
    // const response = await fetch('/api/dashboard/points-fidelite-stats');
    // const data = await response.json();
    
    // DONNÉES MOCKÉES (à remplacer)
    const dataMockee = {
      moyenne_par_client: 367,
      max_points: 5420,
      min_points: 0,
      clients_avec_points: 125
    };
    
    return {
      moyenneParClient: dataMockee.moyenne_par_client,
      moyenneParClientFormatee: dataMockee.moyenne_par_client.toLocaleString('fr-FR') + ' points/client',
      maxPoints: dataMockee.max_points,
      minPoints: dataMockee.min_points,
      clientsAvecPoints: dataMockee.clients_avec_points
    };
    
  } catch (error) {
    console.error('Erreur lors de la récupération des stats points:', error);
    return {
      moyenneParClient: 0,
      moyenneParClientFormatee: '0 points/client',
      maxPoints: 0,
      minPoints: 0,
      clientsAvecPoints: 0
    };
  }
}

/**
 * Récupérer les statistiques complètes des points de fidélité
 * Combine toutes les données : total, par mois, par client
 * 
 * @returns {Promise<Object>} - Statistiques complètes
 */
export async function getStatistiquesPointsFidelite() {
  try {
    const [total, parMois, parClient] = await Promise.all([
      getPointsFidelite(),
      getPointsFideliteParMois(),
      getStatistiquesPointsParClient()
    ]);
    
    return {
      total: total,
      parMois: parMois,
      parClient: parClient
    };
    
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques points:', error);
    return null;
  }
}

// ============================================================================
// RÉPARTITION DES CLIENTS
// ============================================================================

/**
 * Récupérer la répartition des clients par catégorie
 * 
 * LOGIQUE DE CATÉGORISATION :
 * -----------------------------
 * 1. NOUVEAUX CLIENTS : Inscrits dans les 30 derniers jours
 * 2. CLIENTS FIDÈLES : Plus de 5 commandes validées ET plus de 500 points de fidélité
 * 3. CLIENTS ACTIFS : Tous les autres clients avec au moins 1 commande
 * 
 * CONNEXION BASE DE DONNÉES :
 * ---------------------------
 * Requête SQL attendue :
 * 
 * WITH client_stats AS (
 *   SELECT 
 *     c.id_user,
 *     c.date_inscription,
 *     c.points_fidelite,
 *     COUNT(cmd.id_commande) as nombre_commandes
 *   FROM Client c
 *   LEFT JOIN Commande cmd ON cmd.id_client = c.id_user AND cmd.statut_commande = 'validée'
 *   GROUP BY c.id_user, c.date_inscription, c.points_fidelite
 * )
 * SELECT 
 *   COUNT(CASE WHEN date_inscription >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as nouveaux_clients,
 *   COUNT(CASE WHEN nombre_commandes > 5 AND points_fidelite > 500 THEN 1 END) as clients_fideles,
 *   COUNT(CASE WHEN date_inscription < CURRENT_DATE - INTERVAL '30 days' 
 *                AND (nombre_commandes <= 5 OR points_fidelite <= 500) THEN 1 END) as clients_actifs
 * FROM client_stats;
 * 
 * Format de réponse API attendu :
 * {
 *   "clients_actifs": 450,
 *   "nouveaux_clients": 280,
 *   "clients_fideles": 380
 * }
 * 
 * @returns {Promise<Object>} - Répartition des clients par catégorie
 */
export async function getRepartitionClients() {
  try {
    // TODO: Remplacer par un appel API réel
    // const response = await fetch('/api/dashboard/repartition-clients');
    // const data = await response.json();
    
    // DONNÉES MOCKÉES (à remplacer)
    const dataMockee = {
      clients_actifs: 450,
      nouveaux_clients: 280,
      clients_fideles: 380
    };
    
    // Calculer le total
    const total = dataMockee.clients_actifs + dataMockee.nouveaux_clients + dataMockee.clients_fideles;
    
    // Calculer les pourcentages
    const pourcentageActifs = Math.round((dataMockee.clients_actifs / total) * 100);
    const pourcentageNouveaux = Math.round((dataMockee.nouveaux_clients / total) * 100);
    const pourcentageFideles = Math.round((dataMockee.clients_fideles / total) * 100);
    
    return {
      clientsActifs: dataMockee.clients_actifs,
      nouveauxClients: dataMockee.nouveaux_clients,
      clientsFideles: dataMockee.clients_fideles,
      total: total,
      pourcentages: {
        actifs: pourcentageActifs,
        nouveaux: pourcentageNouveaux,
        fideles: pourcentageFideles
      },
      // Format pour le graphique (PieChart)
      donneesGraphique: [
        { 
          name: 'Clients actifs', 
          value: dataMockee.clients_actifs, 
          color: '#cfbd97',
          pourcentage: pourcentageActifs
        },
        { 
          name: 'Nouveaux clients', 
          value: dataMockee.nouveaux_clients, 
          color: '#6b7280',
          pourcentage: pourcentageNouveaux
        },
        { 
          name: 'Clients fidèles', 
          value: dataMockee.clients_fideles, 
          color: '#000000',
          pourcentage: pourcentageFideles
        },
      ]
    };
    
  } catch (error) {
    console.error('Erreur lors de la récupération de la répartition clients:', error);
    return {
      clientsActifs: 0,
      nouveauxClients: 0,
      clientsFideles: 0,
      total: 0,
      pourcentages: { actifs: 0, nouveaux: 0, fideles: 0 },
      donneesGraphique: []
    };
  }
}

/**
 * Récupérer l'évolution de la répartition des clients par mois
 * 
 * CONNEXION BASE DE DONNÉES :
 * ---------------------------
 * Requête SQL attendue :
 * 
 * SELECT 
 *   TO_CHAR(date_inscription, 'Mon') as mois,
 *   EXTRACT(MONTH FROM date_inscription) as num_mois,
 *   COUNT(*) as total_inscrits,
 *   COUNT(CASE WHEN date_inscription >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as nouveaux
 * FROM Client
 * WHERE date_inscription >= CURRENT_DATE - INTERVAL '12 months'
 * GROUP BY TO_CHAR(date_inscription, 'Mon'), EXTRACT(MONTH FROM date_inscription)
 * ORDER BY num_mois;
 * 
 * Format de réponse API attendu :
 * [
 *   { "mois": "Jan", "total_inscrits": 45, "nouveaux": 12 },
 *   { "mois": "Fév", "total_inscrits": 52, "nouveaux": 15 },
 *   ...
 * ]
 * 
 * @returns {Promise<Object>} - Évolution par mois
 */
export async function getEvolutionClientsParMois() {
  try {
    // TODO: Remplacer par un appel API réel
    // const response = await fetch('/api/dashboard/evolution-clients');
    // const data = await response.json();
    
    // DONNÉES MOCKÉES (à remplacer)
    const dataMockee = [
      { mois: 'Jan', total_inscrits: 45, nouveaux: 12 },
      { mois: 'Fév', total_inscrits: 52, nouveaux: 15 },
      { mois: 'Mar', total_inscrits: 48, nouveaux: 14 },
      { mois: 'Avr', total_inscrits: 55, nouveaux: 18 },
      { mois: 'Mai', total_inscrits: 60, nouveaux: 20 },
      { mois: 'Juin', total_inscrits: 58, nouveaux: 19 },
      { mois: 'Juil', total_inscrits: 62, nouveaux: 22 },
      { mois: 'Août', total_inscrits: 50, nouveaux: 16 },
      { mois: 'Sept', total_inscrits: 65, nouveaux: 25 },
      { mois: 'Oct', total_inscrits: 70, nouveaux: 28 },
      { mois: 'Nov', total_inscrits: 0, nouveaux: 0 },
      { mois: 'Déc', total_inscrits: 0, nouveaux: 0 },
    ];
    
    return {
      donnees: dataMockee
    };
    
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'évolution clients:', error);
    return {
      donnees: []
    };
  }
}

/**
 * Récupérer les détails des catégories de clients
 * 
 * @returns {Promise<Object>} - Détails de chaque catégorie
 */
export async function getDetailsCategories() {
  try {
    const repartition = await getRepartitionClients();
    
    return {
      categories: [
        {
          nom: 'Clients actifs',
          nombre: repartition.clientsActifs,
          description: 'Clients avec au moins 1 commande',
          couleur: '#cfbd97',
          criteres: 'Au moins 1 commande validée'
        },
        {
          nom: 'Nouveaux clients',
          nombre: repartition.nouveauxClients,
          description: 'Inscrits dans les 30 derniers jours',
          couleur: '#6b7280',
          criteres: 'Inscription < 30 jours'
        },
        {
          nom: 'Clients fidèles',
          nombre: repartition.clientsFideles,
          description: 'Plus de 5 commandes et 500+ points',
          couleur: '#000000',
          criteres: '> 5 commandes ET > 500 points'
        }
      ],
      total: repartition.total
    };
    
  } catch (error) {
    console.error('Erreur lors de la récupération des détails:', error);
    return {
      categories: [],
      total: 0
    };
  }
}

// ============================================================================
// COMMANDES RÉCENTES
// ============================================================================

/**
 * Récupérer les commandes récentes (10 dernières)
 * 
 * CONNEXION BASE DE DONNÉES :
 * ---------------------------
 * Requête SQL attendue :
 * 
 * SELECT 
 *   c.id_commande,
 *   c.montant_total,
 *   c.statut_commande,
 *   c.date_commande,
 *   u.nom || ' ' || u.prenom as client_nom,
 *   u.email as client_email
 * FROM Commande c
 * JOIN "Utilisateur" u ON u.id_user = c.id_client
 * ORDER BY c.date_commande DESC
 * LIMIT 10;
 * 
 * Format de réponse API attendu :
 * [
 *   {
 *     "id_commande": 1234,
 *     "montant_total": 29.856,
 *     "statut_commande": "validée",
 *     "date_commande": "2025-10-27T14:30:00",
 *     "client_nom": "Marie Dubois",
 *     "client_email": "marie@example.com"
 *   },
 *   ...
 * ]
 * 
 * @returns {Promise<Array>} - Liste des 10 dernières commandes
 */
export async function getCommandesRecentes() {
  try {
    // TODO: Remplacer par un appel API réel
    // const response = await fetch('/api/dashboard/commandes-recentes');
    // const data = await response.json();
    
    // DONNÉES MOCKÉES (à remplacer)
    const dataMockee = [
      {
        id_commande: 1234,
        montant_total: 29.856,
        statut_commande: 'validée',
        date_commande: '2025-10-27T14:25:00',
        client_nom: 'Marie Dubois',
        client_email: 'marie@example.com'
      },
      {
        id_commande: 1235,
        montant_total: 21.511,
        statut_commande: 'en_cours',
        date_commande: '2025-10-27T14:18:00',
        client_nom: 'Pierre Martin',
        client_email: 'pierre@example.com'
      },
      {
        id_commande: 1236,
        montant_total: 18.957,
        statut_commande: 'en_cours',
        date_commande: '2025-10-27T14:12:00',
        client_nom: 'Sophie Laurent',
        client_email: 'sophie@example.com'
      },
      {
        id_commande: 1237,
        montant_total: 45.230,
        statut_commande: 'validée',
        date_commande: '2025-10-27T13:55:00',
        client_nom: 'Jean Durand',
        client_email: 'jean@example.com'
      },
      {
        id_commande: 1238,
        montant_total: 32.100,
        statut_commande: 'en_cours',
        date_commande: '2025-10-27T13:40:00',
        client_nom: 'Julie Bernard',
        client_email: 'julie@example.com'
      },
      {
        id_commande: 1239,
        montant_total: 28.450,
        statut_commande: 'validée',
        date_commande: '2025-10-27T13:25:00',
        client_nom: 'Thomas Petit',
        client_email: 'thomas@example.com'
      },
      {
        id_commande: 1240,
        montant_total: 52.890,
        statut_commande: 'validée',
        date_commande: '2025-10-27T13:10:00',
        client_nom: 'Emma Rousseau',
        client_email: 'emma@example.com'
      },
      {
        id_commande: 1241,
        montant_total: 19.750,
        statut_commande: 'annulée',
        date_commande: '2025-10-27T12:55:00',
        client_nom: 'Lucas Moreau',
        client_email: 'lucas@example.com'
      },
      {
        id_commande: 1242,
        montant_total: 38.200,
        statut_commande: 'validée',
        date_commande: '2025-10-27T12:40:00',
        client_nom: 'Camille Leroy',
        client_email: 'camille@example.com'
      },
      {
        id_commande: 1243,
        montant_total: 25.600,
        statut_commande: 'en_cours',
        date_commande: '2025-10-27T12:25:00',
        client_nom: 'Antoine Simon',
        client_email: 'antoine@example.com'
      },
    ];
    
    // Convertir EUR en XAF et calculer le temps écoulé
    const commandesFormatees = dataMockee.map(cmd => {
      const montantXAF = convertirEURversXAF(cmd.montant_total);
      const tempsEcoule = calculerTempsEcoule(cmd.date_commande);
      
      return {
        id: `#${cmd.id_commande}`,
        montant: montantXAF,
        montantFormate: formaterMontantXAF(montantXAF),
        statut: cmd.statut_commande,
        statutLabel: getStatutLabel(cmd.statut_commande),
        date: cmd.date_commande,
        tempsEcoule: tempsEcoule,
        client: cmd.client_nom,
        email: cmd.client_email
      };
    });
    
    return commandesFormatees;
    
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes récentes:', error);
    return [];
  }
}

/**
 * Calculer le temps écoulé depuis une date
 * @param {string} date - Date au format ISO
 * @returns {string} - Temps écoulé (ex: "il y a 5 min")
 */
function calculerTempsEcoule(date) {
  const maintenant = new Date();
  const dateCommande = new Date(date);
  const diffMs = maintenant - dateCommande;
  const diffMin = Math.floor(diffMs / 60000);
  
  if (diffMin < 1) return 'il y a quelques secondes';
  if (diffMin < 60) return `il y a ${diffMin} min`;
  
  const diffHeure = Math.floor(diffMin / 60);
  if (diffHeure < 24) return `il y a ${diffHeure}h`;
  
  const diffJour = Math.floor(diffHeure / 24);
  return `il y a ${diffJour}j`;
}

/**
 * Obtenir le label du statut de commande
 * @param {string} statut - Statut de la commande
 * @returns {string} - Label du statut
 */
function getStatutLabel(statut) {
  const labels = {
    'en_cours': 'En cours',
    'validée': 'Livré',
    'annulée': 'Annulé'
  };
  return labels[statut] || statut;
}

// ============================================================================
// RÉCLAMATIONS RÉCENTES
// ============================================================================

/**
 * Récupérer les réclamations récentes (10 dernières)
 * 
 * CONNEXION BASE DE DONNÉES :
 * ---------------------------
 * Requête SQL attendue :
 * 
 * SELECT 
 *   r.id_reclamation,
 *   r.sujet_reclamation,
 *   r.description_reclamation,
 *   r.statut_reclamation,
 *   r.date_reclamation,
 *   u.nom || ' ' || u.prenom as client_nom,
 *   c.id_commande
 * FROM Reclamation r
 * JOIN "Utilisateur" u ON u.id_user = r.id_client
 * LEFT JOIN Commande c ON c.id_commande = r.id_commande
 * ORDER BY r.date_reclamation DESC
 * LIMIT 10;
 * 
 * Format de réponse API attendu :
 * [
 *   {
 *     "id_reclamation": 2341,
 *     "sujet_reclamation": "Commande froide",
 *     "description_reclamation": "La nourriture est arrivée froide...",
 *     "statut_reclamation": "ouverte",
 *     "date_reclamation": "2025-10-27T12:30:00",
 *     "client_nom": "Marie Dubois",
 *     "id_commande": 1234
 *   },
 *   ...
 * ]
 * 
 * @returns {Promise<Array>} - Liste des 10 dernières réclamations
 */
export async function getReclamationsRecentes() {
  try {
    // TODO: Remplacer par un appel API réel
    // const response = await fetch('/api/dashboard/reclamations-recentes');
    // const data = await response.json();
    
    // DONNÉES MOCKÉES (à remplacer)
    const dataMockee = [
      {
        id_reclamation: 2341,
        sujet_reclamation: 'Commande froide',
        description_reclamation: 'La nourriture est arrivée froide malgré le délai respecté',
        statut_reclamation: 'ouverte',
        date_reclamation: '2025-10-27T12:30:00',
        client_nom: 'Marie Dubois',
        id_commande: 1234
      },
      {
        id_reclamation: 2340,
        sujet_reclamation: 'Retard livraison',
        description_reclamation: 'Ma commande a pris 45 minutes de retard',
        statut_reclamation: 'en_traitement',
        date_reclamation: '2025-10-27T08:15:00',
        client_nom: 'Pierre Martin',
        id_commande: 1230
      },
      {
        id_reclamation: 2339,
        sujet_reclamation: 'Problème résolu',
        description_reclamation: 'Il manquait les frites dans ma commande',
        statut_reclamation: 'fermée',
        date_reclamation: '2025-10-27T07:20:00',
        client_nom: 'Sophie Leroy',
        id_commande: 1225
      },
      {
        id_reclamation: 2338,
        sujet_reclamation: 'Erreur de commande',
        description_reclamation: 'J\'ai reçu une pizza végétarienne au lieu d\'une pepperoni',
        statut_reclamation: 'en_traitement',
        date_reclamation: '2025-10-26T19:45:00',
        client_nom: 'Jean Durand',
        id_commande: 1220
      },
      {
        id_reclamation: 2337,
        sujet_reclamation: 'Qualité du produit',
        description_reclamation: 'Le burger n\'est pas assez cuit',
        statut_reclamation: 'ouverte',
        date_reclamation: '2025-10-26T18:10:00',
        client_nom: 'Julie Bernard',
        id_commande: 1215
      },
      {
        id_reclamation: 2336,
        sujet_reclamation: 'Produit manquant',
        description_reclamation: 'Il manque le dessert dans ma commande',
        statut_reclamation: 'fermée',
        date_reclamation: '2025-10-26T15:30:00',
        client_nom: 'Thomas Petit',
        id_commande: 1210
      },
      {
        id_reclamation: 2335,
        sujet_reclamation: 'Livraison incorrecte',
        description_reclamation: 'Mauvaise adresse de livraison',
        statut_reclamation: 'en_traitement',
        date_reclamation: '2025-10-26T14:20:00',
        client_nom: 'Emma Rousseau',
        id_commande: 1205
      },
      {
        id_reclamation: 2334,
        sujet_reclamation: 'Allergie non respectée',
        description_reclamation: 'Présence de fruits à coque malgré ma demande',
        statut_reclamation: 'ouverte',
        date_reclamation: '2025-10-26T13:15:00',
        client_nom: 'Lucas Moreau',
        id_commande: 1200
      },
      {
        id_reclamation: 2333,
        sujet_reclamation: 'Emballage endommagé',
        description_reclamation: 'Le sac était déchiré à l\'arrivée',
        statut_reclamation: 'fermée',
        date_reclamation: '2025-10-26T12:00:00',
        client_nom: 'Camille Leroy',
        id_commande: 1195
      },
      {
        id_reclamation: 2332,
        sujet_reclamation: 'Problème de paiement',
        description_reclamation: 'Double prélèvement sur ma carte',
        statut_reclamation: 'en_traitement',
        date_reclamation: '2025-10-26T10:45:00',
        client_nom: 'Antoine Simon',
        id_commande: 1190
      },
    ];
    
    // Formater les réclamations avec priorité et temps écoulé
    const reclamationsFormatees = dataMockee.map(rec => {
      const tempsEcoule = calculerTempsEcoule(rec.date_reclamation);
      const priorite = getPrioriteReclamation(rec.statut_reclamation, rec.date_reclamation);
      
      return {
        id: `#${rec.id_reclamation}`,
        sujet: rec.sujet_reclamation,
        description: rec.description_reclamation,
        statut: rec.statut_reclamation,
        statutLabel: getStatutReclamationLabel(rec.statut_reclamation),
        priorite: priorite.label,
        prioriteCouleur: priorite.couleur,
        date: rec.date_reclamation,
        tempsEcoule: tempsEcoule,
        client: rec.client_nom,
        commande: rec.id_commande ? `#${rec.id_commande}` : 'N/A'
      };
    });
    
    return reclamationsFormatees;
    
  } catch (error) {
    console.error('Erreur lors de la récupération des réclamations récentes:', error);
    return [];
  }
}

/**
 * Obtenir le label du statut de réclamation
 * @param {string} statut - Statut de la réclamation
 * @returns {string} - Label du statut
 */
function getStatutReclamationLabel(statut) {
  const labels = {
    'ouverte': 'Urgent',
    'en_traitement': 'Moyen',
    'fermée': 'Résolu'
  };
  return labels[statut] || statut;
}

/**
 * Déterminer la priorité d'une réclamation
 * @param {string} statut - Statut de la réclamation
 * @param {string} date - Date de la réclamation
 * @returns {Object} - { label: string, couleur: string }
 */
function getPrioriteReclamation(statut, date) {
  if (statut === 'fermée') {
    return { label: 'Résolu', couleur: 'green' };
  }
  
  const maintenant = new Date();
  const dateReclamation = new Date(date);
  const diffHeures = (maintenant - dateReclamation) / (1000 * 60 * 60);
  
  if (statut === 'ouverte' || diffHeures > 4) {
    return { label: 'Urgent', couleur: 'red' };
  }
  
  return { label: 'Moyen', couleur: 'yellow' };
}

// ============================================================================
// GESTION DES COMMANDES (PAGE COMPLÈTE)
// ============================================================================

/**
 * Récupérer toutes les commandes avec filtres et pagination
 * 
 * CONNEXION BASE DE DONNÉES :
 * ---------------------------
 * Requête SQL attendue :
 * 
 * SELECT 
 *   c.id_commande,
 *   c.montant_total,
 *   c.statut_commande,
 *   c.date_commande,
 *   u.nom || ' ' || u.prenom as client_nom,
 *   u.email as client_email,
 *   COUNT(lc.id_ligne_commande) as nombre_articles
 * FROM Commande c
 * JOIN "Utilisateur" u ON u.id_user = c.id_client
 * LEFT JOIN Ligne_Commande lc ON lc.id_commande = c.id_commande
 * WHERE 
 *   -- Filtre par statut (optionnel)
 *   (statut_commande = :statut OR :statut IS NULL)
 *   -- Recherche par numéro, client ou email
 *   AND (c.id_commande::text LIKE :search 
 *        OR u.nom ILIKE :search 
 *        OR u.prenom ILIKE :search
 *        OR u.email ILIKE :search)
 * GROUP BY c.id_commande, c.montant_total, c.statut_commande, c.date_commande, u.nom, u.prenom, u.email
 * ORDER BY c.date_commande DESC
 * LIMIT :limit OFFSET :offset;
 * 
 * Format de réponse API attendu :
 * {
 *   "commandes": [
 *     {
 *       "id_commande": 1284,
 *       "montant_total": 240.00,
 *       "statut_commande": "validée",
 *       "date_commande": "2025-10-24T10:30:00",
 *       "client_nom": "Marie Dubois",
 *       "client_email": "marie.dubois@email.com",
 *       "nombre_articles": 3
 *     },
 *     ...
 *   ],
 *   "total": 150,
 *   "page": 1,
 *   "limit": 20
 * }
 * 
 * @param {Object} options - Options de filtrage
 * @param {string} options.statut - Filtre par statut ('en_cours', 'validée', 'annulée')
 * @param {string} options.recherche - Texte de recherche
 * @param {number} options.page - Numéro de page (défaut: 1)
 * @param {number} options.limit - Nombre d'éléments par page (défaut: 20)
 * @returns {Promise<Object>} - Liste des commandes avec pagination
 */
export async function getCommandes(options = {}) {
  try {
    const { statut = null, recherche = '', page = 1, limit = 20 } = options;
    
    // TODO: Remplacer par un appel API réel
    // const params = new URLSearchParams({
    //   statut: statut || '',
    //   recherche: recherche,
    //   page: page,
    //   limit: limit
    // });
    // const response = await fetch(`/api/commandes?${params}`);
    // const data = await response.json();
    
    // DONNÉES MOCKÉES (à remplacer)
    const toutesLesCommandes = [
      {
        id_commande: 1284,
        montant_total: 240.00,
        statut_commande: 'validée',
        date_commande: '2025-10-24T10:30:00',
        client_nom: 'Marie Dubois',
        client_email: 'marie.dubois@email.com',
        nombre_articles: 3
      },
      {
        id_commande: 1283,
        montant_total: 128.90,
        statut_commande: 'en_cours',
        date_commande: '2025-10-24T09:15:00',
        client_nom: 'Pierre Martin',
        client_email: 'pierre.martin@email.com',
        nombre_articles: 2
      },
      {
        id_commande: 1282,
        montant_total: 320.00,
        statut_commande: 'en_cours',
        date_commande: '2025-10-23T18:45:00',
        client_nom: 'Sophie Laurent',
        client_email: 'sophie.laurent@email.com',
        nombre_articles: 4
      },
      {
        id_commande: 1281,
        montant_total: 95.00,
        statut_commande: 'validée',
        date_commande: '2025-10-23T14:20:00',
        client_nom: 'Luc Bernard',
        client_email: 'luc.bernard@email.com',
        nombre_articles: 1
      },
      {
        id_commande: 1280,
        montant_total: 185.50,
        statut_commande: 'validée',
        date_commande: '2025-10-23T12:10:00',
        client_nom: 'Julie Durand',
        client_email: 'julie.durand@email.com',
        nombre_articles: 2
      },
      {
        id_commande: 1279,
        montant_total: 450.00,
        statut_commande: 'annulée',
        date_commande: '2025-10-23T10:00:00',
        client_nom: 'Thomas Petit',
        client_email: 'thomas.petit@email.com',
        nombre_articles: 5
      },
    ];
    
    // Appliquer les filtres côté frontend (simulation)
    let commandesFiltrees = [...toutesLesCommandes];
    
    // Filtre par statut
    if (statut) {
      commandesFiltrees = commandesFiltrees.filter(cmd => cmd.statut_commande === statut);
    }
    
    // Filtre par recherche
    if (recherche) {
      const rechercheMin = recherche.toLowerCase();
      commandesFiltrees = commandesFiltrees.filter(cmd => 
        cmd.id_commande.toString().includes(rechercheMin) ||
        cmd.client_nom.toLowerCase().includes(rechercheMin) ||
        cmd.client_email.toLowerCase().includes(rechercheMin)
      );
    }
    
    // Pagination
    const total = commandesFiltrees.length;
    const debut = (page - 1) * limit;
    const fin = debut + limit;
    const commandesPaginees = commandesFiltrees.slice(debut, fin);
    
    // Formater les commandes
    const commandesFormatees = commandesPaginees.map(cmd => {
      const montantXAF = convertirEURversXAF(cmd.montant_total);
      
      return {
        id: `CMD-${cmd.id_commande}`,
        idCommande: cmd.id_commande,
        montant: montantXAF,
        montantFormate: formaterMontantXAF(montantXAF),
        montantEUR: cmd.montant_total,
        montantEURFormate: `${cmd.montant_total.toFixed(2)} €`,
        statut: cmd.statut_commande,
        statutLabel: getStatutLabel(cmd.statut_commande),
        statutCouleur: getStatutCouleur(cmd.statut_commande),
        date: cmd.date_commande,
        dateFormatee: formaterDate(cmd.date_commande),
        client: cmd.client_nom,
        email: cmd.client_email,
        nombreArticles: cmd.nombre_articles
      };
    });
    
    return {
      commandes: commandesFormatees,
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit)
    };
    
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    return {
      commandes: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0
    };
  }
}

/**
 * Récupérer les détails d'une commande spécifique
 * 
 * CONNEXION BASE DE DONNÉES :
 * ---------------------------
 * Requête SQL attendue :
 * 
 * SELECT 
 *   c.*,
 *   u.nom || ' ' || u.prenom as client_nom,
 *   u.email as client_email,
 *   u.telephone as client_telephone,
 *   lc.id_ligne_commande,
 *   lc.quantite,
 *   lc.prix_unitaire,
 *   p.nom_plat,
 *   p.description_plat
 * FROM Commande c
 * JOIN "Utilisateur" u ON u.id_user = c.id_client
 * LEFT JOIN Ligne_Commande lc ON lc.id_commande = c.id_commande
 * LEFT JOIN Plat p ON p.id_plat = lc.id_plat
 * WHERE c.id_commande = :id_commande;
 * 
 * @param {number} idCommande - ID de la commande
 * @returns {Promise<Object>} - Détails de la commande
 */
export async function getDetailsCommande(idCommande) {
  try {
    // TODO: Remplacer par un appel API réel
    // const response = await fetch(`/api/commandes/${idCommande}`);
    // const data = await response.json();
    
    // DONNÉES MOCKÉES (à remplacer)
    const commandeMockee = {
      id_commande: idCommande,
      montant_total: 240.00,
      statut_commande: 'validée',
      date_commande: '2025-10-24T10:30:00',
      client_nom: 'Marie Dubois',
      client_email: 'marie.dubois@email.com',
      client_telephone: '+33 6 12 34 56 78',
      adresse_livraison: '123 Rue de la Paix, 75001 Paris',
      articles: [
        {
          id_ligne: 1,
          nom_plat: 'Pizza Margherita',
          description: 'Tomate, mozzarella, basilic',
          quantite: 2,
          prix_unitaire: 12.50
        },
        {
          id_ligne: 2,
          nom_plat: 'Salade César',
          description: 'Salade, poulet, parmesan, croûtons',
          quantite: 1,
          prix_unitaire: 8.90
        }
      ]
    };
    
    return commandeMockee;
    
  } catch (error) {
    console.error('Erreur lors de la récupération des détails:', error);
    return null;
  }
}

/**
 * Obtenir la couleur du statut de commande
 * @param {string} statut - Statut de la commande
 * @returns {string} - Couleur du statut
 */
function getStatutCouleur(statut) {
  const couleurs = {
    'en_cours': 'blue',
    'validée': 'green',
    'annulée': 'red'
  };
  return couleurs[statut] || 'gray';
}

/**
 * Formater une date au format français
 * @param {string} date - Date au format ISO
 * @returns {string} - Date formatée (ex: "24/10/2025")
 */
function formaterDate(date) {
  const d = new Date(date);
  const jour = String(d.getDate()).padStart(2, '0');
  const mois = String(d.getMonth() + 1).padStart(2, '0');
  const annee = d.getFullYear();
  return `${jour}/${mois}/${annee}`;
}

// ============================================================================
// GESTION DES PRIX (CONVERSION ET FORMATAGE)
// ============================================================================

/**
 * Formate un prix (déjà en FCFA) et retourne un objet structuré.
 * @param {number} prixFCFA - Prix en FCFA.
 * @returns {Object} - { xaf, xafFormate }
 */
export function convertirPrix(prixFCFA) {
  const prix = typeof prixFCFA === 'number' && !isNaN(prixFCFA) ? prixFCFA : 0;
  
  return {
    xaf: prix,
    xafFormate: formaterMontantXAF(prix),
  };
}

/**
 * Valider un prix (doit être positif)
 * @param {number} prix - Prix à valider
 * @returns {boolean} - True si valide
 */
export function validerPrix(prix) {
  return typeof prix === 'number' && prix > 0 && !isNaN(prix);
}

/**
 * Calculer le prix total d'une commande
 * @param {Array} articles - Liste des articles { prix, quantite }
 * @returns {Object} - { totalEUR, totalXAF, totalXAFFormate }
 */
export function calculerPrixTotal(articles) {
  const totalFCFA = articles.reduce((sum, article) => {
    return sum + (article.prix * article.quantite);
  }, 0);
  
  return {
    totalXAF: totalFCFA,
    totalXAFFormate: formaterMontantXAF(totalFCFA),
  };
}

/**
 * Arrondir un prix à 2 décimales
 * @param {number} prix - Prix à arrondir
 * @returns {number} - Prix arrondi
 */
export function arrondirPrix(prix) {
  return Math.round(prix * 100) / 100;
}

// ============================================================================
// GESTION DU MENU (PLATS)
// ============================================================================

/**
 * Récupérer tous les plats du menu
 * 
 * CONNEXION BASE DE DONNÉES :
 * ---------------------------
 * Requête SQL attendue :
 * 
 * SELECT 
 *   p.id_plat,
 *   p.nom_plat,
 *   p.description_plat,
 *   p.prix_plat,
 *   p.categorie_plat,
 *   p.disponible,
 *   p.image_url
 * FROM Plat p
 * ORDER BY p.categorie_plat, p.nom_plat;
 * 
 * Format de réponse API attendu :
 * [
 *   {
 *     "id_plat": 1,
 *     "nom_plat": "Burger Premium",
 *     "description_plat": "Pain artisanal, steak 180g...",
 *     "prix_plat": 15.90,
 *     "categorie_plat": "Plats",
 *     "disponible": true,
 *     "image_url": "https://..."
 *   },
 *   ...
 * ]
 * 
 * @param {Object} options - Options de filtrage
 * @param {string} options.categorie - Filtre par catégorie
 * @param {string} options.recherche - Recherche par nom
 * @returns {Promise<Array>} - Liste des plats
 */
export async function getPlatsMenu(options = {}) {
  try {
    const { categorie = null, recherche = '' } = options;
    
    // TODO: Remplacer par un appel API réel
    // const params = new URLSearchParams({
    //   categorie: categorie || '',
    //   recherche: recherche
    // });
    // const response = await fetch(`/api/menu/plats?${params}`);
    // const data = await response.json();
    
    // DONNÉES MOCKÉES (à remplacer)
    const platsMockees = [
      {
        id_plat: 1,
        nom_plat: 'Burger Premium',
        description_plat: 'Pain artisanal, steak 180g, cheddar affiné, sauce maison',
        prix_plat: 15.90,
        categorie_plat: 'Plats',
        disponible: true,
        image_url: null
      },
      {
        id_plat: 2,
        nom_plat: 'Pizza Margherita',
        description_plat: 'Sauce tomate, mozzarella di bufala, basilic frais',
        prix_plat: 12.90,
        categorie_plat: 'Plats',
        disponible: true,
        image_url: null
      },
      {
        id_plat: 3,
        nom_plat: 'Salade César',
        description_plat: 'Laitue, poulet grillé, parmesan, croûtons, sauce césar',
        prix_plat: 9.90,
        categorie_plat: 'Entrées',
        disponible: true,
        image_url: null
      },
      {
        id_plat: 4,
        nom_plat: 'Tiramisu',
        description_plat: 'Mascarpone, café, cacao',
        prix_plat: 6.50,
        categorie_plat: 'Desserts',
        disponible: true,
        image_url: null
      },
      {
        id_plat: 5,
        nom_plat: 'Coca-Cola',
        description_plat: 'Boisson gazeuse 33cl',
        prix_plat: 2.50,
        categorie_plat: 'Boissons',
        disponible: true,
        image_url: null
      },
    ];
    
    // Appliquer les filtres
    let platsFiltres = [...platsMockees];
    
    if (categorie) {
      platsFiltres = platsFiltres.filter(p => p.categorie_plat === categorie);
    }
    
    if (recherche) {
      const rechercheMin = recherche.toLowerCase();
      platsFiltres = platsFiltres.filter(p => 
        p.nom_plat.toLowerCase().includes(rechercheMin) ||
        p.description_plat.toLowerCase().includes(rechercheMin)
      );
    }
    
    // Formater les plats avec conversion XAF
    const platsFormates = platsFiltres.map(plat => {
      const prix = convertirPrix(plat.prix_plat); // Le prix est déjà en FCFA
      
      return {
        id: plat.id_plat.toString(),
        idPlat: plat.id_plat,
        nom: plat.nom_plat,
        description: plat.description_plat,
        prixXAF: prix.xaf,
        prixFormate: prix.xafFormate,
        categorie: plat.categorie_plat,
        disponible: plat.disponible,
        statut: plat.disponible ? 'available' : 'unavailable',
        image: plat.image_url
      };
    });
    
    return platsFormates;
    
  } catch (error) {
    console.error('Erreur lors de la récupération des plats:', error);
    return [];
  }
}

/**
 * Créer ou mettre à jour un plat
 * 
 * @param {Object} plat - Données du plat
 * @param {string} plat.nom - Nom du plat
 * @param {string} plat.description - Description du plat
 * @param {number} plat.prixFCFA - Prix en FCFA
 * @param {string} plat.categorie - Catégorie
 * @param {boolean} plat.disponible - Disponibilité
 * @returns {Promise<Object>} - Plat créé/mis à jour
 */
export async function sauvegarderPlat(plat) {
  try {
    if (!validerPrix(plat.prixFCFA)) {
      throw new Error('Prix invalide');
    }
    
    // TODO: Remplacer par un appel API réel
    // const response = await fetch('/api/menu/plats', {
    //   method: plat.id ? 'PUT' : 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     id_plat: plat.id,
    //     nom_plat: plat.nom,
    //     description_plat: plat.description,
    //     prix_plat: plat.prixFCFA,
        
    //     categorie_plat: plat.categorie,
    //     disponible: plat.disponible
    //   })
    // });
    // const data = await response.json();
    
    console.log('Plat sauvegardé:', plat);
    return plat;
    
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du plat:', error);
    throw error;
  }
}

/**
 * Supprimer un plat
 * 
 * @param {number} idPlat - ID du plat à supprimer
 * @returns {Promise<boolean>} - True si succès
 */
export async function supprimerPlat(idPlat) {
  try {
    // TODO: Remplacer par un appel API réel
    // const response = await fetch(`/api/menu/plats/${idPlat}`, {
    //   method: 'DELETE'
    // });
    // return response.ok;
    
    console.log('Plat supprimé:', idPlat);
    return true;
    
  } catch (error) {
    console.error('Erreur lors de la suppression du plat:', error);
    return false;
  }
}

/**
 * Récupérer les catégories de plats
 * 
 * @returns {Promise<Array>} - Liste des catégories
 */
export async function getCategoriesMenu() {
  try {
    // TODO: Remplacer par un appel API réel
    // const response = await fetch('/api/menu/categories');
    // const data = await response.json();
    
    return [
      { id: 'entrees', nom: 'Entrées', icone: 'UtensilsCrossed' },
      { id: 'plats', nom: 'Plats', icone: 'ChefHat' },
      { id: 'desserts', nom: 'Desserts', icone: 'Cake' },
      { id: 'boissons', nom: 'Boissons', icone: 'Coffee' }
    ];
    
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return [];
  }
}

// ============================================================================
// STATISTIQUES GLOBALES
// ============================================================================

/**
 * Récupérer toutes les statistiques du dashboard
 * 
 * CONNEXION BASE DE DONNÉES :
 * ---------------------------
 * Utiliser la fonction PostgreSQL existante :
 * SELECT * FROM get_dashboard_stats();
 * 
 * Cette fonction retourne :
 * - total_commandes_jour
 * - total_clients
 * - total_reclamations
 * - total_points_fidelite
 * 
 * @returns {Promise<Object>} - Toutes les stats du dashboard
 */
// Pour les statistiques principales
export async function getStatsDashboard() {
  try {
    const restaurantId = getRestaurantId();
    const url = new URL('api/dashboard/stats', API_URL);
    if (restaurantId) url.searchParams.set('restaurant_id', restaurantId);
    const response = await fetch(url.toString());
    const data = await response.json();

    const totalFCFA = Number(data.ventes_aujourdhui_xaf ?? data.ventes_aujourdhui ?? 0) || 0;

    return {
      ventesAujourdhui: {
        total: totalFCFA,
        totalFormate: formaterMontantXAF(totalFCFA)
      },
      utilisateursActifs: data.utilisateurs_actifs ?? 0,
      reclamations: data.reclamations ?? 0,
      pointsFidelite: data.points_fidelite ?? 0,
      pourcentage_utilisateurs_ajoutes_ce_mois: data.pourcentage_utilisateurs_ajoutes_ce_mois ?? 0,
      reclamations_non_traitees: data.reclamations_non_traitees ?? 0,
      pourcentage_reclamation_non_traite_ajoute_ce_mois: data.pourcentage_reclamation_non_traite_ajoute_ce_mois ?? 0,
      pourcentage_points_donne_ce_mois: data.pourcentage_points_donne_ce_mois ?? 0,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return null;
  }
}

// Pour les autres endpoints
export async function getUserdistribution() {
  const restaurantId = getRestaurantId();
  const url = new URL('api/dashboard/user-distribution', API_URL);
  if (restaurantId) url.searchParams.set('restaurant_id', restaurantId);
  const response = await fetch(url.toString());
  return await response.json();
}

export async function getRecentOrder(){
  const restaurantId = getRestaurantId();
  const url = new URL('api/dashboard/recent-orders', API_URL);
  if (restaurantId) url.searchParams.set('restaurant_id', restaurantId);
  const response = await fetch(url.toString());
  return await response.json();
}

export async function getRecentComplaints() {
  const restaurantId = getRestaurantId();
  const url = new URL('api/dashboard/recent-complaints', API_URL);
  if (restaurantId) url.searchParams.set('restaurant_id', restaurantId);
  const response = await fetch(url.toString());
  return await response.json();
}

// ============================================================================
// EXEMPLE D'UTILISATION DANS UN COMPOSANT REACT
// ============================================================================

/**
 * EXEMPLE D'INTÉGRATION DANS Dashboard.tsx :
 * 
 * import { getVentesAujourdhui, getStatsDashboard } from '@/services/dashboard';
 * 
 * function Dashboard() {
 *   const [ventes, setVentes] = useState(null);
 *   
 *   useEffect(() => {
 *     async function chargerVentes() {
 *       const data = await getVentesAujourdhui();
 *       setVentes(data);
 *     }
 *     chargerVentes();
 *   }, []);
 *   
 *   return (
 *     <div>
 *       <h3>Ventes Aujourd'hui</h3>
 *       <p>{ventes?.totalFormate}</p>
 *       <p>+{ventes?.pourcentage_vs_hier}% vs hier</p>
 *     </div>
 *   );
 * }
 */
