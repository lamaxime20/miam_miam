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
