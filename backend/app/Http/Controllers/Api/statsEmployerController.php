<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class statsEmployerController extends Controller
{
    /**
     * GET /api/employe/stats?restaurant_id=ID&days=30
     * Retourne: { orders, delivered, revenue, avgTicket, newDishes, complaints }
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
                ),
                recs AS (
                    SELECT COUNT(*)::int AS nb
                    FROM Reclamation r
                    JOIN params p ON TRUE
                    WHERE r.restaurant_cible = p.restaurant_id
                      AND r.date_soummission >= p.start_date AND r.date_soummission <= p.end_date
                )
                SELECT 
                    (SELECT COUNT(*) FROM cmds) AS orders,
                    (SELECT COUNT(*) FROM deliv) AS delivered,
                    (SELECT revenue FROM rev) AS revenue,
                    (SELECT nb FROM new_menus) AS new_dishes,
                    (SELECT nb FROM recs) AS complaints;
            SQL, [$restaurantId, $days]);

            $row = $results[0] ?? null;
            $orders = (int) ($row->orders ?? 0);
            $delivered = (int) ($row->delivered ?? 0);
            $revenue = (float) ($row->revenue ?? 0);
            $avgTicket = $orders > 0 ? ($revenue / $orders) : 0.0;
            $newDishes = (int) ($row->new_dishes ?? 0);
            $complaints = (int) ($row->complaints ?? 0);

            return response()->json([
                'orders' => $orders,
                'delivered' => $delivered,
                'revenue' => $revenue,
                'avgTicket' => $avgTicket,
                'newDishes' => $newDishes,
                'complaints' => $complaints,
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
                'complaints' => 0,
            ], 500);
        }
    }

    /**
     * GET /api/employe/series?restaurant_id=ID&days=30
     * Retourne des séries quotidiennes: labels, orders, delivered, sales, avgTicketPerDay, complaints, newDishes
     */
    public function series(Request $request)
    {
        $restaurantId = (int) $request->query('restaurant_id');
        $days = (int) ($request->query('days', 30));
        if (!$restaurantId) {
            return response()->json(['error' => 'restaurant_id requis'], 400);
        }
        if ($days <= 0) { $days = 30; }

        try {
            $rows = DB::select(<<<SQL
                WITH params AS (
                    SELECT ?::int AS restaurant_id,
                           (NOW()::date - (?::int - 1)) AS start_date,
                           NOW()::date AS end_date
                ),
                d AS (
                    SELECT generate_series((SELECT start_date FROM params), (SELECT end_date FROM params), '1 day')::date AS jour
                ),
                cmds AS (
                    SELECT c.date_commande::date AS jour, COUNT(DISTINCT c.id_commande) AS nb
                    FROM Commande c
                    JOIN Contenir ct ON ct.id_commande = c.id_commande
                    JOIN Menu m ON m.id_menu = ct.id_menu
                    JOIN params p ON TRUE
                    WHERE m.restaurant_hote = p.restaurant_id
                      AND c.date_commande::date BETWEEN p.start_date AND p.end_date
                    GROUP BY c.date_commande::date
                ),
                deliv AS (
                    SELECT c.date_commande::date AS jour, COUNT(DISTINCT c.id_commande) AS nb
                    FROM Livraison l
                    JOIN Bon_commande b ON b.id_bon = l.bon_associe
                    JOIN Commande c ON c.id_commande = b.commande_associe
                    JOIN Contenir ct ON ct.id_commande = c.id_commande
                    JOIN Menu m ON m.id_menu = ct.id_menu
                    JOIN params p ON TRUE
                    WHERE m.restaurant_hote = p.restaurant_id
                      AND c.date_commande::date BETWEEN p.start_date AND p.end_date
                      AND l.statut_livraison = 'validée'
                    GROUP BY c.date_commande::date
                ),
                sales AS (
                    SELECT c.date_commande::date AS jour, COALESCE(SUM(p.montant),0) AS total
                    FROM Paiement p
                    JOIN Commande c ON c.id_commande = p.id_commande
                    JOIN Contenir ct ON ct.id_commande = c.id_commande
                    JOIN Menu m ON m.id_menu = ct.id_menu
                    JOIN params pr ON TRUE
                    WHERE m.restaurant_hote = pr.restaurant_id
                      AND c.date_commande::date BETWEEN pr.start_date AND pr.end_date
                      AND p.statut_paiement = 'reussi'
                    GROUP BY c.date_commande::date
                ),
                recs AS (
                    SELECT r.date_soummission::date AS jour, COUNT(*)::int AS nb
                    FROM Reclamation r
                    JOIN params p ON TRUE
                    WHERE r.restaurant_cible = p.restaurant_id
                      AND r.date_soummission::date BETWEEN p.start_date AND p.end_date
                    GROUP BY r.date_soummission::date
                ),
                new_menus AS (
                    SELECT m.updated_at::date AS jour, COUNT(*)::int AS nb
                    FROM Menu m
                    JOIN params p ON TRUE
                    WHERE m.restaurant_hote = p.restaurant_id
                      AND m.updated_at::date BETWEEN p.start_date AND p.end_date
                    GROUP BY m.updated_at::date
                )
                SELECT 
                    d.jour,
                    COALESCE(cmds.nb, 0) AS orders,
                    COALESCE(deliv.nb, 0) AS delivered,
                    COALESCE(sales.total, 0) AS sales,
                    COALESCE(recs.nb, 0) AS complaints,
                    COALESCE(new_menus.nb, 0) AS new_dishes
                FROM d
                LEFT JOIN cmds ON cmds.jour = d.jour
                LEFT JOIN deliv ON deliv.jour = d.jour
                LEFT JOIN sales ON sales.jour = d.jour
                LEFT JOIN recs ON recs.jour = d.jour
                LEFT JOIN new_menus ON new_menus.jour = d.jour
                ORDER BY d.jour ASC;
            SQL, [$restaurantId, $days]);

            $labels = [];
            $orders = [];
            $delivered = [];
            $sales = [];
            $avgTicketPerDay = [];
            $complaints = [];
            $newDishes = [];

            foreach ($rows as $r) {
                $labels[] = $r->jour;
                $orders[] = (int) $r->orders;
                $delivered[] = (int) $r->delivered;
                $sales[] = (float) $r->sales;
                $avgTicketPerDay[] = ((int)$r->orders) > 0 ? ((float)$r->sales / (int)$r->orders) : 0.0;
                $complaints[] = (int) $r->complaints;
                $newDishes[] = (int) $r->new_dishes;
            }

            return response()->json([
                'labels' => $labels,
                'orders' => $orders,
                'delivered' => $delivered,
                'sales' => $sales,
                'avgTicketPerDay' => $avgTicketPerDay,
                'complaints' => $complaints,
                'newDishes' => $newDishes,
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur series employe: '.$e->getMessage());
            return response()->json([
                'labels' => [],
                'orders' => [],
                'delivered' => [],
                'sales' => [],
                'avgTicketPerDay' => [],
                'complaints' => [],
                'newDishes' => [],
            ], 500);
        }
    }
}