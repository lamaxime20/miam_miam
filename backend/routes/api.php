<?php

use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\UtilisateurController;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/utilisateurs', [UtilisateurController::class, 'index']);
Route::get('/utilisateurs/{id}', [UtilisateurController::class, 'show']);
Route::post('/utilisateurs', [UtilisateurController::class, 'store']);
Route::put('/utilisateurs/{id}', [UtilisateurController::class, 'update']);
Route::delete('/utilisateurs/{id}', [UtilisateurController::class, 'destroy']);

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
});