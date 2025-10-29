<?php

use App\Http\Controllers\Api\administrateurController;
use App\Http\Controllers\Api\UtilisateurController;
use App\Models\Utilisateur;
use App\Http\Controllers\Api\fileController;
use App\Http\Controllers\Api\choisir_menu_jourController;
use App\Models\choisir_menu_jour;
use App\Http\Controllers\Api\clientController;
use App\Http\Controllers\Api\promotionController;
use App\Http\Controllers\Api\notificationsController;
use App\Http\Controllers\Api\menuController;
use App\Http\Controllers\Api\restaurantController;
use App\Http\Controllers\Api\reponseController;
use App\Http\Controllers\Api\reclamationController;
use App\Http\Controllers\employeController;
use App\Http\Controllers\Api\statsDashboardAdminController;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/utilisateurs', [UtilisateurController::class, 'index']);
Route::get('/utilisateurs/{id}', [UtilisateurController::class, 'show']);
Route::post('/utilisateurs', [UtilisateurController::class, 'store']);
Route::put('/utilisateurs/{id}', [UtilisateurController::class, 'update']);
Route::delete('/utilisateurs/{id}', [UtilisateurController::class, 'destroy']);
Route::get('/checkUserDejaEmploye', [UtilisateurController::class, 'checkUserDejaEmploye']);
Route::post('/getRestaurantsUtilisateur', [UtilisateurController::class, 'getRestaurantsUtilisateur']);

// Vérifications et authentification
Route::post('/checkEmailExiste', [UtilisateurController::class, 'checkEmailExiste']);
Route::post('/checkPasswordCorrect', [UtilisateurController::class, 'checkPasswordCorrect']);
Route::post('/codeVerification', [UtilisateurController::class, 'sendCodeVerification']);

// 🛠️ Correction ici : il faut mettre les crochets [] autour du contrôleur et de la méthode
Route::post('/login', [UtilisateurController::class, 'login']);
Route::post('/inscription', [UtilisateurController::class, 'inscription']);
Route::post('/token_inscription', [UtilisateurController::class, 'token_inscription']);
Route::post('/deconnexion', [UtilisateurController::class, 'logout']);

Route::get('/administrateurs', [administrateurController::class, 'index']);
Route::get('/administrateurs/{id}', [administrateurController::class, 'show']);
Route::post('/administrateurs', [administrateurController::class, 'store']);
Route::put('/administrateurs/{id}', [administrateurController::class, 'update']);
Route::delete('/administrateurs/{id}', [administrateurController::class, 'destroy']);
Route::get('/getemployeesrestaurant/{id}', [administrateurController::class, 'getEmployees']);
Route::post('/createemployee', [administrateurController::class, 'createEmployee']);
Route::post('/desactiveremploye', [administrateurController::class, 'desactiverEmploye']);

// Routes pour les fichiers

Route::prefix('files')->group(function () {
    Route::get('/', [FileController::class, 'index']);
    Route::post('/upload', [FileController::class, 'upload']);
    Route::get('/{id}', [FileController::class, 'show']);
    Route::delete('/{id}', [FileController::class, 'destroy']);
    Route::put('/{id}', [FileController::class, 'replaceSimple']);
});

Route::get('/choisir_menu_jour', [choisir_menu_jourController::class, 'index']);
Route::get('/choisir_menu_jour/popularite', [choisir_menu_jourController::class, 'menusParPopularite']);

Route::get('/clients', [ClientController::class, 'index']);
Route::get('/clients/{id}', [ClientController::class, 'show']);
Route::put('/clients/{id}', [ClientController::class, 'update']);
Route::delete('/clients/{id}', [ClientController::class, 'destroy']);
Route::prefix('client')->group(function () {
    // GET /api/client/{id}/filleuls
    Route::get('{id}/filleuls', [ClientController::class, 'totalFilleuls']);

    // GET /api/client/{id}/commandes
    Route::get('{id}/commandes', [ClientController::class, 'totalCommandes']);

    // GET /api/client/{id}/points
    Route::get('{id}/points', [ClientController::class, 'pointsFidelite']);

    // GET /api/client/{id}/dashboard-stats
    Route::get('{id}/dashboard-stats', [ClientController::class, 'dashboardStats']);

    // GET /api/client/{id}/commandes-recentes
    Route::get('{id}/commandes-recentes', [ClientController::class, 'commandesRecentes']);

    // GET /api/client/{id}/details-fidelite
    Route::get('{id}/details-fidelite', [ClientController::class, 'detailsFidelite']);

    // NEW: GET /api/client/{id}/referral-details
    Route::get('{id}/referral-details', [ClientController::class, 'referralDetails']);

    // NEW: POST /api/client/{id}/bonus-quotidien
    Route::post('{id}/bonus-quotidien', [ClientController::class, 'claimDailyBonus']);

    // GET /api/client/top-clients
    Route::get('top-clients', [ClientController::class, 'topClients']);
});

// Routes pour les promotions
Route::get('/promotions/actives', [promotionController::class, 'promotionsActives']);
Route::get('/promotions', [promotionController::class, 'index']);
Route::post('/promotions', [promotionController::class, 'store']);
Route::put('/promotions/{id}', [promotionController::class, 'update']);
Route::get('/promotions/{id}/menus', [promotionController::class, 'getMenusPromotion']);

// Routes pour les notifications
Route::prefix('notifications')->group(function () {
    // GET /api/notifications/client/{id}
    Route::get('client/{id}', [notificationsController::class, 'notificationsClient']);

    // PUT /api/notifications/{id_notification}/client/{id_client}/marquer-lue
    Route::put('{id_notification}/client/{id_client}/marquer-lue', [notificationsController::class, 'marquerLue']);
});

// Routes pour les menus
Route::get('/menu/{id_menu}/restaurant', [menuController::class, 'getRestaurantByMenuId']);

// Routes pour les restaurants
Route::get('/restaurants', [restaurantController::class, 'index']);
Route::get('/restaurants/{id}', [restaurantController::class, 'show']);
Route::post('/restaurants', [restaurantController::class, 'store']);
Route::put('/restaurants/{id}', [restaurantController::class, 'update']);
Route::delete('/restaurants/{id}', [restaurantController::class, 'destroy']);

Route::post('/commandes', [fileController::class, 'commander']);
Route::post('/getUserbyEmail', [UtilisateurController::class, 'getByEmail']);

Route::get('/getCommandesByUser/{id_user}', [UtilisateurController::class, 'getCommandesByUser']);
Route::put('/updateCommande/{id_commande}', [UtilisateurController::class, 'updateCommande']);

Route::get('/reclamations/client/{id_client}', [reclamationController::class, 'indexClient']);
Route::get('/reclamations/restaurant/{id_restaurant}', [reclamationController::class, 'indexRestaurant']);
Route::post('/reclamations', [reclamationController::class, 'store']);
Route::get('/reclamations/{id}', [reclamationController::class, 'show']);
Route::put('/reclamations/{id}/status', [reclamationController::class, 'updateStatus']);
Route::put('/reclamations/{id}/close', [reclamationController::class, 'close']);

Route::get('/reclamations/{id}/reponses', [reponseController::class, 'index']);
Route::post('/reclamations/{id}/reponses', [reponseController::class, 'store']);

Route::get('/employe/dashboard/kpis', [UtilisateurController::class, 'dashboardKpis']);
Route::get('/menu/{id_restaurant}/items', [menuController::class, 'getAllMenuItems']);
Route::post('/menu', [menuController::class, 'index']);
Route::put('/menu/{id_menu}', [menuController::class, 'update']);

// Routes pour les statistiques admin

Route::get('/dashboard/ventes-aujourdhui', [statsDashboardAdminController::class, 'getVentesAujourdhui']);
Route::get('/dashboard/stats', [statsDashboardAdminController::class, 'getStatsDashboard']);
Route::get('/dashboard/user-distribution', [statsDashboardAdminController::class, 'getUserDistribution']);
Route::get('/dashboard/recent-orders', [statsDashboardAdminController::class, 'getRecentOrders']);
Route::get('/dashboard/recent-complaints', [statsDashboardAdminController::class, 'getRecentComplaints']);
Route::get('/dashboard/ventes-semaine', [statsDashboardAdminController::class, 'getVentesSemaine']);

Route::get('/orders', [statsDashboardAdminController::class, 'getOrders']);

// ReportsPage endpoints
Route::get('/dashboard/reports/monthly-revenue', [statsDashboardAdminController::class, 'getMonthlyRevenue']);
Route::get('/dashboard/reports/category-distribution', [statsDashboardAdminController::class, 'getCategoryDistribution']);
Route::get('/dashboard/reports/top-products', [statsDashboardAdminController::class, 'getTopProducts']);
Route::get('/dashboard/reports/hourly-orders', [statsDashboardAdminController::class, 'getHourlyOrders']);
Route::get('/dashboard/reports/kpis', [statsDashboardAdminController::class, 'getReportsKpis']);
Route::get('/dashboard/reports/summary', [statsDashboardAdminController::class, 'getMonthlySummary']);
Route::get('/dashboard/reports/all', [statsDashboardAdminController::class, 'getReportsAll']);

Route::post('/promotions/ajouter-menus', [promotionController::class, 'ajouterPlusieursMenusPromotion']);
Route::post('/promotions/supprimer-menus', [promotionController::class, 'supprimerMenusPromotion']);
