<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class clientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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

    public function totalFilleuls(int $id_client)
    {
        $total = DB::select('SELECT get_total_filleuls(?) AS total', [$id_client]);

        return response()->json([
            'id_client' => $id_client,
            'total_filleuls' => $total[0]->total ?? 0,
        ], 200);
    }

    /**
     * Retourne le nombre total de commandes d'un client.
     */
    public function totalCommandes(int $id_client)
    {
        $total = DB::select('SELECT get_total_commandes(?) AS total', [$id_client]);

        return response()->json([
            'id_client' => $id_client,
            'total_commandes' => $total[0]->total ?? 0,
        ], 200);
    }

    /**
     * Retourne le nombre de points de fidélité d'un client.
     */
    public function pointsFidelite(int $id_client)
    {
        $points = DB::select('SELECT get_points_fidelite(?) AS points', [$id_client]);

        return response()->json([
            'id_client' => $id_client,
            'points_fidelite' => $points[0]->points ?? 0,
        ], 200);
    }
}
