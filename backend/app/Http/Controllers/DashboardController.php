<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Contrôleur Dashboard - Gestion des statistiques admin
 * 
 * Ce contrôleur expose les endpoints API pour le dashboard admin.
 * Les données sont récupérées depuis PostgreSQL et formatées pour le frontend.
 * 
 * IMPORTANT : Les montants sont retournés en EUR, la conversion XAF se fait côté frontend.
 */
class DashboardController extends Controller
{
    /**
     * Récupérer les ventes du jour
     * 
     * Utilise la fonction PostgreSQL : get_ventes_aujourdhui()
     * 
     * @return \Illuminate\Http\JsonResponse
     * 
     * Format de réponse :
     * {
     *   "total_eur": 2847.50,
     *   "pourcentage_vs_hier": 12.3
     * }
     */
    public function getVentesAujourdhui()
    {
        try {
            // Appeler la fonction PostgreSQL existante
            $result = DB::select('SELECT get_ventes_aujourdhui() as total');
            $total = $result[0]->total ?? 0;
            
            // Calculer les ventes d'hier pour la comparaison
            $hier = DB::select("
                SELECT COALESCE(SUM(montant), 0) as total
                FROM Paiement
                WHERE DATE(date_paiement) = CURRENT_DATE - INTERVAL '1 day'
                AND statut_paiement = 'reussi'
            ");
            $totalHier = $hier[0]->total ?? 1;
            
            // Calculer le pourcentage de variation
            $pourcentage = 0;
            if ($totalHier > 0) {
                $pourcentage = (($total - $totalHier) / $totalHier) * 100;
            }
            
            return response()->json([
                'total_eur' => floatval($total),
                'pourcentage_vs_hier' => round($pourcentage, 1)
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Erreur getVentesAujourdhui: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la récupération des ventes',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Récupérer les ventes de la semaine (7 derniers jours)
     * 
     * @return \Illuminate\Http\JsonResponse
     * 
     * Format de réponse :
     * [
     *   { "jour": "Lun", "ventes_eur": 2800 },
     *   { "jour": "Mar", "ventes_eur": 3200 },
     *   ...
     * ]
     */
    public function getVentesSemaine()
    {
        try {
            $ventes = DB::select("
                SELECT 
                    CASE EXTRACT(DOW FROM p.date_paiement)
                        WHEN 0 THEN 'Dim'
                        WHEN 1 THEN 'Lun'
                        WHEN 2 THEN 'Mar'
                        WHEN 3 THEN 'Mer'
                        WHEN 4 THEN 'Jeu'
                        WHEN 5 THEN 'Ven'
                        WHEN 6 THEN 'Sam'
                    END as jour,
                    COALESCE(SUM(p.montant), 0) as ventes_eur
                FROM Paiement p
                WHERE p.date_paiement >= CURRENT_DATE - INTERVAL '7 days'
                AND p.statut_paiement = 'reussi'
                GROUP BY EXTRACT(DOW FROM p.date_paiement)
                ORDER BY EXTRACT(DOW FROM p.date_paiement)
            ");
            
            // Convertir les objets en tableau associatif
            $ventesArray = array_map(function($vente) {
                return [
                    'jour' => $vente->jour,
                    'ventes_eur' => floatval($vente->ventes_eur)
                ];
            }, $ventes);
            
            return response()->json($ventesArray);
            
        } catch (\Exception $e) {
            \Log::error('Erreur getVentesSemaine: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la récupération des ventes de la semaine',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Récupérer toutes les statistiques du dashboard
     * 
     * Utilise la fonction PostgreSQL : get_dashboard_stats()
     * 
     * @return \Illuminate\Http\JsonResponse
     * 
     * Format de réponse :
     * {
     *   "ventes_aujourdhui_eur": 2847.50,
     *   "utilisateurs_actifs": 1234,
     *   "reclamations": 23,
     *   "points_fidelite": 45678
     * }
     */
    public function getStatsDashboard()
    {
        try {
            // Récupérer les statistiques depuis la fonction PostgreSQL
            $stats = DB::select('SELECT * FROM get_dashboard_stats()');
            
            // Récupérer les ventes du jour
            $ventesResult = DB::select('SELECT get_ventes_aujourdhui() as total');
            $ventes = $ventesResult[0]->total ?? 0;
            
            // Compter les utilisateurs actifs (connectés ce mois)
            $utilisateursActifs = DB::select("
                SELECT COUNT(DISTINCT id_user) as total
                FROM \"Utilisateur\"
                WHERE EXTRACT(MONTH FROM last_connexion) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR FROM last_connexion) = EXTRACT(YEAR FROM CURRENT_DATE)
            ");
            
            // Compter les réclamations ouvertes
            $reclamations = DB::select("
                SELECT COUNT(*) as total
                FROM Reclamation
                WHERE statut_reclamation IN ('ouverte', 'en_traitement')
            ");
            
            // Calculer le total des points de fidélité distribués
            $pointsFidelite = DB::select("
                SELECT COALESCE(SUM(points_fidelite), 0) as total
                FROM Client
            ");
            
            return response()->json([
                'ventes_aujourdhui_eur' => floatval($ventes),
                'utilisateurs_actifs' => intval($utilisateursActifs[0]->total ?? 0),
                'reclamations' => intval($reclamations[0]->total ?? 0),
                'points_fidelite' => intval($pointsFidelite[0]->total ?? 0)
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Erreur getStatsDashboard: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la récupération des statistiques',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Récupérer les commandes récentes (10 dernières)
     * 
     * @return \Illuminate\Http\JsonResponse
     * 
     * Format de réponse :
     * [
     *   {
     *     "id": "CMD-1234",
     *     "montant_eur": 45.50,
     *     "statut": "validée",
     *     "date": "2025-10-27T14:30:00",
     *     "client": "Marie Dubois"
     *   },
     *   ...
     * ]
     */
    public function getCommandesRecentes()
    {
        try {
            $commandes = DB::select("
                SELECT 
                    c.id_commande,
                    c.montant_total as montant_eur,
                    c.statut_commande,
                    c.date_commande,
                    u.nom || ' ' || u.prenom as client_nom
                FROM Commande c
                JOIN \"Utilisateur\" u ON u.id_user = c.id_client
                ORDER BY c.date_commande DESC
                LIMIT 10
            ");
            
            $commandesArray = array_map(function($cmd) {
                return [
                    'id' => 'CMD-' . $cmd->id_commande,
                    'montant_eur' => floatval($cmd->montant_eur),
                    'statut' => $cmd->statut_commande,
                    'date' => $cmd->date_commande,
                    'client' => $cmd->client_nom
                ];
            }, $commandes);
            
            return response()->json($commandesArray);
            
        } catch (\Exception $e) {
            \Log::error('Erreur getCommandesRecentes: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la récupération des commandes',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Récupérer les utilisateurs actifs du mois en cours
     * 
     * @return \Illuminate\Http\JsonResponse
     * 
     * Format de réponse :
     * {
     *   "total": 1247,
     *   "pourcentage_vs_mois_dernier": 8.2
     * }
     */
    public function getUtilisateursActifsMois()
    {
        try {
            // Utilisateurs actifs ce mois
            $moisActuel = DB::select("
                SELECT COUNT(DISTINCT id_user) as total
                FROM \"Utilisateur\"
                WHERE EXTRACT(MONTH FROM last_connexion) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR FROM last_connexion) = EXTRACT(YEAR FROM CURRENT_DATE)
            ");
            $totalMoisActuel = $moisActuel[0]->total ?? 0;
            
            // Utilisateurs actifs le mois dernier
            $moisDernier = DB::select("
                SELECT COUNT(DISTINCT id_user) as total
                FROM \"Utilisateur\"
                WHERE EXTRACT(MONTH FROM last_connexion) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')
                AND EXTRACT(YEAR FROM last_connexion) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')
            ");
            $totalMoisDernier = $moisDernier[0]->total ?? 1;
            
            // Calculer le pourcentage de variation
            $pourcentage = 0;
            if ($totalMoisDernier > 0) {
                $pourcentage = (($totalMoisActuel - $totalMoisDernier) / $totalMoisDernier) * 100;
            }
            
            return response()->json([
                'total' => intval($totalMoisActuel),
                'pourcentage_vs_mois_dernier' => round($pourcentage, 1)
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Erreur getUtilisateursActifsMois: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la récupération des utilisateurs actifs',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Récupérer les utilisateurs actifs par mois (12 derniers mois)
     * 
     * @return \Illuminate\Http\JsonResponse
     * 
     * Format de réponse :
     * [
     *   { "mois": "Jan", "total": 1150 },
     *   { "mois": "Fév", "total": 1200 },
     *   ...
     * ]
     */
    public function getUtilisateursParMois()
    {
        try {
            $utilisateurs = DB::select("
                SELECT 
                    TO_CHAR(last_connexion, 'Mon') as mois,
                    EXTRACT(MONTH FROM last_connexion) as num_mois,
                    COUNT(DISTINCT id_user) as total
                FROM \"Utilisateur\"
                WHERE last_connexion >= CURRENT_DATE - INTERVAL '12 months'
                GROUP BY TO_CHAR(last_connexion, 'Mon'), EXTRACT(MONTH FROM last_connexion)
                ORDER BY num_mois
            ");
            
            // Convertir en tableau avec les noms de mois en français
            $moisFrancais = [
                'Jan' => 'Jan', 'Feb' => 'Fév', 'Mar' => 'Mar', 'Apr' => 'Avr',
                'May' => 'Mai', 'Jun' => 'Juin', 'Jul' => 'Juil', 'Aug' => 'Août',
                'Sep' => 'Sept', 'Oct' => 'Oct', 'Nov' => 'Nov', 'Dec' => 'Déc'
            ];
            
            $utilisateursArray = array_map(function($user) use ($moisFrancais) {
                $moisEn = trim($user->mois);
                return [
                    'mois' => $moisFrancais[$moisEn] ?? $moisEn,
                    'total' => intval($user->total)
                ];
            }, $utilisateurs);
            
            return response()->json($utilisateursArray);
            
        } catch (\Exception $e) {
            \Log::error('Erreur getUtilisateursParMois: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la récupération des utilisateurs par mois',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Récupérer les utilisateurs actifs par semaine (8 dernières semaines)
     * 
     * @return \Illuminate\Http\JsonResponse
     * 
     * Format de réponse :
     * [
     *   { "semaine": "Sem 35", "total": 280 },
     *   { "semaine": "Sem 36", "total": 295 },
     *   ...
     * ]
     */
    public function getUtilisateursParSemaine()
    {
        try {
            $utilisateurs = DB::select("
                SELECT 
                    EXTRACT(WEEK FROM last_connexion) as num_semaine,
                    'Sem ' || EXTRACT(WEEK FROM last_connexion) as semaine,
                    COUNT(DISTINCT id_user) as total
                FROM \"Utilisateur\"
                WHERE last_connexion >= CURRENT_DATE - INTERVAL '8 weeks'
                GROUP BY EXTRACT(WEEK FROM last_connexion)
                ORDER BY num_semaine
            ");
            
            $utilisateursArray = array_map(function($user) {
                return [
                    'semaine' => $user->semaine,
                    'total' => intval($user->total)
                ];
            }, $utilisateurs);
            
            return response()->json($utilisateursArray);
            
        } catch (\Exception $e) {
            \Log::error('Erreur getUtilisateursParSemaine: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la récupération des utilisateurs par semaine',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Récupérer le nombre total de réclamations et les non traitées
     * 
     * @return \Illuminate\Http\JsonResponse
     * 
     * Format de réponse :
     * {
     *   "total": 23,
     *   "non_traitees": 5,
     *   "traitees": 18
     * }
     */
    public function getReclamations()
    {
        try {
            $stats = DB::select("
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN statut_reclamation IN ('ouverte', 'en_traitement') THEN 1 END) as non_traitees,
                    COUNT(CASE WHEN statut_reclamation = 'fermée' THEN 1 END) as traitees
                FROM Reclamation
            ");
            
            return response()->json([
                'total' => intval($stats[0]->total ?? 0),
                'non_traitees' => intval($stats[0]->non_traitees ?? 0),
                'traitees' => intval($stats[0]->traitees ?? 0)
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Erreur getReclamations: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la récupération des réclamations',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Récupérer le nombre de réclamations par mois (12 derniers mois)
     * 
     * @return \Illuminate\Http\JsonResponse
     * 
     * Format de réponse :
     * [
     *   { 
     *     "mois": "Jan", 
     *     "total": 18,
     *     "ouvertes": 3,
     *     "en_traitement": 5,
     *     "fermees": 10
     *   },
     *   ...
     * ]
     */
    public function getReclamationsParMois()
    {
        try {
            $reclamations = DB::select("
                SELECT 
                    TO_CHAR(date_reclamation, 'Mon') as mois,
                    EXTRACT(MONTH FROM date_reclamation) as num_mois,
                    COUNT(*) as total,
                    COUNT(CASE WHEN statut_reclamation = 'ouverte' THEN 1 END) as ouvertes,
                    COUNT(CASE WHEN statut_reclamation = 'en_traitement' THEN 1 END) as en_traitement,
                    COUNT(CASE WHEN statut_reclamation = 'fermée' THEN 1 END) as fermees
                FROM Reclamation
                WHERE date_reclamation >= CURRENT_DATE - INTERVAL '12 months'
                GROUP BY TO_CHAR(date_reclamation, 'Mon'), EXTRACT(MONTH FROM date_reclamation)
                ORDER BY num_mois
            ");
            
            // Convertir en tableau avec les noms de mois en français
            $moisFrancais = [
                'Jan' => 'Jan', 'Feb' => 'Fév', 'Mar' => 'Mar', 'Apr' => 'Avr',
                'May' => 'Mai', 'Jun' => 'Juin', 'Jul' => 'Juil', 'Aug' => 'Août',
                'Sep' => 'Sept', 'Oct' => 'Oct', 'Nov' => 'Nov', 'Dec' => 'Déc'
            ];
            
            $reclamationsArray = array_map(function($rec) use ($moisFrancais) {
                $moisEn = trim($rec->mois);
                return [
                    'mois' => $moisFrancais[$moisEn] ?? $moisEn,
                    'total' => intval($rec->total),
                    'ouvertes' => intval($rec->ouvertes),
                    'en_traitement' => intval($rec->en_traitement),
                    'fermees' => intval($rec->fermees)
                ];
            }, $reclamations);
            
            return response()->json($reclamationsArray);
            
        } catch (\Exception $e) {
            \Log::error('Erreur getReclamationsParMois: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la récupération des réclamations par mois',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Récupérer les réclamations par statut
     * 
     * @return \Illuminate\Http\JsonResponse
     * 
     * Format de réponse :
     * {
     *   "ouverte": 5,
     *   "en_traitement": 8,
     *   "fermee": 10
     * }
     */
    public function getReclamationsParStatut()
    {
        try {
            $stats = DB::select("
                SELECT 
                    statut_reclamation,
                    COUNT(*) as nombre
                FROM Reclamation
                GROUP BY statut_reclamation
            ");
            
            $result = [
                'ouverte' => 0,
                'en_traitement' => 0,
                'fermee' => 0
            ];
            
            foreach ($stats as $stat) {
                $statut = $stat->statut_reclamation;
                if ($statut === 'ouverte') {
                    $result['ouverte'] = intval($stat->nombre);
                } elseif ($statut === 'en_traitement') {
                    $result['en_traitement'] = intval($stat->nombre);
                } elseif ($statut === 'fermée') {
                    $result['fermee'] = intval($stat->nombre);
                }
            }
            
            return response()->json($result);
            
        } catch (\Exception $e) {
            \Log::error('Erreur getReclamationsParStatut: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la récupération des réclamations par statut',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Récupérer le total des points de fidélité distribués
     * 
     * @return \Illuminate\Http\JsonResponse
     * 
     * Format de réponse :
     * {
     *   "total_points": 45892,
     *   "points_mois_actuel": 3250
     * }
     */
    public function getPointsFidelite()
    {
        try {
            // Total de tous les points distribués
            $total = DB::select("
                SELECT COALESCE(SUM(points_fidelite), 0) as total_points
                FROM Client
            ");
            $totalPoints = $total[0]->total_points ?? 0;
            
            // Points distribués ce mois (calculé à partir des commandes validées)
            $moisActuel = DB::select("
                SELECT COALESCE(SUM(FLOOR(montant_total * 0.1)), 0) as points_mois
                FROM Commande
                WHERE EXTRACT(MONTH FROM date_commande) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR FROM date_commande) = EXTRACT(YEAR FROM CURRENT_DATE)
                AND statut_commande = 'validée'
            ");
            $pointsMois = $moisActuel[0]->points_mois ?? 0;
            
            return response()->json([
                'total_points' => intval($totalPoints),
                'points_mois_actuel' => intval($pointsMois)
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Erreur getPointsFidelite: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la récupération des points de fidélité',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Récupérer les points de fidélité distribués par mois (12 derniers mois)
     * 
     * @return \Illuminate\Http\JsonResponse
     * 
     * Format de réponse :
     * [
     *   { 
     *     "mois": "Jan", 
     *     "total_points": 3850,
     *     "nombre_clients": 125
     *   },
     *   ...
     * ]
     */
    public function getPointsFideliteParMois()
    {
        try {
            $points = DB::select("
                SELECT 
                    TO_CHAR(date_commande, 'Mon') as mois,
                    EXTRACT(MONTH FROM date_commande) as num_mois,
                    SUM(FLOOR(montant_total * 0.1)) as total_points,
                    COUNT(DISTINCT id_client) as nombre_clients
                FROM Commande
                WHERE date_commande >= CURRENT_DATE - INTERVAL '12 months'
                AND statut_commande = 'validée'
                GROUP BY TO_CHAR(date_commande, 'Mon'), EXTRACT(MONTH FROM date_commande)
                ORDER BY num_mois
            ");
            
            // Convertir en tableau avec les noms de mois en français
            $moisFrancais = [
                'Jan' => 'Jan', 'Feb' => 'Fév', 'Mar' => 'Mar', 'Apr' => 'Avr',
                'May' => 'Mai', 'Jun' => 'Juin', 'Jul' => 'Juil', 'Aug' => 'Août',
                'Sep' => 'Sept', 'Oct' => 'Oct', 'Nov' => 'Nov', 'Dec' => 'Déc'
            ];
            
            $pointsArray = array_map(function($pt) use ($moisFrancais) {
                $moisEn = trim($pt->mois);
                return [
                    'mois' => $moisFrancais[$moisEn] ?? $moisEn,
                    'total_points' => intval($pt->total_points),
                    'nombre_clients' => intval($pt->nombre_clients)
                ];
            }, $points);
            
            return response()->json($pointsArray);
            
        } catch (\Exception $e) {
            \Log::error('Erreur getPointsFideliteParMois: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la récupération des points par mois',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Récupérer les statistiques des points de fidélité par client
     * 
     * @return \Illuminate\Http\JsonResponse
     * 
     * Format de réponse :
     * {
     *   "moyenne_par_client": 367,
     *   "max_points": 5420,
     *   "min_points": 0,
     *   "clients_avec_points": 125
     * }
     */
    public function getStatistiquesPointsParClient()
    {
        try {
            $stats = DB::select("
                SELECT 
                    AVG(points_fidelite) as moyenne_par_client,
                    MAX(points_fidelite) as max_points,
                    MIN(points_fidelite) as min_points,
                    COUNT(CASE WHEN points_fidelite > 0 THEN 1 END) as clients_avec_points
                FROM Client
            ");
            
            return response()->json([
                'moyenne_par_client' => intval($stats[0]->moyenne_par_client ?? 0),
                'max_points' => intval($stats[0]->max_points ?? 0),
                'min_points' => intval($stats[0]->min_points ?? 0),
                'clients_avec_points' => intval($stats[0]->clients_avec_points ?? 0)
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Erreur getStatistiquesPointsParClient: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la récupération des stats points',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Récupérer la répartition des clients par catégorie
     * 
     * LOGIQUE DE CATÉGORISATION :
     * - NOUVEAUX CLIENTS : Inscrits dans les 30 derniers jours
     * - CLIENTS FIDÈLES : Plus de 5 commandes validées ET plus de 500 points
     * - CLIENTS ACTIFS : Tous les autres clients avec au moins 1 commande
     * 
     * @return \Illuminate\Http\JsonResponse
     * 
     * Format de réponse :
     * {
     *   "clients_actifs": 450,
     *   "nouveaux_clients": 280,
     *   "clients_fideles": 380
     * }
     */
    public function getRepartitionClients()
    {
        try {
            $repartition = DB::select("
                WITH client_stats AS (
                    SELECT 
                        c.id_user,
                        c.date_inscription,
                        c.points_fidelite,
                        COUNT(cmd.id_commande) as nombre_commandes
                    FROM Client c
                    LEFT JOIN Commande cmd ON cmd.id_client = c.id_user AND cmd.statut_commande = 'validée'
                    GROUP BY c.id_user, c.date_inscription, c.points_fidelite
                )
                SELECT 
                    COUNT(CASE WHEN date_inscription >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as nouveaux_clients,
                    COUNT(CASE WHEN nombre_commandes > 5 AND points_fidelite > 500 THEN 1 END) as clients_fideles,
                    COUNT(CASE WHEN date_inscription < CURRENT_DATE - INTERVAL '30 days' 
                                 AND (nombre_commandes <= 5 OR points_fidelite <= 500) 
                                 AND nombre_commandes > 0 THEN 1 END) as clients_actifs
                FROM client_stats
            ");
            
            return response()->json([
                'clients_actifs' => intval($repartition[0]->clients_actifs ?? 0),
                'nouveaux_clients' => intval($repartition[0]->nouveaux_clients ?? 0),
                'clients_fideles' => intval($repartition[0]->clients_fideles ?? 0)
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Erreur getRepartitionClients: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la récupération de la répartition clients',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
