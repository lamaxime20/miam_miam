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
                    'image' => 'storage/' . $item->image
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