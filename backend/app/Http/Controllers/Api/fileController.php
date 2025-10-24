<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class fileController extends Controller
{
    /**
     * Afficher tous les fichiers
     */
    public function index(): JsonResponse
    {
        $files = DB::select('SELECT * FROM get_all_files()');
        return response()->json($files, 200);
    }

    /**
     * Créer un nouveau fichier
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom_fichier' => 'required|string|max:255',
            'extension' => 'required|string|max:10',
            'chemin' => 'required|string|max:255',
        ]);

        $result = DB::select(
            'SELECT * FROM creer_file(?, ?, ?)',
            [$validated['nom_fichier'], $validated['extension'], $validated['chemin']]
        );

        return response()->json([
            'message' => 'fichier created successfully',
            'id' => $result[0]->id,
        ], 201);
    }

    /**
     * Afficher un fichier par ID
     */
    public function show(string $id): JsonResponse
    {
        $file = DB::select('SELECT * FROM get_one_file(?)', [$id]);

        if (empty($file)) {
            return response()->json(['message' => 'fichier introuvable'], 404);
        }

        return response()->json($file[0], 200);
    }

    /**
     * Mettre à jour un fichier
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'nom_fichier' => 'sometimes|string|max:255|nullable',
            'extension' => 'sometimes|string|max:10|nullable',
            'chemin' => 'sometimes|string|max:255|nullable',
        ]);

        $result = DB::select(
            'SELECT update_file(?, ?, ?, ?)',
            [
                $id,
                $validated['nom_fichier'] ?? null,
                $validated['extension'] ?? null,
                $validated['chemin'] ?? null,
            ]
        );

        return response()->json([
            'message' => $result[0]->update_file,
        ], 200);
    }

    /**
     * Supprimer un fichier
     */
    public function destroy(string $id): JsonResponse
    {
        $result = DB::select('SELECT delete_file(?)', [$id]);
        $message = $result[0]->delete_file;

        return response()->json([
            'message' => $message,
        ], 204);
    }
}