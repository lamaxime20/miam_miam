<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Http\Controllers\Api\file;

class fileController extends Controller
{
    /**
     * Afficher tous les fichiers
     */
    // Upload d'image
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048'
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            
            // Générer un nom unique
            $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            
            // Stocker le fichier
            $path = $file->storeAs('images', $fileName, 'public');
            
            // Enregistrer dans la base de données avec la fonction PostgreSQL
            $fileRecord = DB::selectOne(
                "SELECT * FROM insert_file(?, ?, ?)",
                [$originalName, $file->getClientOriginalExtension(), $path]
            );

            return response()->json([
                'success' => true,
                'message' => 'Fichier uploadé avec succès',
                'data' => $fileRecord,
                // Retourner seulement le chemin relatif
                'relative_path' => $path,
                // Ou construire l'URL sans domaine fixe
                'url' => 'storage/' . $path
            ], 201);
        }

        return response()->json([
            'success' => false,
            'message' => 'Aucun fichier trouvé'
        ], 400);
    }

    public function show($id)
    {
        $file = DB::selectOne("SELECT * FROM get_file_by_id(?)", [$id]);

        if (!$file) {
            return response()->json([
                'success' => false,
                'message' => 'Fichier non trouvé'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $file,
            'url' => asset('storage/' . $file->chemin)
        ]);
    }

    public function index()
    {
        $files = DB::select("SELECT * FROM get_all_files()");

        $filesWithUrl = array_map(function($file) {
            return [
                'id_file' => $file->id_file,
                'nom_fichier' => $file->nom_fichier,
                'extension' => $file->extension,
                'chemin' => $file->chemin,
                'url' => asset('storage/' . $file->chemin)
            ];
        }, $files);

        return response()->json([
            'success' => true,
            'data' => $filesWithUrl
        ]);
    }

    public function destroy($id)
    {
        // Vérifier si le fichier existe en base
        $fileExists = DB::selectOne("SELECT file_exists(?) as exists", [$id]);
        
        if (!$fileExists->exists) {
            return response()->json([
                'success' => false,
                'message' => 'Fichier non trouvé en base de données'
            ], 404);
        }

        // Récupérer le chemin avant suppression
        $file = DB::selectOne("SELECT * FROM get_file_by_id(?)", [$id]);

        // Supprimer le fichier physique SUR LA MACHINE HOST
        if ($file) {
            $filePath = storage_path('app/public/' . $file->chemin);
            
            // Vérifier si le fichier existe physiquement
            if (file_exists($filePath)) {
                unlink($filePath); // Supprimer le fichier
            } else {
                // Le fichier n'existe pas physiquement, mais on continue quand même
                \Log::warning("Fichier physique non trouvé: " . $filePath);
            }
        }

        // Supprimer l'enregistrement en base avec la fonction PostgreSQL
        $deleted = DB::selectOne("SELECT delete_file(?) as success", [$id]);

        return response()->json([
            'success' => (bool)$deleted->success,
            'message' => $deleted->success ? 'Fichier supprimé avec succès' : 'Erreur lors de la suppression en base'
        ]);
    }

    /**
     * Remplacer un fichier existant par un nouveau (version simplifiée)
     */
    public function replaceSimple(Request $request, $id): JsonResponse
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048'
        ]);

        // Vérifier si l'ancien fichier existe
        $oldFile = DB::selectOne("SELECT * FROM get_file_by_id(?)", [$id]);
        
        if (!$oldFile) {
            return response()->json([
                'success' => false,
                'message' => 'Ancien fichier non trouvé'
            ], 404);
        }

        // Supprimer l'ancien fichier physique
        $oldFilePath = storage_path('app/public/' . $oldFile->chemin);
        if (file_exists($oldFilePath)) {
            unlink($oldFilePath);
        }

        // Upload du nouveau fichier
        $file = $request->file('file');
        $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $path = $file->storeAs('images', $fileName, 'public');

        // Mettre à jour l'enregistrement en base
        $updatedFile = DB::selectOne(
            "SELECT * FROM update_file(?, ?, ?, ?)",
            [$id, $originalName, $file->getClientOriginalExtension(), $path]
        );

        return response()->json([
            'success' => true,
            'message' => 'Fichier remplacé avec succès',
            'data' => $updatedFile,
            'url' => 'storage/' . $path
        ], 200);
    }
}