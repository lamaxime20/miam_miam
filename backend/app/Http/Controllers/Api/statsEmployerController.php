<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class statsEmployerController extends Controller
{
    /**
     * GET /api/employe/stats?restaurant_id=ID&days=30
     * Retourne: { orders, delivered, revenue, avgTicket, newDishes }
     * - Complaints laissées statiques côté frontend selon la demande.
     */
    public function stats(Request $request)
    {
        $restaurantId = (int) $request->query('restaurant_id');
        $days = (int) ($request->query('days', 30));

        if (!$restaurantId) {
            return response()->json(['error' => 'restaurant_id requis'], 400);
        }
        if ($days <= 0) { $days = 30; }

        try {
            $results = DB::select(<<<SQL
                WITH params AS (
                    SELECT ?::int AS restaurant_id,
                           (NOW() - (?::int || ' days')::interval) AS start_date,
                           NOW() AS end_date
                ),
                cmds AS (
                    SELECT DISTINCT c.id_commande, c.date_commande
                    FROM Commande c
                    JOIN Contenir ct ON ct.id_commande = c.id_commande
                    JOIN Menu m ON m.id_menu = ct.id_menu
                    JOIN params p ON TRUE
                    WHERE m.restaurant_hote = p.restaurant_id
                      AND c.date_commande >= p.start_date AND c.date_commande <= p.end_date
                ),
                deliv AS (
                    SELECT DISTINCT c.id_commande
                    FROM Livraison l
                    JOIN Bon_commande b ON b.id_bon = l.bon_associe
                    JOIN Commande c ON c.id_commande = b.commande_associe
                    JOIN Contenir ct ON ct.id_commande = c.id_commande
                    JOIN Menu m ON m.id_menu = ct.id_menu
                    JOIN params p ON TRUE
                    WHERE m.restaurant_hote = p.restaurant_id
                      AND c.date_commande >= p.start_date AND c.date_commande <= p.end_date
                      AND l.statut_livraison = 'validée'
                ),
                rev AS (
                    SELECT COALESCE(SUM(p.montant), 0) AS revenue
                    FROM Paiement p
                    JOIN Commande c ON c.id_commande = p.id_commande
                    JOIN Contenir ct ON ct.id_commande = c.id_commande
                    JOIN Menu m ON m.id_menu = ct.id_menu
                    JOIN params pr ON TRUE
                    WHERE m.restaurant_hote = pr.restaurant_id
                      AND c.date_commande >= pr.start_date AND c.date_commande <= pr.end_date
                      AND p.statut_paiement = 'reussi'
                ),
                new_menus AS (
                    SELECT COUNT(*)::int AS nb
                    FROM Menu m
                    JOIN params p ON TRUE
                    WHERE m.restaurant_hote = p.restaurant_id
                      AND m.updated_at >= p.start_date AND m.updated_at <= p.end_date
                )
                SELECT 
                    (SELECT COUNT(*) FROM cmds) AS orders,
                    (SELECT COUNT(*) FROM deliv) AS delivered,
                    (SELECT revenue FROM rev) AS revenue,
                    (SELECT nb FROM new_menus) AS new_dishes;
            SQL, [$restaurantId, $days]);

            $row = $results[0] ?? null;
            $orders = (int) ($row->orders ?? 0);
            $delivered = (int) ($row->delivered ?? 0);
            $revenue = (float) ($row->revenue ?? 0);
            $avgTicket = $orders > 0 ? ($revenue / $orders) : 0.0;
            $newDishes = (int) ($row->new_dishes ?? 0);

            return response()->json([
                'orders' => $orders,
                'delivered' => $delivered,
                'revenue' => $revenue,
                'avgTicket' => $avgTicket,
                'newDishes' => $newDishes,
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur stats employe: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'orders' => 0,
                'delivered' => 0,
                'revenue' => 0,
                'avgTicket' => 0,
                'newDishes' => 0,
            ], 500);
        }
    }
}