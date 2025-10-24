<?php

use App\Http\Controllers\Api\administrateurController;
use App\Http\Controllers\Api\UtilisateurController;
use App\Models\Utilisateur;
use App\Http\Controllers\Api\fileController;
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
