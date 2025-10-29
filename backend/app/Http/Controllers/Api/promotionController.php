<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class promotionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $results = DB::select('SELECT * FROM get_all_promotions()');
            
            $promotions = array_map(function($item) {
                return [
                    'id_promo' => (int)$item->id_promo,
                    'titre' => $item->titre,
                    'description_promotion' => $item->description_promotion,
                    'pourcentage_reduction' => (float)$item->pourcentage_reduction,
                    'date_debut' => $item->date_debut,
                    'date_fin' => $item->date_fin,
                    'image_path' => $item->image_path,
                    'statut' => $item->statut
                ];
            }, $results);
            
            return response()->json($promotions);
            
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération des promotions:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:100',
                'description' => 'required|string',
                'discount' => 'required|numeric|min:0.01|max:100',
                'startDate' => 'required|date',
                'endDate' => 'required|date|after:startDate',
                'id_file' => 'nullable|integer'
            ]);

            // Convertir les dates en format TIMESTAMP
            $startDate = $request->input('startDate') . ' 00:00:00';
            $endDate = $request->input('endDate') . ' 23:59:59';

            $result = DB::select('SELECT create_promotion(?, ?, ?, ?, ?, ?) as resultat', [
                $request->input('name'),
                $request->input('description'),
                $request->input('discount'),
                $startDate,
                $endDate,
                $request->input('id_file')
            ]);
            
            if (empty($result)) {
                return response()->json(['error' => 'Erreur lors de la création'], 500);
            }
            
            $resultat = $result[0]->resultat;
            
            // Gérer les différents retours
            if (str_starts_with($resultat, 'PROMOTION_CREE:')) {
                $promoId = str_replace('PROMOTION_CREE:', '', $resultat);
                return response()->json([
                    'success' => 'Promotion créée avec succès',
                    'promotion_id' => $promoId
                ]);
            }
            
            switch ($resultat) {
                case 'DATES_INVALIDES':
                    return response()->json(['error' => 'La date de fin doit être après la date de début'], 400);
                    
                case 'DATE_DEBUT_PASSEE':
                    return response()->json(['error' => 'La date de début ne peut pas être dans le passé'], 400);
                    
                case 'POURCENTAGE_INVALIDE':
                    return response()->json(['error' => 'Le pourcentage de réduction doit être entre 0.01 et 100'], 400);
                    
                case 'IMAGE_NON_TROUVEE':
                    return response()->json(['error' => 'Image non trouvée'], 404);
                    
                case 'CONFLIT_DATES':
                    return response()->json(['error' => 'Conflit de dates avec une promotion existante'], 409);
                    
                default:
                    if (str_starts_with($resultat, 'ERREUR:')) {
                        \Log::error('Erreur PostgreSQL create_promotion: ' . $resultat);
                        return response()->json(['error' => 'Erreur lors de la création'], 500);
                    }
                    return response()->json(['error' => 'Erreur inconnue'], 500);
            }
            
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la création de la promotion:', [
                'message' => $e->getMessage(),
                'data' => $request->all()
            ]);
            
            return response()->json(['error' => 'Erreur interne du serveur'], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
         * Update the specified resource in storage.
         */
        /**
    * Met à jour une promotion existante
    */
    public function update(Request $request, $promotionId)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:100',
                'description' => 'required|string',
                'discount' => 'required|numeric|min:0.01|max:100',
                'startDate' => 'required|date',
                'endDate' => 'required|date|after:startDate',
                'id_file' => 'nullable|integer'
            ]);

            // Convertir les dates en format TIMESTAMP
            $startDate = $request->input('startDate') . ' 00:00:00';
            $endDate = $request->input('endDate') . ' 23:59:59';

            $result = DB::select('SELECT update_promotion(?, ?, ?, ?, ?, ?, ?) as resultat', [
                (int)$promotionId,
                $request->input('name'),
                $request->input('description'),
                $request->input('discount'),
                $startDate,
                $endDate,
                $request->input('id_file')
            ]);
            
            if (empty($result)) {
                return response()->json(['error' => 'Erreur lors de la mise à jour'], 500);
            }
            
            $resultat = $result[0]->resultat;
            
            // Gérer les différents retours
            if (str_starts_with($resultat, 'PROMOTION_MODIFIEE:')) {
                return response()->json([
                    'success' => 'Promotion modifiée avec succès',
                    'promotion_id' => $promotionId
                ]);
            }
            
            switch ($resultat) {
                case 'PROMOTION_NON_TROUVEE':
                    return response()->json(['error' => 'Promotion non trouvée'], 404);
                    
                case 'DATES_INVALIDES':
                    return response()->json(['error' => 'La date de fin doit être après la date de début'], 400);
                    
                case 'POURCENTAGE_INVALIDE':
                    return response()->json(['error' => 'Le pourcentage de réduction doit être entre 0.01 et 100'], 400);
                    
                case 'IMAGE_NON_TROUVEE':
                    return response()->json(['error' => 'Image non trouvée'], 404);
                    
                case 'CONFLIT_DATES':
                    return response()->json(['error' => 'Conflit de dates avec une autre promotion'], 409);
                    
                case 'AUCUNE_MODIFICATION':
                    return response()->json(['error' => 'Aucune modification effectuée'], 400);
                    
                default:
                    if (str_starts_with($resultat, 'ERREUR:')) {
                        \Log::error('Erreur PostgreSQL update_promotion: ' . $resultat);
                        return response()->json(['error' => 'Erreur lors de la mise à jour'], 500);
                    }
                    return response()->json(['error' => 'Erreur inconnue'], 500);
            }
            
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la mise à jour de la promotion:', [
                'message' => $e->getMessage(),
                'promotion_id' => $promotionId,
                'data' => $request->all()
            ]);
            
            return response()->json(['error' => 'Erreur interne du serveur'], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Retourne les promotions actives.
     */
    public function promotionsActives()
    {
        $promotions = DB::select('SELECT * FROM get_promotions_actives()');

        return response()->json([
            'promotions' => $promotions,
        ], 200);
    }

    public function ajouterPlusieursMenusPromotion(Request $request)
    {
        try {
            $request->validate([
                'id_promo' => 'required|integer|min:1',
                'ids_menu' => 'required|array',
                'ids_menu.*' => 'integer|min:1'
            ]);

            $promotionId = $request->input('id_promo');
            $menuIds = $request->input('ids_menu');
            
            $successCount = 0;
            $errorCount = 0;
            $errors = [];
            $successIds = [];

            foreach ($menuIds as $menuId) {
                try {
                    $result = DB::select('SELECT ajouter_menu_promotion(?, ?) as resultat', [
                        $promotionId, $menuId
                    ]);
                    
                    $resultat = $result[0]->resultat ?? '';
                    
                    if ($resultat === 'ASSOCIATION_CREEE') {
                        $successCount++;
                        $successIds[] = $menuId;
                    } else {
                        $errorCount++;
                        $errors[] = [
                            'menu_id' => $menuId,
                            'error' => $this->getErrorMessage($resultat)
                        ];
                    }
                    
                } catch (\Exception $e) {
                    $errorCount++;
                    $errors[] = [
                        'menu_id' => $menuId,
                        'error' => 'Erreur technique: ' . $e->getMessage()
                    ];
                }
            }

            $response = [
                'success_count' => $successCount,
                'error_count' => $errorCount,
                'success_ids' => $successIds,
                'errors' => $errors
            ];

            if ($successCount > 0 && $errorCount === 0) {
                return response()->json([
                    'success' => "Tous les menus ($successCount) ont été ajoutés à la promotion",
                    ...$response
                ]);
            } elseif ($successCount > 0) {
                return response()->json([
                    'success' => "$successCount menus ajoutés avec succès",
                    'warning' => "$errorCount erreurs rencontrées",
                    ...$response
                ]);
            } else {
                return response()->json([
                    'error' => 'Aucun menu n\'a pu être ajouté',
                    ...$response
                ], 400);
            }
            
        } catch (\Exception $e) {
            \Log::error('Erreur lors de l\'ajout des menus à la promotion:', [
                'message' => $e->getMessage(),
                'data' => $request->all()
            ]);
            
            return response()->json(['error' => 'Erreur interne du serveur'], 500);
        }
    }

    private function getErrorMessage($resultat)
    {
        $messages = [
            'PROMOTION_NON_TROUVEE' => 'Promotion non trouvée',
            'MENU_NON_TROUVE' => 'Menu non trouvé',
            'ASSOCIATION_EXISTE_DEJA' => 'Déjà associé à cette promotion'
        ];
        
        return $messages[$resultat] ?? 'Erreur inconnue';
    }
}
