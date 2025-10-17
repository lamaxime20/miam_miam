<?php

use App\Http\Controllers\Api\UtilisateurController;
use App\Http\Controllers\Api\GerantController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/utilisateurs', [UtilisateurController::class, 'index']);
Route::get('/utilisateurs/{id}', [UtilisateurController::class, 'show']);
Route::post('/utilisateurs', [UtilisateurController::class, 'store']);
Route::put('/utilisateurs/{id}', [UtilisateurController::class, 'update']);
Route::delete('/utilisateurs/{id}', [UtilisateurController::class, 'destroy']);

Route::get('/gerant', [GerantController::class, 'index']);
Route::post('/gerant', [GerantController::class, 'store']);
Route::delete('/gerant/{id}', [GerantController::class, 'destroy']);