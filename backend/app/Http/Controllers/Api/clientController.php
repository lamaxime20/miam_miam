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

    /**
     * Retourne les statistiques complètes du dashboard pour un client.
     */
    public function dashboardStats(int $id_client)
    {
        $stats = DB::select('SELECT * FROM get_dashboard_stats_client(?)', [$id_client]);

        return response()->json([
            'id_client' => $id_client,
            'stats' => $stats[0] ?? null,
        ], 200);
    }

    /**
     * Retourne les commandes récentes d'un client.
     */
    public function commandesRecentes(int $id_client, Request $request)
    {
        $limit = $request->query('limit', 5);
        $commandes = DB::select('SELECT * FROM get_commandes_recentes_client(?, ?)', [$id_client, $limit]);

        return response()->json([
            'id_client' => $id_client,
            'commandes' => $commandes,
        ], 200);
    }

    /**
     * Retourne les détails de fidélité d'un client.
     */
    public function detailsFidelite(int $id_client)
    {
        $details = DB::select('SELECT * FROM get_details_fidelite_client(?)', [$id_client]);

        return response()->json([
            'id_client' => $id_client,
            'details' => $details[0] ?? null,
        ], 200);
    }

    /**
     * Retourne le top des clients.
     */
    public function topClients(Request $request)
    {
        $limit = $request->query('limit', 10);
        $clients = DB::select('SELECT * FROM get_top_clients(?)', [$limit]);

        return response()->json([
            'clients' => $clients,
        ], 200);
    }
}
