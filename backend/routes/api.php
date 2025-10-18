<?php
use App\Http\Controllers\Api\UtilisateurController;
use App\Http\Controllers\Api\restaurantController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/utilisateurs', [UtilisateurController::class, 'index']);
Route::get('/utilisateurs/{id}', [UtilisateurController::class, 'show']);
Route::post('/utilisateurs', [UtilisateurController::class, 'store']);
Route::put('/utilisateurs/{id}', [UtilisateurController::class, 'update']);
Route::delete('/utilisateurs/{id}', [UtilisateurController::class, 'destroy']);

Route::get('/restaurants', [restaurantController::class, 'index']);
Route::get('/restaurants/{id}', [restaurantController::class, 'show']);
Route::post('/restaurants', [restaurantController::class, 'store']);
Route::put('/restaurants/{id}', [restaurantController::class, 'update']);
Route::delete('/restaurants/{id}', [restaurantController::class, 'destroy']);