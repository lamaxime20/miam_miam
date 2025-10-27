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

    public function commander(Request $request)
    {
        // 🔹 Validation des champs reçus
        $validated = $request->validate([
            'date_heure_livraison' => 'required|date_format:Y-m-d H:i:s',
            'localisation_client' => 'required|string',
            'type_localisation' => 'required|string', // correspond au domain location
            'statut_commande' => 'required|string',   // correspond au domain commandeState
            'acheteur' => 'required|integer|exists:client,id_user',
            'menus' => 'required|array|min:1',
            'menus.*.id_menu' => 'required|integer|exists:menu,id_menu',
            'menus.*.quantite' => 'required|integer|min:1',
            'menus.*.prix_unitaire' => 'required|numeric|min:0'
        ]);

        try {
            // 🔹 Appel de la fonction PostgreSQL creer_commande()
            $result = DB::select('SELECT creer_commande(?, ?, ?, ?, ?, ?)', [
                $validated['date_heure_livraison'],
                $validated['localisation_client'],
                $validated['type_localisation'],
                $validated['statut_commande'],
                $validated['acheteur'],
                json_encode($validated['menus'])
            ]);

            $id_commande = $result[0]->creer_commande ?? null;

            if ($id_commande) {
                return response()->json([
                    'message' => 'Commande créée avec succès.',
                    'id_commande' => $id_commande
                ], 201);
            } else {
                return response()->json([
                    'message' => 'Erreur lors de la création de la commande.'
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur serveur : ' . $e->getMessage()
            ], 500);
        }
    }
}