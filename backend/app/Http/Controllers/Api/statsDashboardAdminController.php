<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class statsDashboardAdminController extends Controller
{
    /**
     * Display a listing of the resource.
     */public function getVentesAujourdhui()
    {
        try {
            // Appel de la fonction PostgreSQL
            $result = DB::select('SELECT * FROM get_ventes_aujourdhui()');
            
            if (empty($result)) {
                return response()->json([
                    'total_eur' => 0,
                    'pourcentage_vs_hier' => 0
                ]);
            }
            
            $data = $result[0];
            
            return response()->json([
                'total_eur' => (float) $data->total_eur,
                'pourcentage_vs_hier' => (float) $data->pourcentage_vs_hier
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération des ventes:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([
                'total_eur' => 0,
                'pourcentage_vs_hier' => 0
            ], 500);
        }
    }

    /**
     * Récupère toutes les statistiques du dashboard
     */
    public function getStatsDashboard()
    {
        try {
            $result = DB::select('SELECT * FROM get_stats_dashboard()');
            
            if (empty($result)) {
                return response()->json([
                    'ventes_aujourdhui_eur' => 0,
                    'utilisateurs_actifs' => 0,
                    'pourcentage_utilisateurs_ajoutes_ce_mois' => 0,
                    'reclamations' => 0,
                    'pourcentage_reclamation_non_traite_ajoute_ce_mois' => 0,
                    'points_fidelite' => 0,
                    'pourcentage_points_donne_ce_mois' => 0,
                    'reclamations_non_traitees' => 0
                ]);
            }
            
            $data = $result[0];
            
            return response()->json([
                'ventes_aujourdhui_eur' => (float) $data->ventes_aujourdhui_eur,
                'utilisateurs_actifs' => (int) $data->utilisateurs_actifs,
                'pourcentage_utilisateurs_ajoutes_ce_mois' => (float) $data->pourcentage_utilisateurs_ajoutes_ce_mois,
                'reclamations' => (int) $data->reclamations,
                'pourcentage_reclamation_non_traite_ajoute_ce_mois' => (float) $data->pourcentage_reclamation_non_traite_ajoute_ce_mois,
                'points_fidelite' => (int) $data->points_fidelite,
                'pourcentage_points_donne_ce_mois' => (float) $data->pourcentage_points_donne_ce_mois,
                'reclamations_non_traitees' => (int) $data->reclamations_non_traitees
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération des statistiques dashboard:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([
                'ventes_aujourdhui_eur' => 0,
                'utilisateurs_actifs' => 0,
                'pourcentage_utilisateurs_ajoutes_ce_mois' => 0,
                'reclamations' => 0,
                'pourcentage_reclamation_non_traite_ajoute_ce_mois' => 0,
                'points_fidelite' => 0,
                'pourcentage_points_donne_ce_mois' => 0,
                'reclamations_non_traitees' => 0
            ], 500);
        }
    }

    /**
     * Récupère la distribution des utilisateurs
     */
    public function getUserDistribution()
    {
        try {
            $results = DB::select('SELECT * FROM get_user_distribution()');
            
            return array_map(function($item) {
                return [
                    'name' => $item->name,
                    'value' => (int) $item->value,
                    'color' => $item->color
                ];
            }, $results);
            
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération de la distribution utilisateurs:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return [];
        }
    }

    /**
     * Récupère les commandes récentes
     */
    public function getRecentOrders()
    {
        try {
            $results = DB::select('SELECT * FROM get_recent_orders()');
            
            return array_map(function($item) {
                return [
                    'id' => $item->commande_id,
                    'amount' => $item->amount,
                    'status' => $item->status,
                    'time' => $item->time_text,
                    'statusColor' => $item->status_color,
                    'icon' => $item->icon_type
                ];
            }, $results);
            
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération des commandes récentes:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return [];
        }
    }

    /**
     * Récupère les réclamations récentes
     */
    public function getRecentComplaints()
    {
        try {
            $results = DB::select('SELECT * FROM get_recent_complaints()');
            
            return array_map(function($item) {
                return [
                    'id' => $item->reclamation_id,
                    'title' => $item->title,
                    'client' => $item->client,
                    'time' => $item->time_text,
                    'priority' => $item->priority,
                    'priorityColor' => $item->priority_color,
                    'icon' => $item->icon
                ];
            }, $results);
            
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération des réclamations récentes:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return [];
        }
    }

    public function getVentesSemaine()
    {
        try {
            $results = DB::select('SELECT * FROM get_ventes_semaine()');
            
            return array_map(function($item) {
                return [
                    'jour' => $item->jour,
                    'ventes_eur' => (float) $item->ventes_eur
                ];
            }, $results);
            
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération des ventes de la semaine:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            // Retourner des valeurs par défaut en cas d'erreur
            return [
                ['jour' => 'Lun', 'ventes_eur' => 8],
                ['jour' => 'Mar', 'ventes_eur' => 0],
                ['jour' => 'Mer', 'ventes_eur' => 0],
                ['jour' => 'Jeu', 'ventes_eur' => 8],
                ['jour' => 'Ven', 'ventes_eur' => 0],
                ['jour' => 'Sam', 'ventes_eur' => 0],
                ['jour' => 'Dim', 'ventes_eur' => 0]
            ];
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
