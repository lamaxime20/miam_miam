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

    public function listForRestaurant(Request $request)
    {
        try {
            $restaurantId = (int) $request->query('restaurant_id', 0);
            if ($restaurantId <= 0) {
                return response()->json(['error' => 'restaurant_id requis'], 400);
            }

            $rows = DB::select(
                'SELECT m.id_menu, m.nom_menu, m.description_menu, m.prix_menu, m.libelle_menu, m.statut_menu, m.updated_at, m.image_menu,
                        f.id_file, f.chemin
                 FROM menu m
                 LEFT JOIN file f ON m.image_menu = f.id_file
                 WHERE m.restaurant_hote = ?
                 ORDER BY m.updated_at DESC',
                [$restaurantId]
            );

            $data = array_map(function ($r) {
                $categoryMap = [
                    'plat' => 'plat',
                    'entree' => 'entree',
                    'dessert' => 'dessert',
                    'boisson' => 'boisson',
                ];
                return [
                    'id' => (int)$r->id_menu,
                    'name' => $r->nom_menu,
                    'description' => $r->description_menu,
                    'price' => (float)$r->prix_menu,
                    'category' => $categoryMap[strtolower($r->libelle_menu)] ?? strtolower($r->libelle_menu),
                    'available' => strtolower($r->statut_menu) === 'disponible',
                    'image' => $r->chemin ? asset('storage/' . $r->chemin) : null,
                    'image_id' => $r->id_file ? (int)$r->id_file : null,
                    'updatedAt' => $r->updated_at ? substr($r->updated_at, 0, 10) : null,
                ];
            }, $rows);

            return response()->json($data);
        } catch (\Exception $e) {
            \Log::error('Erreur listForRestaurant', ['message' => $e->getMessage()]);
            return response()->json([], 500);
        }
    }

    public function listAllWithPromotions()
    {
        try {
            $rows = DB::select(
                "SELECT m.id_menu, m.nom_menu, m.description_menu, m.prix_menu, m.libelle_menu, m.statut_menu, m.updated_at,
                        m.image_menu, r.nom_restaurant,
                        f.id_file, f.chemin,
                        COALESCE(MAX(p.pourcentage_reduction), 0) AS discount_percent
                 FROM menu m
                 LEFT JOIN concerner_menu cm ON cm.id_menu = m.id_menu
                 LEFT JOIN promotion p ON p.id_promo = cm.id_promo AND p.date_debut <= NOW() AND p.date_fin >= NOW()
                 LEFT JOIN file f ON m.image_menu = f.id_file
                 LEFT JOIN restaurant r ON r.id_restaurant = m.restaurant_hote
                 GROUP BY m.id_menu, m.nom_menu, m.description_menu, m.prix_menu, m.libelle_menu, m.statut_menu, m.updated_at, m.image_menu, r.nom_restaurant, f.id_file, f.chemin
                 ORDER BY m.updated_at DESC"
            );

            $data = array_map(function ($r) {
                $category = strtolower($r->libelle_menu);
                $discount = (float)$r->discount_percent;
                $price = (float)$r->prix_menu;
                $finalPrice = $discount > 0 ? round($price * (1 - ($discount / 100)), 2) : $price;
                return [
                    'id' => (int)$r->id_menu,
                    'name' => $r->nom_menu,
                    'description' => $r->description_menu,
                    'price' => $finalPrice,
                    'priceOriginal' => $discount > 0 ? $price : null,
                    'discountPercent' => $discount,
                    'category' => $category,
                    'available' => strtolower($r->statut_menu) === 'disponible',
                    'image' => $r->chemin ? asset('storage/' . $r->chemin) : null,
                    'image_id' => $r->id_file ? (int)$r->id_file : null,
                    'nom_restaurant' => $r->nom_restaurant,
                    'updatedAt' => $r->updated_at ? substr($r->updated_at, 0, 10) : null,
                ];
            }, $rows);

            return response()->json($data);
        } catch (\Exception $e) {
            \Log::error('Erreur listAllWithPromotions', ['message' => $e->getMessage()]);
            return response()->json([], 500);
        }
    }

    public function listDailyWithPromotions()
    {
        try {
            $rows = DB::select(
                "SELECT m.id_menu, m.nom_menu, m.description_menu, m.prix_menu, m.libelle_menu, m.statut_menu, m.updated_at,
                        m.image_menu, r.nom_restaurant,
                        f.id_file, f.chemin,
                        COALESCE(MAX(p.pourcentage_reduction), 0) AS discount_percent
                 FROM choisir_menu_jour cmj
                 INNER JOIN menu m ON m.id_menu = cmj.id_menu
                 LEFT JOIN concerner_menu cm ON cm.id_menu = m.id_menu
                 LEFT JOIN promotion p ON p.id_promo = cm.id_promo AND p.date_debut <= NOW() AND p.date_fin >= NOW()
                 LEFT JOIN file f ON m.image_menu = f.id_file
                 LEFT JOIN restaurant r ON r.id_restaurant = m.restaurant_hote
                 WHERE cmj.date_jour = CURRENT_DATE
                 GROUP BY m.id_menu, m.nom_menu, m.description_menu, m.prix_menu, m.libelle_menu, m.statut_menu, m.updated_at, m.image_menu, r.nom_restaurant, f.id_file, f.chemin
                 ORDER BY m.updated_at DESC"
            );

            $data = array_map(function ($r) {
                $category = strtolower($r->libelle_menu);
                $discount = (float)$r->discount_percent;
                $price = (float)$r->prix_menu;
                $finalPrice = $discount > 0 ? round($price * (1 - ($discount / 100)), 2) : $price;
                return [
                    'id' => (int)$r->id_menu,
                    'name' => $r->nom_menu,
                    'description' => $r->description_menu,
                    'price' => $finalPrice,
                    'priceOriginal' => $discount > 0 ? $price : null,
                    'discountPercent' => $discount,
                    'category' => $category,
                    'available' => strtolower($r->statut_menu) === 'disponible',
                    'image' => $r->chemin ? asset('storage/' . $r->chemin) : null,
                    'image_id' => $r->id_file ? (int)$r->id_file : null,
                    'nom_restaurant' => $r->nom_restaurant,
                    'updatedAt' => $r->updated_at ? substr($r->updated_at, 0, 10) : null,
                ];
            }, $rows);

            return response()->json($data);
        } catch (\Exception $e) {
            \Log::error('Erreur listDailyWithPromotions', ['message' => $e->getMessage()]);
            return response()->json([], 500);
        }
    }

    /**
    * Met à jour un article de menu existant
    */
    public function update(Request $request, $menuId)
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

            $menuId = (int)$menuId;
            $restaurantId = $request->input('restaurant_hote');
            $nomMenu = $request->input('nom_menu');
            $imageId = $request->input('image_menu');

            // 1. Vérifier si le menu existe dans le restaurant
            $menu = DB::selectOne('SELECT * FROM menu WHERE id_menu = ? AND restaurant_hote = ?', [$menuId, $restaurantId]);
            if (!$menu) {
                return response()->json(['error' => 'Menu non trouvé dans ce restaurant'], 404);
            }

            // 2. Vérifier si le nouveau nom existe déjà pour un autre menu du même restaurant
            $existingName = DB::selectOne(
                'SELECT id_menu FROM menu WHERE nom_menu = ? AND restaurant_hote = ? AND id_menu != ?',
                [$nomMenu, $restaurantId, $menuId]
            );
            if ($existingName) {
                return response()->json(['error' => 'Un autre menu avec ce nom existe déjà dans ce restaurant'], 409);
            }

            // 3. Vérifier si l'image existe (si fournie)
            if ($imageId) {
                $image = DB::selectOne('SELECT id_file FROM file WHERE id_file = ?', [$imageId]);
                if (!$image) {
                    return response()->json(['error' => 'Image non trouvée'], 404);
                }
            }

            // 4. Exécuter la mise à jour
            $affected = DB::update(
                'UPDATE menu SET nom_menu = ?, description_menu = ?, prix_menu = ?, libelle_menu = ?, statut_menu = ?, image_menu = ?, updated_at = CURRENT_TIMESTAMP WHERE id_menu = ?',
                [
                    $nomMenu,
                    $request->input('description_menu'),
                    $request->input('prix_menu'),
                    $request->input('libelle_menu'),
                    $request->input('statut_menu'),
                    $imageId,
                    $menuId
                ]
            );
            
            if ($affected > 0) {
                return response()->json([
                    'success' => 'Menu modifié avec succès',
                    'menu_id' => $menuId
                ]);
            } else {
                return response()->json(['error' => 'Aucune modification effectuée'], 400);
            }
            
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la mise à jour du menu:', [
                'message' => $e->getMessage(),
                'menu_id' => $menuId,
                'data' => $request->all()
            ]);
            
            return response()->json(['error' => 'Erreur interne du serveur'], 500);
        }
    }
}
