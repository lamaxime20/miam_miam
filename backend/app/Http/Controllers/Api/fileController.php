<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    /**
     * Récupérer tous les fichiers
     */
    public function index(): JsonResponse
    {
        $files = DB::select('SELECT * FROM get_all_files()');
        return response()->json($files, 200);
    }

    /**
     * Upload et enregistrement du fichier
     */
    public function store(Request $request): JsonResponse
    {
        // Vérifie qu’un fichier a bien été envoyé
        if (!$request->hasFile('file')) {
            return response()->json(['error' => 'Aucun fichier reçu.'], 400);
        }

        $file = $request->file('file');

        // Vérifie que le fichier est valide
        if (!$file->isValid()) {
            return response()->json(['error' => 'Fichier invalide.'], 400);
        }

        // Enregistre le fichier dans "storage/app/public/uploads"
        $path = $file->store('uploads', 'public');

        // Prépare les données pour la base
        $nomFichier = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $extension = $file->getClientOriginalExtension();
        $chemin = 'storage/' . $path;

        // Enregistre dans la base via ta fonction PL/pgSQL
        $result = DB::select('SELECT * FROM creer_file(?, ?, ?)', [
            $nomFichier,
            $extension,
            $chemin,
        ]);

        return response()->json([
            'message' => $result[0]->message ?? 'fichier created successfully',
            'id' => $result[0]->id,
            'nom_fichier' => $nomFichier,
            'extension' => $extension,
            'chemin' => $chemin,
            'url' => asset($chemin),
        ], 201);
    }

    /**
     * Récupérer un fichier par ID
     */
    public function show(string $id): JsonResponse
    {
        $file = DB::select('SELECT * FROM get_one_file(?)', [$id]);

        if (empty($file)) {
            return response()->json(['message' => 'fichier introuvable'], 404);
        }

        $fileData = (array) $file[0];

        // Chemin complet vers le fichier sur le serveur
        $fullPath = public_path($fileData['chemin']);

        if (!file_exists($fullPath)) {
            return response()->json([
                'message' => 'Fichier introuvable sur le disque',
                'info' => $fileData
            ], 404);
        }

        // Lire le contenu du fichier et l’encoder en base64 pour transmission JSON
        $content = base64_encode(file_get_contents($fullPath));

        // Retourner les métadonnées + le contenu encodé
        return response()->json([
            'id_File' => $fileData['id_file'],
            'nom_fichier' => $fileData['nom_fichier'],
            'extension' => $fileData['extension'],
            'chemin' => $fileData['chemin'],
            'contenu_base64' => $content,
        ], 200);
    }

    /**
     * Mettre à jour les informations d’un fichier
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
            'message' => $result[0]->update_file ?? 'fichier mis à jour',
        ], 200);
    }

    /**
     * Supprimer un fichier (physiquement + dans la BD)
     */
    public function destroy(string $id): JsonResponse
    {
        // Récupère le chemin avant suppression
        $file = DB::select('SELECT * FROM get_one_file(?)', [$id]);
        if (empty($file)) {
            return response()->json(['message' => 'fichier introuvable'], 404);
        }

        $chemin = $file[0]->chemin ?? null;

        // Supprime d’abord le fichier physique
        if ($chemin && Storage::disk('public')->exists(str_replace('storage/', '', $chemin))) {
            Storage::disk('public')->delete(str_replace('storage/', '', $chemin));
        }

        // Supprime ensuite de la base
        $result = DB::select('SELECT delete_file(?)', [$id]);
        $message = $result[0]->delete_file ?? 'fichier supprimé';

        return response()->json([
            'message' => $message,
        ], 200);
    }
}