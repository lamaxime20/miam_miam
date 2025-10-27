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
}
