<?php

use App\Http\Controllers\Api\UtilisateurController;
use App\Http\Controllers\Api\livreurController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/utilisateurs', [UtilisateurController::class, 'index']);
Route::get('/utilisateurs/{id}', [UtilisateurController::class, 'show']);
Route::post('/utilisateurs', [UtilisateurController::class, 'store']);
Route::put('/utilisateurs/{id}', [UtilisateurController::class, 'update']);
Route::delete('/utilisateurs/{id}', [UtilisateurController::class, 'destroy']);

Route::get('/livreurs', [livreurController::class, 'index']);
Route::get('/livreurs/{id}', [livreurController::class, 'show']);
Route::post('/livreurs', [livreurController::class, 'store']);
Route::put('/livreurs/{id}', [livreurController::class, 'update']);
Route::delete('/livreurs/{id}', [livreurController::class, 'destroy']);