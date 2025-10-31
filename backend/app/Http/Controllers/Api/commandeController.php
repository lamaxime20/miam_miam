<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class commandeController extends Controller
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
    

    public function show(string $id)
    {
        //
    }

    public function update(Request $request, string $id)
    {
        //
    }

    public function destroy(string $id)
    {
        //
    }

    // Liste des commandes pour l'employeur avec statut front calculé
    public function employerIndex(Request $request)
    {
        $status = $request->query('status'); // 'all', 'non lu', 'en préparation', 'en livraison', 'validé', 'annulé'
        $restaurantId = $request->query('restaurant_id'); // Nouveau paramètre pour filtrer par restaurant

        // Récupère commandes + client + bon + livraison + menus avec filtre par restaurant
        $sql = <<<SQL
            SELECT c.id_commande,
                c.date_heure_livraison,
                c.localisation_client,
                c.type_localisation,
                c.statut_commande,
                u.nom_user AS nom_client,
                b.id_bon,
                b.statut_bon,
                l.id_livraison,
                l.statut_livraison,
                m.nom_menu,
                ct.quantite,
                m.restaurant_hote
            FROM Commande c
            JOIN Client cl ON cl.id_user = c.acheteur
            JOIN "Utilisateur" u ON u.id_user = cl.id_user
            LEFT JOIN Bon_commande b ON b.commande_associe = c.id_commande
            LEFT JOIN Livraison l ON l.bon_associe = b.id_bon
            LEFT JOIN Contenir ct ON ct.id_commande = c.id_commande
            LEFT JOIN Menu m ON m.id_menu = ct.id_menu
        SQL;

        // Ajouter le filtre par restaurant si spécifié
        if ($restaurantId) {
            $sql .= " WHERE m.restaurant_hote = ?";
            $rows = DB::select($sql . " ORDER BY c.id_commande DESC", [$restaurantId]);
        } else {
            $rows = DB::select($sql . " ORDER BY c.id_commande DESC");
        }

        // Regrouper par commande et calculer le statut pour le frontend
        $map = [];
        foreach ($rows as $r) {
            $id = $r->id_commande;
            if (!isset($map[$id])) {
                $map[$id] = [
                    'id_commande' => $r->id_commande,
                    'nom_client' => $r->nom_client,
                    'date_livraison' => $r->date_heure_livraison,
                    'localisation_client' => $r->localisation_client,
                    'type_localisation' => $r->type_localisation,
                    'menus' => [],
                    'statut' => null,
                    '_raw' => [
                        'statut_commande' => $r->statut_commande,
                        'statut_bon' => $r->statut_bon ?? null,
                        'statut_livraison' => $r->statut_livraison ?? null,
                    ],
                ];
            }
            // Ajouter seulement les menus qui appartiennent au restaurant filtré
            if ($r->nom_menu) {
                // Si un restaurant_id est spécifié, vérifier que le menu lui appartient
                if (!$restaurantId || ($restaurantId && $r->restaurant_hote == $restaurantId)) {
                    $map[$id]['menus'][] = [ 
                        'nom' => $r->nom_menu, 
                        'quantite' => (int)($r->quantite ?? 0),
                        'restaurant_id' => $r->restaurant_hote
                    ];
                }
            }
        }

        // mapping des statuts selon les règles métier fournies
        $compute = function($raw) {
            $sc = $raw['statut_commande'];
            $sb = $raw['statut_bon'];
            $sl = $raw['statut_livraison'];
            // Si l'un est annulé
            if ($sc === 'annulée' || $sb === 'annulée' || $sl === 'annulée') return 'annulé';
            // non lu: commande en cours
            if ($sc === 'en_cours') return 'non lu';
            // en préparation: commande validée et bon en cours
            if ($sc === 'validée' && $sb === 'en_cours') return 'en préparation';
            // en préparation: commande validée, bon validé, mais pas encore de livraison
            if ($sc === 'validée' && $sb === 'validée' && ($sl === null || $sl === '')) return 'en préparation';
            // en livraison: commande validée, bon validé et livraison en cours
            if ($sc === 'validée' && $sb === 'validée' && $sl === 'en_cours') return 'en livraison';
            // validé: tout validé
            if ($sc === 'validée' && $sb === 'validée' && $sl === 'validée') return 'validé';
            // fallback
            return 'non lu';
        };

        $list = [];
        foreach ($map as $id => $item) {
            $item['statut'] = $compute($item['_raw']);
            unset($item['_raw']);
            $list[] = $item;
        }

        if ($status && strtolower($status) !== 'all') {
            $filter = strtolower($status);
            $list = array_values(array_filter($list, function($c) use ($filter){
                return strtolower($c['statut']) === $filter;
            }));
        }

        return response()->json($list);
    }

    // Mise à jour du statut côté employeur
    public function updateStatus(Request $request, int $id)
    {
        $validated = $request->validate([
            'statut' => 'required|string', // 'en préparation' | 'annulé'
            'validateur' => 'nullable|integer', // id utilisateur employé
        ]);

        $new = strtolower($validated['statut']);
        $validateur = $validated['validateur'] ?? null;

        // Récupérer commande existante
        $commande = DB::selectOne('SELECT * FROM Commande WHERE id_commande = ?', [$id]);
        if (!$commande) return response()->json(['message' => 'Commande introuvable'], 404);

        if ($new === 'annulé') {
            DB::update('UPDATE Commande SET statut_commande = ? WHERE id_commande = ?', ['annulée', $id]);
        } elseif ($new === 'en préparation') {
            // 1) Valider la commande si nécessaire
            if ($commande->statut_commande !== 'validée') {
                DB::update('UPDATE Commande SET statut_commande = ? WHERE id_commande = ?', ['validée', $id]);
            }
            // 2) Créer ou passer le bon en cours
            $bon = DB::selectOne('SELECT * FROM Bon_commande WHERE commande_associe = ? ORDER BY id_bon DESC LIMIT 1', [$id]);
            if (!$bon) {
                // validateur requis sinon NULL => on met validateur à 1 par défaut si manquant
                $val = $validateur ?? 1;
                DB::selectOne('INSERT INTO Bon_commande (statut_bon, validateur, commande_associe) VALUES (?, ?, ?) RETURNING id_bon', ['en_cours', $val, $id]);
            } else {
                if ($bon->statut_bon !== 'en_cours') {
                    DB::update('UPDATE Bon_commande SET statut_bon = ? WHERE id_bon = ?', ['en_cours', $bon->id_bon]);
                }
            }
        } elseif ($new === 'validé') {
            // Fin de préparation: valider le bon
            if ($commande->statut_commande !== 'validée') {
                DB::update('UPDATE Commande SET statut_commande = ? WHERE id_commande = ?', ['validée', $id]);
            }
            $bon = DB::selectOne('SELECT * FROM Bon_commande WHERE commande_associe = ? ORDER BY id_bon DESC LIMIT 1', [$id]);
            if (!$bon) {
                $val = $validateur ?? 1;
                DB::selectOne('INSERT INTO Bon_commande (statut_bon, validateur, commande_associe) VALUES (?, ?, ?) RETURNING id_bon', ['validée', $val, $id]);
            } elseif ($bon->statut_bon !== 'validée') {
                DB::update('UPDATE Bon_commande SET statut_bon = ? WHERE id_bon = ?', ['validée', $bon->id_bon]);
            }
        } else {
            return response()->json(['message' => 'Statut non supporté'], 400);
        }

        // Recalculer le statut front
        $full = DB::selectOne('SELECT c.statut_commande, b.statut_bon, l.statut_livraison FROM Commande c LEFT JOIN Bon_commande b ON b.commande_associe=c.id_commande LEFT JOIN Livraison l ON l.bon_associe=b.id_bon WHERE c.id_commande=? ORDER BY b.id_bon DESC, l.id_livraison DESC', [$id]);
        $statut = 'non lu';
        if ($full) {
            $sc = $full->statut_commande; $sb = $full->statut_bon; $sl = $full->statut_livraison;
            if ($sc === 'annulée' || $sb === 'annulée' || $sl === 'annulée') $statut = 'annulé';
            elseif ($sc === 'en_cours') $statut = 'non lu';
            elseif ($sc === 'validée' && $sb === 'en_cours') $statut = 'en préparation';
            elseif ($sc === 'validée' && $sb === 'validée' && ($sl === null || $sl === '')) $statut = 'en préparation';
            elseif ($sc === 'validée' && $sb === 'validée' && $sl === 'en_cours') $statut = 'en livraison';
            elseif ($sc === 'validée' && $sb === 'validée' && $sl === 'validée') $statut = 'validé';
        }

        return response()->json(['id_commande' => $id, 'statut' => $statut]);
    }

    // Assigner un livreur: crée une livraison en cours pour le bon de la commande
    public function assignerLivreur(Request $request, int $id)
    {
        $validated = $request->validate([
            'livreur_id' => 'required|integer',
            'commentaire' => 'nullable|string'
        ]);

        // Récupérer le bon (doit exister et être au moins en_cours)
        $bon = DB::selectOne('SELECT * FROM Bon_commande WHERE commande_associe = ? ORDER BY id_bon DESC LIMIT 1', [$id]);
        if (!$bon) return response()->json(['message' => 'Bon introuvable pour cette commande'], 404);

        // Si le bon n'est pas encore validé, on le valide pour passer en livraison selon la règle métier 3
        if ($bon->statut_bon !== 'validée') {
            DB::update('UPDATE Bon_commande SET statut_bon = ? WHERE id_bon = ?', ['validée', $bon->id_bon]);
        }

        // Créer la livraison en cours
        $livraison = DB::selectOne(
            'INSERT INTO Livraison (date_livraison, statut_livraison, commentaire, note_livraison, livreur, bon_associe) VALUES (NULL, ?, ?, 0, ?, ?) RETURNING id_livraison, statut_livraison',
            ['en_cours', $validated['commentaire'] ?? 'RAS', $validated['livreur_id'], $bon->id_bon]
        );

        // Calculer statut front -> en livraison
        return response()->json([
            'id_commande' => $id,
            'id_livraison' => $livraison->id_livraison,
            'statut' => 'en livraison'
        ], 201);
    }
}