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
            // Appel de la fonction PostgreSQL pour les menus classés par popularité
            $menus = DB::select('SELECT * FROM get_menus_du_jour_par_popularite()');

            // Si aucun menu n'est trouvé
            if (empty($menus)) {
                return response()->json([
                    'message' => 'Aucun menu disponible pour aujourd\'hui.'
                ], 404);
            }

            // Renvoie la liste des menus classés par popularité avec un code 200
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
