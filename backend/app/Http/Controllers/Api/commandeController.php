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
    // Liste des commandes pour l'employeur avec statut front calculé
public function employerIndex(Request $request)
{
    $status = $request->query('status'); // 'all', 'non lu', 'en préparation', 'en livraison', 'validé', 'annulé'
    $restaurantId = $request->query('restaurant_id'); // Nouveau paramètre pour filtrer par restaurant

    // Requête de base avec LEFT JOIN pour éviter de perdre les commandes sans menus
    $sql = <<<SQL
        SELECT 
            c.id_commande,
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

    $params = [];
    
    // Ajouter le filtre par restaurant si spécifié
    if ($restaurantId) {
        $sql .= " WHERE (m.restaurant_hote = ? OR m.restaurant_hote IS NULL)";
        $params[] = $restaurantId;
    }

    $sql .= " ORDER BY c.id_commande DESC";
    
    $rows = DB::select($sql, $params);

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
        
        // Ajouter les menus seulement s'ils appartiennent au restaurant filtré
        // ou si aucun filtre n'est appliqué
        if ($r->nom_menu) {
            // Si un restaurant_id est spécifié, vérifier que le menu lui appartient
            if (!$restaurantId || ($restaurantId && $r->restaurant_hote == $restaurantId)) {
                // Éviter les doublons
                $menuExists = false;
                foreach ($map[$id]['menus'] as $existingMenu) {
                    if ($existingMenu['nom'] === $r->nom_menu && 
                        $existingMenu['restaurant_id'] == $r->restaurant_hote) {
                        $menuExists = true;
                        break;
                    }
                }
                
                if (!$menuExists) {
                    $map[$id]['menus'][] = [ 
                        'nom' => $r->nom_menu, 
                        'quantite' => (int)($r->quantite ?? 0),
                        'restaurant_id' => $r->restaurant_hote
                    ];
                }
            }
        }
    }

    // Filtrer les commandes qui n'ont aucun menu du restaurant demandé
    // (si un restaurant_id est spécifié)
    if ($restaurantId) {
        $map = array_filter($map, function($commande) use ($restaurantId) {
            // Garder la commande seulement si elle a au moins un menu du restaurant
            foreach ($commande['menus'] as $menu) {
                if ($menu['restaurant_id'] == $restaurantId) {
                    return true;
                }
            }
            return false;
        });
    }

    // Calculer le statut front pour chaque commande
    $list = [];
    foreach ($map as $id => $item) {
        $item['statut'] = $this->computeStatutFront(
            $item['_raw']['statut_commande'],
            $item['_raw']['statut_bon'],
            $item['_raw']['statut_livraison']
        );
        unset($item['_raw']);
        $list[] = $item;
    }

    // Appliquer le filtre par statut
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
        try {
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
                    // Récupérer un validateur valide (premier employé disponible si non fourni)
                    if (!$validateur) {
                        $firstEmploye = DB::selectOne('SELECT id_user FROM Employe LIMIT 1');
                        $val = $firstEmploye ? $firstEmploye->id_user : null;
                        if (!$val) {
                            return response()->json(['message' => 'Aucun employé disponible pour valider'], 500);
                        }
                    } else {
                        $val = $validateur;
                    }
                    DB::insert('INSERT INTO Bon_commande (statut_bon, validateur, commande_associe) VALUES (?, ?, ?)', ['en_cours', $val, $id]);
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
                    // Récupérer un validateur valide (premier employé disponible si non fourni)
                    if (!$validateur) {
                        $firstEmploye = DB::selectOne('SELECT id_user FROM Employe LIMIT 1');
                        $val = $firstEmploye ? $firstEmploye->id_user : null;
                        if (!$val) {
                            return response()->json(['message' => 'Aucun employé disponible pour valider'], 500);
                        }
                    } else {
                        $val = $validateur;
                    }
                    DB::insert('INSERT INTO Bon_commande (statut_bon, validateur, commande_associe) VALUES (?, ?, ?)', ['validée', $val, $id]);
                } elseif ($bon->statut_bon !== 'validée') {
                    DB::update('UPDATE Bon_commande SET statut_bon = ? WHERE id_bon = ?', ['validée', $bon->id_bon]);
                }
            } else {
                return response()->json(['message' => 'Statut non supporté'], 400);
            }

            // Recalculer le statut front
            $full = DB::selectOne('SELECT c.statut_commande, b.statut_bon, l.statut_livraison FROM Commande c LEFT JOIN Bon_commande b ON b.commande_associe=c.id_commande LEFT JOIN Livraison l ON l.bon_associe=b.id_bon WHERE c.id_commande=? ORDER BY b.id_bon DESC, l.id_livraison DESC LIMIT 1', [$id]);
            
            $statut = 'non lu';
            if ($full) {
                $statut = $this->computeStatutFront(
                    $full->statut_commande,
                    $full->statut_bon,
                    $full->statut_livraison
                );
            }

            return response()->json(['id_commande' => $id, 'statut' => $statut]);
        } catch (\Exception $e) {
            \Log::error('Erreur updateStatus: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur serveur: ' . $e->getMessage()], 500);
        }
    }

    // Assigner un livreur: crée une livraison en cours pour le bon de la commande
    public function assignerLivreur(Request $request, int $id)
    {
        try {
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
            DB::insert(
                'INSERT INTO Livraison (date_livraison, statut_livraison, commentaire, note_livraison, livreur, bon_associe) VALUES (NULL, ?, ?, 0, ?, ?)',
                ['en_cours', $validated['commentaire'] ?? 'RAS', $validated['livreur_id'], $bon->id_bon]
            );

            // Récupérer la livraison créée
            $livraison = DB::selectOne(
                'SELECT id_livraison, statut_livraison FROM Livraison WHERE bon_associe = ? ORDER BY id_livraison DESC LIMIT 1',
                [$bon->id_bon]
            );

            // Calculer statut front -> en livraison
            return response()->json([
                'id_commande' => $id,
                'id_livraison' => $livraison->id_livraison,
                'statut' => 'en livraison'
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Erreur assignerLivreur: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur serveur: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Calcule le statut frontend basé sur les statuts de la commande, bon et livraison
     * 
     * @param string $statutCommande
     * @param string|null $statutBon
     * @param string|null $statutLivraison
     * @return string
     */
    private function computeStatutFront($statutCommande, $statutBon, $statutLivraison)
    {
        $statutCommande = strtolower($statutCommande ?? '');
        $statutBon = strtolower($statutBon ?? '');
        $statutLivraison = strtolower($statutLivraison ?? '');

        // Logique selon vos règles métier
        if ($statutCommande === 'annulée') {
            return 'annulé';
        }
        
        // Non lu c'est lorsque la commande est en cours
        if ($statutCommande !== 'validée') {
            return 'non lu';
        }
        
        // En préparation, c'est lorsque la commande est validée et que le bon associé est en cours
        if ($statutCommande === 'validée' && $statutBon === 'en_cours') {
            return 'en préparation';
        }
        
        // En livraison c'est lorsque la commande est validée, le bon associé est validé et la livraison est en cours
        if ($statutCommande === 'validée' && $statutBon === 'validée' && $statutLivraison === 'en_cours') {
            return 'en livraison';
        }
        
        // Validé, c'est lorsque la commande est validée, le bon associé est validé et la livraison est validée
        if ($statutCommande === 'validée' && $statutBon === 'validée' && $statutLivraison === 'validée') {
            return 'validé';
        }
        
        // Statut par défaut
        return 'non lu';
    }
}