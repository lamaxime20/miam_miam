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

    /**
     * Détails de parrainage d'un client (code, totaux, liste des filleuls)
     */
    public function referralDetails(int $id_client)
    {
        $summary = DB::select('SELECT * FROM get_referral_summary(?)', [$id_client]);
        $referrals = DB::select('SELECT * FROM get_referrals_client(?)', [$id_client]);

        return response()->json([
            'id_client' => $id_client,
            'referral' => $summary[0] ?? null,
            'referrals' => $referrals,
        ], 200);
    }

    /**
     * Réclamer le bonus quotidien de fidélité.
     */
    public function claimDailyBonus(int $id_client, Request $request)
    {
        $restaurantId = (int) $request->input('restaurant_id', 1);
        $ok = DB::select('SELECT claim_daily_bonus(?, ?) AS ok', [$id_client, $restaurantId]);
        $okVal = isset($ok[0]) ? (bool) $ok[0]->ok : false;

        if (!$okVal) {
            return response()->json([
                'success' => false,
                'message' => "Bonus déjà réclamé aujourd'hui",
            ], 409);
        }

        $points = DB::select('SELECT get_points_fidelite(?) AS points', [$id_client]);
        $newPoints = $points[0]->points ?? 0;

        return response()->json([
            'success' => true,
            'message' => 'Bonus crédité',
            'new_points' => $newPoints,
        ], 200);
    }
}
