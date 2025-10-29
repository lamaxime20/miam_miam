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
}
