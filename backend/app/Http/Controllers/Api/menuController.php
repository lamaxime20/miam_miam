<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class menuController extends Controller
{
    /**
     * Récupérer les restaurants par IDs de menus
     */
    /**
    * Crée un nouvel article de menu
    */
    public function index(Request $request)
    {
        try {
            $request->validate([
                'nom_menu' => 'required|string|max:100',
                'description_menu' => 'required|string',
                'prix_menu' => 'required|numeric|min:0.01',
                'libelle_menu' => 'required|string|in:entree,plat,dessert,boisson',
                'statut_menu' => 'required|string|in:disponible,indisponible',
                'restaurant_hote' => 'required|integer|min:1',
                'image_menu' => 'nullable|integer'
            ]);

            $result = DB::select('SELECT create_menu_item(?, ?, ?, ?, ?, ?, ?) as resultat', [
                $request->input('nom_menu'),
                $request->input('description_menu'),
                $request->input('prix_menu'),
                $request->input('libelle_menu'),
                $request->input('statut_menu'),
                $request->input('restaurant_hote'),
                $request->input('image_menu') // Maintenant en dernier paramètre
            ]);
            
            if (empty($result)) {
                return response()->json(['error' => 'Erreur lors de la création'], 500);
            }
            
            $resultat = $result[0]->resultat;
            
            // Gérer les différents retours
            if (str_starts_with($resultat, 'MENU_CREE:')) {
                $menuId = str_replace('MENU_CREE:', '', $resultat);
                return response()->json([
                    'success' => 'Menu créé avec succès',
                    'menu_id' => $menuId
                ]);
            }
            
            switch ($resultat) {
                case 'RESTAURANT_NON_TROUVE':
                    return response()->json(['error' => 'Restaurant non trouvé'], 404);
                    
                case 'IMAGE_NON_TROUVEE':
                    return response()->json(['error' => 'Image non trouvée'], 404);
                    
                case 'NOM_EXISTE_DEJA':
                    return response()->json(['error' => 'Un menu avec ce nom existe déjà dans ce restaurant'], 409);
                    
                default:
                    if (str_starts_with($resultat, 'ERREUR:')) {
                        \Log::error('Erreur PostgreSQL create_menu_item: ' . $resultat);
                        return response()->json(['error' => 'Erreur lors de la création'], 500);
                    }
                    return response()->json(['error' => 'Erreur inconnue'], 500);
            }
            
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la création du menu:', [
                'message' => $e->getMessage(),
                'data' => $request->all()
            ]);
            
            return response()->json(['error' => 'Erreur interne du serveur'], 500);
        }
    }
    public function getRestaurantByMenuId(string $id_menu)
    {
        try {
            $result = DB::select('SELECT * FROM get_restaurant_by_menu_id(?)', [$id_menu]);

            if (empty($result)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun menu trouvé pour cet ID'
                ], 404);
            }

            // Renvoie le premier élément car la fonction retourne un seul menu
            $menu = $result[0];

            return response()->json([
                'success' => true,
                'data' => [
                    'id_menu' => $menu->id_menu,
                    'nom_menu' => $menu->nom_menu,
                    'prix_menu' => floatval($menu->prix_menu),
                    'description_menu' => $menu->description_menu,
                    'image_menu' => $menu->image_menu,
                    'id_restaurant' => $menu->id_restaurant,
                    'nom_restaurant' => $menu->nom_restaurant,
                    'localisation' => $menu->localisation
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du restaurant',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getAllMenuItems($restaurantId)
    {
        try {
            // Valider l'ID du restaurant
            if (!is_numeric($restaurantId) || $restaurantId <= 0) {
                return response()->json(['error' => 'ID de restaurant invalide'], 400);
            }

            $results = DB::select('SELECT * FROM get_all_menu_items(?)', [(int)$restaurantId]);
            
            $menuItems = array_map(function($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'description' => $item->description,
                    'price' => (float) $item->price,
                    'category' => $item->category,
                    'status' => $item->status,
                    'image' => ('storage/' . $item->image)
                ];
            }, $results);
            
            return response()->json($menuItems);
            
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération des plats du menu:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'restaurant_id' => $restaurantId
            ]);
            
            return response()->json([], 500);
        }
    }
}