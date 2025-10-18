<?php

use App\Http\Controllers\Api\UtilisateurController;
use App\Http\Controllers\Api\fileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/utilisateurs', [UtilisateurController::class, 'index']);
Route::get('/utilisateurs/{id}', [UtilisateurController::class, 'show']);
Route::post('/utilisateurs', [UtilisateurController::class, 'store']);
Route::put('/utilisateurs/{id}', [UtilisateurController::class, 'update']);
Route::delete('/utilisateurs/{id}', [UtilisateurController::class, 'destroy']);

Route::get('/files', [fileController::class, 'index']);
Route::get('/files/{id}', [fileController::class, 'show']);
Route::post('/files', [fileController::class, 'store']);
Route::put('/files/{id}', [fileController::class, 'update']);
Route::delete('/files/{id}', [fileController::class, 'destroy']);