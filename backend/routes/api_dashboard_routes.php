<?php

/**
 * Routes API pour le Dashboard Admin
 * 
 * À AJOUTER DANS : backend/routes/api.php
 * 
 * INSTRUCTIONS :
 * 1. Copier ce contenu dans backend/routes/api.php
 * 2. Ou inclure ce fichier avec : require __DIR__.'/api_dashboard_routes.php';
 * 3. Tester les endpoints avec Postman ou curl
 */

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

/**
 * Routes Dashboard Admin
 * Préfixe : /api/dashboard
 * 
 * Exemples d'URLs :
 * - GET http://localhost:8000/api/dashboard/ventes-aujourdhui
 * - GET http://localhost:8000/api/dashboard/ventes-semaine
 * - GET http://localhost:8000/api/dashboard/stats
 * - GET http://localhost:8000/api/dashboard/commandes-recentes
 */
Route::prefix('dashboard')->group(function () {
    
    /**
     * GET /api/dashboard/ventes-aujourdhui
     * Récupère le total des ventes du jour et le pourcentage vs hier
     */
    Route::get('/ventes-aujourdhui', [DashboardController::class, 'getVentesAujourdhui']);
    
    /**
     * GET /api/dashboard/ventes-semaine
     * Récupère les ventes des 7 derniers jours
     */
    Route::get('/ventes-semaine', [DashboardController::class, 'getVentesSemaine']);
    
    /**
     * GET /api/dashboard/stats
     * Récupère toutes les statistiques du dashboard
     */
    Route::get('/stats', [DashboardController::class, 'getStatsDashboard']);
    
    /**
     * GET /api/dashboard/commandes-recentes
     * Récupère les 10 dernières commandes
     */
    Route::get('/commandes-recentes', [DashboardController::class, 'getCommandesRecentes']);
    
    /**
     * GET /api/dashboard/utilisateurs-actifs-mois
     * Récupère le nombre d'utilisateurs actifs ce mois
     */
    Route::get('/utilisateurs-actifs-mois', [DashboardController::class, 'getUtilisateursActifsMois']);
    
    /**
     * GET /api/dashboard/utilisateurs-par-mois
     * Récupère les utilisateurs actifs par mois (12 derniers mois)
     */
    Route::get('/utilisateurs-par-mois', [DashboardController::class, 'getUtilisateursParMois']);
    
    /**
     * GET /api/dashboard/utilisateurs-par-semaine
     * Récupère les utilisateurs actifs par semaine (8 dernières semaines)
     */
    Route::get('/utilisateurs-par-semaine', [DashboardController::class, 'getUtilisateursParSemaine']);
    
    /**
     * GET /api/dashboard/reclamations
     * Récupère le nombre total de réclamations et les non traitées
     */
    Route::get('/reclamations', [DashboardController::class, 'getReclamations']);
    
    /**
     * GET /api/dashboard/reclamations-par-mois
     * Récupère les réclamations par mois (12 derniers mois)
     */
    Route::get('/reclamations-par-mois', [DashboardController::class, 'getReclamationsParMois']);
    
    /**
     * GET /api/dashboard/reclamations-par-statut
     * Récupère les réclamations par statut
     */
    Route::get('/reclamations-par-statut', [DashboardController::class, 'getReclamationsParStatut']);
    
    /**
     * GET /api/dashboard/points-fidelite
     * Récupère le total des points de fidélité distribués
     */
    Route::get('/points-fidelite', [DashboardController::class, 'getPointsFidelite']);
    
    /**
     * GET /api/dashboard/points-fidelite-par-mois
     * Récupère les points de fidélité distribués par mois (12 derniers mois)
     */
    Route::get('/points-fidelite-par-mois', [DashboardController::class, 'getPointsFideliteParMois']);
    
    /**
     * GET /api/dashboard/points-fidelite-stats
     * Récupère les statistiques des points par client
     */
    Route::get('/points-fidelite-stats', [DashboardController::class, 'getStatistiquesPointsParClient']);
    
    /**
     * GET /api/dashboard/repartition-clients
     * Récupère la répartition des clients (actifs, nouveaux, fidèles)
     */
    Route::get('/repartition-clients', [DashboardController::class, 'getRepartitionClients']);
    
    /**
     * GET /api/dashboard/commandes-recentes
     * Récupère les 10 dernières commandes
     */
    Route::get('/commandes-recentes', [DashboardController::class, 'getCommandesRecentes']);
    
    /**
     * GET /api/dashboard/reclamations-recentes
     * Récupère les 10 dernières réclamations
     */
    Route::get('/reclamations-recentes', [DashboardController::class, 'getReclamationsRecentes']);
});

/**
 * TESTS AVEC CURL :
 * 
 * # Ventes du jour
 * curl http://localhost:8000/api/dashboard/ventes-aujourdhui
 * 
 * # Ventes de la semaine
 * curl http://localhost:8000/api/dashboard/ventes-semaine
 * 
 * # Toutes les stats
 * curl http://localhost:8000/api/dashboard/stats
 * 
 * # Commandes récentes
 * curl http://localhost:8000/api/dashboard/commandes-recentes
 * 
 * # Utilisateurs actifs ce mois
 * curl http://localhost:8000/api/dashboard/utilisateurs-actifs-mois
 * 
 * # Utilisateurs par mois
 * curl http://localhost:8000/api/dashboard/utilisateurs-par-mois
 * 
 * # Utilisateurs par semaine
 * curl http://localhost:8000/api/dashboard/utilisateurs-par-semaine
 * 
 * # Réclamations totales
 * curl http://localhost:8000/api/dashboard/reclamations
 * 
 * # Réclamations par mois
 * curl http://localhost:8000/api/dashboard/reclamations-par-mois
 * 
 * # Réclamations par statut
 * curl http://localhost:8000/api/dashboard/reclamations-par-statut
 * 
 * # Points de fidélité totaux
 * curl http://localhost:8000/api/dashboard/points-fidelite
 * 
 * # Points de fidélité par mois
 * curl http://localhost:8000/api/dashboard/points-fidelite-par-mois
 * 
 * # Statistiques points par client
 * curl http://localhost:8000/api/dashboard/points-fidelite-stats
 * 
 * # Répartition des clients
 * curl http://localhost:8000/api/dashboard/repartition-clients
 * 
 * # Commandes récentes
 * curl http://localhost:8000/api/dashboard/commandes-recentes
 * 
 * # Réclamations récentes
 * curl http://localhost:8000/api/dashboard/reclamations-recentes
 */

/**
 * CONFIGURATION CORS (si nécessaire)
 * 
 * Ajouter dans backend/config/cors.php :
 * 
 * 'paths' => ['api/*', 'sanctum/csrf-cookie'],
 * 'allowed_origins' => ['http://localhost:5173', 'http://localhost:3000'],
 * 'allowed_methods' => ['*'],
 * 'allowed_headers' => ['*'],
 * 'exposed_headers' => [],
 * 'max_age' => 0,
 * 'supports_credentials' => false,
 */
