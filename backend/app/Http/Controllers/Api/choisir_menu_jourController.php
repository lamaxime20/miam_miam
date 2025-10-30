<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class choisir_menu_jourController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Appel de la fonction PostgreSQL
        $menus = DB::select('SELECT * FROM lister_menu_du_jour()');

        // Si aucun menu n'est trouvé
        if (empty($menus)) {
            return response()->json([
                'message' => 'Aucun menu disponible pour aujourd\'hui.'
            ], 404);
        }

        // Renvoie la liste des menus avec un code 200
        return response()->json($menus, 200);
    }

    /**
     * Display menus du jour classés par popularité (nombre de commandes).
     */
    public function menusParPopularite()
    {
        try {
            $menus = DB::select('SELECT * FROM get_menus_du_jour_par_popularite()');
            if (empty($menus)) {
                return response()->json([
                    'message' => 'Aucun menu disponible pour aujourd\'hui.'
                ], 404);
            }
            return response()->json([
                'success' => true,
                'data' => $menus,
                'message' => 'Menus du jour récupérés avec succès'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des menus: ' . $e->getMessage()
            ], 500);
        }
    }

    public function ajouterMenusAujourdhui(Request $request)
    {
        $data = $request->validate([
            'id_employe' => 'required|integer|min:1',
            'menus_plus' => 'required|array',
            'menus_plus.*' => 'integer|min:1',
        ]);

        $idEmploye = (int)$data['id_employe'];
        $ids = array_values(array_unique(array_map('intval', $data['menus_plus'])));
        if (empty($ids)) {
            return response()->json(['success' => true, 'added' => 0]);
        }

        try {
            DB::beginTransaction();
            // Insertion avec gestion des doublons via ON CONFLICT DO NOTHING
            $placeholders = implode(',', array_fill(0, count($ids), '(?, CURRENT_DATE)'));
            $bindings = [];
            foreach ($ids as $id) {
                $bindings[] = $idEmploye; // sera remplacé dans la requête finale, voir ci-dessous
            }
            // Construction de la requête complète avec id_menu variable et id_employe constant
            $sql = 'INSERT INTO choisir_menu_jour (id_menu, id_employe, date_jour) VALUES ';
            $values = [];
            $bindings = [];
            foreach ($ids as $id) {
                $values[] = '(?, ?, CURRENT_DATE)';
                $bindings[] = $id;       // id_menu
                $bindings[] = $idEmploye; // id_employe
            }
            $sql .= implode(',', $values) . ' ON CONFLICT (id_menu, date_jour) DO NOTHING';
            DB::statement($sql, $bindings);
            DB::commit();
            return response()->json(['success' => true, 'added' => count($ids)]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function retirerMenusAujourdhui(Request $request)
    {
        $data = $request->validate([
            'menus_moins' => 'required|array',
            'menus_moins.*' => 'integer|min:1',
        ]);

        $ids = array_values(array_unique(array_map('intval', $data['menus_moins'])));
        if (empty($ids)) {
            return response()->json(['success' => true, 'removed' => 0]);
        }

        try {
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $sql = "DELETE FROM choisir_menu_jour WHERE date_jour = CURRENT_DATE AND id_menu IN ($placeholders)";
            DB::statement($sql, $ids);
            return response()->json(['success' => true, 'removed' => count($ids)]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
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
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
