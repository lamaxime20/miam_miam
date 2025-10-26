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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/utilisateurs', [UtilisateurController::class, 'index']);
Route::get('/utilisateurs/{id}', [UtilisateurController::class, 'show']);
Route::post('/utilisateurs', [UtilisateurController::class, 'store']);
Route::put('/utilisateurs/{id}', [UtilisateurController::class, 'update']);
Route::delete('/utilisateurs/{id}', [UtilisateurController::class, 'destroy']);

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
Route::get('/files', [fileController::class, 'index']);
Route::get('/files/{id}', [fileController::class, 'show']);
Route::post('/files', [fileController::class, 'store']);
Route::put('/files/{id}', [fileController::class, 'update']);
Route::delete('/files/{id}', [fileController::class, 'destroy']);

Route::get('/choisir_menu_jour', [choisir_menu_jourController::class, 'index']);
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

    // GET /api/client/top-clients
    Route::get('top-clients', [ClientController::class, 'topClients']);
});

// Routes pour les promotions
Route::get('/promotions/actives', [promotionController::class, 'promotionsActives']);

// Routes pour les notifications
Route::prefix('notifications')->group(function () {
    // GET /api/notifications/client/{id}
    Route::get('client/{id}', [notificationsController::class, 'notificationsClient']);

    // PUT /api/notifications/{id_notification}/client/{id_client}/marquer-lue
    Route::put('{id_notification}/client/{id_client}/marquer-lue', [notificationsController::class, 'marquerLue']);
});
