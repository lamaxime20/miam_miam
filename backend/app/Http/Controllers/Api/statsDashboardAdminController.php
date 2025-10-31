<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class statsDashboardAdminController extends Controller
{
    /**
     * Ventes d'aujourd'hui en XAF pour un restaurant
     */
    public function getVentesAujourdhui(Request $request)
    {
        $restaurantId = $request->query('restaurant_id');
        if (!$restaurantId) {
            return response()->json(['total_xaf' => 0, 'pourcentage_vs_hier' => 0]);
        }
        try {
            // Total aujourd'hui
            $today = DB::selectOne('
                SELECT COALESCE(SUM(p.montant),0) AS total
                FROM Paiement p
                JOIN Commande c ON c.id_commande = p.id_commande
                JOIN Contenir ct ON ct.id_commande = c.id_commande
                JOIN Menu m ON m.id_menu = ct.id_menu
                WHERE p.statut_paiement = ?
                  AND m.restaurant_hote = ?
                  AND DATE(p.date_paiement) = CURRENT_DATE
            ', ['reussi', $restaurantId]);

            // Total hier
            $yesterday = DB::selectOne('
                SELECT COALESCE(SUM(p.montant),0) AS total
                FROM Paiement p
                JOIN Commande c ON c.id_commande = p.id_commande
                JOIN Contenir ct ON ct.id_commande = c.id_commande
                JOIN Menu m ON m.id_menu = ct.id_menu
                WHERE p.statut_paiement = ?
                  AND m.restaurant_hote = ?
                  AND DATE(p.date_paiement) = CURRENT_DATE - INTERVAL \'1 day\'
            ', ['reussi', $restaurantId]);

            $t = (float) ($today->total ?? 0);
            $y = (float) ($yesterday->total ?? 0);
            $pct = $y > 0 ? round((($t - $y) / $y) * 100, 2) : 0;

            return response()->json([
                'total_xaf' => $t,
                'pourcentage_vs_hier' => $pct,
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur getVentesAujourdhui: '.$e->getMessage());
            return response()->json(['total_xaf' => 0, 'pourcentage_vs_hier' => 0], 500);
        }
    }

    /**
     * Récupère toutes les statistiques du dashboard
     */
    public function getStatsDashboard(Request $request)
    {
        $restaurantId = $request->query('restaurant_id');
        if (!$restaurantId) {
            return response()->json([
                'ventes_aujourdhui_xaf' => 0,
                'utilisateurs_actifs' => 0,
                'pourcentage_utilisateurs_ajoutes_ce_mois' => 0,
                'reclamations' => 0,
                'pourcentage_reclamation_non_traite_ajoute_ce_mois' => 0,
                'points_fidelite' => 0,
                'pourcentage_points_donne_ce_mois' => 0,
                'reclamations_non_traitees' => 0
            ]);
        }
        try {
            // ventes aujourd'hui
            $ventes = DB::selectOne('
                SELECT COALESCE(SUM(p.montant),0) AS total
                FROM Paiement p
                JOIN Commande c ON c.id_commande = p.id_commande
                JOIN Contenir ct ON ct.id_commande = c.id_commande
                JOIN Menu m ON m.id_menu = ct.id_menu
                WHERE p.statut_paiement = ?
                  AND m.restaurant_hote = ?
                  AND DATE(p.date_paiement) = CURRENT_DATE
            ', ['reussi', $restaurantId]);

            // utilisateurs actifs: distinct clients ayant commandé ce mois sur ce restaurant
            $utilisateursActifs = DB::selectOne('
                SELECT COUNT(DISTINCT c.acheteur) AS total
                FROM Commande c
                JOIN Contenir ct ON ct.id_commande = c.id_commande
                JOIN Menu m ON m.id_menu = ct.id_menu
                WHERE m.restaurant_hote = ?
                  AND EXTRACT(MONTH FROM c.date_commande) = EXTRACT(MONTH FROM CURRENT_DATE)
                  AND EXTRACT(YEAR FROM c.date_commande) = EXTRACT(YEAR FROM CURRENT_DATE)
            ', [$restaurantId]);

            // variation utilisateurs vs mois dernier
            $actifsMoisDernier = DB::selectOne('
                SELECT COUNT(DISTINCT c.acheteur) AS total
                FROM Commande c
                JOIN Contenir ct ON ct.id_commande = c.id_commande
                JOIN Menu m ON m.id_menu = ct.id_menu
                WHERE m.restaurant_hote = ?
                  AND EXTRACT(MONTH FROM c.date_commande) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL \'1 month\')
                  AND EXTRACT(YEAR FROM c.date_commande) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL \'1 month\')
            ', [$restaurantId]);

            $ua = (int) ($utilisateursActifs->total ?? 0);
            $uaPrev = (int) ($actifsMoisDernier->total ?? 0);
            $pctUsers = $uaPrev > 0 ? round((($ua - $uaPrev) / $uaPrev) * 100, 2) : 0;

            // réclamations
            $reclamations = DB::selectOne('SELECT COUNT(*) AS total FROM Reclamation WHERE restaurant_cible = ?', [$restaurantId]);
            $reclamationsNonTraitees = DB::selectOne("SELECT COUNT(*) AS total FROM Reclamation WHERE restaurant_cible = ? AND statut_reclamation IN ('ouverte','en_traitement')", [$restaurantId]);

            // points fidélité distribués pour ce restaurant (historique)
            $points = DB::selectOne('SELECT COALESCE(SUM(changement),0) AS total FROM Historique_fidelite WHERE restaurant = ?', [$restaurantId]);
            $pointsMois = DB::selectOne('SELECT COALESCE(SUM(changement),0) AS total FROM Historique_fidelite WHERE restaurant = ? AND EXTRACT(MONTH FROM date_changement) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM date_changement) = EXTRACT(YEAR FROM CURRENT_DATE)', [$restaurantId]);
            $pointsMoisPrev = DB::selectOne('SELECT COALESCE(SUM(changement),0) AS total FROM Historique_fidelite WHERE restaurant = ? AND EXTRACT(MONTH FROM date_changement) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL \'1 month\') AND EXTRACT(YEAR FROM date_changement) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL \'1 month\')', [$restaurantId]);
            $pm = (int) ($pointsMois->total ?? 0);
            $pmPrev = (int) ($pointsMoisPrev->total ?? 0);
            $pctPoints = $pmPrev > 0 ? round((($pm - $pmPrev) / $pmPrev) * 100, 2) : 0;

            return response()->json([
                'ventes_aujourdhui_xaf' => (float) ($ventes->total ?? 0),
                'utilisateurs_actifs' => $ua,
                'pourcentage_utilisateurs_ajoutes_ce_mois' => $pctUsers,
                'reclamations' => (int) ($reclamations->total ?? 0),
                'reclamations_non_traitees' => (int) ($reclamationsNonTraitees->total ?? 0),
                'pourcentage_reclamation_non_traite_ajoute_ce_mois' => 0, // calcul avancé optionnel
                'points_fidelite' => (int) ($points->total ?? 0),
                'pourcentage_points_donne_ce_mois' => $pctPoints,
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur stats dashboard: '.$e->getMessage());
            return response()->json([
                'ventes_aujourdhui_xaf' => 0,
                'utilisateurs_actifs' => 0,
                'pourcentage_utilisateurs_ajoutes_ce_mois' => 0,
                'reclamations' => 0,
                'reclamations_non_traitees' => 0,
                'pourcentage_reclamation_non_traite_ajoute_ce_mois' => 0,
                'points_fidelite' => 0,
                'pourcentage_points_donne_ce_mois' => 0,
            ], 500);
        }
    }

    /**
     * Récupère la distribution des utilisateurs
     */
    public function getUserDistribution(Request $request)
    {
        $restaurantId = $request->query('restaurant_id');
        if (!$restaurantId) return [];
        try {
            // Calcul des catégories à partir des commandes de ce restaurant
            $totals = DB::selectOne('
                WITH stats AS (
                  SELECT u.id_user, u.date_inscription, COALESCE(cl.fidelity,0) AS fidelity,
                         COUNT(DISTINCT c.id_commande) FILTER (WHERE m.restaurant_hote = ?) AS nb_cmd
                  FROM "Utilisateur" u
                  LEFT JOIN Client cl ON cl.id_user = u.id_user
                  LEFT JOIN Commande c ON c.acheteur = cl.id_user
                  LEFT JOIN Contenir ct ON ct.id_commande = c.id_commande
                  LEFT JOIN Menu m ON m.id_menu = ct.id_menu
                  GROUP BY u.id_user, u.date_inscription, cl.fidelity
                )
                SELECT 
                  COUNT(*) FILTER (WHERE date_inscription >= CURRENT_DATE - INTERVAL \'30 days\') AS nouveaux,
                  COUNT(*) FILTER (WHERE nb_cmd > 5 AND fidelity > 500) AS fideles,
                  COUNT(*) FILTER (WHERE date_inscription < CURRENT_DATE - INTERVAL \'30 days\' AND (nb_cmd <= 5 OR fidelity <= 500)) AS actifs
                FROM stats
            ', [$restaurantId]);

            return [
                ['name' => 'Clients actifs', 'value' => (int) ($totals->actifs ?? 0), 'color' => '#cfbd97'],
                ['name' => 'Nouveaux clients', 'value' => (int) ($totals->nouveaux ?? 0), 'color' => '#6b7280'],
                ['name' => 'Clients fidèles', 'value' => (int) ($totals->fideles ?? 0), 'color' => '#000000'],
            ];
        } catch (\Exception $e) {
            \Log::error('Erreur getUserDistribution: '.$e->getMessage());
            return [];
        }
    }

    /**
     * Récupère les commandes récentes
     */
    public function getRecentOrders(Request $request)
    {
        $restaurantId = $request->query('restaurant_id');
        if (!$restaurantId) return [];
        try {
            $rows = DB::select('
                SELECT c.id_commande AS id, COALESCE(SUM(p.montant),0) AS total,
                       c.date_commande,
                       c.statut_commande
                FROM Commande c
                JOIN Contenir ct ON ct.id_commande = c.id_commande
                JOIN Menu m ON m.id_menu = ct.id_menu
                LEFT JOIN Paiement p ON p.id_commande = c.id_commande AND p.statut_paiement = ?
                WHERE m.restaurant_hote = ?
                GROUP BY c.id_commande
                ORDER BY c.date_commande DESC
                LIMIT 6
            ', ['reussi', $restaurantId]);

            $mapStatus = [
                'validée' => 'Livré',
                'en_cours' => 'En cours',
                'annulée' => 'Annulé',
            ];

            return array_map(function($r) use ($mapStatus) {
                $status = $mapStatus[$r->statut_commande] ?? 'En cours';
                return [
                    'id' => '#'.$r->id,
                    'amount' => (float) $r->total,
                    'status' => $status,
                    'time' => date('d/m H:i', strtotime($r->date_commande)),
                ];
            }, $rows);
        } catch (\Exception $e) {
            \Log::error('Erreur getRecentOrders: '.$e->getMessage());
            return [];
        }
    }

    /**
     * Récupère les réclamations récentes
     */
    public function getRecentComplaints(Request $request)
    {
        $restaurantId = $request->query('restaurant_id');
        if (!$restaurantId) return [];
        try {
            $rows = DB::select('
                SELECT r.id_reclamation AS id, LEFT(r.message_reclamation, 60) AS title,
                       CONCAT(\'Client: \', u.nom_user) AS client,
                       r.date_soummission, r.statut_reclamation
                FROM Reclamation r
                JOIN "Utilisateur" u ON u.id_user = r.acheteur
                WHERE r.restaurant_cible = ?
                ORDER BY r.date_soummission DESC
                LIMIT 6
            ', [$restaurantId]);

            return array_map(function($r) {
                $prio = $r->statut_reclamation === 'ouverte' ? ['Urgent','bg-red-100 text-red-700','bg-red-100 text-red-600']
                      : ($r->statut_reclamation === 'en_traitement' ? ['Moyen','bg-yellow-100 text-yellow-700','bg-yellow-100 text-yellow-600']
                      : ['Résolu','bg-green-100 text-green-700','bg-green-100 text-green-600']);
                return [
                    'id' => '#'.$r->id,
                    'title' => $r->title,
                    'client' => $r->client,
                    'time' => date('d/m H:i', strtotime($r->date_soummission)),
                    'priority' => $prio[0],
                    'priorityColor' => $prio[1],
                    'icon' => $prio[2],
                ];
            }, $rows);
        } catch (\Exception $e) {
            \Log::error('Erreur getRecentComplaints: '.$e->getMessage());
            return [];
        }
    }

    public function getVentesSemaine(Request $request)
    {
        $restaurantId = $request->query('restaurant_id');
        if (!$restaurantId) return [];
        try {
            $rows = DB::select('
                WITH jours AS (
                  SELECT 0 AS dow, \'Dim\' AS lib UNION ALL
                  SELECT 1, \'Lun\' UNION ALL
                  SELECT 2, \'Mar\' UNION ALL
                  SELECT 3, \'Mer\' UNION ALL
                  SELECT 4, \'Jeu\' UNION ALL
                  SELECT 5, \'Ven\' UNION ALL
                  SELECT 6, \'Sam\'
                ),
                ventes AS (
                  SELECT EXTRACT(DOW FROM p.date_paiement)::int AS dow,
                         COALESCE(SUM(p.montant),0) AS total
                  FROM Paiement p
                  JOIN Commande c ON c.id_commande = p.id_commande
                  JOIN Contenir ct ON ct.id_commande = c.id_commande
                  JOIN Menu m ON m.id_menu = ct.id_menu
                  WHERE p.statut_paiement = ?
                    AND m.restaurant_hote = ?
                    AND p.date_paiement >= CURRENT_DATE - INTERVAL \'6 days\'
                  GROUP BY 1
                )
                SELECT j.lib AS jour, COALESCE(v.total,0) AS ventes_xaf
                FROM jours j
                LEFT JOIN ventes v ON v.dow = j.dow
                ORDER BY CASE j.lib WHEN \'Lun\' THEN 1 WHEN \'Mar\' THEN 2 WHEN \'Mer\' THEN 3 WHEN \'Jeu\' THEN 4 WHEN \'Ven\' THEN 5 WHEN \'Sam\' THEN 6 WHEN \'Dim\' THEN 7 END
            ', ['reussi', $restaurantId]);
            return array_map(function($r){ return ['jour' => $r->jour, 'ventes_xaf' => (float)$r->ventes_xaf]; }, $rows);
        } catch (\Exception $e) {
            \Log::error('Erreur getVentesSemaine: '.$e->getMessage());
            return [];
        }
    }

    /**
     * ReportsPage: Revenus mensuels
     * Query params: restaurant_id (required), months (optional)
     */
    public function getMonthlyRevenue(Request $request)
    {
        $restaurantId = $request->query('restaurant_id');
        $months = $request->query('months', 10);

        if (!$restaurantId) {
            return response()->json(['error' => 'restaurant_id requis'], 400);
        }

        try {
            $results = DB::select('SELECT * FROM get_monthly_revenue(?, ?)', [$restaurantId, $months]);

            return array_map(function($row) {
                return [
                    'month' => $row->month_label,
                    'revenus' => (float) $row->revenus,
                    'commandes' => (int) $row->commandes
                ];
            }, $results);

        } catch (\Exception $e) {
            \Log::error('Erreur getMonthlyRevenue: '.$e->getMessage());
            return response()->json([], 500);
        }
    }

    /**
     * ReportsPage: Répartition par catégorie
     * Query params: restaurant_id (required)
     */
    public function getCategoryDistribution(Request $request)
    {
        $restaurantId = $request->query('restaurant_id');

        if (!$restaurantId) {
            return response()->json(['error' => 'restaurant_id requis'], 400);
        }

        // mapping des catégories vers des labels et couleurs côté frontend
        $colorMap = [
            'plat' => ['label' => 'Plats', 'color' => '#cfbd97'],
            'entree' => ['label' => 'Entrées', 'color' => '#6b7280'],
            'dessert' => ['label' => 'Desserts', 'color' => '#000000'],
            'boisson' => ['label' => 'Boissons', 'color' => '#3b82f6']
        ];

        try {
            $results = DB::select('SELECT * FROM get_category_distribution(?)', [$restaurantId]);

            return array_map(function($row) use ($colorMap) {
                $key = strtolower(trim($row->name));
                if (isset($colorMap[$key])) {
                    $label = $colorMap[$key]['label'];
                    $color = $colorMap[$key]['color'];
                } else {
                    // si la catégorie vient sous forme lisible (ex: 'Plats'), on vérifie
                    $found = null;
                    foreach ($colorMap as $k => $v) {
                        if (strcasecmp($v['label'], $row->name) === 0) { $found = $v; break; }
                    }
                    if ($found) {
                        $label = $found['label'];
                        $color = $found['color'];
                    } else {
                        $label = $row->name;
                        $color = '#bbbbbb';
                    }
                }

                return [
                    'name' => $label,
                    'value' => (float) $row->value,
                    'color' => $color
                ];
            }, $results);

        } catch (\Exception $e) {
            \Log::error('Erreur getCategoryDistribution: '.$e->getMessage());
            return response()->json([], 500);
        }
    }

    /**
     * ReportsPage: Top products
     * Query params: restaurant_id (required), limit (optional)
     */
    public function getTopProducts(Request $request)
    {
        $restaurantId = $request->query('restaurant_id');
        $limit = $request->query('limit', 5);

        if (!$restaurantId) {
            return response()->json(['error' => 'restaurant_id requis'], 400);
        }

        try {
            $results = DB::select('SELECT * FROM get_top_products(?, ?)', [$restaurantId, $limit]);

            return array_map(function($row) {
                return [
                    'name' => $row->name,
                    'sales' => (int) $row->sales,
                    'revenue' => (float) $row->revenue
                ];
            }, $results);

        } catch (\Exception $e) {
            \Log::error('Erreur getTopProducts: '.$e->getMessage());
            return response()->json([], 500);
        }
    }

    /**
     * ReportsPage: Commandes par heure
     * Query params: restaurant_id (required), start_date, end_date
     */
    public function getHourlyOrders(Request $request)
    {
        $restaurantId = $request->query('restaurant_id');
        $start = $request->query('start_date');
        $end = $request->query('end_date');

        if (!$restaurantId || !$start || !$end) {
            return response()->json(['error' => 'restaurant_id, start_date et end_date requis'], 400);
        }

        try {
            $results = DB::select('SELECT * FROM get_hourly_orders(?, ?, ?)', [$restaurantId, $start, $end]);

            return array_map(function($row) {
                return [
                    'hour' => $row->hour_label,
                    'commandes' => (int) $row->commandes
                ];
            }, $results);

        } catch (\Exception $e) {
            \Log::error('Erreur getHourlyOrders: '.$e->getMessage());
            return response()->json([], 500);
        }
    }

    /**
     * ReportsPage: KPIs
     * Query params: restaurant_id (required), start_date, end_date
     */
    public function getReportsKpis(Request $request)
    {
        $restaurantId = $request->query('restaurant_id');
        $start = $request->query('start_date');
        $end = $request->query('end_date');

        if (!$restaurantId || !$start || !$end) {
            return response()->json(['error' => 'restaurant_id, start_date et end_date requis'], 400);
        }

        try {
            $results = DB::select('SELECT * FROM get_kpis(?, ?, ?)', [$restaurantId, $start, $end]);

            if (empty($results)) {
                return response()->json([
                    'total_revenue' => 0,
                    'total_orders' => 0,
                    'avg_basket' => 0,
                    'unique_customers' => 0
                ]);
            }

            $r = $results[0];
            return response()->json([
                'total_revenue' => (float) $r->total_revenue,
                'total_orders' => (int) $r->total_orders,
                'avg_basket' => (float) $r->avg_basket,
                'unique_customers' => (int) $r->unique_customers
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur getReportsKpis: '.$e->getMessage());
            return response()->json([
                'total_revenue' => 0,
                'total_orders' => 0,
                'avg_basket' => 0,
                'unique_customers' => 0
            ], 500);
        }
    }

    /**
     * ReportsPage: Résumé mensuel
     * Query params: restaurant_id (required), start_date, end_date
     */
    public function getMonthlySummary(Request $request)
    {
        $restaurantId = $request->query('restaurant_id');
        $start = $request->query('start_date');
        $end = $request->query('end_date');

        if (!$restaurantId || !$start || !$end) {
            return response()->json(['error' => 'restaurant_id, start_date et end_date requis'], 400);
        }

        try {
            $results = DB::select('SELECT * FROM get_monthly_summary(?, ?, ?)', [$restaurantId, $start, $end]);

            if (empty($results)) {
                return response()->json([
                    'best_day' => 'N/A',
                    'avg_orders' => 0,
                    'peak_hour' => 'N/A',
                    'peak_hour_orders' => 0,
                    'satisfaction_percent' => 0
                ]);
            }

            $r = $results[0];

            // convert '19h' -> '19h - 20h' for frontend display
            $peakHourRange = $r->peak_hour;
            if ($peakHourRange && $peakHourRange !== 'N/A') {
                $hr = intval(trim(str_replace('h','',$peakHourRange)));
                $peakHourRange = $hr . 'h - ' . (($hr + 1) % 24) . 'h';
            }

            return response()->json([
                'best_day' => $r->best_day,
                'avg_orders' => (int) $r->avg_orders,
                'peak_hour' => $peakHourRange,
                'peak_hour_orders' => (int) $r->peak_hour_orders,
                'satisfaction_percent' => (float) $r->satisfaction_percent
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur getMonthlySummary: '.$e->getMessage());
            return response()->json([
                'best_day' => 'N/A',
                'avg_orders' => 0,
                'peak_hour' => 'N/A',
                'peak_hour_orders' => 0,
                'satisfaction_percent' => 0
            ], 500);
        }
    }

    /**
     * ReportsPage: endpoint unique qui renvoie toutes les données nécessaires
     * Query params: restaurant_id (required), start_date (optional), end_date (optional), months (optional), limit (optional)
     */
    public function getReportsAll(Request $request)
    {
        $restaurantId = $request->query('restaurant_id');
        $months = $request->query('months', 10);
        $limit = $request->query('limit', 5);

        // default period: current month
        $start = $request->query('start_date', date('Y-m-01'));
        $end = $request->query('end_date', date('Y-m-d'));

        if (!$restaurantId) {
            return response()->json(['error' => 'restaurant_id requis'], 400);
        }

        try {
            // monthly revenue
            $revenueRows = DB::select('SELECT * FROM get_monthly_revenue(?, ?)', [$restaurantId, $months]);

            // category distribution
            $categoryRows = DB::select('SELECT * FROM get_category_distribution(?)', [$restaurantId]);

            // top products
            $topRows = DB::select('SELECT * FROM get_top_products(?, ?)', [$restaurantId, $limit]);

            // hourly orders
            $hourlyRows = DB::select('SELECT * FROM get_hourly_orders(?, ?, ?)', [$restaurantId, $start, $end]);

            // kpis
            $kpiRows = DB::select('SELECT * FROM get_kpis(?, ?, ?)', [$restaurantId, $start, $end]);

            // summary
            $summaryRows = DB::select('SELECT * FROM get_monthly_summary(?, ?, ?)', [$restaurantId, $start, $end]);

            // map category colors same as single endpoint
            $colorMap = [
                'plat' => ['label' => 'Plats', 'color' => '#cfbd97'],
                'entree' => ['label' => 'Entrées', 'color' => '#6b7280'],
                'dessert' => ['label' => 'Desserts', 'color' => '#000000'],
                'boisson' => ['label' => 'Boissons', 'color' => '#3b82f6']
            ];

            $revenueData = array_map(function($row) {
                return [
                    'month' => $row->month_label,
                    'revenus' => (float) $row->revenus,
                    'commandes' => (int) $row->commandes
                ];
            }, $revenueRows);

            $categoryData = array_map(function($row) use ($colorMap) {
                $key = strtolower(trim($row->name));
                if (isset($colorMap[$key])) {
                    $label = $colorMap[$key]['label'];
                    $color = $colorMap[$key]['color'];
                } else {
                    $found = null;
                    foreach ($colorMap as $k => $v) {
                        if (strcasecmp($v['label'], $row->name) === 0) { $found = $v; break; }
                    }
                    if ($found) {
                        $label = $found['label'];
                        $color = $found['color'];
                    } else {
                        $label = $row->name;
                        $color = '#bbbbbb';
                    }
                }
                return [
                    'name' => $label,
                    'value' => (float) $row->value,
                    'color' => $color
                ];
            }, $categoryRows);

            $topProducts = array_map(function($row) {
                return [
                    'name' => $row->name,
                    'sales' => (int) $row->sales,
                    'revenue' => (float) $row->revenue
                ];
            }, $topRows);

            $hourlyData = array_map(function($row) {
                return [
                    'hour' => $row->hour_label,
                    'commandes' => (int) $row->commandes
                ];
            }, $hourlyRows);

            $kpis = [
                'total_revenue' => 0,
                'total_orders' => 0,
                'avg_basket' => 0,
                'unique_customers' => 0
            ];
            if (!empty($kpiRows)) {
                $kp = $kpiRows[0];
                $kpis = [
                    'total_revenue' => (float) $kp->total_revenue,
                    'total_orders' => (int) $kp->total_orders,
                    'avg_basket' => (float) $kp->avg_basket,
                    'unique_customers' => (int) $kp->unique_customers
                ];
            }

            $summary = [
                'best_day' => 'N/A',
                'avg_orders' => 0,
                'peak_hour' => 'N/A',
                'peak_hour_orders' => 0,
                'satisfaction_percent' => 0
            ];
            if (!empty($summaryRows)) {
                $s = $summaryRows[0];
                $peakHourRange = $s->peak_hour;
                if ($peakHourRange && $peakHourRange !== 'N/A') {
                    $hr = intval(trim(str_replace('h','',$peakHourRange)));
                    $peakHourRange = $hr . 'h - ' . (($hr + 1) % 24) . 'h';
                }
                $summary = [
                    'best_day' => $s->best_day,
                    'avg_orders' => (int) $s->avg_orders,
                    'peak_hour' => $peakHourRange,
                    'peak_hour_orders' => (int) $s->peak_hour_orders,
                    'satisfaction_percent' => (float) $s->satisfaction_percent
                ];
            }

            return response()->json([
                'revenueData' => $revenueData,
                'categoryData' => $categoryData,
                'topProducts' => $topProducts,
                'hourlyData' => $hourlyData,
                'kpis' => $kpis,
                'summary' => $summary
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur getReportsAll: '.$e->getMessage());
            return response()->json(['error' => 'Erreur serveur'], 500);
        }
    }

    /**
     * Récupère la liste des commandes
     */
    public function getOrders()
    {
        try {
            $results = DB::select('SELECT * FROM get_orders()');
            
            return array_map(function($item) {
                // Conversion des produits JSON en array PHP
                $products = json_decode($item->products, true) ?? [];
                
                // Mapping des statuts détaillés vers les statuts frontend
                $statusMapping = [
                    'non_lu' => 'en_cours',
                    'en_préparation' => 'validée',
                    'en_livraison' => 'validée', 
                    'fait' => 'validée',
                    'annulée' => 'annulée'
                ];
                
                $frontendStatus = $statusMapping[$item->status] ?? $item->status;
                
                return [
                    'id' => $item->id,
                    'customer' => $item->customer,
                    'email' => $item->email,
                    'date' => $item->date,
                    'total' => (float) $item->total,
                    'status' => $frontendStatus,
                    'detailed_status' => $item->status, // Garder le statut détaillé si besoin
                    'items' => (int) $item->items,
                    'paymentMethod' => $item->payment_method,
                    'numero' => $item->numero,
                    'products' => $products
                ];
            }, $results);
            
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération des commandes:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return [];
        }
    }

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
}
