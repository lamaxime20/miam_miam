<?php

use App\Http\Controllers\Api\administrateurController;
use App\Http\Controllers\Api\UtilisateurController;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/utilisateurs', [UtilisateurController::class, 'index']);
Route::get('/utilisateurs/{id}', [UtilisateurController::class, 'show']);
Route::post('/utilisateurs', [UtilisateurController::class, 'store']);
Route::put('/utilisateurs/{id}', [UtilisateurController::class, 'update']);
Route::delete('/utilisateurs/{id}', [UtilisateurController::class, 'destroy']);

// Vérifications et authentification
Route::get('/checkEmailExiste', [UtilisateurController::class, 'checkEmailExiste']);
Route::get('/checkPasswordCorrect', [UtilisateurController::class, 'checkPasswordCorrect']);

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