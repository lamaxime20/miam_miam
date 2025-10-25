<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class restaurantController extends Controller
{
    /**
     * Affiche la liste de tous les restaurants.
     */
    public function index(): JsonResponse
    {
        $restaurants = DB::select('SELECT * FROM get_all_restaurants()');
        return response()->json($restaurants, 200);
    }

    /**
     * Enregistre un nouveau restaurant.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom_restaurant' => 'required|string|max:255',
            'localisation' => 'required|string',
            'type_localisation' => 'required|string|max:100',
            'logo_restaurant' => 'required|integer',
            'politique' => 'required|string',
            'administrateur' => 'required|integer',
        ]);

        $result = DB::select('SELECT * FROM creer_restaurant(?, ?, ?, ?, ?, ?)', [
            $validated['nom_restaurant'],
            $validated['localisation'],
            $validated['type_localisation'],
            $validated['logo_restaurant'],
            $validated['politique'],
            $validated['administrateur'],
        ]);

        return response()->json([
            'id_restaurant' => $result[0]->id_restaurant ?? null,
            'message' => $result[0]->message ?? 'Restaurant créé avec succès.',
        ], 201);
    }

    /**
     * Affiche les informations d’un restaurant donné.
     */
    public function show(string $id): JsonResponse
    {
        $restaurant = DB::select('SELECT * FROM get_one_restaurant(?)', [$id]);

        if (empty($restaurant)) {
            return response()->json(['message' => 'Restaurant introuvable.'], 404);
        }

        return response()->json($restaurant[0], 200);
    }

    /**
     * Met à jour les informations d’un restaurant.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $data = $request->only([
            'nom_restaurant',
            'localisation',
            'type_localisation',
            'logo_restaurant',
            'politique',
            'administrateur',
        ]);

        $result = DB::select('SELECT update_restaurant(?, ?, ?, ?, ?, ?, ?)', [
            $id,
            $data['nom_restaurant'] ?? null,
            $data['localisation'] ?? null,
            $data['type_localisation'] ?? null,
            $data['logo_restaurant'] ?? null,
            $data['politique'] ?? null,
            $data['administrateur'] ?? null,
        ]);

        $message = $result[0]->update_restaurant ?? 'Restaurant mis à jour avec succès.';

        return response()->json(['message' => $message], 200);
    }

    /**
     * Supprime un restaurant.
     */
    public function destroy(string $id): JsonResponse
    {
        $result = DB::select('SELECT delete_restaurant(?)', [$id]);
        $message = $result[0]->delete_restaurant ?? null;

        if (!$message || str_contains(strtolower($message), 'aucun')) {
            return response()->json(['message' => 'Restaurant introuvable.'], 404);
        }

        return response()->json(['message' => 'Restaurant supprimé avec succès.'], 204);
    }
}